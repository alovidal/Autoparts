from flask import jsonify, request
from app import app
from config import connection

# ------------------- USUARIOS -------------------
@app.route('/usuarios/registrar', methods=['POST'])
def registrar_usuario():
    try:
        data = request.get_json()
        rut = data.get('rut')
        nombre = data.get('nombre_completo')
        correo = data.get('correo')
        contrasena = data.get('contrasena')
        rol = data.get('rol')
        if not all([rut, nombre, correo, contrasena, rol]):
            return jsonify({'error': 'Faltan datos'}), 400
        cursor = connection.cursor()
        cursor.execute("""
            INSERT INTO USUARIOS (RUT, NOMBRE_COMPLETO, CORREO, CONTRASENA, ROL)
            VALUES (:rut, :nombre, :correo, :contrasena, :rol)
        """, rut=rut, nombre=nombre, correo=correo, contrasena=contrasena, rol=rol)
        connection.commit()
        cursor.close()
        return jsonify({'mensaje': 'Usuario registrado correctamente'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/usuarios/login', methods=['POST'])
def login_usuario():
    try:
        data = request.get_json()
        correo = data.get('correo')
        contrasena = data.get('contrasena')
        if not all([correo, contrasena]):
            return jsonify({'error': 'Faltan datos'}), 400
        cursor = connection.cursor()
        cursor.execute("""
            SELECT ID_USUARIO, NOMBRE_COMPLETO, CORREO, ROL FROM USUARIOS WHERE CORREO = :correo AND CONTRASENA = :contrasena
        """, correo=correo, contrasena=contrasena)
        usuario = cursor.fetchone()
        cursor.close()
        if usuario:
            return jsonify({
                'id_usuario': usuario[0],
                'nombre_completo': usuario[1],
                'correo': usuario[2],
                'rol': usuario[3]
            })
        else:
            return jsonify({'error': 'Credenciales incorrectas'}), 401
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/usuarios', methods=['GET'])
def obtener_usuarios():
    try:
        cursor = connection.cursor()
        cursor.execute("SELECT ID_USUARIO, RUT, NOMBRE_COMPLETO, CORREO, ROL, FECHA_REGISTRO FROM USUARIOS")
        columns = [col[0].lower() for col in cursor.description]
        usuarios = [dict(zip(columns, row)) for row in cursor.fetchall()]
        cursor.close()
        return jsonify({'usuarios': usuarios})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/usuarios/<int:id_usuario>', methods=['GET'])
def obtener_usuario(id_usuario):
    try:
        cursor = connection.cursor()
        cursor.execute("SELECT ID_USUARIO, RUT, NOMBRE_COMPLETO, CORREO, ROL, FECHA_REGISTRO FROM USUARIOS WHERE ID_USUARIO = :id", id=id_usuario)
        row = cursor.fetchone()
        cursor.close()
        if row:
            columns = ['id_usuario', 'rut', 'nombre_completo', 'correo', 'rol', 'fecha_registro']
            return jsonify(dict(zip(columns, row)))
        else:
            return jsonify({'error': 'Usuario no encontrado'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/usuarios/<int:id_usuario>', methods=['PUT'])
def actualizar_usuario(id_usuario):
    try:
        data = request.get_json()
        nombre = data.get('nombre_completo')
        correo = data.get('correo')
        rol = data.get('rol')
        cursor = connection.cursor()
        cursor.execute("""
            UPDATE USUARIOS SET NOMBRE_COMPLETO = :nombre, CORREO = :correo, ROL = :rol WHERE ID_USUARIO = :id
        """, nombre=nombre, correo=correo, rol=rol, id=id_usuario)
        connection.commit()
        cursor.close()
        return jsonify({'mensaje': 'Usuario actualizado correctamente'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/usuarios/<int:id_usuario>', methods=['DELETE'])
def eliminar_usuario(id_usuario):
    try:
        cursor = connection.cursor()
        cursor.execute("DELETE FROM USUARIOS WHERE ID_USUARIO = :id", id=id_usuario)
        connection.commit()
        cursor.close()
        return jsonify({'mensaje': 'Usuario eliminado correctamente'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ------------------- SUCURSALES -------------------
@app.route('/sucursales', methods=['POST'])
def crear_sucursal():
    try:
        data = request.get_json()
        nombre = data.get('nombre')
        direccion = data.get('direccion')
        comuna = data.get('comuna')
        region = data.get('region')
        if not nombre:
            return jsonify({'error': 'Faltan datos'}), 400
        cursor = connection.cursor()
        cursor.execute("""
            INSERT INTO SUCURSALES (NOMBRE, DIRECCION, COMUNA, REGION)
            VALUES (:nombre, :direccion, :comuna, :region)
        """, nombre=nombre, direccion=direccion, comuna=comuna, region=region)
        connection.commit()
        cursor.close()
        return jsonify({'mensaje': 'Sucursal creada correctamente'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/sucursales', methods=['GET'])
def listar_sucursales():
    try:
        cursor = connection.cursor()
        cursor.execute("SELECT ID_SUCURSAL, NOMBRE, DIRECCION, COMUNA, REGION FROM SUCURSALES")
        columns = [col[0].lower() for col in cursor.description]
        sucursales = [dict(zip(columns, row)) for row in cursor.fetchall()]
        cursor.close()
        return jsonify({'sucursales': sucursales})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/sucursales/<int:id_sucursal>', methods=['GET'])
def obtener_sucursal(id_sucursal):
    try:
        cursor = connection.cursor()
        cursor.execute("SELECT ID_SUCURSAL, NOMBRE, DIRECCION, COMUNA, REGION FROM SUCURSALES WHERE ID_SUCURSAL = :id", id=id_sucursal)
        row = cursor.fetchone()
        cursor.close()
        if row:
            columns = ['id_sucursal', 'nombre', 'direccion', 'comuna', 'region']
            return jsonify(dict(zip(columns, row)))
        else:
            return jsonify({'error': 'Sucursal no encontrada'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/sucursales/<int:id_sucursal>', methods=['PUT'])
def actualizar_sucursal(id_sucursal):
    try:
        data = request.get_json()
        nombre = data.get('nombre')
        direccion = data.get('direccion')
        comuna = data.get('comuna')
        region = data.get('region')
        cursor = connection.cursor()
        cursor.execute("""
            UPDATE SUCURSALES SET NOMBRE = :nombre, DIRECCION = :direccion, COMUNA = :comuna, REGION = :region WHERE ID_SUCURSAL = :id
        """, nombre=nombre, direccion=direccion, comuna=comuna, region=region, id=id_sucursal)
        connection.commit()
        cursor.close()
        return jsonify({'mensaje': 'Sucursal actualizada correctamente'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/sucursales/<int:id_sucursal>', methods=['DELETE'])
def eliminar_sucursal(id_sucursal):
    try:
        cursor = connection.cursor()
        cursor.execute("DELETE FROM SUCURSALES WHERE ID_SUCURSAL = :id", id=id_sucursal)
        connection.commit()
        cursor.close()
        return jsonify({'mensaje': 'Sucursal eliminada correctamente'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ------------------- CATEGORÍAS Y SUBCATEGORÍAS -------------------
@app.route('/categorias', methods=['POST'])
def crear_categoria():
    try:
        data = request.get_json()
        nombre = data.get('nombre')
        if not nombre:
            return jsonify({'error': 'Faltan datos'}), 400
        cursor = connection.cursor()
        cursor.execute("INSERT INTO CATEGORIAS (NOMBRE) VALUES (:nombre)", nombre=nombre)
        connection.commit()
        cursor.close()
        return jsonify({'mensaje': 'Categoría creada correctamente'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/categorias', methods=['GET'])
def listar_categorias():
    try:
        cursor = connection.cursor()
        cursor.execute("SELECT ID_CATEGORIA, NOMBRE FROM CATEGORIAS")
        columns = [col[0].lower() for col in cursor.description]
        categorias = [dict(zip(columns, row)) for row in cursor.fetchall()]
        cursor.close()
        return jsonify({'categorias': categorias})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/subcategorias', methods=['POST'])
def crear_subcategoria():
    try:
        data = request.get_json()
        id_categoria = data.get('id_categoria')
        nombre = data.get('nombre')
        if not all([id_categoria, nombre]):
            return jsonify({'error': 'Faltan datos'}), 400
        cursor = connection.cursor()
        cursor.execute("INSERT INTO SUBCATEGORIAS (ID_CATEGORIA, NOMBRE) VALUES (:id_categoria, :nombre)", id_categoria=id_categoria, nombre=nombre)
        connection.commit()
        cursor.close()
        return jsonify({'mensaje': 'Subcategoría creada correctamente'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/subcategorias', methods=['GET'])
def listar_subcategorias():
    try:
        cursor = connection.cursor()
        cursor.execute("SELECT ID_SUBCATEGORIA, ID_CATEGORIA, NOMBRE FROM SUBCATEGORIAS")
        columns = [col[0].lower() for col in cursor.description]
        subcategorias = [dict(zip(columns, row)) for row in cursor.fetchall()]
        cursor.close()
        return jsonify({'subcategorias': subcategorias})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/categorias/<int:id_categoria>/subcategorias', methods=['GET'])
def listar_subcategorias_por_categoria(id_categoria):
    try:
        cursor = connection.cursor()
        cursor.execute("SELECT ID_SUBCATEGORIA, NOMBRE FROM SUBCATEGORIAS WHERE ID_CATEGORIA = :id_categoria", id_categoria=id_categoria)
        columns = [col[0].lower() for col in cursor.description]
        subcategorias = [dict(zip(columns, row)) for row in cursor.fetchall()]
        cursor.close()
        return jsonify({'subcategorias': subcategorias})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/categorias/<int:id_categoria>', methods=['PUT'])
def actualizar_categoria(id_categoria):
    try:
        data = request.get_json()
        nombre = data.get('nombre')
        if not nombre:
            return jsonify({'error': 'Faltan datos'}), 400
        cursor = connection.cursor()
        cursor.execute("""
            UPDATE CATEGORIAS SET NOMBRE = :nombre WHERE ID_CATEGORIA = :id_categoria
        """, nombre=nombre, id_categoria=id_categoria)
        connection.commit()
        cursor.close()
        return jsonify({'mensaje': 'Categoría actualizada correctamente'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/categorias/<int:id_categoria>', methods=['DELETE'])
def eliminar_categoria(id_categoria):
    try:
        cursor = connection.cursor()
        cursor.execute("DELETE FROM CATEGORIAS WHERE ID_CATEGORIA = :id_categoria", id_categoria=id_categoria)
        connection.commit()
        cursor.close()
        return jsonify({'mensaje': 'Categoría eliminada correctamente'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ------------------- PRODUCTOS -------------------
@app.route('/productos', methods=['GET'])
def obtener_productos():
    try:
        cursor = connection.cursor()
        cursor.execute("""
            SELECT 
                p.ID_PRODUCTO,
                p.CODIGO_FABRICANTE,
                p.MARCA,
                p.CODIGO_INTERNO,
                p.NOMBRE,
                p.DESCRIPCION,
                p.PRECIO_UNITARIO,
                p.STOCK_MIN,
                p.ID_CATEGORIA,
                p.IMAGEN,
                i.STOCK,
                s.NOMBRE as SUCURSAL_NOMBRE
            FROM PRODUCTOS p
            LEFT JOIN INVENTARIO i ON p.ID_PRODUCTO = i.ID_PRODUCTO
            LEFT JOIN SUCURSALES s ON i.ID_SUCURSAL = s.ID_SUCURSAL
            ORDER BY p.NOMBRE
        """)
        columns = [col[0].lower() for col in cursor.description]
        productos = [dict(zip(columns, row)) for row in cursor.fetchall()]
        cursor.close()
        return jsonify({'productos': productos})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/productos/<int:id_producto>', methods=['GET'])
def obtener_producto(id_producto):
    try:
        cursor = connection.cursor()
        cursor.execute("""
            SELECT 
                p.ID_PRODUCTO,
                p.CODIGO_FABRICANTE,
                p.MARCA,
                p.CODIGO_INTERNO,
                p.NOMBRE,
                p.DESCRIPCION,
                p.PRECIO_UNITARIO,
                p.STOCK_MIN,
                p.ID_CATEGORIA,
                p.IMAGEN,
                i.STOCK,
                s.NOMBRE as SUCURSAL_NOMBRE
            FROM PRODUCTOS p
            LEFT JOIN INVENTARIO i ON p.ID_PRODUCTO = i.ID_PRODUCTO
            LEFT JOIN SUCURSALES s ON i.ID_SUCURSAL = s.ID_SUCURSAL
            WHERE p.ID_PRODUCTO = :id_producto
        """, id_producto=id_producto)
        columns = [col[0].lower() for col in cursor.description]
        productos = [dict(zip(columns, row)) for row in cursor.fetchall()]
        cursor.close()
        
        if productos:
            return jsonify(productos[0])
        else:
            return jsonify({'error': 'Producto no encontrado'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/productos', methods=['POST'])
def crear_producto():
    try:
        data = request.get_json()
        codigo_fabricante = data.get('codigo_fabricante')
        marca = data.get('marca')
        codigo_interno = data.get('codigo_interno')
        nombre = data.get('nombre')
        descripcion = data.get('descripcion')
        precio_unitario = data.get('precio_unitario')
        stock_min = data.get('stock_min')
        id_categoria = data.get('id_categoria')
        imagen = data.get('imagen')
        if not all([codigo_fabricante, marca, codigo_interno, nombre, descripcion, precio_unitario, stock_min, id_categoria]):
            return jsonify({'error': 'Faltan datos'}), 400
        cursor = connection.cursor()
        cursor.execute("""
            INSERT INTO PRODUCTOS (CODIGO_FABRICANTE, MARCA, CODIGO_INTERNO, NOMBRE, DESCRIPCION, PRECIO_UNITARIO, STOCK_MIN, ID_CATEGORIA, IMAGEN)
            VALUES (:codigo_fabricante, :marca, :codigo_interno, :nombre, :descripcion, :precio_unitario, :stock_min, :id_categoria, :imagen)
        """, codigo_fabricante=codigo_fabricante, marca=marca, codigo_interno=codigo_interno, nombre=nombre, descripcion=descripcion, precio_unitario=precio_unitario, stock_min=stock_min, id_categoria=id_categoria, imagen=imagen)
        connection.commit()
        cursor.close()
        return jsonify({'mensaje': 'Producto creado correctamente'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/productos/<int:id_producto>', methods=['PUT'])
def actualizar_producto(id_producto):
    try:
        data = request.get_json()
        codigo_fabricante = data.get('codigo_fabricante')
        marca = data.get('marca')
        codigo_interno = data.get('codigo_interno')
        nombre = data.get('nombre')
        descripcion = data.get('descripcion')
        precio_unitario = data.get('precio_unitario')
        stock_min = data.get('stock_min')
        id_categoria = data.get('id_categoria')
        imagen = data.get('imagen')
        if not all([codigo_fabricante, marca, codigo_interno, nombre, descripcion, precio_unitario, stock_min, id_categoria]):
            return jsonify({'error': 'Faltan datos'}), 400
        cursor = connection.cursor()
        cursor.execute("""
            UPDATE PRODUCTOS SET
                CODIGO_FABRICANTE = :codigo_fabricante,
                MARCA = :marca,
                CODIGO_INTERNO = :codigo_interno,
                NOMBRE = :nombre,
                DESCRIPCION = :descripcion,
                PRECIO_UNITARIO = :precio_unitario,
                STOCK_MIN = :stock_min,
                ID_CATEGORIA = :id_categoria,
                IMAGEN = :imagen
            WHERE ID_PRODUCTO = :id_producto
        """, codigo_fabricante=codigo_fabricante, marca=marca, codigo_interno=codigo_interno, nombre=nombre, descripcion=descripcion, precio_unitario=precio_unitario, stock_min=stock_min, id_categoria=id_categoria, imagen=imagen, id_producto=id_producto)
        connection.commit()
        cursor.close()
        return jsonify({'mensaje': 'Producto actualizado correctamente'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/productos/<int:id_producto>', methods=['DELETE'])
def eliminar_producto(id_producto):
    try:
        cursor = connection.cursor()
        cursor.execute("DELETE FROM PRODUCTOS WHERE ID_PRODUCTO = :id_producto", id_producto=id_producto)
        connection.commit()
        cursor.close()
        return jsonify({'mensaje': 'Producto eliminado correctamente'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ------------------- INVENTARIO -------------------
@app.route('/inventario', methods=['GET'])
def obtener_stock():
    try:
        id_sucursal = request.args.get('sucursal')
        id_producto = request.args.get('producto')
        cursor = connection.cursor()
        if id_sucursal and id_producto:
            cursor.execute("SELECT STOCK FROM INVENTARIO WHERE ID_SUCURSAL = :sucursal AND ID_PRODUCTO = :producto", sucursal=id_sucursal, producto=id_producto)
            row = cursor.fetchone()
            cursor.close()
            if row:
                return jsonify({'stock': row[0]})
            else:
                return jsonify({'error': 'No existe inventario para ese producto en la sucursal'}), 404
        elif id_sucursal:
            cursor.execute("SELECT ID_PRODUCTO, STOCK FROM INVENTARIO WHERE ID_SUCURSAL = :sucursal", sucursal=id_sucursal)
            productos = [{'id_producto': row[0], 'stock': row[1]} for row in cursor.fetchall()]
            cursor.close()
            return jsonify({'inventario': productos})
        else:
            return jsonify({'error': 'Debe indicar al menos la sucursal'}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/ingresar_stock', methods=['POST'])
def ingresar_stock():
    data = request.get_json()
    id_sucursal = data.get('id_sucursal')
    id_producto = data.get('id_producto')
    cantidad = data.get('cantidad')
    if not all([id_sucursal, id_producto, cantidad]):
        return jsonify({'error': 'Faltan datos'}), 400
    cursor = connection.cursor()
    cursor.execute("""
        SELECT STOCK FROM INVENTARIO 
        WHERE ID_SUCURSAL = :sucursal AND ID_PRODUCTO = :producto
    """, sucursal=id_sucursal, producto=id_producto)
    row = cursor.fetchone()
    if row:
        nuevo_stock = row[0] + cantidad
        cursor.execute("""
            UPDATE INVENTARIO 
            SET STOCK = :stock 
            WHERE ID_SUCURSAL = :sucursal AND ID_PRODUCTO = :producto
        """, stock=nuevo_stock, sucursal=id_sucursal, producto=id_producto)
    else:
        cursor.execute("""
            INSERT INTO INVENTARIO (ID_SUCURSAL, ID_PRODUCTO, STOCK)
            VALUES (:sucursal, :producto, :stock)
        """, sucursal=id_sucursal, producto=id_producto, stock=cantidad)
    connection.commit()
    cursor.close()
    return jsonify({'mensaje': 'Stock ingresado correctamente'})

@app.route('/rebajar_stock', methods=['POST'])
def rebajar_stock():
    data = request.get_json()
    id_sucursal = data.get('id_sucursal')
    id_producto = data.get('id_producto')
    cantidad = data.get('cantidad')
    if not all([id_sucursal, id_producto, cantidad]):
        return jsonify({'error': 'Faltan datos'}), 400
    cursor = connection.cursor()
    cursor.execute("""
        SELECT STOCK FROM INVENTARIO 
        WHERE ID_SUCURSAL = :sucursal AND ID_PRODUCTO = :producto
    """, sucursal=id_sucursal, producto=id_producto)
    row = cursor.fetchone()
    if not row:
        cursor.close()
        return jsonify({'error': 'Producto no existe en la sucursal'}), 404
    stock_actual = row[0]
    if stock_actual < cantidad:
        cursor.close()
        return jsonify({'error': 'Stock insuficiente'}), 400
    nuevo_stock = stock_actual - cantidad
    cursor.execute("""
        UPDATE INVENTARIO 
        SET STOCK = :stock 
        WHERE ID_SUCURSAL = :sucursal AND ID_PRODUCTO = :producto
    """, stock=nuevo_stock, sucursal=id_sucursal, producto=id_producto)
    connection.commit()
    cursor.close()
    return jsonify({'mensaje': 'Stock rebajado correctamente'})

@app.route('/inventario/detalle', methods=['GET'])
def inventario_detallado():
    try:
        cursor = connection.cursor()
        cursor.execute("""
            SELECT 
                p.ID_PRODUCTO,
                p.NOMBRE,
                p.MARCA,
                p.DESCRIPCION,
                p.CODIGO_INTERNO,
                p.CODIGO_FABRICANTE,
                p.IMAGEN,
                p.PRECIO_UNITARIO,
                p.ID_CATEGORIA,
                i.STOCK,
                s.NOMBRE as SUCURSAL_NOMBRE,
                s.ID_SUCURSAL
            FROM INVENTARIO i
            JOIN PRODUCTOS p ON i.ID_PRODUCTO = p.ID_PRODUCTO
            JOIN SUCURSALES s ON i.ID_SUCURSAL = s.ID_SUCURSAL
            WHERE i.STOCK > 0
            ORDER BY p.NOMBRE, s.NOMBRE
        """)
        columns = [col[0].lower() for col in cursor.description]
        inventario = [dict(zip(columns, row)) for row in cursor.fetchall()]
        cursor.close()
        return jsonify({'inventario': inventario})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/productos/disponibles', methods=['GET'])
def obtener_productos_disponibles():
    """Endpoint específico para mostrar solo productos con stock disponible"""
    try:
        cursor = connection.cursor()
        cursor.execute("""
            SELECT DISTINCT
                p.ID_PRODUCTO,
                p.NOMBRE,
                p.MARCA,
                p.DESCRIPCION,
                p.CODIGO_INTERNO,
                p.CODIGO_FABRICANTE,
                p.IMAGEN,
                p.PRECIO_UNITARIO,
                p.ID_CATEGORIA,
                SUM(i.STOCK) as STOCK_TOTAL,
                COUNT(DISTINCT i.ID_SUCURSAL) as NUM_SUCURSALES,
                MIN(s.NOMBRE) as SUCURSAL_PRINCIPAL
            FROM PRODUCTOS p
            JOIN INVENTARIO i ON p.ID_PRODUCTO = i.ID_PRODUCTO
            JOIN SUCURSALES s ON i.ID_SUCURSAL = s.ID_SUCURSAL
            WHERE i.STOCK > 0
            GROUP BY p.ID_PRODUCTO, p.NOMBRE, p.MARCA, p.DESCRIPCION, p.CODIGO_INTERNO, p.CODIGO_FABRICANTE, p.IMAGEN, p.PRECIO_UNITARIO, p.ID_CATEGORIA
            ORDER BY p.NOMBRE
        """)
        columns = [col[0].lower() for col in cursor.description]
        productos = [dict(zip(columns, row)) for row in cursor.fetchall()]
        cursor.close()
        return jsonify({'productos': productos})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/inventario', methods=['DELETE'])
def eliminar_inventario():
    id_sucursal = request.args.get('sucursal')
    id_producto = request.args.get('producto')
    if not id_sucursal or not id_producto:
        return jsonify({'error': 'Faltan parámetros'}), 400
    try:
        cursor = connection.cursor()
        cursor.execute("DELETE FROM INVENTARIO WHERE ID_SUCURSAL = :sucursal AND ID_PRODUCTO = :producto", sucursal=id_sucursal, producto=id_producto)
        connection.commit()
        cursor.close()
        return jsonify({'mensaje': 'Registro de inventario eliminado correctamente'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ------------------- CARRITOS -------------------
@app.route('/carritos', methods=['POST'])
def crear_carrito():
    try:
        cursor = connection.cursor()
        
        # Usar la secuencia automática de Oracle (más confiable)
        cursor.execute("INSERT INTO CARRITOS (FECHA_CREACION) VALUES (SYSDATE)")
        
        # Obtener el ID del carrito recién creado
        cursor.execute("SELECT ID_CARRITO FROM CARRITOS WHERE ROWID = (SELECT MAX(ROWID) FROM CARRITOS)")
        id_carrito = cursor.fetchone()[0]
        
        connection.commit()
        cursor.close()
        
        print(f"🛒 Carrito creado con ID: {id_carrito}")
        return jsonify({'id_carrito': id_carrito, 'mensaje': 'Carrito creado correctamente'})
    except Exception as e:
        print(f"❌ Error creando carrito: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500
       
@app.route('/carritos/<int:id_carrito>/productos', methods=['POST'])
def agregar_producto_carrito(id_carrito):
    try:
        data = request.get_json()
        id_producto = data.get('id_producto')
        id_sucursal = data.get('id_sucursal')
        cantidad = data.get('cantidad')
        valor_unitario = data.get('valor_unitario')
        valor_total = data.get('valor_total')
        if not all([id_producto, id_sucursal, cantidad, valor_unitario, valor_total]):
            return jsonify({'error': 'Faltan datos'}), 400
        
        cursor = connection.cursor()
        
        # Verificar si el producto ya existe en el carrito
        cursor.execute("""
            SELECT CANTIDAD, VALOR_UNITARIO FROM CARRITO_PRODUCTOS 
            WHERE ID_CARRITO = :id_carrito AND ID_PRODUCTO = :id_producto
        """, id_carrito=id_carrito, id_producto=id_producto)
        
        existing_item = cursor.fetchone()
        
        if existing_item:
            # Si ya existe, actualizar la cantidad
            nueva_cantidad = existing_item[0] + cantidad
            nuevo_valor_total = nueva_cantidad * valor_unitario
            
            cursor.execute("""
                UPDATE CARRITO_PRODUCTOS 
                SET CANTIDAD = :cantidad, VALOR_TOTAL = :valor_total
                WHERE ID_CARRITO = :id_carrito AND ID_PRODUCTO = :id_producto
            """, cantidad=nueva_cantidad, valor_total=nuevo_valor_total, id_carrito=id_carrito, id_producto=id_producto)
            
            mensaje = 'Cantidad actualizada en el carrito'
        else:
            # Si no existe, insertar nuevo registro
            cursor.execute("""
                INSERT INTO CARRITO_PRODUCTOS (ID_CARRITO, ID_PRODUCTO, ID_SUCURSAL, CANTIDAD, VALOR_UNITARIO, VALOR_TOTAL)
                VALUES (:id_carrito, :id_producto, :id_sucursal, :cantidad, :valor_unitario, :valor_total)
            """, id_carrito=id_carrito, id_producto=id_producto, id_sucursal=id_sucursal, cantidad=cantidad, valor_unitario=valor_unitario, valor_total=valor_total)
            
            mensaje = 'Producto agregado al carrito'
        
        connection.commit()
        cursor.close()
        print(f"✅ {mensaje} - Carrito: {id_carrito}, Producto: {id_producto}")
        return jsonify({'mensaje': mensaje})
    except Exception as e:
        print(f"❌ Error agregando producto al carrito: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/carritos/<int:id_carrito>/productos/<int:id_producto>', methods=['DELETE'])
def eliminar_producto_carrito(id_carrito, id_producto):
    try:
        cursor = connection.cursor()
        cursor.execute("DELETE FROM CARRITO_PRODUCTOS WHERE ID_CARRITO = :id_carrito AND ID_PRODUCTO = :id_producto", id_carrito=id_carrito, id_producto=id_producto)
        connection.commit()
        cursor.close()
        return jsonify({'mensaje': 'Producto eliminado del carrito'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/carritos/<int:id_carrito>/productos/<int:id_producto>/cantidad', methods=['PUT'])
def actualizar_cantidad_carrito(id_carrito, id_producto):
    try:
        data = request.get_json()
        nueva_cantidad = data.get('cantidad')
        
        print(f"🔄 Actualizando cantidad: Carrito {id_carrito}, Producto {id_producto}, Nueva cantidad: {nueva_cantidad}")
        
        if not nueva_cantidad or nueva_cantidad <= 0:
            return jsonify({'error': 'La cantidad debe ser mayor a 0'}), 400
        
        cursor = connection.cursor()
        
        # Verificar stock disponible
        cursor.execute("""
            SELECT i.STOCK 
            FROM INVENTARIO i 
            JOIN CARRITO_PRODUCTOS cp ON i.ID_PRODUCTO = cp.ID_PRODUCTO AND i.ID_SUCURSAL = cp.ID_SUCURSAL
            WHERE cp.ID_CARRITO = :id_carrito AND cp.ID_PRODUCTO = :id_producto
        """, id_carrito=id_carrito, id_producto=id_producto)
        
        stock_disponible = cursor.fetchone()
        print(f"📦 Stock disponible: {stock_disponible}")
        
        if not stock_disponible:
            return jsonify({'error': 'Producto no encontrado en inventario'}), 400
        
        if stock_disponible[0] < nueva_cantidad:
            return jsonify({'error': f'No hay suficiente stock disponible. Stock actual: {stock_disponible[0]}'}), 400
        
        # Actualizar cantidad y recalcular valor total
        cursor.execute("""
            UPDATE CARRITO_PRODUCTOS 
            SET CANTIDAD = :cantidad, 
                VALOR_TOTAL = CANTIDAD * VALOR_UNITARIO 
            WHERE ID_CARRITO = :id_carrito AND ID_PRODUCTO = :id_producto
        """, cantidad=nueva_cantidad, id_carrito=id_carrito, id_producto=id_producto)
        
        connection.commit()
        cursor.close()
        
        return jsonify({'mensaje': 'Cantidad actualizada correctamente'})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/carritos/<int:id_carrito>/productos', methods=['GET'])
def listar_productos_carrito(id_carrito):
    try:
        cursor = connection.cursor()
        cursor.execute("""
            SELECT 
                cp.ID_PRODUCTO,
                cp.ID_SUCURSAL,
                cp.CANTIDAD,
                cp.VALOR_UNITARIO,
                cp.VALOR_TOTAL,
                p.NOMBRE,
                p.MARCA,
                p.IMAGEN,
                s.NOMBRE as SUCURSAL_NOMBRE
            FROM CARRITO_PRODUCTOS cp
            JOIN PRODUCTOS p ON cp.ID_PRODUCTO = p.ID_PRODUCTO
            JOIN SUCURSALES s ON cp.ID_SUCURSAL = s.ID_SUCURSAL
            WHERE cp.ID_CARRITO = :id_carrito
        """, id_carrito=id_carrito)
        columns = [col[0].lower() for col in cursor.description]
        productos = [dict(zip(columns, row)) for row in cursor.fetchall()]
        cursor.close()
        return jsonify({'productos': productos})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/carritos/<int:id_carrito>/vaciar', methods=['DELETE'])
def vaciar_carrito(id_carrito):
    try:
        cursor = connection.cursor()
        cursor.execute("DELETE FROM CARRITO_PRODUCTOS WHERE ID_CARRITO = :id_carrito", id_carrito=id_carrito)
        connection.commit()
        cursor.close()
        return jsonify({'mensaje': 'Carrito vaciado correctamente'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ------------------- PEDIDOS -------------------
@app.route('/pedidos', methods=['POST'])
def crear_pedido():
    try:
        data = request.get_json()
        id_usuario = data.get('id_usuario')
        id_carrito = data.get('id_carrito')
        direccion = data.get('direccion')
        metodo_pago = data.get('metodo_pago', 'TRANSBANK')
        monto_total = data.get('monto_total', 0)
        
        print(f"📦 Creando pedido: {data}")
        
        if not all([id_usuario, id_carrito, direccion]):
            return jsonify({'error': 'Faltan datos requeridos: id_usuario, id_carrito, direccion'}), 400
        
        cursor = connection.cursor()
        
        # Verificar que el carrito existe en la tabla CARRITOS
        cursor.execute("SELECT COUNT(*) FROM CARRITOS WHERE ID_CARRITO = :id_carrito", id_carrito=id_carrito)
        carrito_exists = cursor.fetchone()[0]
        
        if carrito_exists == 0:
            print(f"❌ Carrito {id_carrito} no existe en tabla CARRITOS")
            return jsonify({'error': f'Carrito {id_carrito} no encontrado'}), 400
        
        # Verificar que el carrito tiene productos
        cursor.execute("""
            SELECT COUNT(*) FROM CARRITO_PRODUCTOS WHERE ID_CARRITO = :id_carrito
        """, id_carrito=id_carrito)
        
        productos_count = cursor.fetchone()[0]
        print(f"📦 Productos en carrito {id_carrito}: {productos_count}")
        
        if productos_count == 0:
            return jsonify({'error': 'El carrito está vacío'}), 400
        
        # Verificar que el usuario existe
        cursor.execute("SELECT COUNT(*) FROM USUARIOS WHERE ID_USUARIO = :id_usuario", id_usuario=id_usuario)
        usuario_exists = cursor.fetchone()[0]
        
        if usuario_exists == 0:
            return jsonify({'error': 'Usuario no encontrado'}), 400
        
        # Obtener el siguiente ID para DETALLE_PEDIDO
        cursor.execute("SELECT NVL(MAX(ID_DETALLE), 0) + 1 FROM DETALLE_PEDIDO")
        next_id = cursor.fetchone()[0]
        
        # Obtener el siguiente ID para PEDIDOS
        cursor.execute("SELECT NVL(MAX(ID_PEDIDO), 0) + 1 FROM PEDIDOS")
        next_pedido_id = cursor.fetchone()[0]
        
        # Crear detalle de pedido
        cursor.execute("""
            INSERT INTO DETALLE_PEDIDO (ID_DETALLE, ID_CARRITO, DIRECCION, ID_USUARIO, ESTADO) 
            VALUES (:id_detalle, :id_carrito, :direccion, :id_usuario, 'PENDIENTE')
        """, id_detalle=next_id, id_carrito=id_carrito, direccion=direccion, id_usuario=id_usuario)
        
        print(f"✅ Detalle de pedido creado: {next_id}")
        
        # Crear pedido
        cursor.execute("""
            INSERT INTO PEDIDOS (ID_PEDIDO, ID_USUARIO, ID_DETALLE, FECHA_PEDIDO) 
            VALUES (:id_pedido, :id_usuario, :id_detalle, SYSDATE)
        """, id_pedido=next_pedido_id, id_usuario=id_usuario, id_detalle=next_id)
        
        id_pedido = next_pedido_id
        print(f"✅ Pedido creado: {id_pedido}")
        
        # Crear pago asociado (usando WEBPAY como método por defecto ya que TRANSBANK no está en las restricciones)
        metodo_pago_db = 'WEBPAY' if metodo_pago == 'TRANSBANK' else metodo_pago
        cursor.execute("""
            INSERT INTO PAGOS (ID_PEDIDO, MONTO_TOTAL, METODO_PAGO, ESTADO_PAGO) 
            VALUES (:id_pedido, :monto_total, :metodo_pago, 'PENDIENTE')
        """, id_pedido=id_pedido, monto_total=monto_total, metodo_pago=metodo_pago_db)
        
        print(f"✅ Pago registrado para pedido: {id_pedido}")
        
        # Registrar en bitácora
        cursor.execute("""
            INSERT INTO BITACORA (ID_USUARIO, ACCION, FECHA_ACCION)
            VALUES (:id_usuario, 'Pedido creado #' || :id_pedido, SYSDATE)
        """, id_usuario=id_usuario, id_pedido=id_pedido)
        
        connection.commit()
        cursor.close()
        
        print(f"🎉 Pedido {id_pedido} creado exitosamente")
        
        return jsonify({
            'id_pedido': id_pedido, 
            'mensaje': 'Pedido creado correctamente',
            'detalle_id': next_id
        })
        
    except Exception as e:
        import traceback
        print(f"❌ Error al crear pedido: {str(e)}")
        print(f"📋 Traceback completo:")
        traceback.print_exc()
        return jsonify({'error': f'Error al crear el pedido: {str(e)}'}), 500

@app.route('/pedidos', methods=['GET'])
def listar_pedidos():
    try:
        cursor = connection.cursor()
        cursor.execute("SELECT ID_PEDIDO, ID_USUARIO, FECHA_PEDIDO, ID_DETALLE FROM PEDIDOS")
        columns = [col[0].lower() for col in cursor.description]
        pedidos = [dict(zip(columns, row)) for row in cursor.fetchall()]
        cursor.close()
        return jsonify({'pedidos': pedidos})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/pedidos/<int:id_pedido>', methods=['GET'])
def obtener_pedido(id_pedido):
    try:
        cursor = connection.cursor()
        cursor.execute("SELECT ID_PEDIDO, ID_USUARIO, FECHA_PEDIDO, ID_DETALLE FROM PEDIDOS WHERE ID_PEDIDO = :id_pedido", id_pedido=id_pedido)
        row = cursor.fetchone()
        cursor.close()
        if row:
            columns = ['id_pedido', 'id_usuario', 'fecha_pedido', 'id_detalle']
            return jsonify(dict(zip(columns, row)))
        else:
            return jsonify({'error': 'Pedido no encontrado'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/usuarios/<int:id_usuario>/pedidos', methods=['GET'])
def listar_pedidos_usuario(id_usuario):
    try:
        cursor = connection.cursor()
        cursor.execute("""
            SELECT 
                p.ID_PEDIDO, 
                p.FECHA_PEDIDO, 
                p.ID_DETALLE,
                d.ESTADO,
                COALESCE(pg.MONTO_TOTAL, 0) as TOTAL
            FROM PEDIDOS p
            JOIN DETALLE_PEDIDO d ON p.ID_DETALLE = d.ID_DETALLE
            LEFT JOIN PAGOS pg ON p.ID_PEDIDO = pg.ID_PEDIDO
            WHERE p.ID_USUARIO = :id_usuario
            ORDER BY p.FECHA_PEDIDO DESC
        """, id_usuario=id_usuario)
        columns = [col[0].lower() for col in cursor.description]
        pedidos = [dict(zip(columns, row)) for row in cursor.fetchall()]
        cursor.close()
        return jsonify({'pedidos': pedidos})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/pedidos/<int:id_pedido>/estado', methods=['PUT'])
def actualizar_estado_pedido(id_pedido):
    try:
        data = request.get_json()
        estado = data.get('estado')
        if estado not in ['PENDIENTE', 'CONFIRMADO', 'ENVIADO', 'ENTREGADO', 'CANCELADO']:
            return jsonify({'error': 'Estado no válido'}), 400
        cursor = connection.cursor()
        cursor.execute("UPDATE DETALLE_PEDIDO SET ESTADO = :estado WHERE ID_DETALLE = (SELECT ID_DETALLE FROM PEDIDOS WHERE ID_PEDIDO = :id_pedido)", estado=estado, id_pedido=id_pedido)
        connection.commit()
        cursor.close()
        return jsonify({'mensaje': 'Estado de pedido actualizado'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ------------------- PAGOS -------------------
@app.route('/pagos', methods=['POST'])
def registrar_pago():
    try:
        data = request.get_json()
        id_pedido = data.get('id_pedido')
        monto_total = data.get('monto_total')
        metodo_pago = data.get('metodo_pago')
        estado_pago = data.get('estado_pago')
        if not all([id_pedido, monto_total, metodo_pago, estado_pago]):
            return jsonify({'error': 'Faltan datos'}), 400
        cursor = connection.cursor()
        cursor.execute("""
            INSERT INTO PAGOS (ID_PEDIDO, MONTO_TOTAL, METODO_PAGO, ESTADO_PAGO)
            VALUES (:id_pedido, :monto_total, :metodo_pago, :estado_pago)
        """, id_pedido=id_pedido, monto_total=monto_total, metodo_pago=metodo_pago, estado_pago=estado_pago)
        connection.commit()
        cursor.close()
        return jsonify({'mensaje': 'Pago registrado correctamente'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/pagos', methods=['GET'])
def listar_pagos():
    try:
        cursor = connection.cursor()
        cursor.execute("SELECT ID_PAGO, ID_PEDIDO, MONTO_TOTAL, METODO_PAGO, ESTADO_PAGO, FECHA_PAGO FROM PAGOS")
        columns = [col[0].lower() for col in cursor.description]
        pagos = [dict(zip(columns, row)) for row in cursor.fetchall()]
        cursor.close()
        return jsonify({'pagos': pagos})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/pagos/<int:id_pago>', methods=['GET'])
def obtener_pago(id_pago):
    try:
        cursor = connection.cursor()
        cursor.execute("SELECT ID_PAGO, ID_PEDIDO, MONTO_TOTAL, METODO_PAGO, ESTADO_PAGO, FECHA_PAGO FROM PAGOS WHERE ID_PAGO = :id_pago", id_pago=id_pago)
        row = cursor.fetchone()
        cursor.close()
        if row:
            columns = ['id_pago', 'id_pedido', 'monto_total', 'metodo_pago', 'estado_pago', 'fecha_pago']
            return jsonify(dict(zip(columns, row)))
        else:
            return jsonify({'error': 'Pago no encontrado'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/pagos/<int:id_pago>', methods=['PUT'])
def actualizar_pago(id_pago):
    try:
        data = request.get_json()
        estado_pago = data.get('estado_pago')
        metodo_pago = data.get('metodo_pago')
        monto_total = data.get('monto_total')
        if not estado_pago and not metodo_pago and not monto_total:
            return jsonify({'error': 'No hay campos para actualizar'}), 400
        cursor = connection.cursor()
        sets = []
        params = {'id_pago': id_pago}
        if estado_pago:
            sets.append('ESTADO_PAGO = :estado_pago')
            params['estado_pago'] = estado_pago
        if metodo_pago:
            sets.append('METODO_PAGO = :metodo_pago')
            params['metodo_pago'] = metodo_pago
        if monto_total:
            sets.append('MONTO_TOTAL = :monto_total')
            params['monto_total'] = monto_total
        set_clause = ', '.join(sets)
        cursor.execute(f"""
            UPDATE PAGOS SET {set_clause} WHERE ID_PAGO = :id_pago
        """, params)
        connection.commit()
        cursor.close()
        return jsonify({'mensaje': 'Pago actualizado correctamente'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500



# ------------------- BITÁCORA -------------------
@app.route('/bitacora', methods=['GET'])
def listar_bitacora():
    try:
        id_usuario = request.args.get('usuario')
        cursor = connection.cursor()
        if id_usuario:
            cursor.execute("SELECT ID_LOG, ID_USUARIO, ACCION, FECHA_ACCION FROM BITACORA WHERE ID_USUARIO = :id_usuario", id_usuario=id_usuario)
        else:
            cursor.execute("SELECT ID_LOG, ID_USUARIO, ACCION, FECHA_ACCION FROM BITACORA")
        columns = [col[0].lower() for col in cursor.description]
        logs = [dict(zip(columns, row)) for row in cursor.fetchall()]
        cursor.close()
        return jsonify({'bitacora': logs})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ------------------- DIAGNÓSTICO -------------------
@app.route('/diagnostico/carritos', methods=['GET'])
def diagnostico_carritos():
    """Endpoint para diagnosticar el estado de los carritos"""
    try:
        cursor = connection.cursor()
        
        # Verificar carritos
        cursor.execute("SELECT ID_CARRITO, FECHA_CREACION FROM CARRITOS ORDER BY ID_CARRITO")
        carritos = cursor.fetchall()
        
        # Verificar productos en carritos
        cursor.execute("""
            SELECT ID_CARRITO, COUNT(*) as productos 
            FROM CARRITO_PRODUCTOS 
            GROUP BY ID_CARRITO 
            ORDER BY ID_CARRITO
        """)
        productos_carrito = cursor.fetchall()
        
        # Verificar usuarios
        cursor.execute("SELECT ID_USUARIO, NOMBRE_COMPLETO FROM USUARIOS ORDER BY ID_USUARIO")
        usuarios = cursor.fetchall()
        
        cursor.close()
        
        return jsonify({
            'carritos': [{'id': row[0], 'fecha': str(row[1])} for row in carritos],
            'productos_por_carrito': [{'carrito': row[0], 'productos': row[1]} for row in productos_carrito],
            'usuarios': [{'id': row[0], 'nombre': row[1]} for row in usuarios]
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == "__main__":
    app.run()