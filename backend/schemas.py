# Schemas Pydantic: validación de entrada y salida de la API
from datetime import datetime
from typing import Optional

from pydantic import BaseModel


# -------- Usuarios --------
class UsuarioBase(BaseModel):
    tipo_documento: str
    numero_documento: str
    nombre_completo: str
    correo_electronico: Optional[str] = None
    telefono: Optional[str] = None
    direccion: Optional[str] = None
    departamento_id: Optional[int] = None
    ciudad_id: Optional[int] = None


class UsuarioCreate(UsuarioBase):
    pass


class UsuarioResponse(UsuarioBase):
    id: int
    creado_en: Optional[datetime] = None

    class Config:
        from_attributes = True


# -------- Funcionarios --------
class FuncionarioBase(BaseModel):
    nombre: str
    cargo: Optional[str] = None
    correo: Optional[str] = None
    regional_id: Optional[int] = None


class FuncionarioCreate(FuncionarioBase):
    pass


class FuncionarioResponse(FuncionarioBase):
    id: int
    activo: Optional[int] = 1

    class Config:
        from_attributes = True


# -------- PQRD --------
class PQRDCreate(BaseModel):
    tipo_pqrd_id: int
    descripcion: str
    canal_entrada_id: int
    anonima: bool = False
    usuario_id: Optional[int] = None
    funcionario_id: Optional[int] = None


class PQRDResponse(BaseModel):
    id: int
    radicado: str
    tipo_pqrd_id: int
    descripcion: str
    canal_entrada_id: int
    anonima: int
    usuario_id: Optional[int] = None
    funcionario_id: Optional[int] = None
    estado_id: int
    fecha_registro: Optional[datetime] = None
    fecha_vencimiento: Optional[datetime] = None
    fecha_cierre: Optional[datetime] = None
    respuesta: Optional[str] = None

    class Config:
        from_attributes = True


# -------- Histórico --------
class HistoricoResponse(BaseModel):
    id: int
    pqrd_id: int
    fecha: Optional[datetime] = None
    tipo_cambio: Optional[str] = None
    cambio: Optional[str] = None

    class Config:
        from_attributes = True


# -------- Maestras (solo lectura en API) --------
class MaestroTipoPqrdResponse(BaseModel):
    id: int
    codigo: str
    nombre: str
    descripcion: Optional[str] = None

    class Config:
        from_attributes = True


class MaestroEstadoResponse(BaseModel):
    id: int
    codigo: str
    nombre: str

    class Config:
        from_attributes = True


class MaestroCanalEntradaResponse(BaseModel):
    id: int
    codigo: str
    nombre: str

    class Config:
        from_attributes = True
