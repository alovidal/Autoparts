-- Categorías
INSERT INTO CATEGORIAS (ID_CATEGORIA, NOMBRE) VALUES (1, 'Filtros y Lubricantes');
INSERT INTO CATEGORIAS (ID_CATEGORIA, NOMBRE) VALUES (2, 'Encendido y Eléctricos');
INSERT INTO CATEGORIAS (ID_CATEGORIA, NOMBRE) VALUES (3, 'Suspensión y Dirección');
INSERT INTO CATEGORIAS (ID_CATEGORIA, NOMBRE) VALUES (4, 'Sistema de Frenos');
INSERT INTO CATEGORIAS (ID_CATEGORIA, NOMBRE) VALUES (5, 'Accesorios');
INSERT INTO CATEGORIAS (ID_CATEGORIA, NOMBRE) VALUES (6, 'Refrigeración');
INSERT INTO CATEGORIAS (ID_CATEGORIA, NOMBRE) VALUES (7, 'Baterías');

-- Subcategorías
INSERT INTO SUBCATEGORIAS (ID_SUBCATEGORIA, ID_CATEGORIA, NOMBRE) VALUES (1, 1, 'Filtros de Aceite');
INSERT INTO SUBCATEGORIAS (ID_SUBCATEGORIA, ID_CATEGORIA, NOMBRE) VALUES (2, 1, 'Lubricantes de Motor');
INSERT INTO SUBCATEGORIAS (ID_SUBCATEGORIA, ID_CATEGORIA, NOMBRE) VALUES (3, 2, 'Bujías');
INSERT INTO SUBCATEGORIAS (ID_SUBCATEGORIA, ID_CATEGORIA, NOMBRE) VALUES (4, 3, 'Amortiguadores');
INSERT INTO SUBCATEGORIAS (ID_SUBCATEGORIA, ID_CATEGORIA, NOMBRE) VALUES (5, 4, 'Pastillas de Freno');

-- Productos
INSERT INTO PRODUCTOS VALUES (101, 'BOS-FLT123', 'Bosch', 'FLT-0001', 'Filtro de Aceite Bosch', 'Filtro de aceite sintético para motores bencineros', 4990.00, 20, 1, 'filtro_bosch.jpg');
INSERT INTO PRODUCTOS VALUES (102, 'NGK-BUJ456', 'NGK', 'BUJ-0001', 'Bujía NGK Estándar', 'Bujía estándar para vehículos de uso urbano', 2990.00, 30, 2, 'bujia_ngk.jpg');
INSERT INTO PRODUCTOS VALUES (103, 'MON-AMT789', 'Monroe', 'AMT-0001', 'Amortiguador Delantero Monroe', 'Amortiguador hidráulico para autos medianos', 19990.00, 10, 3, 'amortiguador_monroe.jpg');
INSERT INTO PRODUCTOS VALUES (104, 'MOB-ACE890', 'Mobil', 'ACE-0001', 'Aceite Sintético Mobil 5W30', 'Lubricante sintético para motores de alto rendimiento', 10990.00, 50, 1, 'aceite_mobil.jpg');
INSERT INTO PRODUCTOS VALUES (105, 'KNN-FIL101', 'K&N', 'FIL-0001', 'Filtro de Aire K&N', 'Filtro de alto flujo lavable para autos deportivos', 89990.00, 5, 1, 'filtro_kn.jpg');
INSERT INTO PRODUCTOS VALUES (106, 'TXT-FRE106', 'Textar', 'FRE-0106', 'Pastillas de Freno Delanteras', 'Pastillas para sistema de frenos delantero con tecnología antirruido', 45990.00, 8, 4, 'pastillas_textar.jpg');
INSERT INTO PRODUCTOS VALUES (107, 'NGK-IR107', 'NGK', 'BUJ-0107', 'Bujías de Iridio', 'Bujías de alto rendimiento con punta de iridio', 12990.00, 12, 2, 'bujias_iridio.jpg');
INSERT INTO PRODUCTOS VALUES (108, 'KYB-AMT108', 'KYB', 'AMT-0108', 'Amortiguadores Deportivos', 'Amortiguadores de alto desempeño para vehículos tuning', 159990.00, 4, 3, 'amortiguadores_kyb.jpg');
INSERT INTO PRODUCTOS VALUES (109, 'MOB-ACE109', 'Mobil', 'ACE-0109', 'Aceite Sintético 5W-40', 'Lubricante premium para motores modernos', 39990.00, 10, 1, 'aceite_mobil.jpg');
INSERT INTO PRODUCTOS VALUES (110, 'LUK-EMB110', 'LUK', 'EMB-0110', 'Kit de Embrague', 'Conjunto de embrague para autos europeos', 189990.00, 3, 5, 'embrague_luk.jpg');
INSERT INTO PRODUCTOS VALUES (111, 'VAR-BAT111', 'Varta', 'BAT-0111', 'Batería 65Ah', 'Batería libre de mantenimiento de alto arranque', 79990.00, 5, 7, 'bateria_varta.jpg');
INSERT INTO PRODUCTOS VALUES (112, 'CON-COR112', 'Continental', 'COR-0112', 'Correa de Distribución', 'Correa dentada de alto rendimiento', 34990.00, 6, 6, 'correa_continental.jpg');
INSERT INTO PRODUCTOS VALUES (113, 'VAL-RAD113', 'Valeo', 'RAD-0113', 'Radiador de Aluminio', 'Radiador para autos compactos con núcleo de aluminio', 129990.00, 4, 6, 'radiador_valeo.jpg');
INSERT INTO PRODUCTOS VALUES (114, 'SKF-BOM114', 'SKF', 'BOM-0114', 'Bomba de Agua', 'Bomba de refrigeración con rodamiento reforzado', 45990.00, 5, 6, 'bomba_skf.jpg');
INSERT INTO PRODUCTOS VALUES (115, 'WAH-TER115', 'Wahler', 'TER-0115', 'Termostato', 'Termostato de regulación de temperatura para motor', 19990.00, 7, 6, 'termostato_wahler.jpg');
INSERT INTO PRODUCTOS VALUES (116, 'ATE-FRT116', 'ATE', 'FRT-0116', 'Kit de Frenos Traseros', 'Set completo de frenos traseros para sedán mediano', 89990.00, 4, 4, 'kit_frenos_ate.jpg');
INSERT INTO PRODUCTOS VALUES (117, 'MAN-FIL117', 'Mann-Filter', 'FIL-0117', 'Filtro de Combustible', 'Filtro de combustible de alta eficiencia', 15990.00, 8, 1, 'filtro_mann.jpg');
INSERT INTO PRODUCTOS VALUES (118, 'DEN-SEN118', 'Denso', 'SEN-0118', 'Sensor de Oxígeno', 'Sensor O2 para sistema de inyección electrónica', 49990.00, 6, 2, 'sensor_denso.jpg');
INSERT INTO PRODUCTOS VALUES (119, 'BOS-ALT119', 'Bosch', 'ALT-0119', 'Alternador Remanufacturado', 'Alternador reconstruido con garantía Bosch', 199990.00, 3, 2, 'alternador_bosch.jpg');
INSERT INTO PRODUCTOS VALUES (120, 'FEB-BOM120', 'Febi', 'BOM-0120', 'Bomba de Aceite', 'Bomba de aceite de presión constante', 59990.00, 4, 1, 'bomba_febi.jpg');
INSERT INTO PRODUCTOS VALUES (121, 'FAG-ROD121', 'FAG', 'ROD-0121', 'Kit de Rodamientos', 'Juego de rodamientos delanteros y traseros', 44990.00, 6, 3, 'kit_rodamientos_fag.jpg');
INSERT INTO PRODUCTOS VALUES (122, 'INA-TEN122', 'INA', 'TEN-0122', 'Tensor de Correa', 'Tensor automático para correa auxiliar', 29990.00, 5, 3, 'tensor_ina.jpg');
INSERT INTO PRODUCTOS VALUES (123, 'FRM-FIL123', 'Fram', 'FIL-0123', 'Filtro de Aceite Premium', 'Filtro con válvula antirretorno para arranques en frío', 9990.00, 10, 1, 'filtro_fram.jpg');
INSERT INTO PRODUCTOS VALUES (124, 'DEL-BOB124', 'Delphi', 'BOB-0124', 'Bobina de Encendido', 'Bobina de encendido para sistema DIS', 39990.00, 7, 2, 'bobina_delphi.jpg');

INSERT INTO SUCURSALES (NOMBRE, DIRECCION, COMUNA, REGION) VALUES ('Sucursal Santiago Centro', 'Av. Alameda 123', 'Santiago', 'Región Metropolitana');
INSERT INTO SUCURSALES (NOMBRE, DIRECCION, COMUNA, REGION) VALUES ('Sucursal Viña del Mar', 'Av. Libertad 456', 'Viña del Mar', 'Valparaíso');
INSERT INTO SUCURSALES (NOMBRE, DIRECCION, COMUNA, REGION) VALUES ('Sucursal Concepción', 'Calle Colo Colo 789', 'Concepción', 'Biobío');
INSERT INTO SUCURSALES (NOMBRE, DIRECCION, COMUNA, REGION) VALUES ('Sucursal La Serena', 'Av. del Mar 321', 'La Serena', 'Coquimbo');
INSERT INTO SUCURSALES (NOMBRE, DIRECCION, COMUNA, REGION) VALUES ('Sucursal Puerto Montt', 'Costanera 654', 'Puerto Montt', 'Los Lagos');

INSERT INTO USUARIOS (RUT, NOMBRE_COMPLETO, CORREO, CONTRASENA, ROL) VALUES ('12345678-9', 'Juan Pérez', 'admin@autoparts.com', 'pass123', 'ADMIN');
INSERT INTO USUARIOS (RUT, NOMBRE_COMPLETO, CORREO, CONTRASENA, ROL) VALUES ('98765432-1', 'María López', 'bodega@autoparts.com', 'pass456', 'BODEGUERO');
INSERT INTO USUARIOS (RUT, NOMBRE_COMPLETO, CORREO, CONTRASENA, ROL) VALUES ('13579246-8', 'Carlos Soto', 'distribuidor@autoparts.com', 'pass789',  'DISTRIBUIDOR');
INSERT INTO USUARIOS (RUT, NOMBRE_COMPLETO, CORREO, CONTRASENA, ROL) VALUES ('13579246-8', 'Carlos Soto', 'carlos@example.com', 'pass789',  'CLIENTE');
INSERT INTO USUARIOS (RUT, NOMBRE_COMPLETO, CORREO, CONTRASENA, ROL) VALUES ('19283746-5', 'Fernanda Díaz', 'fernanda@example.com', 'pass321',  'CLIENTE');
INSERT INTO USUARIOS (RUT, NOMBRE_COMPLETO, CORREO, CONTRASENA, ROL) VALUES ('10293847-6', 'Ricardo Figueroa', 'ricardo@example.com', 'pass654', 'CLIENTE');
INSERT INTO USUARIOS (RUT, NOMBRE_COMPLETO, CORREO, CONTRASENA, ROL) VALUES ('56473829-1', 'Ana Torres', 'ana@example.com', 'pass987',  'CLIENTE');
INSERT INTO USUARIOS (RUT, NOMBRE_COMPLETO, CORREO, CONTRASENA, ROL) VALUES ('29384756-3', 'Javier Morales', 'javier@example.com', 'pass159',  'CLIENTE');
INSERT INTO USUARIOS (RUT, NOMBRE_COMPLETO, CORREO, CONTRASENA, ROL) VALUES ('18273645-0', 'Paula Rojas', 'paula@example.com', 'pass753',  'CLIENTE');
INSERT INTO USUARIOS (RUT, NOMBRE_COMPLETO, CORREO, CONTRASENA, ROL) VALUES ('90817263-4', 'Martín Herrera', 'martin@example.com', 'pass852',  'CLIENTE');
INSERT INTO USUARIOS (RUT, NOMBRE_COMPLETO, CORREO, CONTRASENA, ROL) VALUES ('27483910-2', 'Isabel Núñez', 'isabel@example.com', 'pass963',  'CLIENTE');

INSERT INTO INVENTARIO (ID_SUCURSAL, ID_PRODUCTO, STOCK) VALUES (1, 101, 200);
INSERT INTO INVENTARIO (ID_SUCURSAL, ID_PRODUCTO, STOCK) VALUES (2, 101, 250);
INSERT INTO INVENTARIO (ID_SUCURSAL, ID_PRODUCTO, STOCK) VALUES (3, 102, 120);
INSERT INTO INVENTARIO (ID_SUCURSAL, ID_PRODUCTO, STOCK) VALUES (4, 102, 60);
INSERT INTO INVENTARIO (ID_SUCURSAL, ID_PRODUCTO, STOCK) VALUES (5, 103, 190);
INSERT INTO INVENTARIO (ID_SUCURSAL, ID_PRODUCTO, STOCK) VALUES (1, 103, 70);
INSERT INTO INVENTARIO (ID_SUCURSAL, ID_PRODUCTO, STOCK) VALUES (2, 104, 70);
INSERT INTO INVENTARIO (ID_SUCURSAL, ID_PRODUCTO, STOCK) VALUES (3, 104, 95);
INSERT INTO INVENTARIO (ID_SUCURSAL, ID_PRODUCTO, STOCK) VALUES (4, 106, 60);
COMMIT;
