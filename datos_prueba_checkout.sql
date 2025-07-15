-- =====================================================
-- FLUJO COMPLETO DE COMPRA DE PRUEBA - TRANSBANK
-- =====================================================

-- 1. Crear carrito
INSERT INTO CARRITOS (ID_CARRITO, FECHA_CREACION)
VALUES (2, SYSDATE);

-- 2. Agregar producto válido al carrito
-- Producto 101: 'Filtro de Aceite Bosch'
-- Sucursal 1 ya existe
INSERT INTO CARRITO_PRODUCTOS (
    ID_CARRITO, ID_PRODUCTO, ID_SUCURSAL, CANTIDAD, VALOR_UNITARIO, VALOR_TOTAL
) VALUES (
    2, 101, 1, 2, 4990, 9980
);

-- 3. Crear detalle del pedido
-- Usuario 1: admin@autoparts.com
INSERT INTO DETALLE_PEDIDO (
    ID_DETALLE, ID_CARRITO, DIRECCION, ESTADO, ID_USUARIO, TELEFONO_ENTREGA, FECHA_PEDIDO
) VALUES (
    2001, 2, 'Av. Providencia 1234, Santiago', 'PENDIENTE', 1, '+56912345678', SYSDATE
);

-- 4. Crear pedido
INSERT INTO PEDIDOS (
    ID_PEDIDO, ID_USUARIO, FECHA_PEDIDO, ID_DETALLE, ESTADO
) VALUES (
    2001, 1, SYSDATE, 2001, 'PENDIENTE'
);

-- 5. Registrar pago con método TRANSBANK
INSERT INTO PAGOS (
    ID_PAGO, ID_PEDIDO, MONTO_TOTAL, METODO_PAGO, ESTADO_PAGO, FECHA_PAGO
) VALUES (
    2001, 2001, 9980, 'TRANSBANK', 'PENDIENTE', NULL
);

-- 6. Registrar acción en bitácora
INSERT INTO BITACORA (
    ID_LOG, ID_USUARIO, ACCION, FECHA_ACCION
) VALUES (
    3001, 1, 'Compra de prueba realizada con carrito 2, pedido 2001 y pago TRANSBANK', SYSDATE
);

-- 7. Confirmar todos los cambios
COMMIT;

-- =====================================================
-- VALIDACIÓN (Opcional)
-- =====================================================

-- Verifica el carrito y sus productos
SELECT * FROM CARRITOS WHERE ID_CARRITO = 2;
SELECT * FROM CARRITO_PRODUCTOS WHERE ID_CARRITO = 2;

-- Verifica detalle del pedido
SELECT * FROM DETALLE_PEDIDO WHERE ID_DETALLE = 2001;

-- Verifica el pedido
SELECT * FROM PEDIDOS WHERE ID_PEDIDO = 2001;

-- Verifica el pago
SELECT * FROM PAGOS WHERE ID_PEDIDO = 2001;

-- Verifica bitácora
SELECT * FROM BITACORA WHERE ID_LOG = 3001;
