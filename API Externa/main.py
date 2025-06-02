from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
from config import connection

app = FastAPI()

# Configuración de CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Modelos Pydantic
class Sucursal(BaseModel):
    nombre: str
    stock: int

class ProductoDetalle(BaseModel):
    id_producto: int
    nombre: str
    marca: str
    valor: float
    sucursales: List[Sucursal]

class CarritoItem(BaseModel):
    id_carrito: Optional[int]
    id_producto: int
    cantidad: int

class ProductoCarrito(BaseModel):
    nombre: str
    cantidad: int
    valor_unitario: float
    valor_total: float

class CarritoResponse(BaseModel):
    carrito_id: int
    productos: List[ProductoCarrito]
    total_final: float

@app.get("/producto/{id_producto}", response_model=ProductoDetalle)
async def valor_producto(id_producto: int):
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

    if not rows:
        raise HTTPException(status_code=404, detail="Producto no encontrado")

    return {
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

@app.post("/producto_carrito")
async def agregar_a_carrito(item: CarritoItem):
    cursor = connection.cursor()

    if item.id_carrito is None:
        cursor.execute("INSERT INTO CARRITOS DEFAULT VALUES RETURNING ID_CARRITO INTO :id", 
                      {'id': cursor.var(int)})
        item.id_carrito = cursor.getimplicitresults()[0][0]
    else:
        cursor.execute("SELECT 1 FROM CARRITOS WHERE ID_CARRITO = :id", 
                      {'id': item.id_carrito})
        if not cursor.fetchone():
            cursor.execute("INSERT INTO CARRITOS (ID_CARRITO) VALUES (:id)", 
                         {'id': item.id_carrito})

    cursor.execute("""
        SELECT P.PRECIO_UNITARIO, I.STOCK 
        FROM PRODUCTOS P 
        JOIN INVENTARIO I ON P.ID_PRODUCTO = I.ID_PRODUCTO 
        WHERE P.ID_PRODUCTO = :id""", 
        {'id': item.id_producto})
    producto = cursor.fetchone()

    if not producto:
        cursor.close()
        raise HTTPException(status_code=404, detail="Producto no encontrado")

    stock = producto[1]
    if item.cantidad >= stock:
        cursor.close()
        raise HTTPException(status_code=400, detail="Cantidad no disponible en stock")

    valor_unitario = float(producto[0])
    valor_total = valor_unitario * item.cantidad

    cursor.execute("""
        SELECT CANTIDAD FROM CARRITO_PRODUCTOS 
        WHERE ID_CARRITO = :carrito AND ID_PRODUCTO = :producto
    """, {'carrito': item.id_carrito, 'producto': item.id_producto})
    existente = cursor.fetchone()

    if existente:
        nueva_cantidad = existente[0] + item.cantidad
        nuevo_total = nueva_cantidad * valor_unitario

        cursor.execute("""
            UPDATE CARRITO_PRODUCTOS 
            SET CANTIDAD = :cant, VALOR_TOTAL = :total
            WHERE ID_CARRITO = :carrito AND ID_PRODUCTO = :producto
        """, {
            'cant': nueva_cantidad,
            'total': nuevo_total,
            'carrito': item.id_carrito,
            'producto': item.id_producto
        })
        mensaje = 'Producto actualizado en el carrito'
    else:
        cursor.execute("""
            INSERT INTO CARRITO_PRODUCTOS (ID_CARRITO, ID_PRODUCTO, CANTIDAD, VALOR_UNITARIO, VALOR_TOTAL)
            VALUES (:carrito, :producto, :cant, :unit, :total)
        """, {
            'carrito': item.id_carrito,
            'producto': item.id_producto,
            'cant': item.cantidad,
            'unit': valor_unitario,
            'total': valor_total
        })
        mensaje = 'Producto agregado al carrito'

    connection.commit()
    cursor.close()

    return {"mensaje": mensaje, "id_carrito": item.id_carrito}

@app.get("/carrito/{id_carrito}", response_model=CarritoResponse)
async def ver_carrito(id_carrito: int):
    cursor = connection.cursor()

    cursor.execute("SELECT 1 FROM CARRITOS WHERE ID_CARRITO = :id", {'id': id_carrito})
    if not cursor.fetchone():
        cursor.close()
        raise HTTPException(status_code=404, detail="El carrito no existe")

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

    productos = []
    total_general = 0

    for row in rows:
        producto = {
            'nombre': row[0],
            'cantidad': row[1],
            'valor_unitario': float(row[2]),
            'valor_total': float(row[3])
        }
        productos.append(producto)
        total_general += float(row[3])

    return {
        'carrito_id': id_carrito,
        'productos': productos,
        'total_final': total_general
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)