from fastapi import FastAPI, HTTPException, Query, Depends, status, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel, EmailStr
from typing import Optional, List
from config import connection
from datetime import datetime, timedelta
import jwt
import bcrypt
from passlib.context import CryptContext
from models import User, UserInDB, Token, UserCreate, UserUpdate
from database import get_db, create_user, verify_password, get_user_by_email, create_access_token, get_user_by_token

app = FastAPI()

# Configuración de CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # URL del frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuración de seguridad
SECRET_KEY = "tu_clave_secreta_aqui"  # Cambia esto en producción
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Crear router para usuarios
user_router = APIRouter(prefix="/api/usuarios", tags=["usuarios"])
auth_router = APIRouter(prefix="/api/auth", tags=["auth"])

# Crear router para productos
product_router = APIRouter(prefix="/api/productos", tags=["productos"])

# Modelos Pydantic
class UserBase(BaseModel):
    correo: EmailStr
    nombre_completo: str
    rut: str
    rol: Optional[str] = "CLIENTE"

class UserCreate(UserBase):
    contrasena: str

class UserUpdate(BaseModel):
    nombre_completo: Optional[str] = None
    rut: Optional[str] = None
    contrasena: Optional[str] = None

class User(UserBase):
    id_usuario: int
    fecha_registro: datetime

class StockInput(BaseModel):
    id_sucursal: int
    id_producto: int
    cantidad: int

class ProductoBase(BaseModel):
    nombre: str
    marca: str
    categoria: Optional[str] = None
    stock_actual: Optional[int] = None
    precio_unitario: Optional[float] = None
    imagen: Optional[str] = None
    alerta: Optional[str] = None

class ProductoResponse(ProductoBase):
    id_producto: int

class UserProfile(BaseModel):
    id: int
    nombre: str
    email: str
    role: str
    direccion: Optional[str] = None
    telefono: Optional[str] = None
    fecha_registro: str
    ultima_compra: Optional[str] = None

class UpdateProfileRequest(BaseModel):
    nombre: Optional[str] = None
    email: Optional[str] = None
    direccion: Optional[str] = None
    telefono: Optional[str] = None

class ConfiguracionUsuario(BaseModel):
    notificaciones_email: bool
    tema_oscuro: bool
    idioma: str

class RegisterRequest(BaseModel):
    correo: EmailStr
    contrasena: str
    nombre_completo: str
    rut: str
    rol: Optional[str] = "CLIENTE"

class LoginRequest(BaseModel):
    correo: EmailStr
    contrasena: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    correo: Optional[str] = None

# Funciones de utilidad
def verify_password(plain_password, stored_password):
    # Si la contraseña almacenada no está hasheada (no comienza con $2)
    if not stored_password.startswith('$2'):
        return plain_password == stored_password
    # Si está hasheada, usar bcrypt
    return pwd_context.verify(plain_password, stored_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Credenciales inválidas",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        correo: str = payload.get("sub")
        if correo is None:
            raise credentials_exception
        token_data = TokenData(correo=correo)
    except jwt.JWTError:
        raise credentials_exception

    cursor = connection.cursor()
    cursor.execute("""
        SELECT ID_USUARIO, NOMBRE_COMPLETO, CORREO, ROL, TELEFONO, FECHA_REGISTRO, ULTIMA_COMPRA
        FROM USUARIOS
        WHERE CORREO = :correo
    """, correo=token_data.correo)
    
    user = cursor.fetchone()
    cursor.close()
    
    if user is None:
        raise credentials_exception
        
    return {
        "id": user[0],
        "nombre_completo": user[1],
        "correo": user[2],
        "rol": user[3],
        "telefono": user[4],
        "fecha_registro": user[5],
        "ultima_compra": user[6]
    }

# Endpoints de autenticación
@auth_router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = get_user_by_email(form_data.username)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not verify_password(form_data.password, user.contrasena):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(
        data={"sub": user.correo}, expires_delta=timedelta(minutes=30)
    )
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }

@auth_router.post("/register", response_model=User)
async def register(user: UserCreate):
    db_user = get_user_by_email(user.correo)
    if db_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )
    return create_user(user)

# Endpoints de usuarios
@user_router.get("/me")
async def read_users_me(current_user = Depends(get_current_user)):
    return current_user

@user_router.put("/me")
async def update_user_me(user_update: UserUpdate, current_user = Depends(get_current_user)):
    cursor = connection.cursor()
    update_fields = []
    params = {}
    
    if user_update.nombre_completo is not None:
        update_fields.append("NOMBRE_COMPLETO = :nombre_completo")
        params["nombre_completo"] = user_update.nombre_completo
    
    if user_update.rut is not None:
        update_fields.append("RUT = :rut")
        params["rut"] = user_update.rut
    
    if user_update.contrasena is not None:
        update_fields.append("CONTRASENA = :contrasena")
        params["contrasena"] = get_password_hash(user_update.contrasena)
    
    if not update_fields:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No se proporcionaron campos para actualizar"
        )
    
    params["id"] = current_user["id"]
    
    try:
        cursor.execute(f"""
            UPDATE USUARIOS
            SET {", ".join(update_fields)}
            WHERE ID_USUARIO = :id
            RETURNING ID_USUARIO, NOMBRE_COMPLETO, CORREO, ROL, TELEFONO, FECHA_REGISTRO
        """, params)
        
        updated_user = cursor.fetchone()
        connection.commit()
        cursor.close()
        
        if not updated_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Usuario no encontrado"
            )
        
        return {
            "status": "success",
            "user": {
                "id": updated_user[0],
                "nombre_completo": updated_user[1],
                "correo": updated_user[2],
                "rol": updated_user[3],
                "telefono": updated_user[4],
                "fecha_registro": updated_user[5].strftime("%Y-%m-%d %H:%M:%S")
            }
        }
        
    except Exception as e:
        cursor.close()
        connection.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al actualizar el usuario: {str(e)}"
        )

@user_router.delete("/me")
async def delete_user_me(current_user = Depends(get_current_user)):
    cursor = connection.cursor()
    
    try:
        cursor.execute("""
            DELETE FROM USUARIOS
            WHERE ID_USUARIO = :id
        """, id=current_user["id"])
        
        connection.commit()
        cursor.close()
        
        return {
            "status": "success",
            "message": "Usuario eliminado correctamente"
        }
        
    except Exception as e:
        cursor.close()
        connection.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al eliminar el usuario: {str(e)}"
        )

# Endpoints de productos
@product_router.get("/", response_model=List[ProductoResponse])
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

# Incluir los routers en la aplicación
app.include_router(auth_router)
app.include_router(user_router)
app.include_router(product_router)

# Endpoint para inicializar la base de datos
@app.post("/api/init-db")
async def init_db():
    cursor = connection.cursor()
    
    try:
        # Actualizar contraseñas existentes a bcrypt
        cursor.execute("SELECT ID_USUARIO, CONTRASENA FROM USUARIOS")
        usuarios = cursor.fetchall()
        
        for usuario in usuarios:
            id_usuario, contrasena = usuario
            # Solo actualizar si la contraseña no parece estar hasheada
            if not contrasena.startswith('$2'):
                hashed_password = get_password_hash(contrasena)
                cursor.execute("""
                    UPDATE USUARIOS
                    SET CONTRASENA = :contrasena
                    WHERE ID_USUARIO = :id_usuario
                """, {
                    "contrasena": hashed_password,
                    "id_usuario": id_usuario
                })
        
        connection.commit()
        cursor.close()
        
        return {
            "status": "success",
            "message": "Contraseñas actualizadas correctamente"
        }
        
    except Exception as e:
        cursor.close()
        connection.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al actualizar las contraseñas: {str(e)}"
        )

async def get_user_or_404(user_id: int):
    cursor = connection.cursor()
    cursor.execute("""
        SELECT ID_USUARIO, NOMBRE_COMPLETO, CORREO, ROL, TELEFONO, FECHA_REGISTRO
        FROM USUARIOS
        WHERE ID_USUARIO = :user_id
    """, user_id=user_id)
    
    user = cursor.fetchone()
    cursor.close()
    
    if not user:
        raise HTTPException(
            status_code=404,
            detail=f"Usuario con ID {user_id} no encontrado"
        )
    
    return {
        "id": user[0],
        "nombre_completo": user[1],
        "correo": user[2],
        "rol": user[3],
        "telefono": user[4],
        "fecha_registro": user[5].strftime("%Y-%m-%d %H:%M:%S") if user[5] else None
    }

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

@app.get("/usuarios/{user_id}/perfil", response_model=UserProfile)
async def get_user_profile(user_id: int):
    try:
        user = await get_user_or_404(user_id)
        
        # Obtener la última compra
        cursor = connection.cursor()
        cursor.execute("""
            SELECT MAX(FECHA) 
            FROM PEDIDOS 
            WHERE ID_USUARIO = :user_id
        """, user_id=user_id)
        ultima_compra = cursor.fetchone()[0]
        cursor.close()

        return {
            "id": user["id"],
            "nombre": user["nombre_completo"],
            "email": user["correo"],
            "role": user["rol"],
            "direccion": None,
            "telefono": user["telefono"],
            "fecha_registro": user["fecha_registro"].strftime("%Y-%m-%d"),
            "ultima_compra": ultima_compra.strftime("%Y-%m-%d") if ultima_compra else None
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error al obtener perfil: {str(e)}")
        raise HTTPException(status_code=500, detail="Error interno del servidor")

@app.put("/usuarios/perfil")
async def update_user_profile(user_id: int, data: UpdateProfileRequest):
    try:
        # Verificar que el usuario existe
        await get_user_or_404(user_id)
        
        # Construir la consulta SQL dinámicamente basada en los campos proporcionados
        update_fields = []
        params = {"user_id": user_id}
        
        if data.nombre is not None:
            update_fields.append("NOMBRE_COMPLETO = :nombre")
            params["nombre"] = data.nombre
        if data.email is not None:
            update_fields.append("CORREO = :email")
            params["email"] = data.email
        if data.direccion is not None:
            update_fields.append("DIRECCION = :direccion")
            params["direccion"] = data.direccion
        if data.telefono is not None:
            update_fields.append("TELEFONO = :telefono")
            params["telefono"] = data.telefono

        if not update_fields:
            return {"status": "success", "message": "No hay campos para actualizar"}

        query = f"""
            UPDATE USUARIOS 
            SET {", ".join(update_fields)}
            WHERE ID_USUARIO = :user_id
        """
        
        cursor = connection.cursor()
        cursor.execute(query, params)
        connection.commit()
        cursor.close()

        return {"status": "success", "message": "Perfil actualizado exitosamente"}
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error al actualizar perfil: {str(e)}")
        raise HTTPException(status_code=500, detail="Error interno del servidor")

@app.get("/usuarios/{user_id}/configuracion")
async def get_user_config(user_id: int):
    try:
        # Verificar que el usuario existe
        await get_user_or_404(user_id)
        
        cursor = connection.cursor()
        cursor.execute("""
            SELECT NOTIFICACIONES_EMAIL, TEMA_OSCURO, IDIOMA
            FROM CONFIGURACION_USUARIO
            WHERE ID_USUARIO = :user_id
        """, user_id=user_id)
        
        config = cursor.fetchone()
        cursor.close()

        if not config:
            # Si no existe configuración, devolver valores por defecto
            return {
                "notificaciones_email": True,
                "tema_oscuro": False,
                "idioma": "es"
            }

        return {
            "notificaciones_email": bool(config[0]),
            "tema_oscuro": bool(config[1]),
            "idioma": config[2]
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error al obtener configuración: {str(e)}")
        raise HTTPException(status_code=500, detail="Error interno del servidor")

@app.put("/usuarios/{user_id}/configuracion")
async def update_user_config(user_id: int, config: ConfiguracionUsuario):
    try:
        # Verificar que el usuario existe
        await get_user_or_404(user_id)
        
        cursor = connection.cursor()
        cursor.execute("""
            MERGE INTO CONFIGURACION_USUARIO
            USING DUAL ON (ID_USUARIO = :user_id)
            WHEN MATCHED THEN
                UPDATE SET
                    NOTIFICACIONES_EMAIL = :notif,
                    TEMA_OSCURO = :tema,
                    IDIOMA = :idioma
            WHEN NOT MATCHED THEN
                INSERT (ID_USUARIO, NOTIFICACIONES_EMAIL, TEMA_OSCURO, IDIOMA)
                VALUES (:user_id, :notif, :tema, :idioma)
        """, {
            "user_id": user_id,
            "notif": config.notificaciones_email,
            "tema": config.tema_oscuro,
            "idioma": config.idioma
        })
        
        connection.commit()
        cursor.close()

        return {"status": "success", "message": "Configuración actualizada exitosamente"}
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error al actualizar configuración: {str(e)}")
        raise HTTPException(status_code=500, detail="Error interno del servidor")

@app.get("/api/usuarios", response_model=List[User])
async def get_users(current_user: User = Depends(get_user_by_token)):
    db = get_db()
    cursor = db.cursor()
    cursor.execute("SELECT * FROM USUARIOS")
    users = cursor.fetchall()
    cursor.close()
    db.close()
    
    return [
        User(
            id=user[0],
            nombre_completo=user[1],
            rut=user[2],
            correo=user[3],
            rol=user[5],
            fecha_registro=str(user[6])
        )
        for user in users
    ]

@app.get("/api/usuarios/{user_id}", response_model=User)
async def get_user(user_id: int, current_user: User = Depends(get_user_by_token)):
    db = get_db()
    cursor = db.cursor()
    cursor.execute("SELECT * FROM USUARIOS WHERE ID_USUARIO = :1", (user_id,))
    user = cursor.fetchone()
    cursor.close()
    db.close()
    
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    
    return User(
        id=user[0],
        nombre_completo=user[1],
        rut=user[2],
        correo=user[3],
        rol=user[5],
        fecha_registro=str(user[6])
    )

@app.put("/api/usuarios/{user_id}", response_model=User)
async def update_user(
    user_id: int,
    user_update: UserUpdate,
    current_user: User = Depends(get_user_by_token)
):
    if current_user.rol != "ADMIN" and current_user.id != user_id:
        raise HTTPException(
            status_code=403,
            detail="Not enough permissions"
        )
    
    db = get_db()
    cursor = db.cursor()
    
    # Verificar si el correo ya existe para otro usuario
    cursor.execute(
        "SELECT ID_USUARIO FROM USUARIOS WHERE CORREO = :1 AND ID_USUARIO != :2",
        (user_update.correo, user_id)
    )
    if cursor.fetchone():
        cursor.close()
        db.close()
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )
    
    # Verificar si el RUT ya existe para otro usuario
    cursor.execute(
        "SELECT ID_USUARIO FROM USUARIOS WHERE RUT = :1 AND ID_USUARIO != :2",
        (user_update.rut, user_id)
    )
    if cursor.fetchone():
        cursor.close()
        db.close()
        raise HTTPException(
            status_code=400,
            detail="RUT already registered"
        )
    
    cursor.execute("""
        UPDATE USUARIOS
        SET NOMBRE_COMPLETO = :1, RUT = :2, CORREO = :3
        WHERE ID_USUARIO = :4
    """, (user_update.nombre_completo, user_update.rut, user_update.correo, user_id))
    
    db.commit()
    
    # Obtener el usuario actualizado
    cursor.execute("SELECT * FROM USUARIOS WHERE ID_USUARIO = :1", (user_id,))
    user = cursor.fetchone()
    cursor.close()
    db.close()
    
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    
    return User(
        id=user[0],
        nombre_completo=user[1],
        rut=user[2],
        correo=user[3],
        rol=user[5],
        fecha_registro=str(user[6])
    )

@app.delete("/api/usuarios/{user_id}")
async def delete_user(user_id: int, current_user: User = Depends(get_user_by_token)):
    if current_user.rol != "ADMIN":
        raise HTTPException(
            status_code=403,
            detail="Not enough permissions"
        )
    
    if current_user.id == user_id:
        raise HTTPException(
            status_code=400,
            detail="Cannot delete your own user"
        )
    
    db = get_db()
    cursor = db.cursor()
    cursor.execute("DELETE FROM USUARIOS WHERE ID_USUARIO = :1", (user_id,))
    db.commit()
    cursor.close()
    db.close()
    
    return {"message": "User deleted successfully"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
