from flask import Flask, request, jsonify, redirect
from flask_cors import CORS
import oracledb
import os
from dotenv import load_dotenv
from transbank.webpay.webpay_plus.transaction import Transaction
from transbank.common.integration_type import IntegrationType
from transbank.common.integration_commerce_codes import IntegrationCommerceCodes
import logging

load_dotenv()

app = Flask(__name__)
CORS(app)

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configuración de Transbank
# Para testing (cambiar a LIVE para producción)
Transaction.commerce_code = IntegrationCommerceCodes.WEBPAY_PLUS
Transaction.api_key = "579B532A7440BB0C9079DED94D31EA1615BACEB56610332264630D42D0A36B1C"
Transaction.integration_type = IntegrationType.TEST

# Conexión a la base de datos
usuario = os.getenv("usuario")
clave = os.getenv("clave")
wallet_dir = r"wallet"
wallet_password = os.getenv("wallet_password")
dsn = os.getenv("dsn")

try:
    connection = oracledb.connect(
        user=usuario,
        password=clave,
        dsn=dsn,
        config_dir=wallet_dir,
        wallet_location=wallet_dir,
        wallet_password=wallet_password
    )
    print("✅ Conexión a Oracle establecida")
except Exception as e:
    print(f"❌ Error conectando a Oracle: {e}")
    connection = None

@app.route('/transbank/crear-transaccion', methods=['POST'])
def crear_transaccion():
    """Crear transacción real con Transbank WebPay Plus"""
    try:
        data = request.get_json()
        id_pedido = data.get('id_pedido')
        monto = data.get('monto')
        
        # URLs de retorno
        return_url = f"http://localhost:5001/transbank/confirmar/{id_pedido}"
        
        # Crear transacción con Transbank
        buy_order = f"ORDER_{id_pedido}"
        session_id = f"SESSION_{id_pedido}"
        amount = int(monto)  # Transbank requiere monto en enteros (pesos chilenos)
        
        logger.info(f"💳 Creando transacción Transbank real: Pedido {id_pedido}, Monto {amount}")
        
        # Llamada real a Transbank
        response = Transaction().create(
            buy_order=buy_order,
            session_id=session_id,
            amount=amount,
            return_url=return_url
        )
        
        logger.info(f"✅ Respuesta de Transbank: {response}")
        
        # Guardar el token en la base de datos para tracking
        if connection:
            cursor = connection.cursor()
            cursor.execute("""
                UPDATE PAGOS 
                SET ESTADO_PAGO = 'PROCESANDO'
                WHERE ID_PEDIDO = :id_pedido
            """, {'id_pedido': id_pedido})
            connection.commit()
            cursor.close()
        
        return jsonify({
            'success': True,
            'token': response['token'],
            'url': response['url'],
            'id_pedido': id_pedido,
            'mensaje': 'Transacción creada exitosamente. Redirigiendo a Transbank...'
        })
        
    except Exception as e:
        logger.error(f"❌ Error creando transacción: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/transbank/confirmar/<int:id_pedido>', methods=['POST', 'GET'])
def confirmar_transaccion(id_pedido):
    """Confirmar transacción después del pago en Transbank"""
    try:
        # Obtener token desde la respuesta de Transbank
        token = request.form.get('token_ws') or request.args.get('token_ws')
        
        if not token:
            logger.error("❌ No se recibió token de Transbank")
            return redirect(f"http://localhost:5173/payment-success?order_id={id_pedido}&status=error")
        
        logger.info(f"🔄 Confirmando transacción: Pedido {id_pedido}, Token: {token}")
        
        # Confirmar transacción con Transbank
        response = Transaction().commit(token)
        
        logger.info(f"📊 Respuesta de confirmación: {response}")
        
        # Verificar el estado de la transacción
        if response['status'] == 'AUTHORIZED':
            # PAGO EXITOSO
            logger.info(f"✅ Pago autorizado para pedido {id_pedido}")
            
            if connection:
                cursor = connection.cursor()
                
                # 1. Actualizar estado del pago
                cursor.execute("""
                    UPDATE PAGOS 
                    SET ESTADO_PAGO = 'PAGADO', 
                        FECHA_PAGO = SYSDATE
                    WHERE ID_PEDIDO = :id_pedido
                """, {'id_pedido': id_pedido})
                
                # 2. Actualizar estado del pedido
                cursor.execute("""
                    UPDATE DETALLE_PEDIDO 
                    SET ESTADO = 'CONFIRMADO' 
                    WHERE ID_DETALLE = (SELECT ID_DETALLE FROM PEDIDOS WHERE ID_PEDIDO = :id_pedido)
                """, {'id_pedido': id_pedido})
                
                # 3. Actualizar inventario (rebajar stock)
                cursor.execute("""
                    SELECT cp.ID_PRODUCTO, cp.ID_SUCURSAL, cp.CANTIDAD
                    FROM CARRITO_PRODUCTOS cp
                    JOIN DETALLE_PEDIDO dp ON cp.ID_CARRITO = dp.ID_CARRITO
                    JOIN PEDIDOS p ON dp.ID_DETALLE = p.ID_DETALLE
                    WHERE p.ID_PEDIDO = :id_pedido
                """, {'id_pedido': id_pedido})
                
                productos = cursor.fetchall()
                for producto in productos:
                    id_producto, id_sucursal, cantidad = producto
                    cursor.execute("""
                        UPDATE INVENTARIO 
                        SET STOCK = STOCK - :cantidad 
                        WHERE ID_PRODUCTO = :id_producto AND ID_SUCURSAL = :id_sucursal
                    """, {
                        'cantidad': cantidad,
                        'id_producto': id_producto,
                        'id_sucursal': id_sucursal
                    })
                    logger.info(f"📦 Stock actualizado: Producto {id_producto}, Cantidad -{cantidad}")
                
                # 4. Registrar en bitácora
                cursor.execute("""
                    INSERT INTO BITACORA (ID_USUARIO, ACCION, FECHA_ACCION)
                    SELECT p.ID_USUARIO, 
                           'Pago Transbank REAL exitoso - Pedido #' || :id_pedido || 
                           ' - Autorización: ' || :auth_code, 
                           SYSDATE
                    FROM PEDIDOS p WHERE p.ID_PEDIDO = :id_pedido
                """, {
                    'id_pedido': id_pedido,
                    'auth_code': response.get('authorization_code', 'N/A')
                })
                
                connection.commit()
                cursor.close()
                logger.info(f"✅ Base de datos actualizada para pedido {id_pedido}")
            
            # Redirigir a página de éxito
            return redirect(f"http://localhost:5173/payment-success?order_id={id_pedido}&status=success&auth_code={response.get('authorization_code')}")
        
        else:
            # PAGO FALLIDO
            logger.warning(f"❌ Pago no autorizado para pedido {id_pedido}: {response['status']}")
            
            if connection:
                cursor = connection.cursor()
                cursor.execute("""
                    UPDATE PAGOS 
                    SET ESTADO_PAGO = 'FALLIDO', 
                        FECHA_PAGO = SYSDATE 
                    WHERE ID_PEDIDO = :id_pedido
                """, {'id_pedido': id_pedido})
                connection.commit()
                cursor.close()
            
            return redirect(f"http://localhost:5173/payment-success?order_id={id_pedido}&status=failed")
        
    except Exception as e:
        logger.error(f"❌ Error confirmando transacción: {e}")
        return redirect(f"http://localhost:5173/payment-success?order_id={id_pedido}&status=error")

@app.route('/transbank/estado-pedido/<int:id_pedido>', methods=['GET'])
def estado_pedido(id_pedido):
    """Obtener estado actual del pedido"""
    try:
        if not connection:
            return jsonify({'error': 'Sin conexión a base de datos'}), 500
            
        cursor = connection.cursor()
        cursor.execute("""
            SELECT 
                p.ID_PEDIDO,
                dp.ESTADO as ESTADO_PEDIDO,
                pg.ESTADO_PAGO,
                pg.MONTO_TOTAL,
                p.FECHA_PEDIDO
            FROM PEDIDOS p
            JOIN DETALLE_PEDIDO dp ON p.ID_DETALLE = dp.ID_DETALLE
            LEFT JOIN PAGOS pg ON p.ID_PEDIDO = pg.ID_PEDIDO
            WHERE p.ID_PEDIDO = :id_pedido
        """, {'id_pedido': id_pedido})
        
        result = cursor.fetchone()
        cursor.close()
        
        if result:
            return jsonify({
                'id_pedido': result[0],
                'estado_pedido': result[1],
                'estado_pago': result[2],
                'monto_total': float(result[3]) if result[3] else 0,
                'fecha_pedido': str(result[4])
            })
        else:
            return jsonify({'error': 'Pedido no encontrado'}), 404
            
    except Exception as e:
        logger.error(f"❌ Error obteniendo estado: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/transbank/health', methods=['GET'])
def health():
    """Health check"""
    return jsonify({
        'status': 'ok',
        'service': 'Transbank API REAL',
        'environment': 'TEST' if Transaction.integration_type == IntegrationType.TEST else 'LIVE',
        'database': 'connected' if connection else 'disconnected'
    })

if __name__ == '__main__':
    print("🚀 Iniciando API Transbank REAL en puerto 5001")
    print(f"🔧 Ambiente: {'TEST' if Transaction.integration_type == IntegrationType.TEST else 'LIVE'}")
    app.run(debug=True, host='0.0.0.0', port=5001)