# API Transbank - Autoparts

API especializada para la integración con Transbank y simulación de pagos para el sistema Autoparts.

## 🚀 Características

- ✅ **Simulación completa de Transbank**
- ✅ **Actualización automática de inventario**
- ✅ **Registro en bitácora de todas las transacciones**
- ✅ **Estadísticas en tiempo real**
- ✅ **Múltiples escenarios de prueba**
- ✅ **Configuración flexible por ambiente**

## 📋 Requisitos

- Python 3.8+
- Oracle Database
- Oracle Instant Client

## 🛠️ Instalación

1. **Crear entorno virtual:**
```bash
python -m venv venv
source venv/bin/activate  # Linux/Mac
# o
venv\Scripts\activate     # Windows
```

2. **Instalar dependencias:**
```bash
pip install -r requirements.txt
```

3. **Configurar variables de entorno:**
```bash
cp .env.example .env
# Editar .env con tus configuraciones
```

## ⚙️ Configuración

### Variables de Entorno (.env)

```env
# Base de Datos
DB_USER=system
DB_PASSWORD=oracle
DB_HOST=localhost
DB_PORT=1521
DB_SERVICE=XE

# Transbank
TRANSBANK_COMMERCE_CODE=597055555532
TRANSBANK_API_KEY=579B532A7440BB0C9079DED94D31EA1615BACEB56610332264630D42D0A36B1C
TRANSBANK_ENVIRONMENT=integration

# API
API_HOST=0.0.0.0
API_PORT=5001
DEBUG=True

# CORS
CORS_ORIGINS=http://localhost:5173,http://localhost:3000

# Simulación
SIMULATION_SUCCESS_RATE=0.6
SIMULATION_PENDING_RATE=0.2
SIMULATION_FAILURE_RATE=0.2
```

## 🚀 Ejecución

```bash
python main.py
```

La API estará disponible en: `http://localhost:5001`

## 📡 Endpoints

### Health Check
```
GET /transbank/health
```

### Crear Transacción
```
POST /transbank/crear-transaccion
```

**Body:**
```json
{
  "id_pedido": 123,
  "monto": 65000,
  "return_url": "http://localhost:5173/payment-success",
  "session_id": "session_123",
  "buy_order": "order_123"
}
```

### Confirmar Pago
```
POST /transbank/confirmar-pago
```

**Body:**
```json
{
  "token": "token_123",
  "id_pedido": 123
}
```

### Estadísticas
```
GET /transbank/estadisticas
```

### Simular Pago
```
POST /transbank/simular-pago
```

**Body:**
```json
{
  "id_pedido": 123,
  "escenario": "aleatorio"  // aleatorio, exito, pendiente, fallo
}
```

## 🎲 Escenarios de Simulación

### Configuración por Defecto
- **Éxito**: 60% de probabilidad
- **Pendiente**: 20% de probabilidad  
- **Fallo**: 20% de probabilidad

### Datos de Prueba
- **Tarjeta**: `4051885600446623`
- **CVV**: `123`
- **Fecha**: `12/25`
- **RUT**: `11111111-1`

## 📊 Funcionalidades

### 1. Simulación de Transbank
- Creación de transacciones simuladas
- Procesamiento de pagos con diferentes escenarios
- Generación de tokens únicos
- URLs de pago simuladas

### 2. Gestión de Inventario
- Actualización automática de stock al confirmar pagos
- Validación de stock disponible
- Registro de cambios en inventario

### 3. Bitácora de Actividades
- Registro de todas las transacciones
- Seguimiento de cambios de estado
- Auditoría completa de operaciones

### 4. Estadísticas en Tiempo Real
- Métricas de pagos (exitosos, pendientes, fallidos)
- Productos más vendidos
- Montos totales transados
- Configuración de simulación

## 🔧 Integración con Frontend

### URL Base
```
http://localhost:5001
```

### Ejemplo de Uso en Frontend
```javascript
// Crear transacción
const response = await fetch('http://localhost:5001/transbank/crear-transaccion', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    id_pedido: 123,
    monto: 65000,
    return_url: window.location.origin + '/payment-success',
    session_id: 'session_' + Date.now(),
    buy_order: 'order_' + 123
  })
});

// Confirmar pago
const confirmResponse = await fetch('http://localhost:5001/transbank/confirmar-pago', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    token: 'token_123',
    id_pedido: 123
  })
});
```

## 🐛 Troubleshooting

### Error de Conexión a Base de Datos
1. Verificar que Oracle esté ejecutándose
2. Confirmar credenciales en `.env`
3. Verificar que Oracle Instant Client esté instalado

### Error de CORS
1. Verificar configuración de `CORS_ORIGINS` en `.env`
2. Asegurar que el frontend esté en los orígenes permitidos

### Error de Puerto
1. Verificar que el puerto 5001 esté disponible
2. Cambiar `API_PORT` en `.env` si es necesario

## 📝 Logs

La API genera logs detallados para debugging:

```
2024-01-15 10:30:00 - INFO - 💳 Creando transacción Transbank: Pedido 123, Monto 65000
2024-01-15 10:30:01 - INFO - ✅ Transacción creada exitosamente: token_session_123_123_1705312201
2024-01-15 10:30:05 - INFO - 💳 Confirmando pago: Pedido 123, Token: token_123
2024-01-15 10:30:06 - INFO - 📦 Productos en carrito: [(1001, 1, 2), (1003, 1, 1)]
2024-01-15 10:30:07 - INFO - 🔄 Actualizando stock: Producto 1001, Sucursal 1, Stock actual: 50, Cantidad vendida: 2, Nuevo stock: 48
2024-01-15 10:30:08 - INFO - ✅ Pago confirmado exitosamente para pedido 123
```

## 🔄 Migración desde API Interna

Para migrar desde la API Interna:

1. **Actualizar URLs en el frontend:**
   - Cambiar de `http://localhost:5000` a `http://localhost:5001`
   - Actualizar servicios de API

2. **Remover endpoints de Transbank de API Interna:**
   - Eliminar `/transbank/*` de `API Interna/main.py`

3. **Verificar configuración:**
   - Asegurar que ambas APIs usen la misma base de datos
   - Verificar que las variables de entorno estén correctas

## 📞 Soporte

Para problemas o consultas:
1. Revisar logs de la aplicación
2. Verificar configuración de base de datos
3. Confirmar que todas las dependencias estén instaladas 