import oracledb
import os
from dotenv import load_dotenv

load_dotenv()

usuario = os.getenv("usuario")
clave = os.getenv("clave")
wallet_dir = r"wallet"
wallet_password = os.getenv("wallet_password")
dsn = os.getenv("dsn")

connection = oracledb.connect(
    user=usuario,
    password=clave,
    dsn=dsn,
    config_dir=wallet_dir,
    wallet_location=wallet_dir,
    wallet_password=wallet_password
)