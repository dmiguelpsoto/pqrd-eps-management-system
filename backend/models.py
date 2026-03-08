# Modelos SQLAlchemy - reflejan las tablas del schema.sql
# Orden: maestras primero, luego tablas que dependen de ellas
from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, Text, DateTime, ForeignKey, Boolean, CheckConstraint
)
from sqlalchemy.orm import relationship

from database import Base


# -------- TABLAS MAESTRAS --------

class MaestroTipoPqrd(Base):
    __tablename__ = "maestro_tipo_pqrd"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    codigo = Column(String(20), unique=True, nullable=False)
    nombre = Column(String(120), nullable=False)
    descripcion = Column(String(255))
    sla_normativo_list = relationship("MaestroSlaNormativo", back_populates="tipo_pqrd")


class MaestroEstado(Base):
    __tablename__ = "maestro_estado"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    codigo = Column(String(20), unique=True, nullable=False)
    nombre = Column(String(80), nullable=False)


class MaestroDepartamento(Base):
    __tablename__ = "maestro_departamento"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    codigo = Column(String(10), unique=True, nullable=False)
    nombre = Column(String(100), nullable=False)
    ciudades = relationship("MaestroCiudad", back_populates="departamento")


class MaestroCiudad(Base):
    __tablename__ = "maestro_ciudad"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    departamento_id = Column(Integer, ForeignKey("maestro_departamento.id"), nullable=False)
    codigo = Column(String(10), nullable=False)
    nombre = Column(String(100), nullable=False)
    departamento = relationship("MaestroDepartamento", back_populates="ciudades")


class MaestroRegional(Base):
    __tablename__ = "maestro_regional"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    codigo = Column(String(20), unique=True, nullable=False)
    nombre = Column(String(100), nullable=False)


class MaestroCanalEntrada(Base):
    __tablename__ = "maestro_canal_entrada"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    codigo = Column(String(30), unique=True, nullable=False)
    nombre = Column(String(80), nullable=False)


class MaestroSlaNormativo(Base):
    __tablename__ = "maestro_sla_normativo"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    tipo_pqrd_id = Column(Integer, ForeignKey("maestro_tipo_pqrd.id"), nullable=False)
    cantidad = Column(Integer, nullable=False)
    unidad = Column(String(15), nullable=False)  # 'horas' | 'dias_habiles'
    descripcion = Column(String(200))
    tipo_pqrd = relationship("MaestroTipoPqrd", back_populates="sla_normativo_list")


# -------- TABLAS OPERATIVAS --------

class Usuario(Base):
    __tablename__ = "usuarios"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    tipo_documento = Column(String(10), nullable=False)
    numero_documento = Column(String(20), unique=True, nullable=False)
    nombre_completo = Column(String(200), nullable=False)
    correo_electronico = Column(String(120))
    telefono = Column(String(30))
    direccion = Column(String(255))
    departamento_id = Column(Integer, ForeignKey("maestro_departamento.id"))
    ciudad_id = Column(Integer, ForeignKey("maestro_ciudad.id"))
    creado_en = Column(DateTime, default=datetime.utcnow)
    # Relaciones opcionales para joins
    departamento = relationship("MaestroDepartamento")
    ciudad = relationship("MaestroCiudad")


class Funcionario(Base):
    __tablename__ = "funcionarios"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    nombre = Column(String(200), nullable=False)
    cargo = Column(String(100))
    correo = Column(String(120))
    regional_id = Column(Integer, ForeignKey("maestro_regional.id"))
    activo = Column(Integer, default=1)
    regional = relationship("MaestroRegional")


class PQRD(Base):
    __tablename__ = "pqrd"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    radicado = Column(String(30), unique=True, nullable=False)
    tipo_pqrd_id = Column(Integer, ForeignKey("maestro_tipo_pqrd.id"), nullable=False)
    descripcion = Column(Text, nullable=False)
    canal_entrada_id = Column(Integer, ForeignKey("maestro_canal_entrada.id"), nullable=False)
    anonima = Column(Integer, default=0)  # SQLite sin Boolean nativo
    usuario_id = Column(Integer, ForeignKey("usuarios.id"))
    funcionario_id = Column(Integer, ForeignKey("funcionarios.id"))
    estado_id = Column(Integer, ForeignKey("maestro_estado.id"), nullable=False)
    sla_normativo_id = Column(Integer, ForeignKey("maestro_sla_normativo.id"))
    fecha_registro = Column(DateTime, default=datetime.utcnow)
    fecha_vencimiento = Column(DateTime)
    fecha_cierre = Column(DateTime)
    respuesta = Column(Text)
    creado_en = Column(DateTime, default=datetime.utcnow)
    actualizado_en = Column(DateTime, onupdate=datetime.utcnow)
    # Relaciones
    tipo_pqrd = relationship("MaestroTipoPqrd")
    canal_entrada = relationship("MaestroCanalEntrada")
    usuario = relationship("Usuario")
    funcionario = relationship("Funcionario")
    estado = relationship("MaestroEstado")
    sla_normativo = relationship("MaestroSlaNormativo")
    historicos = relationship("Historico", back_populates="pqrd")


class Historico(Base):
    __tablename__ = "historico"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    pqrd_id = Column(Integer, ForeignKey("pqrd.id"), nullable=False)
    fecha = Column(DateTime, default=datetime.utcnow)
    tipo_cambio = Column(String(50))  # cierre, reapertura_inconformidad, reapertura_ente_territorial
    cambio = Column(Text)
    estado_anterior_id = Column(Integer, ForeignKey("maestro_estado.id"))
    estado_nuevo_id = Column(Integer, ForeignKey("maestro_estado.id"))
    usuario_funcionario_id = Column(Integer, ForeignKey("funcionarios.id"))
    pqrd = relationship("PQRD", back_populates="historicos")
