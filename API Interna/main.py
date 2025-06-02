from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
from config import connection

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class StockInput(BaseModel):
    id_sucursal: int
    id_producto: int
    cantidad: int

class ProductoResponse(BaseModel):
    id_producto: int
    nombre: str
    marca: str
    categoria: str
    stock_actual: Optional[int] = None
    alerta: Optional[str] = None
    precio_unitario: Optional[float] = None
    imagen: Optional[str] = None

@app.post("/ingresar_stock")
async def ingresar_stock(stock_data: StockInput):
    cursor = connection.cursor()
    
    cursor.execute("""
        SELECT STOCK FROM INVENTARIO 
        WHERE ID_SUCURSAL = :sucursal AND ID_PRODUCTO = :producto
    """, sucursal=stock_data.id_sucursal, producto=stock_data.id_producto)
    row = cursor.fetchone()

    if row:
        nuevo_stock = row[0] + stock_data.cantidad
        cursor.execute("""
            UPDATE INVENTARIO 
            SET STOCK = :stock 
            WHERE ID_SUCURSAL = :sucursal AND ID_PRODUCTO = :producto
        """, stock=nuevo_stock, sucursal=stock_data.id_sucursal, producto=stock_data.id_producto)
    else:
        cursor.execute("""
            INSERT INTO INVENTARIO (ID_SUCURSAL, ID_PRODUCTO, STOCK)
            VALUES (:sucursal, :producto, :stock)
        """, sucursal=stock_data.id_sucursal, producto=stock_data.id_producto, stock=stock_data.cantidad)

    connection.commit()
    cursor.close()
    return {"mensaje": "Stock ingresado correctamente"}

@app.post("/rebajar_stock")
async def rebajar_stock(stock_data: StockInput):
    cursor = connection.cursor()
    
    cursor.execute("""
        SELECT i.STOCK, p.STOCK_MIN
        FROM INVENTARIO i
        JOIN PRODUCTOS p ON i.ID_PRODUCTO = p.ID_PRODUCTO
        WHERE i.ID_SUCURSAL = :sucursal AND i.ID_PRODUCTO = :producto
    """, sucursal=stock_data.id_sucursal, producto=stock_data.id_producto)
    row = cursor.fetchone()

    if not row:
        cursor.close()
        raise HTTPException(status_code=404, detail="Producto no existe en la sucursal")

    stock_actual, stock_min = row
    if stock_actual < stock_data.cantidad:
        cursor.close()
        raise HTTPException(status_code=400, detail="Stock insuficiente")

    nuevo_stock = stock_actual - stock_data.cantidad
    cursor.execute("""
        UPDATE INVENTARIO 
        SET STOCK = :stock 
        WHERE ID_SUCURSAL = :sucursal AND ID_PRODUCTO = :producto
    """, stock=nuevo_stock, sucursal=stock_data.id_sucursal, producto=stock_data.id_producto)

    connection.commit()
    cursor.close()

    respuesta = {"mensaje": "Stock rebajado correctamente"}
    if nuevo_stock < stock_min:
        respuesta["alerta"] = "El stock está bajo"

    return respuesta

@app.get("/productos", response_model=List[ProductoResponse])
async def get_productos():
    print("Iniciando consulta de productos...")
    try:
        cursor = connection.cursor()
        print("Conexión a la base de datos establecida")
        
        query = """
            SELECT DISTINCT
                p.ID_PRODUCTO,
                p.NOMBRE,
                p.MARCA,
                c.NOMBRE as CATEGORIA,
                COALESCE(SUM(i.STOCK), 0) as stock_actual,
                p.STOCK_MIN,
                p.PRECIO_UNITARIO,
                p.IMAGEN
            FROM PRODUCTOS p
            LEFT JOIN INVENTARIO i ON p.ID_PRODUCTO = i.ID_PRODUCTO
            LEFT JOIN CATEGORIAS c ON p.ID_CATEGORIA = c.ID_CATEGORIA
            GROUP BY p.ID_PRODUCTO, p.NOMBRE, p.MARCA, c.NOMBRE, p.STOCK_MIN, p.PRECIO_UNITARIO, p.IMAGEN
            ORDER BY p.ID_PRODUCTO
        """
        
        cursor.execute(query)
        print("Consulta SQL ejecutada")
        
        productos = []
        rows = cursor.fetchall()
        print(f"Número de productos encontrados: {len(rows)}")
        
        for row in rows:
            id_producto, nombre, marca, categoria, stock_actual, stock_min, precio_unitario, imagen = row
            stock_mostrar = int(stock_actual) if stock_actual > stock_min else None

            producto = {
                "id_producto": id_producto,
                "nombre": nombre,
                "marca": marca,
                "categoria": categoria if categoria else "General",
                "stock_actual": stock_mostrar,
                "precio_unitario": float(precio_unitario) if precio_unitario else None,
                "imagen": imagen
            }

            if stock_actual < stock_min:
                producto["alerta"] = "Stock bajo"

            productos.append(producto)

        cursor.close()
        print("Consulta completada exitosamente")
        return productos
        
    except Exception as e:
        print(f"Error en la consulta: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error en la base de datos: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
