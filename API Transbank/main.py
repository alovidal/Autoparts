from flask import Flask, request, jsonify, redirect
from flask_cors import CORS
import oracledb
import os
from dotenv import load_dotenv
import logging
import traceback
from datetime import datetime

# Importar correctamente la librería de Transbank
try:
    from transbank.webpay.webpay_plus.transaction import Transaction
    from transbank.common.options import WebpayOptions
    from transbank.common.integration_type import IntegrationType
    TRANSBANK_AVAILABLE = True
except ImportError as e:
    print(f"⚠️  Transbank SDK no disponible: {e}")
    TRANSBANK_AVAILABLE = False

load_dotenv()

app = Flask(__name__)
CORS(app)

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Configuración de Transbank
COMMERCE_CODE = os.getenv('TRANSBANK_COMMERCE_CODE', '597055555532')
API_KEY = os.getenv('TRANSBANK_API_KEY', '579B532A7440BB0C9079DED94D31EA1615BACEB56610332264630D42D0A36B1C')
ENVIRONMENT = os.getenv('TRANSBANK_ENVIRONMENT', 'TEST')

# Crear opciones de Transbank
transbank_options = None
if TRANSBANK_AVAILABLE:
    try:
        transbank_options = WebpayOptions(
            commerce_code=COMMERCE_CODE,
            api_key=API_KEY,
            integration_type=IntegrationType.TEST if ENVIRONMENT == 'TEST' else IntegrationType.LIVE
        )
        logger.info(f"✅ Transbank configurado: {ENVIRONMENT} - {COMMERCE_CODE}")
    except Exception as e:
        logger.error(f"❌ Error configurando Transbank: {e}")
        TRANSBANK_AVAILABLE = False

# Configuración de base de datos Oracle
DB_CONFIG = {
    'user': os.getenv("usuario"),
    'password': os.getenv("clave"),
    'dsn': os.getenv("dsn"),
    'config_dir': r"wallet",
    'wallet_location': r"wallet",
    'wallet_password': os.getenv("wallet_password")
}

# Variable global para la conexión
connection = None

def get_db_connection():
    """Obtener conexión a la base de datos"""
    global connection
    try:
        if connection is None or not connection.ping():
            connection = oracledb.connect(**DB_CONFIG)
            logger.info("✅ Conexión a Oracle establecida")
        return connection
    except Exception as e:
        logger.error(f"❌ Error conectando a Oracle: {e}")
        return None

def execute_db_query(query, params=None, fetch=False):
    """Ejecutar consulta en la base de datos de forma segura"""
    try:
        conn = get_db_connection()
        if not conn:
            return None
        
        cursor = conn.cursor()
        cursor.execute(query, params or {})
        
        if fetch:
            result = cursor.fetchall() if fetch == 'all' else cursor.fetchone()
        else:
            conn.commit()
            result = True
        
        cursor.close()
        return result
    except Exception as e:
        logger.error(f"❌ Error en consulta DB: {e}")
        return None

@app.route('/transbank/health', methods=['GET'])
def health():
    """Health check completo"""
    db_status = "connected" if get_db_connection() else "disconnected"
    
    return jsonify({
        'status': 'ok',
        'service': 'Transbank API',
        'version': '1.0.0',
        'timestamp': datetime.now().isoformat(),
        'environment': ENVIRONMENT,
        'commerce_code': COMMERCE_CODE,
        'transbank_sdk': TRANSBANK_AVAILABLE,
        'database': db_status,
        'endpoints': {
            'crear_transaccion': '/transbank/crear-transaccion',
            'confirmar': '/transbank/confirmar/{id_pedido}',
            'estado_pedido': '/transbank/estado-pedido/{id_pedido}',
            'estadisticas': '/transbank/estadisticas'
        }
    })

@app.route('/transbank/crear-transaccion', methods=['POST'])
def crear_transaccion():
    """Crear transacción real con Transbank WebPay Plus"""
    try:
        if not TRANSBANK_AVAILABLE:
            return jsonify({
                'error': 'Transbank SDK no disponible',
                'message': 'Instala la librería: pip install transbank-sdk'
            }), 500
        
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No se recibieron datos'}), 400
        
        id_pedido = data.get('id_pedido')
        monto = data.get('monto')
        
        if not id_pedido or not monto:
            return jsonify({'error': 'id_pedido y monto son requeridos'}), 400
        
        # Validar que el pedido existe
        pedido_exists = execute_db_query(
            "SELECT COUNT(*) FROM PEDIDOS WHERE ID_PEDIDO = :id_pedido",
            {'id_pedido': id_pedido},
            fetch='one'
        )
        
        if not pedido_exists or pedido_exists[0] == 0:
            return jsonify({'error': f'Pedido {id_pedido} no encontrado'}), 404
        
        # URLs de retorno
        return_url = f"http://localhost:5001/transbank/confirmar/{id_pedido}"
        
        # Datos para Transbank
        buy_order = f"ORDER_{id_pedido}_{int(datetime.now().timestamp())}"
        session_id = f"SESSION_{id_pedido}_{int(datetime.now().timestamp())}"
        amount = int(float(monto))  # Convertir a entero (pesos chilenos)
        
        logger.info(f"💳 Creando transacción Transbank: Pedido {id_pedido}, Monto ${amount:,}")
        
        # Crear transacción con Transbank
        transaction = Transaction(transbank_options)
        response = transaction.create(
            buy_order=buy_order,
            session_id=session_id,
            amount=amount,
            return_url=return_url
        )
        
        logger.info(f"✅ Transacción creada - Token: {response.get('token', 'N/A')[:20]}...")
        
        # Actualizar estado del pago a PROCESANDO
        execute_db_query("""
            UPDATE PAGOS 
            SET ESTADO_PAGO = 'PROCESANDO'
            WHERE ID_PEDIDO = :id_pedido
        """, {'id_pedido': id_pedido})
        
        # Registrar en bitácora
        execute_db_query("""
            INSERT INTO BITACORA (ID_USUARIO, ACCION, FECHA_ACCION)
            SELECT p.ID_USUARIO, 
                   'Transacción Transbank iniciada - Pedido #' || :id_pedido || ' - Token: ' || :token,
                   SYSDATE
            FROM PEDIDOS p WHERE p.ID_PEDIDO = :id_pedido
        """, {
            'id_pedido': id_pedido,
            'token': response.get('token', 'N/A')[:20]
        })
        
        return jsonify({
            'success': True,
            'token': response['token'],
            'url': response['url'],
            'id_pedido': id_pedido,
            'buy_order': buy_order,
            'amount': amount,
            'mensaje': 'Transacción creada exitosamente. Redirigiendo a Transbank...'
        })
        
    except Exception as e:
        logger.error(f"❌ Error creando transacción: {e}")
        logger.error(traceback.format_exc())
        return jsonify({
            'error': 'Error interno del servidor',
            'message': str(e),
            'type': type(e).__name__
        }), 500

@app.route('/transbank/confirmar/<int:id_pedido>', methods=['POST', 'GET'])
def confirmar_transaccion(id_pedido):
    """Confirmar transacción después del pago en Transbank"""
    try:
        # Obtener token desde la respuesta de Transbank
        token = request.form.get('token_ws') or request.args.get('token_ws')
        
        if not token:
            logger.error("❌ No se recibió token de Transbank")
            return redirect(f"http://localhost:5173/payment-success?order_id={id_pedido}&status=error&message=token_missing")
        
        logger.info(f"🔄 Confirmando transacción: Pedido {id_pedido}, Token: {token[:20]}...")
        
        if not TRANSBANK_AVAILABLE:
            logger.error("❌ Transbank SDK no disponible")
            return redirect(f"http://localhost:5173/payment-success?order_id={id_pedido}&status=error&message=sdk_unavailable")
        
        # Confirmar transacción con Transbank
        transaction = Transaction(transbank_options)
        response = transaction.commit(token)
        
        logger.info(f"📊 Respuesta de confirmación: Status={response.get('status')}, Amount={response.get('amount')}")
        
        # Verificar el estado de la transacción
        if response.get('status') == 'AUTHORIZED':
            # PAGO EXITOSO
            logger.info(f"✅ Pago autorizado para pedido {id_pedido}")
            
            # Actualizar base de datos
            success = process_successful_payment(id_pedido, response)
            
            if success:
                # Redirigir a página de éxito
                auth_code = response.get('authorization_code', 'N/A')
                return redirect(f"http://localhost:5173/payment-success?order_id={id_pedido}&status=success&auth_code={auth_code}")
            else:
                logger.error(f"❌ Error actualizando base de datos para pedido {id_pedido}")
                return redirect(f"http://localhost:5173/payment-success?order_id={id_pedido}&status=error&message=db_update_failed")
        
        else:
            # PAGO FALLIDO
            logger.warning(f"❌ Pago no autorizado para pedido {id_pedido}: {response.get('status')}")
            
            # Actualizar estado del pago
            execute_db_query("""
                UPDATE PAGOS 
                SET ESTADO_PAGO = 'FALLIDO', 
                    FECHA_PAGO = SYSDATE 
                WHERE ID_PEDIDO = :id_pedido
            """, {'id_pedido': id_pedido})
            
            # Registrar en bitácora
            execute_db_query("""
                INSERT INTO BITACORA (ID_USUARIO, ACCION, FECHA_ACCION)
                SELECT p.ID_USUARIO, 
                       'Pago Transbank fallido - Pedido #' || :id_pedido || ' - Status: ' || :status,
                       SYSDATE
                FROM PEDIDOS p WHERE p.ID_PEDIDO = :id_pedido
            """, {
                'id_pedido': id_pedido,
                'status': response.get('status', 'UNKNOWN')
            })
            
            return redirect(f"http://localhost:5173/payment-success?order_id={id_pedido}&status=failed&reason={response.get('status', 'unknown')}")
        
    except Exception as e:
        logger.error(f"❌ Error confirmando transacción: {e}")
        logger.error(traceback.format_exc())
        return redirect(f"http://localhost:5173/payment-success?order_id={id_pedido}&status=error&message=server_error")

def process_successful_payment(id_pedido, response):
    """Procesar pago exitoso y actualizar base de datos"""
    try:
        conn = get_db_connection()
        if not conn:
            return False
        
        cursor = conn.cursor()
        
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
        
        # 3. Obtener productos del pedido para actualizar inventario
        cursor.execute("""
            SELECT cp.ID_PRODUCTO, cp.ID_SUCURSAL, cp.CANTIDAD
            FROM CARRITO_PRODUCTOS cp
            JOIN DETALLE_PEDIDO dp ON cp.ID_CARRITO = dp.ID_CARRITO
            JOIN PEDIDOS p ON dp.ID_DETALLE = p.ID_DETALLE
            WHERE p.ID_PEDIDO = :id_pedido
        """, {'id_pedido': id_pedido})
        
        productos = cursor.fetchall()
        
        # 4. Actualizar inventario (rebajar stock)
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
            logger.info(f"📦 Stock actualizado: Producto {id_producto}, Sucursal {id_sucursal}, Cantidad -{cantidad}")
        
        # 5. Registrar en bitácora
        cursor.execute("""
            INSERT INTO BITACORA (ID_USUARIO, ACCION, FECHA_ACCION)
            SELECT p.ID_USUARIO, 
                   'Pago Transbank EXITOSO - Pedido #' || :id_pedido || 
                   ' - Autorización: ' || :auth_code || 
                   ' - Monto: $' || :amount,
                   SYSDATE
            FROM PEDIDOS p WHERE p.ID_PEDIDO = :id_pedido
        """, {
            'id_pedido': id_pedido,
            'auth_code': response.get('authorization_code', 'N/A'),
            'amount': response.get('amount', 0)
        })
        
        conn.commit()
        cursor.close()
        
        logger.info(f"✅ Base de datos actualizada exitosamente para pedido {id_pedido}")
        return True
        
    except Exception as e:
        logger.error(f"❌ Error procesando pago exitoso: {e}")
        logger.error(traceback.format_exc())
        if conn:
            conn.rollback()
        return False

@app.route('/transbank/estado-pedido/<int:id_pedido>', methods=['GET'])
def estado_pedido(id_pedido):
    """Obtener estado actual del pedido"""
    try:
        result = execute_db_query("""
            SELECT 
                p.ID_PEDIDO,
                dp.ESTADO as ESTADO_PEDIDO,
                pg.ESTADO_PAGO,
                pg.MONTO_TOTAL,
                p.FECHA_PEDIDO,
                u.NOMBRE_COMPLETO
            FROM PEDIDOS p
            JOIN DETALLE_PEDIDO dp ON p.ID_DETALLE = dp.ID_DETALLE
            JOIN USUARIOS u ON p.ID_USUARIO = u.ID_USUARIO
            LEFT JOIN PAGOS pg ON p.ID_PEDIDO = pg.ID_PEDIDO
            WHERE p.ID_PEDIDO = :id_pedido
        """, {'id_pedido': id_pedido}, fetch='one')
        
        if result:
            return jsonify({
                'success': True,
                'pedido': {
                    'id_pedido': result[0],
                    'estado_pedido': result[1],
                    'estado_pago': result[2],
                    'monto_total': float(result[3]) if result[3] else 0,
                    'fecha_pedido': str(result[4]),
                    'cliente': result[5]
                }
            })
        else:
            return jsonify({'error': 'Pedido no encontrado'}), 404
            
    except Exception as e:
        logger.error(f"❌ Error obteniendo estado: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/transbank/estadisticas', methods=['GET'])
def estadisticas():
    """Obtener estadísticas de transacciones"""
    try:
        # Estadísticas de pagos
        stats_pagos = execute_db_query("""
            SELECT 
                COUNT(*) as total_pagos,
                SUM(CASE WHEN ESTADO_PAGO = 'PAGADO' THEN 1 ELSE 0 END) as pagos_exitosos,
                SUM(CASE WHEN ESTADO_PAGO = 'PENDIENTE' THEN 1 ELSE 0 END) as pagos_pendientes,
                SUM(CASE WHEN ESTADO_PAGO = 'FALLIDO' THEN 1 ELSE 0 END) as pagos_fallidos,
                COALESCE(SUM(CASE WHEN ESTADO_PAGO = 'PAGADO' THEN MONTO_TOTAL ELSE 0 END), 0) as monto_total
            FROM PAGOS
        """, fetch='one')
        
        # Estadísticas de pedidos
        stats_pedidos = execute_db_query("""
            SELECT 
                COUNT(*) as total_pedidos,
                SUM(CASE WHEN ESTADO = 'CONFIRMADO' THEN 1 ELSE 0 END) as pedidos_confirmados,
                SUM(CASE WHEN ESTADO = 'PENDIENTE' THEN 1 ELSE 0 END) as pedidos_pendientes
            FROM DETALLE_PEDIDO
        """, fetch='one')
        
        # Transacciones recientes
        transacciones_recientes = execute_db_query("""
            SELECT 
                p.ID_PEDIDO,
                pg.ESTADO_PAGO,
                pg.MONTO_TOTAL,
                pg.FECHA_PAGO,
                u.NOMBRE_COMPLETO
            FROM PAGOS pg
            JOIN PEDIDOS p ON pg.ID_PEDIDO = p.ID_PEDIDO
            JOIN USUARIOS u ON p.ID_USUARIO = u.ID_USUARIO
            WHERE pg.FECHA_PAGO >= SYSDATE - 30
            ORDER BY pg.FECHA_PAGO DESC
            FETCH FIRST 10 ROWS ONLY
        """, fetch='all')
        
        return jsonify({
            'success': True,
            'periodo': 'Últimos 30 días',
            'timestamp': datetime.now().isoformat(),
            'pagos': {
                'total': stats_pagos[0] if stats_pagos else 0,
                'exitosos': stats_pagos[1] if stats_pagos else 0,
                'pendientes': stats_pagos[2] if stats_pagos else 0,
                'fallidos': stats_pagos[3] if stats_pagos else 0,
                'monto_total': float(stats_pagos[4]) if stats_pagos else 0
            },
            'pedidos': {
                'total': stats_pedidos[0] if stats_pedidos else 0,
                'confirmados': stats_pedidos[1] if stats_pedidos else 0,
                'pendientes': stats_pedidos[2] if stats_pedidos else 0
            },
            'transacciones_recientes': [
                {
                    'id_pedido': t[0],
                    'estado': t[1],
                    'monto': float(t[2]) if t[2] else 0,
                    'fecha': str(t[3]),
                    'cliente': t[4]
                }
                for t in (transacciones_recientes or [])
            ]
        })
        
    except Exception as e:
        logger.error(f"❌ Error obteniendo estadísticas: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/transbank/test-connection', methods=['GET'])
def test_connection():
    """Probar conexión con Transbank sin crear transacción"""
    try:
        if not TRANSBANK_AVAILABLE:
            return jsonify({
                'status': 'error',
                'message': 'Transbank SDK no disponible',
                'solution': 'Ejecuta: pip install transbank-sdk'
            }), 500
        
        # Solo verificar que podemos instanciar la clase
        transaction = Transaction(transbank_options)
        
        return jsonify({
            'status': 'ok',
            'message': 'Conexión con Transbank disponible',
            'environment': ENVIRONMENT,
            'commerce_code': COMMERCE_CODE,
            'integration_type': 'TEST' if ENVIRONMENT == 'TEST' else 'LIVE'
        })
        
    except Exception as e:
        logger.error(f"❌ Error testando conexión Transbank: {e}")
        return jsonify({
            'status': 'error',
            'message': str(e),
            'type': type(e).__name__
        }), 500

@app.errorhandler(404)
def not_found(error):
    return jsonify({
        'error': 'Endpoint no encontrado',
        'message': 'Verifica la URL y el método HTTP',
        'available_endpoints': [
            'GET /transbank/health',
            'POST /transbank/crear-transaccion',
            'POST /transbank/confirmar/{id_pedido}',
            'GET /transbank/estado-pedido/{id_pedido}',
            'GET /transbank/estadisticas',
            'GET /transbank/test-connection'
        ]
    }), 404

@app.errorhandler(500)
def internal_error(error):
    logger.error(f"Error interno del servidor: {error}")
    return jsonify({
        'error': 'Error interno del servidor',
        'message': 'Revisa los logs para más detalles'
    }), 500

if __name__ == '__main__':
    print("🚀 Iniciando API Transbank")
    print("=" * 50)
    print(f"🔧 Ambiente: {ENVIRONMENT}")
    print(f"🏪 Commerce Code: {COMMERCE_CODE}")
    print(f"📦 Transbank SDK: {'✅ Disponible' if TRANSBANK_AVAILABLE else '❌ No disponible'}")
    print(f"🗄️  Base de datos: {'✅ Conectada' if get_db_connection() else '❌ No conectada'}")
    print(f"🌐 Puerto: 5001")
    print(f"🔗 Health check: http://localhost:5001/transbank/health")
    print("=" * 50)
    
    app.run(debug=True, host='0.0.0.0', port=5001)