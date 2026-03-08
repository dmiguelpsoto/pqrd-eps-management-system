# Configuración centralizada (modo aprendizaje: un solo lugar para cambiar BD, etc.)
import os

# Ruta de la base de datos SQLite (relativa al directorio backend)
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./pqrd.db")

# Para SQLite es necesario permitir conexiones desde otro hilo (FastAPI)
CONNECT_ARGS = {"check_same_thread": False} if "sqlite" in DATABASE_URL else {}
