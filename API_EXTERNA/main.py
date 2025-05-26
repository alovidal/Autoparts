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

@app.route('/carrito', methods=['POST'])
def agregar_a_carrito():
    data = request.json
    id_producto = data['id_producto']
    cantidad = data['cantidad']

    cursor = connection.cursor()

    cursor.execute("""
        SELECT NOMBRE, MARCA, PRECIO_UNITARIO 
        FROM PRODUCTOS 
        WHERE ID_PRODUCTO = :id_producto
    """, {'id_producto': id_producto})
    producto = cursor.fetchone()

    if not producto:
        return jsonify({'error': 'Producto no encontrado'}), 404

    nombre = producto[0]
    marca = producto[1]
    valor_unitario = float(producto[2])
    valor_total = valor_unitario * cantidad


    cursor.execute("""
        SELECT CANTIDAD 
        FROM CARRITO 
        WHERE ID_PRODUCTO = :id_producto
    """, {'id_producto': id_producto})
    existente = cursor.fetchone()

    if existente:
        nueva_cantidad = existente[0] + cantidad
        nuevo_total = nueva_cantidad * valor_unitario

        cursor.execute("""
            UPDATE CARRITO 
            SET CANTIDAD = :cantidad, VALOR_TOTAL = :valor_total 
            WHERE ID_PRODUCTO = :id_producto
        """, {
            'cantidad': nueva_cantidad,
            'valor_total': nuevo_total,
            'id_producto': id_producto
        })

        mensaje = 'Cantidad actualizada en el carrito'
    else:
        cursor.execute("""
            INSERT INTO CARRITO (ID_PRODUCTO, MARCA, CANTIDAD, VALOR_UNITARIO, VALOR_TOTAL)
            VALUES (:id_producto, :marca, :cantidad, :valor_unitario, :valor_total)
        """, {
            'id_producto': id_producto,
            'marca': marca,
            'cantidad': cantidad,
            'valor_unitario': valor_unitario,
            'valor_total': valor_total
        })

        mensaje = 'Producto agregado al carrito'

    connection.commit()
    cursor.close()

    return jsonify({
        'id_producto': id_producto,
        'nombre': nombre,
        'marca': marca,
        'cantidad': cantidad,
        'valor_unitario': valor_unitario,
        'valor_total': valor_total,
        'mensaje': mensaje
    }), 201

@app.route('/carrito', methods=['GET'])
def ver_carrito():
    cursor = connection.cursor()
    cursor.execute("""
        SELECT ID_CARRITO, ID_PRODUCTO, MARCA, CANTIDAD, VALOR_UNITARIO, VALOR_TOTAL
        FROM CARRITO
        ORDER BY ID_CARRITO
    """)

    rows = cursor.fetchall()
    cursor.close()

    carrito = []
    for row in rows:
        carrito.append({
            'id_carrito': row[0],
            'id_producto': row[1],
            'marca': row[2],
            'cantidad': row[3],
            'valor_unitario': float(row[4]),
            'valor_total': float(row[5])
        })

    return jsonify({'carrito': carrito})

if __name__ == '__main__':
    app.run(debug=True, port=5000)

