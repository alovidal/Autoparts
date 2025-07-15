-- Datos de prueba para la nueva estructura de carritos
-- Ejecutar después de actualizar_estructura_carritos.sql

-- Insertar usuarios de prueba
INSERT INTO USUARIOS (RUT, NOMBRE_COMPLETO, CORREO, CONTRASENA, ROL) VALUES
('12345678-9', 'Juan Pérez', 'juan@test.com', '123456', 'CLIENTE'),
('98765432-1', 'María García', 'maria@test.com', '123456', 'EMPRESA'),
('11111111-1', 'Admin Sistema', 'admin@autoparts.com', 'admin123', 'ADMIN');

-- Insertar sucursales
INSERT INTO SUCURSALES (NOMBRE, DIRECCION, COMUNA, REGION) VALUES
('Sucursal Centro', 'Av. Providencia 123', 'Providencia', 'Metropolitana'),
('Sucursal Norte', 'Av. Las Condes 456', 'Las Condes', 'Metropolitana'),
('Sucursal Sur', 'Gran Avenida 789', 'La Cisterna', 'Metropolitana');

-- Insertar categorías
INSERT INTO CATEGORIAS (NOMBRE) VALUES
('Aceites y Lubricantes'),
('Frenos'),
('Suspensión'),
('Motor'),
('Electricidad');

-- Insertar productos
INSERT INTO PRODUCTOS (CODIGO_FABRICANTE, MARCA, CODIGO_INTERNO, NOMBRE, DESCRIPCION, PRECIO_UNITARIO, STOCK_MIN, ID_CATEGORIA, IMAGEN) VALUES
('MOB001', 'Mobil', 'ACE001', 'Aceite Mobil 1', 'Aceite sintético 5W-30', 25000, 10, 1, 'aceite_mobil.jpg'),
('MON001', 'Monroe', 'AMO001', 'Amortiguador Monroe', 'Amortiguador delantero', 45000, 5, 3, 'amortiguador_monroe.jpg'),
('KYB001', 'KYB', 'AMO002', 'Amortiguador KYB', 'Amortiguador trasero', 38000, 5, 3, 'amortiguadores_kyb.jpg'),
('BOS001', 'Bosch', 'BAT001', 'Batería Bosch', 'Batería 60Ah', 85000, 3, 5, 'bateria_bosch.jpg'),
('FER001', 'Ferodo', 'PAS001', 'Pastillas de Freno', 'Pastillas delanteras', 15000, 20, 2, 'pastillas_ferodo.jpg'),
('MAN001', 'Mann', 'FIL001', 'Filtro de Aceite', 'Filtro de aceite motor', 8000, 15, 4, 'filtro_mann.jpg'),
('VAL001', 'Valvoline', 'ACE002', 'Aceite Valvoline', 'Aceite mineral 10W-40', 18000, 12, 1, 'aceite_valvoline.jpg'),
('BOS002', 'Bosch', 'BOM001', 'Bomba de Agua', 'Bomba de agua motor', 35000, 4, 4, 'bomba_bosch.jpg');

-- Insertar inventario
INSERT INTO INVENTARIO (ID_SUCURSAL, ID_PRODUCTO, STOCK) VALUES
(1, 1, 50), (1, 2, 15), (1, 3, 20), (1, 4, 8), (1, 5, 100), (1, 6, 30), (1, 7, 40), (1, 8, 10),
(2, 1, 30), (2, 2, 10), (2, 3, 12), (2, 4, 5), (2, 5, 60), (2, 6, 20), (2, 7, 25), (2, 8, 6),
(3, 1, 25), (3, 2, 8), (3, 3, 10), (3, 4, 4), (3, 5, 50), (3, 6, 15), (3, 7, 20), (3, 8, 5);

-- Insertar carritos de prueba
-- Carrito de usuario registrado
INSERT INTO CARRITOS (ID_USUARIO, SESSION_ID, NOMBRE_CARRITO, ESTADO, FECHA_CREACION, FECHA_ULTIMA_ACTIVIDAD) VALUES
(1, NULL, 'Carrito Principal', 'ACTIVO', SYSDATE, SYSDATE);

-- Carrito de invitado
INSERT INTO CARRITOS (ID_USUARIO, SESSION_ID, NOMBRE_CARRITO, ESTADO, FECHA_CREACION, FECHA_ULTIMA_ACTIVIDAD) VALUES
(NULL, 'session_invitado_001', 'Carrito Invitado', 'ACTIVO', SYSDATE, SYSDATE);

-- Insertar productos en carritos
-- Productos en carrito de usuario
INSERT INTO CARRITO_PRODUCTOS (ID_CARRITO, ID_PRODUCTO, ID_SUCURSAL, CANTIDAD, VALOR_UNITARIO, VALOR_TOTAL, FECHA_AGREGADO) VALUES
(1, 1, 1, 2, 25000, 50000, SYSDATE),
(1, 3, 1, 1, 38000, 38000, SYSDATE),
(1, 5, 1, 3, 15000, 45000, SYSDATE);

-- Productos en carrito de invitado
INSERT INTO CARRITO_PRODUCTOS (ID_CARRITO, ID_PRODUCTO, ID_SUCURSAL, CANTIDAD, VALOR_UNITARIO, VALOR_TOTAL, FECHA_AGREGADO) VALUES
(2, 2, 2, 1, 45000, 45000, SYSDATE),
(2, 4, 2, 1, 85000, 85000, SYSDATE);

COMMIT;

-- Verificar datos insertados
SELECT 'USUARIOS' as tabla, COUNT(*) as cantidad FROM USUARIOS
UNION ALL
SELECT 'SUCURSALES', COUNT(*) FROM SUCURSALES
UNION ALL
SELECT 'CATEGORIAS', COUNT(*) FROM CATEGORIAS
UNION ALL
SELECT 'PRODUCTOS', COUNT(*) FROM PRODUCTOS
UNION ALL
SELECT 'INVENTARIO', COUNT(*) FROM INVENTARIO
UNION ALL
SELECT 'CARRITOS', COUNT(*) FROM CARRITOS
UNION ALL
SELECT 'CARRITO_PRODUCTOS', COUNT(*) FROM CARRITO_PRODUCTOS;

-- Mostrar carritos creados
SELECT 
    c.ID_CARRITO,
    c.NOMBRE_CARRITO,
    CASE 
        WHEN c.ID_USUARIO IS NOT NULL THEN 'Usuario: ' || u.NOMBRE_COMPLETO
        ELSE 'Invitado: ' || c.SESSION_ID
    END as PROPIETARIO,
    c.ESTADO,
    COUNT(cp.ID_PRODUCTO) as NUM_PRODUCTOS,
    SUM(cp.VALOR_TOTAL) as TOTAL_CARRITO
FROM CARRITOS c
LEFT JOIN USUARIOS u ON c.ID_USUARIO = u.ID_USUARIO
LEFT JOIN CARRITO_PRODUCTOS cp ON c.ID_CARRITO = cp.ID_CARRITO
GROUP BY c.ID_CARRITO, c.NOMBRE_CARRITO, c.ID_USUARIO, u.NOMBRE_COMPLETO, c.SESSION_ID, c.ESTADO
ORDER BY c.ID_CARRITO; 