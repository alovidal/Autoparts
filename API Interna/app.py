from flask import Flask, jsonify
from flask_cors import CORS, cross_origin
import cx_Oracle
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

# Configuración de la conexión a Oracle
def get_db_connection():
    return cx_Oracle.connect(
        user=os.getenv('DB_USER'),
        password=os.getenv('DB_PASSWORD'),
        dsn=os.getenv('DB_DSN')
    )

@app.route('/productos', methods=['GET'])
def get_productos():
    try:
        connection = get_db_connection()
        cursor = connection.cursor()
        
        query = """
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
                p.IMAGEN_URL,
                c.NOMBRE as CATEGORIA_NOMBRE
            FROM PRODUCTOS p
            JOIN CATEGORIAS c ON p.ID_CATEGORIA = c.ID_CATEGORIA
            ORDER BY p.ID_PRODUCTO
        """
        
        cursor.execute(query)
        columns = [col[0].lower() for col in cursor.description]
        productos = []
        
        for row in cursor:
            producto = dict(zip(columns, row))
            productos.append(producto)
        
        cursor.close()
        connection.close()
        
        return jsonify({
            'status': 'success',
            'productos': productos
        })
    
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@app.route('/productos/<int:id_producto>', methods=['GET'])
def get_producto(id_producto):
    try:
        connection = get_db_connection()
        cursor = connection.cursor()
        
        query = """
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
                p.IMAGEN_URL,
                c.NOMBRE as CATEGORIA_NOMBRE
            FROM PRODUCTOS p
            JOIN CATEGORIAS c ON p.ID_CATEGORIA = c.ID_CATEGORIA
            WHERE p.ID_PRODUCTO = :id
        """
        
        cursor.execute(query, id=id_producto)
        columns = [col[0].lower() for col in cursor.description]
        row = cursor.fetchone()
        
        if row is None:
            return jsonify({
                'status': 'error',
                'message': 'Producto no encontrado'
            }), 404
        
        producto = dict(zip(columns, row))
        
        cursor.close()
        connection.close()
        
        return jsonify({
            'status': 'success',
            'producto': producto
        })
    
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

if __name__ == '__main__':
    app.run(port=8000, debug=True)