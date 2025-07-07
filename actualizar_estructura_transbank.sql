-- =====================================================
-- ACTUALIZACIÓN DE ESTRUCTURA PARA TRANSBANK
-- =====================================================

-- 1. Actualizar restricciones de PAGOS para incluir TRANSBANK
ALTER TABLE PAGOS DROP CONSTRAINT SYS_C0012345; -- Ajustar nombre de la constraint
ALTER TABLE PAGOS ADD CONSTRAINT CK_PAGOS_METODO 
    CHECK (METODO_PAGO IN ('WEBPAY', 'MERCADOPAGO', 'TRANSFERENCIA', 'TRANSBANK'));

-- 2. Actualizar restricciones de ESTADO_PAGO para incluir APROBADO
ALTER TABLE PAGOS DROP CONSTRAINT SYS_C0012346; -- Ajustar nombre de la constraint
ALTER TABLE PAGOS ADD CONSTRAINT CK_PAGOS_ESTADO 
    CHECK (ESTADO_PAGO IN ('PENDIENTE', 'PAGADO', 'FALLIDO', 'APROBADO', 'PROCESANDO'));

-- 3. Agregar secuencia para DETALLE_PEDIDO si no existe
CREATE SEQUENCE DETALLE_PEDIDO_SEQ
    START WITH 1
    INCREMENT BY 1
    NOCACHE
    NOCYCLE;

-- 4. Agregar columna TELEFONO_ENTREGA a DETALLE_PEDIDO si no existe
ALTER TABLE DETALLE_PEDIDO ADD TELEFONO_ENTREGA VARCHAR2(20);

-- 5. Agregar columna FECHA_PEDIDO a DETALLE_PEDIDO si no existe
ALTER TABLE DETALLE_PEDIDO ADD FECHA_PEDIDO DATE DEFAULT SYSDATE;

-- 6. Agregar columna ESTADO a PEDIDOS si no existe
ALTER TABLE PEDIDOS ADD ESTADO VARCHAR2(20) DEFAULT 'PENDIENTE';

-- 7. Agregar restricción para ESTADO en PEDIDOS
ALTER TABLE PEDIDOS ADD CONSTRAINT CK_PEDIDOS_ESTADO 
    CHECK (ESTADO IN ('PENDIENTE', 'CONFIRMADO', 'ENVIADO', 'ENTREGADO', 'CANCELADO'));

-- 8. Crear índices para mejorar rendimiento
CREATE INDEX IDX_PAGOS_PEDIDO ON PAGOS(ID_PEDIDO);
CREATE INDEX IDX_PAGOS_ESTADO ON PAGOS(ESTADO_PAGO);
CREATE INDEX IDX_PEDIDOS_USUARIO ON PEDIDOS(ID_USUARIO);
CREATE INDEX IDX_DETALLE_PEDIDO_CARRITO ON DETALLE_PEDIDO(ID_CARRITO);

-- 9. Verificar que las tablas tengan los datos correctos
COMMIT;

-- 10. Mostrar estructura actualizada
SELECT 'PAGOS' as tabla, column_name, data_type, nullable 
FROM user_tab_columns 
WHERE table_name = 'PAGOS'
ORDER BY column_id;

SELECT 'DETALLE_PEDIDO' as tabla, column_name, data_type, nullable 
FROM user_tab_columns 
WHERE table_name = 'DETALLE_PEDIDO'
ORDER BY column_id;

SELECT 'PEDIDOS' as tabla, column_name, data_type, nullable 
FROM user_tab_columns 
WHERE table_name = 'PEDIDOS'
ORDER BY column_id;

-- =====================================================
-- INSTRUCCIONES:
-- =====================================================
-- 1. Ejecutar este script en Oracle SQL Developer o SQL*Plus
-- 2. Si hay errores de constraints, ajustar los nombres SYS_C0012345 y SYS_C0012346
-- 3. Verificar que todas las columnas se agregaron correctamente
-- 4. Reiniciar la API después de los cambios
-- ===================================================== 