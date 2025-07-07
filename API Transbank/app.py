from flask import Flask, request, jsonify
from flask_cors import CORS
import oracledb
import os
from dotenv import load_dotenv
import logging

# Cargar variables de entorno
load_dotenv()

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# Configuración de la base de datos Oracle
DB_USER = os.getenv('DB_USER', 'system')
DB_PASSWORD = os.getenv('DB_PASSWORD', 'oracle')
DB_HOST = os.getenv('DB_HOST', 'localhost')
DB_PORT = os.getenv('DB_PORT', '1521')
DB_SERVICE = os.getenv('DB_SERVICE', 'XE')

# Configurar Oracle
oracledb.init_oracle_client()

def get_db_connection():
    """Obtener conexión a la base de datos Oracle"""
    try:
        connection = oracledb.connect(
            user=DB_USER,
            password=DB_PASSWORD,
            host=DB_HOST,
            port=DB_PORT,
            service_name=DB_SERVICE
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
        connection.close()

# Verificar estado de la API
@app.route('/health', methods=['GET'])
def health_check():
    """Endpoint para verificar el estado de la API"""
    try:
        if connection:
            # Verificar conexión a la base de datos
            cursor = connection.cursor()
            cursor.execute("SELECT 1 FROM DUAL")
            cursor.fetchone()
            cursor.close()
            
            return jsonify({
                'status': 'healthy',
                'message': 'API Transbank funcionando correctamente',
                'database': 'connected'
            })
        else:
            return jsonify({
                'status': 'unhealthy',
                'message': 'Error de conexión a la base de datos',
                'database': 'disconnected'
            }), 500
    except Exception as e:
        logger.error(f"Error en health check: {str(e)}")
        return jsonify({
            'status': 'unhealthy',
            'message': str(e),
            'database': 'error'
        }), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001) 