from flask import jsonify, request
from app import app
from config import connection

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

@app.route('/consultar_stock', methods=['POST'])
def consultar_stock():
    data = request.get_json()
    id_sucursal = data.get('id_sucursal')
    id_producto = data.get('id_producto')
    cantidad = data.get('cantidad')

    if not all([id_sucursal, id_producto, cantidad]):
        return jsonify({'error': 'Faltan datos'}), 400

    cursor = connection.cursor()

    
@app.route('/consultar_stock', methods=['GET'])
def stock_producto_sucursal():
    id_producto = request.args.get('id_producto', type=int)
    id_sucursal = request.args.get('id_sucursal', type=int)

    if not id_producto or not id_sucursal:
        return jsonify({'error': 'Faltan parámetros id_producto o id_sucursal'}), 400

    cursor = connection.cursor()
    cursor.execute("""
                    SELECT P.NOMBRE,
                        I.STOCK
                    FROM PRODUCTOS P JOIN
                    INVENTARIO I ON P.ID_PRODUCTO = I.ID_PRODUCTO;
    """, id_producto=id_producto, id_sucursal=id_sucursal)
    row = cursor.fetchone()
    cursor.close()
    if row:
        return jsonify({
            'nombre': row[0],
            'stock': int(row[3])
        })
    else:
        return jsonify({'error': 'No encontrado'}), 404

if __name__ == "__main__":
    app.run()