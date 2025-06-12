import oracledb
import bcrypt
from datetime import datetime, timedelta
from jose import JWTError, jwt
from models import UserCreate, UserInDB, User

# Configuración de JWT
SECRET_KEY = "09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7"
ALGORITHM = "HS256"

def get_db():
    connection = oracledb.connect(
        user="AUTOPARTS",
        password="oracle",
        dsn="localhost:1521/xe"
    )
    return connection

def get_user_by_email(email: str) -> UserInDB | None:
    db = get_db()
    cursor = db.cursor()
    cursor.execute("SELECT * FROM USUARIOS WHERE CORREO = :1", (email,))
    user = cursor.fetchone()
    cursor.close()
    db.close()

    if user:
        return UserInDB(
            id=user[0],
            nombre_completo=user[1],
            rut=user[2],
            correo=user[3],
            contrasena=user[4],
            rol=user[5],
            fecha_registro=str(user[6])
        )
    return None

def get_user_by_token(token: str) -> User | None:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            return None
    except JWTError:
        return None

    user = get_user_by_email(email)
    if user is None:
        return None

    return User(
        id=user.id,
        nombre_completo=user.nombre_completo,
        rut=user.rut,
        correo=user.correo,
        rol=user.rol,
        fecha_registro=user.fecha_registro
    )

def create_user(user: UserCreate) -> User:
    db = get_db()
    cursor = db.cursor()
    
    # Verificar si el correo ya existe
    cursor.execute("SELECT COUNT(*) FROM USUARIOS WHERE CORREO = :1", (user.correo,))
    if cursor.fetchone()[0] > 0:
        cursor.close()
        db.close()
        raise ValueError("Email already registered")
    
    # Verificar si el RUT ya existe
    cursor.execute("SELECT COUNT(*) FROM USUARIOS WHERE RUT = :1", (user.rut,))
    if cursor.fetchone()[0] > 0:
        cursor.close()
        db.close()
        raise ValueError("RUT already registered")
    
    # Generar el hash de la contraseña
    hashed_password = bcrypt.hashpw(user.contrasena.encode('utf-8'), bcrypt.gensalt())
    
    # Obtener el siguiente ID
    cursor.execute("SELECT NVL(MAX(ID_USUARIO), 0) + 1 FROM USUARIOS")
    next_id = cursor.fetchone()[0]
    
    # Insertar el nuevo usuario
    cursor.execute("""
        INSERT INTO USUARIOS (ID_USUARIO, NOMBRE_COMPLETO, RUT, CORREO, CONTRASENA, ROL, FECHA_REGISTRO)
        VALUES (:1, :2, :3, :4, :5, :6, :7)
    """, (
        next_id,
        user.nombre_completo,
        user.rut,
        user.correo,
        hashed_password.decode('utf-8'),
        user.rol,
        datetime.now()
    ))
    
    db.commit()
    cursor.close()
    db.close()
    
    return User(
        id=next_id,
        nombre_completo=user.nombre_completo,
        rut=user.rut,
        correo=user.correo,
        rol=user.rol,
        fecha_registro=str(datetime.now())
    )

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        # Intenta verificar con bcrypt primero
        return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))
    except ValueError:
        # Si falla, verifica si es una contraseña en texto plano (para usuarios existentes)
        return plain_password == hashed_password

def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt 