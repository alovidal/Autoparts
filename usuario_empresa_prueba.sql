-- Script para insertar usuario de prueba con rol EMPRESA
-- Este usuario tendrá un 15% de descuento automático en todos los productos

INSERT INTO USUARIOS (RUT, NOMBRE_COMPLETO, CORREO, CONTRASENA, ROL) 
VALUES ('12345678-9', 'Empresa Test SPA', 'empresa@test.com', 'empresa123', 'EMPRESA');

-- Verificar que se insertó correctamente
SELECT ID_USUARIO, RUT, NOMBRE_COMPLETO, CORREO, ROL, FECHA_REGISTRO 
FROM USUARIOS 
WHERE ROL = 'EMPRESA';

COMMIT; 