# Conexión y sesión de base de datos
# En proyectos más grandes se suele separar engine, Base y SessionLocal
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

from config import DATABASE_URL, CONNECT_ARGS

engine = create_engine(DATABASE_URL, connect_args=CONNECT_ARGS)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    """Generador de sesión para inyección en FastAPI (Depends)."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
