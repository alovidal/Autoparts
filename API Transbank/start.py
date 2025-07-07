#!/usr/bin/env python3
"""
Script de inicio para la API Transbank
"""

import os
import sys
import subprocess
import time
from pathlib import Path

def check_dependencies():
    """Verificar que las dependencias estén instaladas"""
    try:
        import flask
        import flask_cors
        import oracledb
        import dotenv
        print("✅ Todas las dependencias están instaladas")
        return True
    except ImportError as e:
        print(f"❌ Dependencia faltante: {e}")
        print("Instalando dependencias...")
        subprocess.run([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])
        return True

def check_env_file():
    """Verificar que el archivo .env exista"""
    if not os.path.exists('.env'):
        print("⚠️  Archivo .env no encontrado, creando uno con valores por defecto...")
        with open('.env', 'w') as f:
            f.write("""# Configuración de Base de Datos
DB_USER=system
DB_PASSWORD=oracle
DB_HOST=localhost
DB_PORT=1521
DB_SERVICE=XE

# Configuración de Transbank
TRANSBANK_COMMERCE_CODE=597055555532
TRANSBANK_API_KEY=579B532A7440BB0C9079DED94D31EA1615BACEB56610332264630D42D0A36B1C
TRANSBANK_ENVIRONMENT=integration

# Configuración de la API
API_HOST=0.0.0.0
API_PORT=5001
DEBUG=True

# Configuración de CORS
CORS_ORIGINS=http://localhost:5173,http://localhost:3000

# Configuración de Simulación
SIMULATION_SUCCESS_RATE=0.6
SIMULATION_PENDING_RATE=0.2
SIMULATION_FAILURE_RATE=0.2

# Configuración de Logging
LOG_LEVEL=INFO
""")
        print("✅ Archivo .env creado con configuración por defecto")

def start_api():
    """Iniciar la API de Transbank"""
    print("🚀 Iniciando API Transbank...")
    print("📍 Puerto: 5001")
    print("🌍 Host: 0.0.0.0")
    print("🔗 URL: http://localhost:5001")
    print("📊 Dashboard: http://localhost:5001/transbank/health")
    print("\n" + "="*50)
    
    try:
        # Importar y ejecutar la aplicación
        from main import app
        app.run(debug=True, host='0.0.0.0', port=5001)
    except KeyboardInterrupt:
        print("\n🛑 API detenida por el usuario")
    except Exception as e:
        print(f"❌ Error al iniciar la API: {e}")
        sys.exit(1)

def main():
    """Función principal"""
    print("🏦 API Transbank - Autoparts")
    print("="*30)
    
    # Verificar dependencias
    if not check_dependencies():
        sys.exit(1)
    
    # Verificar archivo .env
    check_env_file()
    
    # Iniciar API
    start_api()

if __name__ == "__main__":
    main() 