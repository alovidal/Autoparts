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

    cursor.execute("SELECT PRECIO_UNITARIO FROM PRODUCTOS WHERE ID_PRODUCTO = :id", {'id': id_producto})
    producto = cursor.fetchone()

    if not producto:
        return jsonify({'error': 'Producto no encontrado'}), 404

    valor_unitario = float(producto[0])
    valor_total = valor_unitario * cantidad
    cursor.execute("""
        SELECT CANTIDAD FROM CARRITO WHERE ID_PRODUCTO = :id
    """, {'id': id_producto})
    existente = cursor.fetchone()

    if existente:
        nueva_cantidad = existente[0] + cantidad
        nuevo_total = nueva_cantidad * valor_unitario

        cursor.execute("""
            UPDATE CARRITO 
            SET CANTIDAD = :cant, VALOR_TOTAL = :total 
            WHERE ID_PRODUCTO = :id
        """, {
            'cant': nueva_cantidad,
            'total': nuevo_total,
            'id': id_producto
        })
        mensaje = 'Producto actualizado en el carrito'
    else:
        cursor.execute("""
            INSERT INTO CARRITO (ID_PRODUCTO, CANTIDAD, VALOR_UNITARIO, VALOR_TOTAL)
            VALUES (:id, :cant, :unit, :total)
        """, {
            'id': id_producto,
            'cant': cantidad,
            'unit': valor_unitario,
            'total': valor_total
        })
        mensaje = 'Producto agregado al carrito'

    connection.commit()
    cursor.close()

    return jsonify({'mensaje': mensaje}), 201

@app.route('/carrito', methods=['GET'])
def ver_carrito():
    cursor = connection.cursor()
    cursor.execute("""
        SELECT 
            p.NOMBRE || ' - ' || p.MARCA AS nombre,
            c.CANTIDAD,
            c.VALOR_UNITARIO,
            c.VALOR_TOTAL
        FROM CARRITO c
        JOIN PRODUCTOS p ON c.ID_PRODUCTO = p.ID_PRODUCTO
        ORDER BY c.ID_CARRITO
    """)
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
        'carrito': carrito,
        'total_final': total_general
    })






if __name__ == '__main__':
    app.run(debug=True, port=5000)


