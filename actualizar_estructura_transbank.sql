-- =====================================================
-- ACTUALIZACIÓN DE ESTRUCTURA PARA TRANSBANK (CORREGIDO)
-- =====================================================

-- 1. Buscar y eliminar restricciones CHECK existentes en PAGOS
-- Ejecuta esto primero para identificar los nombres reales:
-- SELECT CONSTRAINT_NAME, SEARCH_CONDITION 
-- FROM USER_CONSTRAINTS 
-- WHERE TABLE_NAME = 'PAGOS' AND CONSTRAINT_TYPE = 'C';

-- Elimina y vuelve a crear constraint de METODO_PAGO
ALTER TABLE PAGOS DROP CONSTRAINT CK_PAGOS_METODO;
ALTER TABLE PAGOS ADD CONSTRAINT CK_PAGOS_METODO 
    CHECK (METODO_PAGO IN ('WEBPAY', 'MERCADOPAGO', 'TRANSFERENCIA', 'TRANSBANK'));

-- Elimina y vuelve a crear constraint de ESTADO_PAGO
ALTER TABLE PAGOS DROP CONSTRAINT CK_PAGOS_ESTADO;
ALTER TABLE PAGOS ADD CONSTRAINT CK_PAGOS_ESTADO 
    CHECK (ESTADO_PAGO IN ('PENDIENTE', 'PAGADO', 'FALLIDO', 'APROBADO', 'PROCESANDO'));

-- 2. Crear secuencia solo si no existe (opcional: comentar si ya existe)
-- DROP SEQUENCE DETALLE_PEDIDO_SEQ; -- Descomentar si necesitas recrearla
-- CREATE SEQUENCE DETALLE_PEDIDO_SEQ
--     START WITH 1
--     INCREMENT BY 1
--     NOCACHE
--     NOCYCLE;

-- 3. Agregar columna TELEFONO_ENTREGA a DETALLE_PEDIDO (si no existe)
BEGIN
    EXECUTE IMMEDIATE 'ALTER TABLE DETALLE_PEDIDO ADD TELEFONO_ENTREGA VARCHAR2(20)';
EXCEPTION
    WHEN OTHERS THEN
        IF SQLCODE != -01430 THEN -- ORA-01430: column already exists
            RAISE;
        END IF;
END;
/

-- 4. Agregar columna FECHA_PEDIDO a DETALLE_PEDIDO (si no existe)
BEGIN
    EXECUTE IMMEDIATE 'ALTER TABLE DETALLE_PEDIDO ADD FECHA_PEDIDO DATE DEFAULT SYSDATE';
EXCEPTION
    WHEN OTHERS THEN
        IF SQLCODE != -01430 THEN
            RAISE;
        END IF;
END;
/

-- 5. Agregar columna ESTADO a PEDIDOS (si no existe)
BEGIN
    EXECUTE IMMEDIATE 'ALTER TABLE PEDIDOS ADD ESTADO VARCHAR2(20) DEFAULT ''PENDIENTE''';
EXCEPTION
    WHEN OTHERS THEN
        IF SQLCODE != -01430 THEN
            RAISE;
        END IF;
END;
/

-- 6. Agregar restricción para ESTADO en PEDIDOS
ALTER TABLE PEDIDOS ADD CONSTRAINT CK_PEDIDOS_ESTADO 
    CHECK (ESTADO IN ('PENDIENTE', 'CONFIRMADO', 'ENVIADO', 'ENTREGADO', 'CANCELADO'));

-- 7. Crear índices (ignora si ya existen)
CREATE INDEX IDX_PAGOS_PEDIDO ON PAGOS(ID_PEDIDO);
CREATE INDEX IDX_PAGOS_ESTADO ON PAGOS(ESTADO_PAGO);
CREATE INDEX IDX_PEDIDOS_USUARIO ON PEDIDOS(ID_USUARIO);
CREATE INDEX IDX_DETALLE_PEDIDO_CARRITO ON DETALLE_PEDIDO(ID_CARRITO);

-- 8. Confirmar cambios
COMMIT;

-- 9. Mostrar estructura actualizada
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
-- NOTAS:
-- - Ejecutar este script en Oracle SQL Developer o SQL*Plus
-- - Las restricciones CK_PAGOS_* deben coincidir con las existentes. Si cambiaste los nombres, ajústalos aquí.
-- - Reiniciar la API o backend si usa caché de estructuras.
-- =====================================================
