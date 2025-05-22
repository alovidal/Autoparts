from app import app
from config import connection
from flask import jsonify, request

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
        SELECT i.STOCK, p.STOCK_MIN
        FROM INVENTARIO i
        JOIN PRODUCTOS p ON i.ID_PRODUCTO = p.ID_PRODUCTO
        WHERE i.ID_SUCURSAL = :sucursal AND i.ID_PRODUCTO = :producto
    """, sucursal=id_sucursal, producto=id_producto)
    row = cursor.fetchone()

    if not row:
        cursor.close()
        return jsonify({'error': 'Producto no existe en la sucursal'}), 404

    stock_actual, stock_min = row
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

    respuesta = {'mensaje': 'Stock rebajado correctamente'}
    if nuevo_stock < stock_min:
        respuesta['alerta'] = 'El stock esta bajo'

    return jsonify(respuesta)

@app.route('/productos', methods=['GET'])
def obtener_productos():
    cursor = connection.cursor()
    cursor.execute("""
        SELECT 
            p.ID_PRODUCTO,
            p.NOMBRE,
            p.MARCA,
            COALESCE(SUM(i.STOCK), 0) as stock_actual,
            p.STOCK_MIN
        FROM PRODUCTOS p
        LEFT JOIN INVENTARIO i ON p.ID_PRODUCTO = i.ID_PRODUCTO
        GROUP BY p.ID_PRODUCTO, p.NOMBRE, p.MARCA, p.STOCK_MIN
        ORDER BY p.ID_PRODUCTO
    """)
    productos = []
    for row in cursor.fetchall():
        id_producto, nombre, marca, stock_actual, stock_min = row
        alerta = "Alerta: Stock bajo" if stock_actual < stock_min else None

        producto = {
            'id_producto': id_producto,
            'nombre': nombre,
            'marca': marca,
            'stock_actual': int(stock_actual)
        }

        if alerta:
            producto['alerta'] = alerta

        productos.append(producto)

    cursor.close()
    return jsonify(productos)


if __name__ == "__main__":
    app.run(host="0.0.0.0")
