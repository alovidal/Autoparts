from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class UserBase(BaseModel):
    nombre_completo: str
    rut: str
    correo: EmailStr

class UserCreate(UserBase):
    contrasena: str
    rol: Optional[str] = "USUARIO"

class UserUpdate(UserBase):
    pass

class User(UserBase):
    id: int
    rol: str
    fecha_registro: str

class UserInDB(User):
    contrasena: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user: User

class TokenData(BaseModel):
    correo: Optional[str] = None 