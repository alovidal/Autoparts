-- =====================================================
-- DATOS DE PRUEBA PARA AMBIENTE TRANSBANK
-- =====================================================

-- Insertar productos de prueba con stock
INSERT INTO PRODUCTOS (ID_PRODUCTO, NOMBRE, DESCRIPCION, PRECIO, MARCA, CATEGORIA, IMAGEN_URL) 
VALUES (1001, 'Aceite Motor Mobil 1', 'Aceite sintético de alto rendimiento', 25000, 'Mobil', 'Aceites', 'aceite_mobil.jpg');

INSERT INTO PRODUCTOS (ID_PRODUCTO, NOMBRE, DESCRIPCION, PRECIO, MARCA, CATEGORIA, IMAGEN_URL) 
VALUES (1002, 'Amortiguador Delantero', 'Amortiguador de suspensión delantera', 45000, 'Monroe', 'Suspensión', 'amortiguador_monroe.jpg');

INSERT INTO PRODUCTOS (ID_PRODUCTO, NOMBRE, DESCRIPCION, PRECIO, MARCA, CATEGORIA, IMAGEN_URL) 
VALUES (1003, 'Filtro de Aire', 'Filtro de aire de alto flujo', 15000, 'K&N', 'Filtros', 'filtro_aire.jpg');

INSERT INTO PRODUCTOS (ID_PRODUCTO, NOMBRE, DESCRIPCION, PRECIO, MARCA, CATEGORIA, IMAGEN_URL) 
VALUES (1004, 'Pastillas de Freno', 'Pastillas de freno cerámicas', 35000, 'Brembo', 'Frenos', 'pastillas_freno.jpg');

INSERT INTO PRODUCTOS (ID_PRODUCTO, NOMBRE, DESCRIPCION, PRECIO, MARCA, CATEGORIA, IMAGEN_URL) 
VALUES (1005, 'Batería Automotriz', 'Batería de 60Ah con garantía', 85000, 'ACDelco', 'Baterías', 'bateria_automotriz.jpg');

-- Insertar inventario de prueba
INSERT INTO INVENTARIO (ID_PRODUCTO, ID_SUCURSAL, STOCK, STOCK_MINIMO) VALUES (1001, 1, 50, 10);
INSERT INTO INVENTARIO (ID_PRODUCTO, ID_SUCURSAL, STOCK, STOCK_MINIMO) VALUES (1002, 1, 20, 5);
INSERT INTO INVENTARIO (ID_PRODUCTO, ID_SUCURSAL, STOCK, STOCK_MINIMO) VALUES (1003, 1, 30, 8);
INSERT INTO INVENTARIO (ID_PRODUCTO, ID_SUCURSAL, STOCK, STOCK_MINIMO) VALUES (1004, 1, 25, 5);
INSERT INTO INVENTARIO (ID_PRODUCTO, ID_SUCURSAL, STOCK, STOCK_MINIMO) VALUES (1005, 1, 15, 3);

-- Insertar carritos de prueba
INSERT INTO CARRITO (ID_CARRITO, ID_USUARIO, FECHA_CREACION, ESTADO) VALUES (1001, 1, SYSDATE, 'ACTIVO');
INSERT INTO CARRITO (ID_CARRITO, ID_USUARIO, FECHA_CREACION, ESTADO) VALUES (1002, 1, SYSDATE, 'ACTIVO');

-- Insertar productos en carritos de prueba
INSERT INTO CARRITO_PRODUCTOS (ID_CARRITO, ID_PRODUCTO, ID_SUCURSAL, CANTIDAD, VALOR_UNITARIO, VALOR_TOTAL) 
VALUES (1001, 1001, 1, 2, 25000, 50000);

INSERT INTO CARRITO_PRODUCTOS (ID_CARRITO, ID_PRODUCTO, ID_SUCURSAL, CANTIDAD, VALOR_UNITARIO, VALOR_TOTAL) 
VALUES (1001, 1003, 1, 1, 15000, 15000);

INSERT INTO CARRITO_PRODUCTOS (ID_CARRITO, ID_PRODUCTO, ID_SUCURSAL, CANTIDAD, VALOR_UNITARIO, VALOR_TOTAL) 
VALUES (1002, 1002, 1, 1, 45000, 45000);

-- Insertar detalles de pedidos de prueba
INSERT INTO DETALLE_PEDIDO (ID_DETALLE, ID_CARRITO, FECHA_PEDIDO, ESTADO, DIRECCION_ENTREGA, TELEFONO_ENTREGA) 
VALUES (1001, 1001, SYSDATE, 'PENDIENTE', 'Av. Providencia 1234, Santiago', '+56912345678');

INSERT INTO DETALLE_PEDIDO (ID_DETALLE, ID_CARRITO, FECHA_PEDIDO, ESTADO, DIRECCION_ENTREGA, TELEFONO_ENTREGA) 
VALUES (1002, 1002, SYSDATE, 'PENDIENTE', 'Las Condes 5678, Santiago', '+56987654321');

-- Insertar pedidos de prueba
INSERT INTO PEDIDOS (ID_PEDIDO, ID_DETALLE, ID_USUARIO, FECHA_PEDIDO, ESTADO) 
VALUES (1001, 1001, 1, SYSDATE, 'PENDIENTE');

INSERT INTO PEDIDOS (ID_PEDIDO, ID_DETALLE, ID_USUARIO, FECHA_PEDIDO, ESTADO) 
VALUES (1002, 1002, 1, SYSDATE, 'PENDIENTE');

-- Insertar pagos de prueba
INSERT INTO PAGOS (ID_PAGO, ID_PEDIDO, MONTO_TOTAL, METODO_PAGO, ESTADO_PAGO, FECHA_PAGO) 
VALUES (1001, 1001, 65000, 'TRANSBANK', 'PENDIENTE', NULL);

INSERT INTO PAGOS (ID_PAGO, ID_PEDIDO, MONTO_TOTAL, METODO_PAGO, ESTADO_PAGO, FECHA_PAGO) 
VALUES (1002, 1002, 45000, 'TRANSBANK', 'PENDIENTE', NULL);

-- Insertar registros en bitácora de prueba
INSERT INTO BITACORA (ID_LOG, ID_USUARIO, ACCION, FECHA_ACCION) 
VALUES (1001, 1, 'Carrito creado - Productos agregados', SYSDATE);

INSERT INTO BITACORA (ID_LOG, ID_USUARIO, ACCION, FECHA_ACCION) 
VALUES (1002, 1, 'Pedido creado #1001', SYSDATE);

INSERT INTO BITACORA (ID_LOG, ID_USUARIO, ACCION, FECHA_ACCION) 
VALUES (1003, 1, 'Pago iniciado - Pedido #1001', SYSDATE);

-- Comentarios sobre el ambiente de pruebas
/*
AMBIENTE DE PRUEBAS TRANSBANK
============================

Este script crea datos de prueba para simular un ambiente completo de Transbank:

1. PRODUCTOS DE PRUEBA:
   - 5 productos con diferentes categorías y precios
   - Stock inicial configurado para pruebas

2. CARRITOS DE PRUEBA:
   - 2 carritos con productos diferentes
   - Diferentes cantidades y valores

3. PEDIDOS DE PRUEBA:
   - Pedidos pendientes listos para pago
   - Diferentes direcciones de entrega

4. PAGOS DE PRUEBA:
   - Pagos pendientes para simular con Transbank
   - Diferentes montos para probar escenarios

5. BITÁCORA DE PRUEBA:
   - Registros de actividades para seguimiento

PARA USAR EL AMBIENTE:
1. Ejecutar este script en la base de datos
2. Ir al carrito y agregar productos
3. Proceder al checkout
4. Usar el simulador de Transbank
5. Verificar actualización de inventario
6. Revisar estadísticas en el dashboard

ESCENARIOS DE PRUEBA:
- Éxito (60%): Pago aprobado, inventario actualizado
- Pendiente (20%): Pago en revisión
- Fallo (20%): Pago rechazado

DATOS DE PRUEBA TRANSBANK:
- Tarjeta: 4051885600446623
- CVV: 123
- Fecha: 12/25
- RUT: 11111111-1
*/ 