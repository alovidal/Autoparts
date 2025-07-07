import oracledb
import os
from dotenv import load_dotenv

# Cargar variables de entorno
load_dotenv()

# Configuración de Oracle Cloud (igual que API Interna)
usuario = os.getenv("usuario", "ADMIN")
clave = os.getenv("clave", "Autoparts2024*")
wallet_dir = r"wallet"
wallet_password = os.getenv("wallet_password", "Autoparts2024*")
dsn = os.getenv("dsn", "integracionplataformasbd_high")

# Configuración de Transbank
TRANSBANK_COMMERCE_CODE = os.getenv('TRANSBANK_COMMERCE_CODE', '597055555532')
TRANSBANK_API_KEY = os.getenv('TRANSBANK_API_KEY', '579B532A7440BB0C9079DED94D31EA1615BACEB56610332264630D42D0A36B1C')
TRANSBANK_ENVIRONMENT = os.getenv('TRANSBANK_ENVIRONMENT', 'integration')

# Configuración de la API
API_HOST = os.getenv('API_HOST', '0.0.0.0')
API_PORT = int(os.getenv('API_PORT', '5001'))
DEBUG = os.getenv('DEBUG', 'True').lower() == 'true'

# Configuración de CORS
CORS_ORIGINS = os.getenv('CORS_ORIGINS', 'http://localhost:5173,http://localhost:3000').split(',')

# Configuración de logging
LOG_LEVEL = os.getenv('LOG_LEVEL', 'INFO')
LOG_FORMAT = '%(asctime)s - %(name)s - %(levelname)s - %(message)s'

# Configuración de simulación
SIMULATION_SUCCESS_RATE = float(os.getenv('SIMULATION_SUCCESS_RATE', '0.6'))
SIMULATION_PENDING_RATE = float(os.getenv('SIMULATION_PENDING_RATE', '0.2'))
SIMULATION_FAILURE_RATE = float(os.getenv('SIMULATION_FAILURE_RATE', '0.2'))

# URLs de Transbank
TRANSBANK_URLS = {
    'integration': {
        'init_transaction': 'https://webpay3gint.transbank.cl/rswebpaytransaction/api/webpay/v1.2/transactions',
        'commit_transaction': 'https://webpay3gint.transbank.cl/rswebpaytransaction/api/webpay/v1.2/transactions/{token}',
        'transaction_status': 'https://webpay3gint.transbank.cl/rswebpaytransaction/api/webpay/v1.2/transactions/{token}',
        'refund': 'https://webpay3gint.transbank.cl/rswebpaytransaction/api/webpay/v1.2/transactions/{token}/refunds'
    },
    'production': {
        'init_transaction': 'https://webpay3g.transbank.cl/rswebpaytransaction/api/webpay/v1.2/transactions',
        'commit_transaction': 'https://webpay3g.transbank.cl/rswebpaytransaction/api/webpay/v1.2/transactions/{token}',
        'transaction_status': 'https://webpay3g.transbank.cl/rswebpaytransaction/api/webpay/v1.2/transactions/{token}',
        'refund': 'https://webpay3g.transbank.cl/rswebpaytransaction/api/webpay/v1.2/transactions/{token}/refunds'
    }
}

# Datos de prueba para simulación
TEST_DATA = {
    'card_number': '4051885600446623',
    'cvv': '123',
    'expiry_date': '12/25',
    'rut': '11111111-1',
    'card_holder': 'TEST USER'
}

class Config:
    """Configuración de la API Transbank"""
    
    # Configuración de la base de datos (igual que API Interna)
    DB_USER = usuario
    DB_PASSWORD = clave
    DB_DSN = dsn
    DB_WALLET_DIR = wallet_dir
    DB_WALLET_PASSWORD = wallet_password
    
    # Configuración de Transbank
    TRANSBANK_COMMERCE_CODE = TRANSBANK_COMMERCE_CODE
    TRANSBANK_API_KEY = TRANSBANK_API_KEY
    TRANSBANK_ENVIRONMENT = TRANSBANK_ENVIRONMENT
    
    # Configuración de la API
    API_HOST = API_HOST
    API_PORT = API_PORT
    DEBUG = DEBUG
    
    # Configuración de CORS
    CORS_ORIGINS = CORS_ORIGINS
    
    # Configuración de logging
    LOG_LEVEL = LOG_LEVEL
    LOG_FORMAT = LOG_FORMAT
    
    # Configuración de simulación
    SIMULATION_SUCCESS_RATE = SIMULATION_SUCCESS_RATE
    SIMULATION_PENDING_RATE = SIMULATION_PENDING_RATE
    SIMULATION_FAILURE_RATE = SIMULATION_FAILURE_RATE
    
    # URLs de Transbank
    TRANSBANK_URLS = TRANSBANK_URLS
    
    # Datos de prueba
    TEST_DATA = TEST_DATA
    
    @classmethod
    def get_transbank_urls(cls):
        """Obtener URLs de Transbank según el ambiente"""
        return cls.TRANSBANK_URLS.get(cls.TRANSBANK_ENVIRONMENT, cls.TRANSBANK_URLS['integration'])
    
    @classmethod
    def is_production(cls):
        """Verificar si estamos en producción"""
        return cls.TRANSBANK_ENVIRONMENT == 'production'
    
    @classmethod
    def is_simulation_mode(cls):
        """Verificar si estamos en modo simulación"""
        return cls.TRANSBANK_ENVIRONMENT == 'integration' or cls.DEBUG 