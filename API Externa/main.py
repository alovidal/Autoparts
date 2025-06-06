from app import app
from config import connection 
from flask import jsonify, request

@app.route('/producto/<int:id_producto>', methods=['GET'])
def valor_producto(id_producto):
    cursor = connection.cursor()
    cursor.execute("""
        SELECT
            p.ID_PRODUCTO,
            p.NOMBRE,
            p.MARCA,
            p.PRECIO_UNITARIO AS valor,
            s.NOMBRE AS sucursal,
            i.STOCK
        FROM PRODUCTOS p
        JOIN INVENTARIO i ON p.ID_PRODUCTO = i.ID_PRODUCTO
        JOIN SUCURSALES s ON i.ID_SUCURSAL = s.ID_SUCURSAL
        WHERE p.ID_PRODUCTO = :id_producto
    """, {'id_producto': id_producto})

    rows = cursor.fetchall()
    cursor.close()

    if rows:
        resultado = {
            'id_producto': rows[0][0],
            'nombre': rows[0][1],
            'marca': rows[0][2],
            'valor': float(rows[0][3]),
            'sucursales': [
                {
                    'nombre': row[4],
                    'stock': int(row[5])
                }
                for row in rows
            ]
        }
        return jsonify(resultado)
    else:
        return jsonify({'error': 'Producto no encontrado'}), 404

@app.route('/producto_carrito', methods=['POST'])
def agregar_a_carrito():
    if not request.is_json:
        return jsonify({'error': 'Content-Type debe ser application/json'}), 415

    data = request.get_json()
    id_carrito = data.get('id_carrito')
    id_producto = data.get('id_producto')
    id_sucursal = data.get('id_sucursal')
    cantidad = data.get('cantidad')

    if not all([id_producto, id_sucursal, cantidad]):
        return jsonify({'error': 'Faltan datos obligatorios'}), 400

    cursor = connection.cursor()

    if id_carrito is None:
        cursor.execute("INSERT INTO CARRITOS DEFAULT VALUES RETURNING ID_CARRITO INTO :id", {'id': cursor.var(int)})
        id_carrito = cursor.getimplicitresults()[0][0]
    else:
        cursor.execute("SELECT 1 FROM CARRITOS WHERE ID_CARRITO = :id", {'id': id_carrito})
        if not cursor.fetchone():
            cursor.execute("INSERT INTO CARRITOS (ID_CARRITO) VALUES (:id)", {'id': id_carrito})

    cursor.execute("""
        SELECT P.PRECIO_UNITARIO, I.STOCK FROM PRODUCTOS P 
        JOIN INVENTARIO I ON P.ID_PRODUCTO = I.ID_PRODUCTO 
        WHERE P.ID_PRODUCTO = :id_producto AND I.ID_SUCURSAL = :id_sucursal
    """, {'id_producto': id_producto, 'id_sucursal': id_sucursal})
    producto = cursor.fetchone()

    if not producto:
        cursor.close()
        return jsonify({'error': 'Producto no encontrado en la sucursal especificada'}), 404

    stock = producto[1]
    if cantidad > stock:
        cursor.close()
        return jsonify({'error': 'Cantidad no disponible en stock'}), 400

    valor_unitario = float(producto[0])
    valor_total = valor_unitario * cantidad

    cursor.execute("""
        SELECT CANTIDAD FROM CARRITO_PRODUCTOS 
        WHERE ID_CARRITO = :carrito AND ID_PRODUCTO = :producto
    """, {'carrito': id_carrito, 'producto': id_producto})
    existente = cursor.fetchone()

    if existente:
        nueva_cantidad = existente[0] + cantidad
        nuevo_total = nueva_cantidad * valor_unitario

        cursor.execute("""
            UPDATE CARRITO_PRODUCTOS 
            SET CANTIDAD = :cant, VALOR_TOTAL = :total, ID_SUCURSAL = :sucursal
            WHERE ID_CARRITO = :carrito AND ID_PRODUCTO = :producto
        """, {
            'cant': nueva_cantidad,
            'total': nuevo_total,
            'sucursal': id_sucursal,
            'carrito': id_carrito,
            'producto': id_producto
        })
        mensaje = 'Producto actualizado en el carrito'
    else:
        cursor.execute("""
            INSERT INTO CARRITO_PRODUCTOS (ID_CARRITO, ID_PRODUCTO, ID_SUCURSAL, CANTIDAD, VALOR_UNITARIO, VALOR_TOTAL)
            VALUES (:carrito, :producto, :sucursal, :cant, :unit, :total)
        """, {
            'carrito': id_carrito,
            'producto': id_producto,
            'sucursal': id_sucursal,
            'cant': cantidad,
            'unit': valor_unitario,
            'total': valor_total
        })
        mensaje = 'Producto agregado al carrito'

    connection.commit()
    cursor.close()

    return jsonify({'mensaje': mensaje, 'id_carrito': id_carrito}), 201



@app.route('/carrito/<int:id_carrito>', methods=['GET'])
def ver_carrito(id_carrito):
    cursor = connection.cursor()

    cursor.execute("SELECT 1 FROM CARRITOS WHERE ID_CARRITO = :id", {'id': id_carrito})
    if not cursor.fetchone():
        cursor.close()
        return jsonify({'error': 'El carrito no existe'}), 404

    cursor.execute("""
        SELECT 
            p.NOMBRE || ' - ' || p.MARCA AS nombre,
            cp.CANTIDAD,
            cp.VALOR_UNITARIO,
            cp.VALOR_TOTAL
        FROM CARRITO_PRODUCTOS cp
        JOIN PRODUCTOS p ON cp.ID_PRODUCTO = p.ID_PRODUCTO
        WHERE cp.ID_CARRITO = :carrito
        ORDER BY p.NOMBRE
    """, {'carrito': id_carrito})

    rows = cursor.fetchall()
    cursor.close()

    carrito = []
    total_general = 0

    for row in rows:
        carrito.append({
            'nombre': row[0],
            'cantidad': row[1],
            'valor_unitario': float(row[2]),
            'valor_total': float(row[3])
        })
        total_general += float(row[3])

    return jsonify({
        'carrito_id': id_carrito,
        'productos': carrito,
        'total_final': total_general
    })

@app.route('/detalle_pedido', methods=['POST']) 
def crear_detalle_pedido():
    if not request.is_json:
        return jsonify({'error': 'Content-Type debe ser application/json'}), 415

    data = request.get_json()
    id_detalle = data.get('id_detalle')
    id_carrito = data.get('id_carrito')
    id_usuario = data.get('id_usuario')  
    direccion = data.get('direccion')  

    if not all([id_detalle, id_carrito, id_usuario, direccion]): 
        return jsonify({'error': 'Faltan datos obligatorios'}), 400

    cursor = connection.cursor()


    cursor.execute("SELECT 1 FROM CARRITOS WHERE ID_CARRITO = :id", {'id': id_carrito})
    if not cursor.fetchone():
        cursor.close()
        return jsonify({'error': 'Carrito no encontrado'}), 404

    cursor.execute("SELECT 1 FROM USUARIOS WHERE ID_USUARIO = :id", {'id': id_usuario})
    if not cursor.fetchone():
        cursor.close()
        return jsonify({'error': 'Usuario no encontrado'}), 404

    cursor.execute("""
        INSERT INTO DETALLE_PEDIDO (ID_DETALLE, ID_CARRITO, DIRECCION, ID_USUARIO)
        VALUES (:id_detalle, :id_carrito, :direccion, :id_usuario)
    """, {
        'id_detalle': id_detalle,
        'id_carrito': id_carrito,
        'direccion': direccion,
        'id_usuario': id_usuario
    })



    cursor.execute("""
        SELECT ID_PRODUCTO, CANTIDAD, ID_SUCURSAL
        FROM CARRITO_PRODUCTOS
        WHERE ID_CARRITO = :id_carrito
    """, {'id_carrito': id_carrito})

    productos = cursor.fetchall()

    for producto in productos:
        id_producto, cantidad, id_sucursal = producto

        cursor.execute("""
            UPDATE INVENTARIO
            SET STOCK = STOCK - :cantidad
            WHERE ID_PRODUCTO = :id_producto AND ID_SUCURSAL = :id_sucursal
        """, {
            'cantidad': cantidad,
            'id_producto': id_producto,
            'id_sucursal': id_sucursal
        })

    connection.commit()
    cursor.close()

    return jsonify({
        'mensaje': 'Detalle de pedido creado exitosamente y stock actualizado',
        'id_detalle': id_detalle,
        'id_carrito': id_carrito,
        'direccion': direccion,
        'estado': 'PENDIENTE'
    }), 201

@app.route('/detalle_pedido/<int:id_detalle>', methods=['GET'])
def ver_detalle_pedido(id_detalle):
    cursor = connection.cursor()
    cursor.execute("""
        SELECT dp.ID_DETALLE, dp.ID_CARRITO, dp.DIRECCION, dp.ESTADO,
               dp.ID_USUARIO, u.NOMBRE_COMPLETO,
               p.NOMBRE || ' - ' || p.MARCA AS nombre_producto,
               cp.CANTIDAD, cp.VALOR_UNITARIO, cp.VALOR_TOTAL
        FROM DETALLE_PEDIDO dp
        JOIN CARRITOS c ON dp.ID_CARRITO = c.ID_CARRITO
        JOIN CARRITO_PRODUCTOS cp ON c.ID_CARRITO = cp.ID_CARRITO
        JOIN PRODUCTOS p ON cp.ID_PRODUCTO = p.ID_PRODUCTO
        JOIN USUARIOS u ON dp.ID_USUARIO = u.ID_USUARIO  -- Relación directa entre detalle de pedido y usuario
        WHERE dp.ID_DETALLE = :id_detalle
    """, {'id_detalle': id_detalle})

    rows = cursor.fetchall()
    cursor.close()

    if not rows:
        return jsonify({'error': 'Detalle de pedido no encontrado'}), 404

    productos = []
    for row in rows:
        productos.append({
            'nombre': row[6],
            'cantidad': row[7],
            'valor_unitario': float(row[8]),
            'valor_total': float(row[9])
        })

    return jsonify({
        'id_detalle': rows[0][0],
        'id_carrito': rows[0][1],
        'direccion': rows[0][2],
        'estado': rows[0][3],
        'usuario': {
            'id': rows[0][4],  
            'nombre': rows[0][5]  
        },
        'productos': productos
    })

@app.route('/confirmar_entrega', methods=['POST'])
def confirmar_entrega():
    if not request.is_json:
        return jsonify({'error': 'Content-Type debe ser application/json'}), 415

    data = request.get_json()
    id_detalle = data.get('id_detalle')

    if not id_detalle:
        return jsonify({'error': 'Faltan datos obligatorios'}), 400

    cursor = connection.cursor()

    cursor.execute("SELECT ID_CARRITO, ID_USUARIO FROM DETALLE_PEDIDO WHERE ID_DETALLE = :id", {'id': id_detalle})
    result = cursor.fetchone()

    if not result:
        cursor.close()
        return jsonify({'error': 'Detalle de pedido no encontrado'}), 404

    id_carrito, id_usuario = result

    cursor.execute("SELECT 1 FROM PEDIDOS WHERE ID_DETALLE = :id_detalle", {'id_detalle': id_detalle})
    if cursor.fetchone():
        cursor.close()
        return jsonify({'error': 'Este pedido ya ha sido registrado'}), 400
    id_pedido = id_detalle  

    cursor.execute("""
        INSERT INTO PEDIDOS (ID_USUARIO, ID_DETALLE, FECHA_PEDIDO)
        VALUES (:usuario, :detalle, SYSDATE)
    """, {
        'usuario': id_usuario,
        'detalle': id_detalle
    })



    cursor.execute("""
        UPDATE DETALLE_PEDIDO
        SET ESTADO = 'ENTREGADO'
        WHERE ID_DETALLE = :id_detalle
    """, {'id_detalle': id_detalle})

    connection.commit()
    cursor.close()

    return jsonify({
        'mensaje': 'Entrega confirmada y pedido registrado',
        'id_pedido': id_pedido,  
        'id_usuario': id_usuario,
        'id_detalle': id_detalle,
        'estado': 'ENTREGADO'
    }), 201

if __name__ == '__main__':
    app.run(debug=True, port=5000)
