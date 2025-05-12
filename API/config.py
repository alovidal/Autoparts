import cx_Oracle
import os
from dotenv import load_dotenv

load_dotenv()

usuario = os.getenv("usuario")
clave = os.getenv("clave")
dsn = 'localhost/XEPDB1'

connection = cx_Oracle.connect(
    user=usuario,
    password=clave,
    dsn=dsn
)

connection.autocommit = True