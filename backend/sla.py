# Motor de SLA: cálculo de fecha de vencimiento según norma
# - Reclamo Riesgo Vital: 24 horas
# - Reclamo Riesgo Priorizado: 48 horas
# - Reclamo Riesgo Simple: 72 horas
# - Petición General: 15 días hábiles (excluyendo sábado y domingo)
from datetime import datetime, timedelta
from sqlalchemy.orm import Session

from models import MaestroSlaNormativo


def _dias_habiles(fecha_desde: datetime, cantidad: int) -> datetime:
    """Suma N días hábiles a una fecha (no cuenta sábado ni domingo)."""
    fecha = fecha_desde
    dias_sumados = 0
    while dias_sumados < cantidad:
        fecha += timedelta(days=1)
        if fecha.weekday() < 5:  # 0=lunes .. 4=viernes
            dias_sumados += 1
    return fecha


def calcular_fecha_vencimiento(
    tipo_pqrd_id: int,
    db: Session,
    fecha_desde: datetime | None = None,
) -> datetime | None:
    """
    Calcula la fecha de vencimiento según el SLA normativo del tipo de PQRD.
    - Si la unidad es 'horas', suma esas horas a fecha_desde.
    - Si es 'dias_habiles', suma solo días hábiles (sin fin de semana).
    """
    if fecha_desde is None:
        fecha_desde = datetime.utcnow()

    sla = (
        db.query(MaestroSlaNormativo)
        .filter(MaestroSlaNormativo.tipo_pqrd_id == tipo_pqrd_id)
        .first()
    )
    if not sla:
        return None

    if sla.unidad == "horas":
        return fecha_desde + timedelta(hours=sla.cantidad)
    if sla.unidad == "dias_habiles":
        return _dias_habiles(fecha_desde, sla.cantidad)
    return None
