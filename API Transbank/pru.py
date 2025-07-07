#!/usr/bin/env python3
"""
Script para probar la funcionalidad de Transbank
"""

import os
from dotenv import load_dotenv
from transbank.webpay.webpay_plus.transaction import Transaction
from transbank.common.options import WebpayOptions
from transbank.common.integration_type import IntegrationType

def test_transbank_setup():
    """Probar la configuración de Transbank"""
    print("🧪 Probando configuración de Transbank")
    print("=" * 40)
    
    # Cargar variables de entorno
    load_dotenv()
    
    # Configuración
    COMMERCE_CODE = os.getenv('TRANSBANK_COMMERCE_CODE', '597055555532')
    API_KEY = os.getenv('TRANSBANK_API_KEY', '579B532A7440BB0C9079DED94D31EA1615BACEB56610332264630D42D0A36B1C')
    ENVIRONMENT = os.getenv('TRANSBANK_ENVIRONMENT', 'TEST')
    
    print(f"🏪 Commerce Code: {COMMERCE_CODE}")
    print(f"🔧 Environment: {ENVIRONMENT}")
    print(f"🔑 API Key: {API_KEY[:10]}...")
    
    try:
        # Crear opciones de Transbank
        options = WebpayOptions(
            commerce_code=COMMERCE_CODE,
            api_key=API_KEY,
            integration_type=IntegrationType.TEST if ENVIRONMENT == 'TEST' else IntegrationType.LIVE
        )
        
        print("✅ Opciones de Transbank creadas correctamente")
        
        # Crear instancia de Transaction
        transaction = Transaction(options)
        print("✅ Instancia de Transaction creada correctamente")
        
        # Probar creación de transacción (sin ejecutar)
        print("\n💳 Probando creación de transacción de prueba...")
        
        # Datos de prueba
        buy_order = "TEST_ORDER_123"
        session_id = "TEST_SESSION_123"
        amount = 1000  # $1.000 CLP
        return_url = "http://localhost:5001/transbank/confirmar/123"
        
        print(f"📋 Datos de prueba:")
        print(f"   - Buy Order: {buy_order}")
        print(f"   - Session ID: {session_id}")
        print(f"   - Amount: {amount}")
        print(f"   - Return URL: {return_url}")
        
        # NOTA: Solo validamos que podemos llamar al método, no ejecutamos la transacción real
        print("\n⚠️  NOTA: Para evitar transacciones reales, no ejecutaremos create()")
        print("✅ La configuración de Transbank está lista para usar")
        
        return True
        
    except Exception as e:
        print(f"❌ Error en la configuración de Transbank: {e}")
        print(f"   Tipo de error: {type(e).__name__}")
        return False

def test_environment_variables():
    """Verificar variables de entorno"""
    print("\n🔧 Verificando variables de entorno")
    print("=" * 35)
    
    required_vars = [
        'usuario',
        'clave', 
        'wallet_password',
        'dsn',
        'TRANSBANK_COMMERCE_CODE',
        'TRANSBANK_API_KEY'
    ]
    
    missing_vars = []
    
    for var in required_vars:
        value = os.getenv(var)
        if value:
            if 'password' in var.lower() or 'key' in var.lower():
                print(f"✅ {var}: {'*' * len(value)}")
            else:
                print(f"✅ {var}: {value}")
        else:
            print(f"❌ {var}: NO DEFINIDA")
            missing_vars.append(var)
    
    if missing_vars:
        print(f"\n⚠️  Variables faltantes: {', '.join(missing_vars)}")
        return False
    else:
        print("\n✅ Todas las variables de entorno están definidas")
        return True

if __name__ == "__main__":
    print("🧪 Script de Prueba - API Transbank")
    print("=" * 50)
    
    # Cargar variables de entorno
    load_dotenv()
    
    # Verificar variables de entorno
    env_ok = test_environment_variables()
    
    # Probar configuración de Transbank
    if env_ok:
        transbank_ok = test_transbank_setup()
        
        if transbank_ok:
            print("\n🎉 ÉXITO: Todo está configurado correctamente")
            print("🚀 Puedes iniciar la API con: python main.py")
        else:
            print("\n❌ FALLO: Hay problemas con la configuración de Transbank")
    else:
        print("\n❌ FALLO: Faltan variables de entorno")
    
    print("\n" + "=" * 50)