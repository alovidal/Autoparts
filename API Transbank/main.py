# === Archivo: main.py (actualizado) ===
from flask import Flask, request, jsonify
from flask_cors import CORS
import oracledb
import os
import logging
import random
import time
from datetime import datetime
from config import Config

# Configurar logging
logging.basicConfig(level=getattr(logging, Config.LOG_LEVEL))
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app, origins=Config.CORS_ORIGINS)

def get_db_connection():
    """Obtener conexión a la base de datos Oracle"""
    try:
        connection = oracledb.connect(
            user=Config.DB_USER,
            password=Config.DB_PASSWORD,
            dsn=Config.DB_DSN,
            config_dir=Config.DB_WALLET_DIR,
            wallet_location=Config.DB_WALLET_DIR,
            wallet_password=Config.DB_WALLET_PASSWORD
        )
        return connection
    except Exception as e:
        logger.error(f"Error conectando a la base de datos: {str(e)}")
        raise e

# Variable global para la conexión
connection = None

def initialize_db():
    """Inicializar conexión a la base de datos"""
    global connection
    try:
        connection = get_db_connection()
        logger.info("✅ Conexión a base de datos establecida")
    except Exception as e:
        logger.error(f"❌ Error al conectar a la base de datos: {str(e)}")

@app.before_request
def before_request():
    """Ejecutar antes de cada request"""
    global connection
    if connection is None:
        initialize_db()

@app.teardown_appcontext
def close_db(error):
    """Cerrar conexión a la base de datos"""
    global connection
    if connection:
        try:
            connection.close()
        except:
            pass


@app.route('/transbank/crear-transaccion', methods=['POST'])
def crear_transaccion_transbank():
    """Crear una nueva transacción de Transbank"""
    try:
        data = request.get_json()
        id_pedido = data.get('id_pedido')
        monto = data.get('monto')
        return_url = data.get('return_url')
        session_id = data.get('session_id')
        buy_order = data.get('buy_order')
        
        if not all([id_pedido, monto, return_url, session_id, buy_order]):
            return jsonify({'error': 'Faltan datos requeridos'}), 400
        
        logger.info(f"💳 Creando transacción Transbank: Pedido {id_pedido}, Monto {monto}")
        
        # Generar token único
        token = f"token_{session_id}_{id_pedido}_{int(time.time())}"
        
        # Simular creación de transacción en Transbank
        # En producción, aquí iría la integración real con Transbank
        transaccion_data = {
            'id_pedido': id_pedido,
            'monto': monto,
            'return_url': return_url,
            'session_id': session_id,
            'buy_order': buy_order,
            'token': token,
            'url_pago': f"https://webpay3gint.transbank.cl/webpayserver/initTransaction?token={token}",
            'estado': 'PENDIENTE',
            'fecha_creacion': datetime.now().isoformat()
        }
        
        # Verificar que la conexión esté activa
        if not connection:
            logger.warning("🔄 Reconectando a la base de datos...")
            initialize_db()
        
        # Actualizar estado del pago en la base de datos
        cursor = connection.cursor()
        cursor.execute("""
            UPDATE PAGOS 
            SET ESTADO_PAGO = 'PROCESANDO', 
                FECHA_PAGO = SYSDATE 
            WHERE ID_PEDIDO = :id_pedido
        """, id_pedido=id_pedido)
        
        # Registrar en bitácora
        cursor.execute("""
            INSERT INTO BITACORA (ID_USUARIO, ACCION, FECHA_ACCION)
            SELECT p.ID_USUARIO, 'Transacción Transbank creada - Pedido #' || :id_pedido, SYSDATE
            FROM PEDIDOS p WHERE p.ID_PEDIDO = :id_pedido
        """, id_pedido=id_pedido)
        
        connection.commit()
        cursor.close()
        
        logger.info(f"✅ Transacción creada exitosamente: {token}")
        
        return jsonify({
            'success': True,
            'transaccion': transaccion_data,
            'mensaje': 'Transacción creada exitosamente'
        })
        
    except Exception as e:
        logger.error(f"❌ Error al crear transacción Transbank: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/transbank/confirmar-pago', methods=['POST'])
def confirmar_pago_transbank():
    """Confirmar un pago de Transbank y actualizar inventario"""
    try:
        data = request.get_json()
        token = data.get('token')
        id_pedido = data.get('id_pedido')
        
        if not all([token, id_pedido]):
            return jsonify({'error': 'Faltan datos requeridos'}), 400
        
        logger.info(f"💳 Confirmando pago: Pedido {id_pedido}, Token: {token}")
        
        cursor = connection.cursor()
        
        # Obtener productos del carrito para actualizar inventario
        cursor.execute("""
            SELECT 
                cp.ID_PRODUCTO,
                cp.ID_SUCURSAL,
                cp.CANTIDAD
            FROM CARRITO_PRODUCTOS cp
            JOIN DETALLE_PEDIDO d ON cp.ID_CARRITO = d.ID_CARRITO
            JOIN PEDIDOS p ON d.ID_DETALLE = p.ID_DETALLE
            WHERE p.ID_PEDIDO = :id_pedido
        """, id_pedido=id_pedido)
        
        productos_carrito = cursor.fetchall()
        logger.info(f"📦 Productos en carrito: {productos_carrito}")
        
        # Actualizar inventario para cada producto
        productos_actualizados = []
        for producto in productos_carrito:
            id_producto, id_sucursal, cantidad = producto
            
            # Verificar stock actual
            cursor.execute("""
                SELECT STOCK FROM INVENTARIO 
                WHERE ID_PRODUCTO = :id_producto AND ID_SUCURSAL = :id_sucursal
            """, id_producto=id_producto, id_sucursal=id_sucursal)
            
            stock_actual = cursor.fetchone()
            if stock_actual:
                nuevo_stock = stock_actual[0] - cantidad
                logger.info(f"🔄 Actualizando stock: Producto {id_producto}, Sucursal {id_sucursal}, Stock actual: {stock_actual[0]}, Cantidad vendida: {cantidad}, Nuevo stock: {nuevo_stock}")
                
                # Actualizar inventario
                cursor.execute("""
                    UPDATE INVENTARIO 
                    SET STOCK = :nuevo_stock 
                    WHERE ID_PRODUCTO = :id_producto AND ID_SUCURSAL = :id_sucursal
                """, nuevo_stock=nuevo_stock, id_producto=id_producto, id_sucursal=id_sucursal)
                
                productos_actualizados.append({
                    'id_producto': id_producto,
                    'id_sucursal': id_sucursal,
                    'cantidad_vendida': cantidad,
                    'stock_anterior': stock_actual[0],
                    'stock_nuevo': nuevo_stock
                })
        
        # Actualizar estado del pago
        cursor.execute("""
            UPDATE PAGOS 
            SET ESTADO_PAGO = 'APROBADO', 
                FECHA_PAGO = SYSDATE 
            WHERE ID_PEDIDO = :id_pedido
        """, id_pedido=id_pedido)
        
        # Actualizar estado del pedido
        cursor.execute("""
            UPDATE DETALLE_PEDIDO 
            SET ESTADO = 'CONFIRMADO' 
            WHERE ID_DETALLE = (
                SELECT ID_DETALLE FROM PEDIDOS WHERE ID_PEDIDO = :id_pedido
            )
        """, id_pedido=id_pedido)
        
        # Registrar en bitácora
        cursor.execute("""
            INSERT INTO BITACORA (ID_USUARIO, ACCION, FECHA_ACCION)
            SELECT p.ID_USUARIO, 'Pago confirmado - Pedido #' || :id_pedido || ' - Inventario actualizado', SYSDATE
            FROM PEDIDOS p WHERE p.ID_PEDIDO = :id_pedido
        """, id_pedido=id_pedido)
        
        connection.commit()
        cursor.close()
        
        logger.info(f"✅ Pago confirmado exitosamente para pedido {id_pedido}")
        
        return jsonify({
            'success': True,
            'mensaje': 'Pago confirmado exitosamente',
            'id_pedido': id_pedido,
            'productos_actualizados': productos_actualizados,
            'total_productos': len(productos_actualizados)
        })
        
    except Exception as e:
        logger.error(f"❌ Error al confirmar pago: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/transbank/estadisticas', methods=['GET'])
def obtener_estadisticas_transbank():
    """Obtener estadísticas de transacciones Transbank"""
    try:
        cursor = connection.cursor()
        
        # Estadísticas de pagos
        cursor.execute("""
            SELECT 
                COUNT(*) as total_pagos,
                SUM(CASE WHEN ESTADO_PAGO = 'APROBADO' THEN 1 ELSE 0 END) as pagos_exitosos,
                SUM(CASE WHEN ESTADO_PAGO = 'PENDIENTE' THEN 1 ELSE 0 END) as pagos_pendientes,
                SUM(CASE WHEN ESTADO_PAGO = 'FALLIDO' THEN 1 ELSE 0 END) as pagos_fallidos,
                SUM(MONTO_TOTAL) as monto_total
            FROM PAGOS
            WHERE METODO_PAGO = 'TRANSBANK'
        """)
        
        stats_pagos = cursor.fetchone()
        
        # Estadísticas de pedidos
        cursor.execute("""
            SELECT 
                COUNT(*) as total_pedidos,
                SUM(CASE WHEN d.ESTADO = 'CONFIRMADO' THEN 1 ELSE 0 END) as pedidos_confirmados,
                SUM(CASE WHEN d.ESTADO = 'PENDIENTE' THEN 1 ELSE 0 END) as pedidos_pendientes
            FROM PEDIDOS p
            JOIN DETALLE_PEDIDO d ON p.ID_DETALLE = d.ID_DETALLE
            JOIN PAGOS pg ON p.ID_PEDIDO = pg.ID_PEDIDO
            WHERE pg.METODO_PAGO = 'TRANSBANK'
        """)
        
        stats_pedidos = cursor.fetchone()
        
        # Productos más vendidos
        cursor.execute("""
            SELECT 
                p.NOMBRE,
                p.MARCA,
                SUM(cp.CANTIDAD) as cantidad_vendida,
                SUM(cp.VALOR_TOTAL) as valor_total
            FROM CARRITO_PRODUCTOS cp
            JOIN PRODUCTOS p ON cp.ID_PRODUCTO = p.ID_PRODUCTO
            JOIN DETALLE_PEDIDO d ON cp.ID_CARRITO = d.ID_CARRITO
            JOIN PEDIDOS ped ON d.ID_DETALLE = ped.ID_DETALLE
            JOIN PAGOS pg ON ped.ID_PEDIDO = pg.ID_PEDIDO
            WHERE pg.ESTADO_PAGO = 'APROBADO' AND pg.METODO_PAGO = 'TRANSBANK'
            GROUP BY p.ID_PRODUCTO, p.NOMBRE, p.MARCA
            ORDER BY cantidad_vendida DESC
            FETCH FIRST 5 ROWS ONLY
        """)
        
        productos_vendidos = []
        for row in cursor.fetchall():
            productos_vendidos.append({
                'nombre': row[0],
                'marca': row[1],
                'cantidad_vendida': row[2],
                'valor_total': float(row[3]) if row[3] else 0
            })
        
        # Estadísticas de simulación
        cursor.execute("""
            SELECT 
                COUNT(*) as total_transacciones,
                SUM(CASE WHEN ESTADO_PAGO = 'APROBADO' THEN 1 ELSE 0 END) as exitosas,
                SUM(CASE WHEN ESTADO_PAGO = 'PENDIENTE' THEN 1 ELSE 0 END) as pendientes,
                SUM(CASE WHEN ESTADO_PAGO = 'FALLIDO' THEN 1 ELSE 0 END) as fallidas
            FROM PAGOS
            WHERE METODO_PAGO = 'TRANSBANK'
        """)
        
        stats_simulacion = cursor.fetchone()
        
        cursor.close()
        
        return jsonify({
            'pagos': {
                'total': stats_pagos[0],
                'exitosos': stats_pagos[1],
                'pendientes': stats_pagos[2],
                'fallidos': stats_pagos[3],
                'monto_total': float(stats_pagos[4]) if stats_pagos[4] else 0
            },
            'pedidos': {
                'total': stats_pedidos[0],
                'confirmados': stats_pedidos[1],
                'pendientes': stats_pedidos[2]
            },
            'productos_mas_vendidos': productos_vendidos,
            'simulacion': {
                'total_transacciones': stats_simulacion[0],
                'exitosas': stats_simulacion[1],
                'pendientes': stats_simulacion[2],
                'fallidas': stats_simulacion[3]
            },
            'configuracion': {
                'ambiente': Config.TRANSBANK_ENVIRONMENT,
                'modo_simulacion': Config.is_simulation_mode(),
                'tasa_exito': Config.SIMULATION_SUCCESS_RATE,
                'tasa_pendiente': Config.SIMULATION_PENDING_RATE,
                'tasa_fallo': Config.SIMULATION_FAILURE_RATE
            }
        })
        
    except Exception as e:
        logger.error(f"❌ Error al obtener estadísticas: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/transbank/simular-pago', methods=['POST'])
def simular_pago_transbank():
    """Simular un pago con diferentes escenarios"""
    try:
        data = request.get_json()
        id_pedido = data.get('id_pedido')
        escenario = data.get('escenario', 'aleatorio')  # aleatorio, exito, pendiente, fallo
        
        if not id_pedido:
            return jsonify({'error': 'ID de pedido requerido'}), 400
        
        logger.info(f"🎲 Simulando pago: Pedido {id_pedido}, Escenario: {escenario}")
        
        # Determinar resultado según escenario
        if escenario == 'aleatorio':
            resultado = random.choices(
                ['exito', 'pendiente', 'fallo'],
                weights=[Config.SIMULATION_SUCCESS_RATE, Config.SIMULATION_PENDING_RATE, Config.SIMULATION_FAILURE_RATE]
            )[0]
        else:
            resultado = escenario
        
        # Simular tiempo de procesamiento
        time.sleep(random.uniform(1, 3))
        
        cursor = connection.cursor()
        
        if resultado == 'exito':
            # Procesar pago exitoso
            estado_pago = 'APROBADO'
            mensaje = 'Pago procesado exitosamente'
            
            # Actualizar inventario (igual que en confirmar-pago)
            cursor.execute("""
                SELECT 
                    cp.ID_PRODUCTO,
                    cp.ID_SUCURSAL,
                    cp.CANTIDAD
                FROM CARRITO_PRODUCTOS cp
                JOIN DETALLE_PEDIDO d ON cp.ID_CARRITO = d.ID_CARRITO
                JOIN PEDIDOS p ON d.ID_DETALLE = p.ID_DETALLE
                WHERE p.ID_PEDIDO = :id_pedido
            """, id_pedido=id_pedido)
            
            productos_carrito = cursor.fetchall()
            
            for producto in productos_carrito:
                id_producto, id_sucursal, cantidad = producto
                cursor.execute("""
                    UPDATE INVENTARIO 
                    SET STOCK = STOCK - :cantidad 
                    WHERE ID_PRODUCTO = :id_producto AND ID_SUCURSAL = :id_sucursal
                """, cantidad=cantidad, id_producto=id_producto, id_sucursal=id_sucursal)
            
            # Actualizar estado del pedido
            cursor.execute("""
                UPDATE DETALLE_PEDIDO 
                SET ESTADO = 'CONFIRMADO' 
                WHERE ID_DETALLE = (
                    SELECT ID_DETALLE FROM PEDIDOS WHERE ID_PEDIDO = :id_pedido
                )
            """, id_pedido=id_pedido)
            
        elif resultado == 'pendiente':
            estado_pago = 'PENDIENTE'
            mensaje = 'Pago en revisión por el banco'
            
        else:  # fallo
            estado_pago = 'FALLIDO'
            mensaje = 'Pago rechazado por el banco'
        
        # Actualizar estado del pago
        cursor.execute("""
            UPDATE PAGOS 
            SET ESTADO_PAGO = :estado_pago, 
                FECHA_PAGO = SYSDATE 
            WHERE ID_PEDIDO = :id_pedido
        """, estado_pago=estado_pago, id_pedido=id_pedido)
        
        # Registrar en bitácora
        cursor.execute("""
            INSERT INTO BITACORA (ID_USUARIO, ACCION, FECHA_ACCION)
            SELECT p.ID_USUARIO, 'Simulación Transbank - ' || :estado_pago || ' - Pedido #' || :id_pedido, SYSDATE
            FROM PEDIDOS p WHERE p.ID_PEDIDO = :id_pedido
        """, estado_pago=estado_pago, id_pedido=id_pedido)
        
        connection.commit()
        cursor.close()
        
        logger.info(f"✅ Simulación completada: {resultado}")
        
        return jsonify({
            'success': True,
            'resultado': resultado,
            'estado_pago': estado_pago,
            'mensaje': mensaje,
            'id_pedido': id_pedido,
            'inventario_actualizado': resultado == 'exito'
        })
        
    except Exception as e:
        logger.error(f"❌ Error en simulación: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/transbank/health', methods=['GET'])
def health_check():
    """Endpoint para verificar el estado de la API Transbank"""
    try:
        if connection:
            # Verificar conexión a la base de datos
            cursor = connection.cursor()
            cursor.execute("SELECT 1 FROM DUAL")
            cursor.fetchone()
            cursor.close()
            
            return jsonify({
                'status': 'healthy',
                'service': 'API Transbank',
                'message': 'API Transbank funcionando correctamente',
                'database': 'connected',
                'environment': Config.TRANSBANK_ENVIRONMENT,
                'simulation_mode': Config.is_simulation_mode(),
                'timestamp': datetime.now().isoformat()
            })
        else:
            return jsonify({
                'status': 'unhealthy',
                'service': 'API Transbank',
                'message': 'Error de conexión a la base de datos',
                'database': 'disconnected'
            }), 500
    except Exception as e:
        logger.error(f"Error en health check: {str(e)}")
        return jsonify({
            'status': 'unhealthy',
            'service': 'API Transbank',
            'message': str(e),
            'database': 'error'
        }), 500

if __name__ == '__main__':
    logger.info(f"🚀 Iniciando API Transbank en puerto {Config.API_PORT}")
    logger.info(f"🌍 Ambiente: {Config.TRANSBANK_ENVIRONMENT}")
    logger.info(f"🎲 Modo simulación: {Config.is_simulation_mode()}")
    app.run(debug=Config.DEBUG, host=Config.API_HOST, port=Config.API_PORT) 