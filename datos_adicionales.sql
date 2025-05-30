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
INSERT INTO PRODUCTOS VALUES (101, 'BOS-FLT123', 'Bosch', 'FLT-0001', 'Filtro de Aceite Bosch', 'Filtro de aceite sintético para motores bencineros', 4990.00, 20, 1);
INSERT INTO PRODUCTOS VALUES (102, 'NGK-BUJ456', 'NGK', 'BUJ-0001', 'Bujía NGK Estándar', 'Bujía estándar para vehículos de uso urbano', 2990.00, 30, 2);
INSERT INTO PRODUCTOS VALUES (103, 'MON-AMT789', 'Monroe', 'AMT-0001', 'Amortiguador Delantero Monroe', 'Amortiguador hidráulico para autos medianos', 19990.00, 10, 3);
INSERT INTO PRODUCTOS VALUES (104, 'MOB-ACE890', 'Mobil', 'ACE-0001', 'Aceite Sintético Mobil 5W30', 'Lubricante sintético para motores de alto rendimiento', 10990.00, 50, 1);
INSERT INTO PRODUCTOS VALUES (105, 'KAN-AIR105', 'K&N', 'AIR-0105', 'Filtro de Aire K&N', 'Filtro de alto flujo lavable para autos deportivos', 89990.00, 5, 1);
INSERT INTO PRODUCTOS VALUES (106, 'TXT-FRE106', 'Textar', 'FRE-0106', 'Pastillas de Freno Delanteras', 'Pastillas para sistema de frenos delantero con tecnología antirruido', 45990.00, 8, 4);
INSERT INTO PRODUCTOS VALUES (107, 'NGK-IR107', 'NGK', 'BUJ-0107', 'Bujías de Iridio', 'Bujías de alto rendimiento con punta de iridio', 12990.00, 12, 2);
INSERT INTO PRODUCTOS VALUES (108, 'KYB-AMT108', 'KYB', 'AMT-0108', 'Amortiguadores Deportivos', 'Amortiguadores de alto desempeño para vehículos tuning', 159990.00, 4, 3);
INSERT INTO PRODUCTOS VALUES (109, 'MOB-ACE109', 'Mobil', 'ACE-0109', 'Aceite Sintético 5W-40', 'Lubricante premium para motores modernos', 39990.00, 10, 1);
INSERT INTO PRODUCTOS VALUES (110, 'LUK-EMB110', 'LUK', 'EMB-0110', 'Kit de Embrague', 'Conjunto de embrague para autos europeos', 189990.00, 3, 5);
INSERT INTO PRODUCTOS VALUES (111, 'VAR-BAT111', 'Varta', 'BAT-0111', 'Batería 65Ah', 'Batería libre de mantenimiento de alto arranque', 79990.00, 5, 7);
INSERT INTO PRODUCTOS VALUES (112, 'CON-COR112', 'Continental', 'COR-0112', 'Correa de Distribución', 'Correa dentada de alto rendimiento', 34990.00, 6, 6);
INSERT INTO PRODUCTOS VALUES (113, 'VAL-RAD113', 'Valeo', 'RAD-0113', 'Radiador de Aluminio', 'Radiador para autos compactos con núcleo de aluminio', 129990.00, 4, 6);
INSERT INTO PRODUCTOS VALUES (114, 'SKF-BOM114', 'SKF', 'BOM-0114', 'Bomba de Agua', 'Bomba de refrigeración con rodamiento reforzado', 45990.00, 5, 6);
INSERT INTO PRODUCTOS VALUES (115, 'WAH-TER115', 'Wahler', 'TER-0115', 'Termostato', 'Termostato de regulación de temperatura para motor', 19990.00, 7, 6);
INSERT INTO PRODUCTOS VALUES (116, 'ATE-FRT116', 'ATE', 'FRT-0116', 'Kit de Frenos Traseros', 'Set completo de frenos traseros para sedán mediano', 89990.00, 4, 4);
INSERT INTO PRODUCTOS VALUES (117, 'MAN-FIL117', 'Mann-Filter', 'FIL-0117', 'Filtro de Combustible', 'Filtro de combustible de alta eficiencia', 15990.00, 8, 1);
INSERT INTO PRODUCTOS VALUES (118, 'DEN-SEN118', 'Denso', 'SEN-0118', 'Sensor de Oxígeno', 'Sensor O2 para sistema de inyección electrónica', 49990.00, 6, 2);
INSERT INTO PRODUCTOS VALUES (119, 'BOS-ALT119', 'Bosch', 'ALT-0119', 'Alternador Remanufacturado', 'Alternador reconstruido con garantía Bosch', 199990.00, 3, 2);
INSERT INTO PRODUCTOS VALUES (120, 'FEB-BOM120', 'Febi', 'BOM-0120', 'Bomba de Aceite', 'Bomba de aceite de presión constante', 59990.00, 4, 1);
INSERT INTO PRODUCTOS VALUES (121, 'FAG-ROD121', 'FAG', 'ROD-0121', 'Kit de Rodamientos', 'Juego de rodamientos delanteros y traseros', 44990.00, 6, 3);
INSERT INTO PRODUCTOS VALUES (122, 'INA-TEN122', 'INA', 'TEN-0122', 'Tensor de Correa', 'Tensor automático para correa auxiliar', 29990.00, 5, 3);
INSERT INTO PRODUCTOS VALUES (123, 'FRM-FIL123', 'Fram', 'FIL-0123', 'Filtro de Aceite Premium', 'Filtro con válvula antirretorno para arranques en frío', 9990.00, 10, 1);
INSERT INTO PRODUCTOS VALUES (124, 'DEL-BOB124', 'Delphi', 'BOB-0124', 'Bobina de Encendido', 'Bobina de encendido para sistema DIS', 39990.00, 7, 2);

COMMIT;
