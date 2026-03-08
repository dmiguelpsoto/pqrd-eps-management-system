# Punto de entrada FastAPI - Sistema PQRD EPS
# Ejecutar desde la carpeta backend: uvicorn main:app --reload
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from database import engine, get_db, Base
from models import (
    MaestroTipoPqrd,
    MaestroEstado,
    MaestroCanalEntrada,
    MaestroSlaNormativo,
    MaestroDepartamento,
    MaestroCiudad,
    MaestroRegional,
    Usuario,
    Funcionario,
    PQRD,
    Historico,
)
from schemas import (
    UsuarioCreate,
    UsuarioResponse,
    FuncionarioCreate,
    FuncionarioResponse,
    PQRDCreate,
    PQRDResponse,
    HistoricoResponse,
    MaestroTipoPqrdResponse,
    MaestroEstadoResponse,
    MaestroCanalEntradaResponse,
)
from radicado import generar_radicado
from sla import calcular_fecha_vencimiento

# Crear tablas en la BD (equivalente a ejecutar schema.sql)
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Sistema PQRD EPS",
    description="Gestión de Peticiones, Quejas, Reclamos, Denuncias y Sugerencias para EPS",
    version="1.0.0",
)

# CORS: permitir que el frontend (React) consuma la API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# -------- Carga inicial de datos maestros (solo si están vacías) --------
def seed_maestras(db: Session):
    if db.query(MaestroTipoPqrd).first() is not None:
        return
    # Tipos PQRD
    tipos = [
        MaestroTipoPqrd(id=1, codigo="RRCV", nombre="Reclamo Riesgo Vital", descripcion="Reclamos que comprometen la vida"),
        MaestroTipoPqrd(id=2, codigo="RRCP", nombre="Reclamo Riesgo Priorizado", descripcion="Reclamos de riesgo priorizado"),
        MaestroTipoPqrd(id=3, codigo="RRCS", nombre="Reclamo Riesgo Simple", descripcion="Reclamos de riesgo simple"),
        MaestroTipoPqrd(id=4, codigo="PETG", nombre="Petición General", descripcion="Peticiones generales"),
    ]
    for t in tipos:
        db.add(t)
    estados = [
        MaestroEstado(id=1, codigo="ABIERTA", nombre="Abierta"),
        MaestroEstado(id=2, codigo="EN_TRAMITE", nombre="En trámite"),
        MaestroEstado(id=3, codigo="CERRADA", nombre="Cerrada"),
        MaestroEstado(id=4, codigo="REABIERTA", nombre="Reabierta"),
    ]
    for e in estados:
        db.add(e)
    canales = [
        MaestroCanalEntrada(id=1, codigo="WEB", nombre="Web"),
        MaestroCanalEntrada(id=2, codigo="APP", nombre="App"),
        MaestroCanalEntrada(id=3, codigo="CHATBOT", nombre="Chatbot"),
        MaestroCanalEntrada(id=4, codigo="VENTANILLA", nombre="Ventanilla física"),
        MaestroCanalEntrada(id=5, codigo="REDES", nombre="Redes Sociales"),
        MaestroCanalEntrada(id=6, codigo="CORREO_CERT", nombre="Correo certificado"),
        MaestroCanalEntrada(id=7, codigo="ENTE_TERR", nombre="Ente Territorial"),
        MaestroCanalEntrada(id=8, codigo="SNS", nombre="SNS"),
    ]
    for c in canales:
        db.add(c)
    slas = [
        MaestroSlaNormativo(id=1, tipo_pqrd_id=1, cantidad=24, unidad="horas", descripcion="Reclamo Riesgo Vital - 24 horas"),
        MaestroSlaNormativo(id=2, tipo_pqrd_id=2, cantidad=48, unidad="horas", descripcion="Reclamo Riesgo Priorizado - 48 horas"),
        MaestroSlaNormativo(id=3, tipo_pqrd_id=3, cantidad=72, unidad="horas", descripcion="Reclamo Riesgo Simple - 72 horas"),
        MaestroSlaNormativo(id=4, tipo_pqrd_id=4, cantidad=15, unidad="dias_habiles", descripcion="Peticiones Generales - 15 días hábiles"),
    ]
    for s in slas:
        db.add(s)
    db.commit()


# -------- Endpoints de maestras (consulta) --------
@app.get("/maestros/tipos-pqrd", response_model=list[MaestroTipoPqrdResponse])
def listar_tipos_pqrd(db: Session = Depends(get_db)):
    seed_maestras(db)
    return db.query(MaestroTipoPqrd).all()


@app.get("/maestros/estados", response_model=list[MaestroEstadoResponse])
def listar_estados(db: Session = Depends(get_db)):
    seed_maestras(db)
    return db.query(MaestroEstado).all()


@app.get("/maestros/canales-entrada", response_model=list[MaestroCanalEntradaResponse])
def listar_canales_entrada(db: Session = Depends(get_db)):
    seed_maestras(db)
    return db.query(MaestroCanalEntrada).all()


# -------- Usuarios --------
@app.post("/usuarios", response_model=UsuarioResponse)
def crear_usuario(data: UsuarioCreate, db: Session = Depends(get_db)):
    usuario = Usuario(**data.model_dump())
    db.add(usuario)
    db.commit()
    db.refresh(usuario)
    return usuario


@app.get("/usuarios", response_model=list[UsuarioResponse])
def listar_usuarios(db: Session = Depends(get_db)):
    return db.query(Usuario).all()


@app.get("/usuarios/{usuario_id}", response_model=UsuarioResponse)
def ver_usuario(usuario_id: int, db: Session = Depends(get_db)):
    u = db.query(Usuario).filter(Usuario.id == usuario_id).first()
    if not u:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return u


# -------- Funcionarios --------
@app.post("/funcionarios", response_model=FuncionarioResponse)
def crear_funcionario(data: FuncionarioCreate, db: Session = Depends(get_db)):
    f = Funcionario(**data.model_dump())
    db.add(f)
    db.commit()
    db.refresh(f)
    return f


@app.get("/funcionarios", response_model=list[FuncionarioResponse])
def listar_funcionarios(db: Session = Depends(get_db)):
    return db.query(Funcionario).all()


# -------- PQRD --------
@app.post("/pqrd", response_model=PQRDResponse)
def crear_pqrd(data: PQRDCreate, db: Session = Depends(get_db)):
    seed_maestras(db)
    radicado = generar_radicado(db)
    fecha_vencimiento = calcular_fecha_vencimiento(data.tipo_pqrd_id, db)
    estado_abierta = 1  # ABIERTA
    pqrd = PQRD(
        radicado=radicado,
        tipo_pqrd_id=data.tipo_pqrd_id,
        descripcion=data.descripcion,
        canal_entrada_id=data.canal_entrada_id,
        anonima=1 if data.anonima else 0,
        usuario_id=data.usuario_id,
        funcionario_id=data.funcionario_id,
        estado_id=estado_abierta,
        fecha_vencimiento=fecha_vencimiento,
    )
    db.add(pqrd)
    db.commit()
    db.refresh(pqrd)
    h = Historico(pqrd_id=pqrd.id, tipo_cambio="creacion", cambio="PQRD creada")
    db.add(h)
    db.commit()
    return pqrd


@app.get("/pqrd", response_model=list[PQRDResponse])
def listar_pqrd(db: Session = Depends(get_db)):
    return db.query(PQRD).all()


@app.get("/pqrd/{pqrd_id}", response_model=PQRDResponse)
def ver_pqrd(pqrd_id: int, db: Session = Depends(get_db)):
    p = db.query(PQRD).filter(PQRD.id == pqrd_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="PQRD no encontrada")
    return p


@app.get("/pqrd/{pqrd_id}/historico", response_model=list[HistoricoResponse])
def historico_pqrd(pqrd_id: int, db: Session = Depends(get_db)):
    return db.query(Historico).filter(Historico.pqrd_id == pqrd_id).order_by(Historico.fecha).all()


@app.put("/pqrd/{pqrd_id}/cerrar")
def cerrar_pqrd(pqrd_id: int, db: Session = Depends(get_db)):
    from datetime import datetime
    pqrd = db.query(PQRD).filter(PQRD.id == pqrd_id).first()
    if not pqrd:
        raise HTTPException(status_code=404, detail="PQRD no encontrada")
    estado_anterior = pqrd.estado_id
    pqrd.estado_id = 3  # CERRADA
    pqrd.fecha_cierre = datetime.utcnow()
    h = Historico(
        pqrd_id=pqrd_id,
        tipo_cambio="cierre",
        cambio="PQRD cerrada",
        estado_anterior_id=estado_anterior,
        estado_nuevo_id=3,
    )
    db.add(h)
    db.commit()
    return {"mensaje": "PQRD cerrada correctamente"}


@app.put("/pqrd/{pqrd_id}/reabrir")
def reabrir_pqrd(pqrd_id: int, motivo: str = "reapertura", db: Session = Depends(get_db)):
    """Reapertura por inconformidad o por solicitud del ente territorial."""
    pqrd = db.query(PQRD).filter(PQRD.id == pqrd_id).first()
    if not pqrd:
        raise HTTPException(status_code=404, detail="PQRD no encontrada")
    estado_anterior = pqrd.estado_id
    pqrd.estado_id = 4  # REABIERTA
    pqrd.fecha_cierre = None
    tipo_cambio = "reapertura_inconformidad" if "inconformidad" in motivo.lower() else "reapertura_ente_territorial"
    h = Historico(
        pqrd_id=pqrd_id,
        tipo_cambio=tipo_cambio,
        cambio=f"PQRD reabierta: {motivo}",
        estado_anterior_id=estado_anterior,
        estado_nuevo_id=4,
    )
    db.add(h)
    db.commit()
    return {"mensaje": "PQRD reabierta"}


@app.get("/")
def raiz():
    return {
        "app": "Sistema PQRD EPS",
        "docs": "/docs",
        "maestros": "/maestros/tipos-pqrd, /maestros/estados, /maestros/canales-entrada",
        "usuarios": "/usuarios",
        "funcionarios": "/funcionarios",
        "pqrd": "/pqrd",
    }
