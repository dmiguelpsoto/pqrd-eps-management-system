-- =============================================================================
-- SISTEMA PQRD EPS - Script SQL completo
-- Genera la base de datos con tablas maestras y operativas.
-- Uso: sqlite3 pqrd.db < schema.sql   o ejecutar desde FastAPI con create_all
-- =============================================================================

PRAGMA foreign_keys = ON;

-- -----------------------------------------------------------------------------
-- TABLAS MAESTRAS (Referencia / Catálogos)
-- -----------------------------------------------------------------------------

-- Tipos de PQRD (Petición, Queja, Reclamo, Denuncia, Sugerencia) y clasificación
CREATE TABLE IF NOT EXISTS maestro_tipo_pqrd (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    codigo VARCHAR(20) UNIQUE NOT NULL,
    nombre VARCHAR(120) NOT NULL,
    descripcion VARCHAR(255)
);

-- Estados del trámite de una PQRD (Abierta, En trámite, Cerrada, Reabierta, etc.)
CREATE TABLE IF NOT EXISTS maestro_estado (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    codigo VARCHAR(20) UNIQUE NOT NULL,
    nombre VARCHAR(80) NOT NULL
);

-- Departamentos (Colombia)
CREATE TABLE IF NOT EXISTS maestro_departamento (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    codigo VARCHAR(10) UNIQUE NOT NULL,
    nombre VARCHAR(100) NOT NULL
);

-- Ciudades (dependen de departamento)
CREATE TABLE IF NOT EXISTS maestro_ciudad (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    departamento_id INTEGER NOT NULL,
    codigo VARCHAR(10) NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    UNIQUE(departamento_id, codigo),
    FOREIGN KEY (departamento_id) REFERENCES maestro_departamento(id)
);

-- Regionales de la EPS
CREATE TABLE IF NOT EXISTS maestro_regional (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    codigo VARCHAR(20) UNIQUE NOT NULL,
    nombre VARCHAR(100) NOT NULL
);

-- Canales por los que ingresa la PQRD
CREATE TABLE IF NOT EXISTS maestro_canal_entrada (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    codigo VARCHAR(30) UNIQUE NOT NULL,
    nombre VARCHAR(80) NOT NULL
);

-- SLA normativo: por tipo de PQRD, tiempo en horas o días hábiles
CREATE TABLE IF NOT EXISTS maestro_sla_normativo (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tipo_pqrd_id INTEGER NOT NULL,
    cantidad INTEGER NOT NULL,
    unidad VARCHAR(15) NOT NULL CHECK (unidad IN ('horas', 'dias_habiles')),
    descripcion VARCHAR(200),
    FOREIGN KEY (tipo_pqrd_id) REFERENCES maestro_tipo_pqrd(id)
);

-- -----------------------------------------------------------------------------
-- TABLAS OPERATIVAS
-- -----------------------------------------------------------------------------

-- Usuarios de la EPS (afiliados / ciudadanos que presentan PQRD)
CREATE TABLE IF NOT EXISTS usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tipo_documento VARCHAR(10) NOT NULL,
    numero_documento VARCHAR(20) UNIQUE NOT NULL,
    nombre_completo VARCHAR(200) NOT NULL,
    correo_electronico VARCHAR(120),
    telefono VARCHAR(30),
    direccion VARCHAR(255),
    departamento_id INTEGER,
    ciudad_id INTEGER,
    creado_en DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (departamento_id) REFERENCES maestro_departamento(id),
    FOREIGN KEY (ciudad_id) REFERENCES maestro_ciudad(id)
);

CREATE INDEX IF NOT EXISTS idx_usuarios_numero_documento ON usuarios(numero_documento);

-- Funcionarios de la EPS que gestionan las PQRD
CREATE TABLE IF NOT EXISTS funcionarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre VARCHAR(200) NOT NULL,
    cargo VARCHAR(100),
    correo VARCHAR(120),
    regional_id INTEGER,
    activo INTEGER DEFAULT 1,
    FOREIGN KEY (regional_id) REFERENCES maestro_regional(id)
);

-- Tabla principal PQRD (Petición, Queja, Reclamo, Denuncia, Sugerencia)
CREATE TABLE IF NOT EXISTS pqrd (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    radicado VARCHAR(30) UNIQUE NOT NULL,
    tipo_pqrd_id INTEGER NOT NULL,
    descripcion TEXT NOT NULL,
    canal_entrada_id INTEGER NOT NULL,
    anonima INTEGER DEFAULT 0,
    usuario_id INTEGER,
    funcionario_id INTEGER,
    estado_id INTEGER NOT NULL,
    sla_normativo_id INTEGER,
    fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_vencimiento DATETIME,
    fecha_cierre DATETIME,
    respuesta TEXT,
    creado_en DATETIME DEFAULT CURRENT_TIMESTAMP,
    actualizado_en DATETIME,
    FOREIGN KEY (tipo_pqrd_id) REFERENCES maestro_tipo_pqrd(id),
    FOREIGN KEY (canal_entrada_id) REFERENCES maestro_canal_entrada(id),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    FOREIGN KEY (funcionario_id) REFERENCES funcionarios(id),
    FOREIGN KEY (estado_id) REFERENCES maestro_estado(id),
    FOREIGN KEY (sla_normativo_id) REFERENCES maestro_sla_normativo(id)
);

CREATE INDEX IF NOT EXISTS idx_pqrd_radicado ON pqrd(radicado);
CREATE INDEX IF NOT EXISTS idx_pqrd_fecha_vencimiento ON pqrd(fecha_vencimiento);
CREATE INDEX IF NOT EXISTS idx_pqrd_estado ON pqrd(estado_id);

-- Histórico de cambios: cierre, reapertura (inconformidad o ente territorial)
CREATE TABLE IF NOT EXISTS historico (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pqrd_id INTEGER NOT NULL,
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
    tipo_cambio VARCHAR(50),
    cambio TEXT,
    estado_anterior_id INTEGER,
    estado_nuevo_id INTEGER,
    usuario_funcionario_id INTEGER,
    FOREIGN KEY (pqrd_id) REFERENCES pqrd(id),
    FOREIGN KEY (estado_anterior_id) REFERENCES maestro_estado(id),
    FOREIGN KEY (estado_nuevo_id) REFERENCES maestro_estado(id),
    FOREIGN KEY (usuario_funcionario_id) REFERENCES funcionarios(id)
);

CREATE INDEX IF NOT EXISTS idx_historico_pqrd ON historico(pqrd_id);

-- -----------------------------------------------------------------------------
-- DATOS INICIALES (Maestras)
-- -----------------------------------------------------------------------------

-- Tipos de PQRD (alineados al motor de SLA)
INSERT OR IGNORE INTO maestro_tipo_pqrd (id, codigo, nombre, descripcion) VALUES
(1, 'RRCV', 'Reclamo Riesgo Vital', 'Reclamos que comprometen la vida'),
(2, 'RRCP', 'Reclamo Riesgo Priorizado', 'Reclamos de riesgo priorizado'),
(3, 'RRCS', 'Reclamo Riesgo Simple', 'Reclamos de riesgo simple'),
(4, 'PETG', 'Petición General', 'Peticiones generales');

-- Estados
INSERT OR IGNORE INTO maestro_estado (id, codigo, nombre) VALUES
(1, 'ABIERTA', 'Abierta'),
(2, 'EN_TRAMITE', 'En trámite'),
(3, 'CERRADA', 'Cerrada'),
(4, 'REABIERTA', 'Reabierta');

-- Canales de entrada
INSERT OR IGNORE INTO maestro_canal_entrada (id, codigo, nombre) VALUES
(1, 'WEB', 'Web'),
(2, 'APP', 'App'),
(3, 'CHATBOT', 'Chatbot'),
(4, 'VENTANILLA', 'Ventanilla física'),
(5, 'REDES', 'Redes Sociales'),
(6, 'CORREO_CERT', 'Correo certificado'),
(7, 'ENTE_TERR', 'Ente Territorial'),
(8, 'SNS', 'SNS');

-- SLA normativo: 24h, 48h, 72h, 15 días hábiles
INSERT OR IGNORE INTO maestro_sla_normativo (id, tipo_pqrd_id, cantidad, unidad, descripcion) VALUES
(1, 1, 24, 'horas', 'Reclamo Riesgo Vital - 24 horas'),
(2, 2, 48, 'horas', 'Reclamo Riesgo Priorizado - 48 horas'),
(3, 3, 72, 'horas', 'Reclamo Riesgo Simple - 72 horas'),
(4, 4, 15, 'dias_habiles', 'Peticiones Generales - 15 días hábiles');

-- Algunos departamentos y regionales de ejemplo (opcional)
INSERT OR IGNORE INTO maestro_departamento (id, codigo, nombre) VALUES (1, '11', 'Bogotá D.C.');
INSERT OR IGNORE INTO maestro_ciudad (id, departamento_id, codigo, nombre) VALUES (1, 1, '11001', 'Bogotá D.C.');
INSERT OR IGNORE INTO maestro_regional (id, codigo, nombre) VALUES (1, 'CENTRO', 'Regional Centro');

-- =============================================================================
-- FIN DEL SCRIPT
-- =============================================================================
