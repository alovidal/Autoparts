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
            SELECT ID_USUARIO, NOMBRE_COMPLETO, ROL FROM USUARIOS WHERE CORREO = :correo AND CONTRASENA = :contrasena
        """, correo=correo, contrasena=contrasena)
        usuario = cursor.fetchone()
        cursor.close()
        if usuario:
            return jsonify({'id_usuario': usuario[0], 'nombre_completo': usuario[1], 'rol': usuario[2]})
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

# ------------------- PRODUCTOS -------------------
# (Puedes mover aquí la lógica de productos si lo deseas, o dejarla en app.py para evitar duplicidad)

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

# ------------------- CARRITOS -------------------
@app.route('/carritos', methods=['POST'])
def crear_carrito():
    try:
        cursor = connection.cursor()
        cursor.execute("INSERT INTO CARRITOS DEFAULT VALUES RETURNING ID_CARRITO INTO :id", id=cursor.var(int))
        id_carrito = cursor.getimplicitresults()[0][0]
        connection.commit()
        cursor.close()
        return jsonify({'id_carrito': id_carrito, 'mensaje': 'Carrito creado correctamente'})
    except Exception as e:
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
        cursor.execute("""
            INSERT INTO CARRITO_PRODUCTOS (ID_CARRITO, ID_PRODUCTO, ID_SUCURSAL, CANTIDAD, VALOR_UNITARIO, VALOR_TOTAL)
            VALUES (:id_carrito, :id_producto, :id_sucursal, :cantidad, :valor_unitario, :valor_total)
        """, id_carrito=id_carrito, id_producto=id_producto, id_sucursal=id_sucursal, cantidad=cantidad, valor_unitario=valor_unitario, valor_total=valor_total)
        connection.commit()
        cursor.close()
        return jsonify({'mensaje': 'Producto agregado al carrito'})
    except Exception as e:
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

@app.route('/carritos/<int:id_carrito>/productos', methods=['GET'])
def listar_productos_carrito(id_carrito):
    try:
        cursor = connection.cursor()
        cursor.execute("SELECT ID_PRODUCTO, ID_SUCURSAL, CANTIDAD, VALOR_UNITARIO, VALOR_TOTAL FROM CARRITO_PRODUCTOS WHERE ID_CARRITO = :id_carrito", id_carrito=id_carrito)
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
        if not all([id_usuario, id_carrito, direccion]):
            return jsonify({'error': 'Faltan datos'}), 400
        cursor = connection.cursor()
        # Crear detalle de pedido
        cursor.execute("INSERT INTO DETALLE_PEDIDO (ID_CARRITO, DIRECCION, ID_USUARIO) VALUES (:id_carrito, :direccion, :id_usuario) RETURNING ID_DETALLE INTO :id_detalle", id_carrito=id_carrito, direccion=direccion, id_usuario=id_usuario, id_detalle=cursor.var(int))
        id_detalle = cursor.getimplicitresults()[0][0]
        # Crear pedido
        cursor.execute("INSERT INTO PEDIDOS (ID_USUARIO, ID_DETALLE) VALUES (:id_usuario, :id_detalle) RETURNING ID_PEDIDO INTO :id_pedido", id_usuario=id_usuario, id_detalle=id_detalle, id_pedido=cursor.var(int))
        id_pedido = cursor.getimplicitresults()[0][0]
        connection.commit()
        cursor.close()
        return jsonify({'id_pedido': id_pedido, 'mensaje': 'Pedido creado correctamente'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

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
        cursor.execute("SELECT ID_PEDIDO, FECHA_PEDIDO, ID_DETALLE FROM PEDIDOS WHERE ID_USUARIO = :id_usuario", id_usuario=id_usuario)
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

if __name__ == "__main__":
    app.run()