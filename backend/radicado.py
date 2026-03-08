# Generador de radicado EPS: PQRD-AAAA-NNNNNNNNNNN (11 dígitos)
# El consecutivo es por año; al cambiar el año se reinicia.
from datetime import datetime
from sqlalchemy import func
from sqlalchemy.orm import Session

from models import PQRD


def generar_radicado(db: Session) -> str:
    """
    Genera un radicado único con formato PQRD-AAAA-00000000001.
    AAAA = año actual, consecutivo de 11 dígitos por año.
    """
    anio = datetime.utcnow().year
    # Conteo de PQRD ya creadas en el año actual (por fecha_registro)
    # Para SQLite: strftime('%Y', fecha_registro) = '2025'
    cantidad = (
        db.query(func.count(PQRD.id))
        .filter(func.strftime("%Y", PQRD.fecha_registro) == str(anio))
        .scalar()
        or 0
    )
    consecutivo = cantidad + 1
    return f"PQRD-{anio}-{consecutivo:011d}"
