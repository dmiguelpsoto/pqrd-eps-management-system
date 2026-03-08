# PQRD EPS Management System

Sistema web para la gestión de PQRD (Peticiones, Quejas, Reclamos, Denuncias y Sugerencias) en EPS con integración de múltiples canales, análisis con IA y generación de reportes operativos.

## Funcionalidades

- Registro de PQRD desde múltiples canales (Web, App, Chatbot, Ventanilla, Redes, Correo certificado, Ente Territorial, SNS)
- PQRD anónimas o asociadas a usuario (registro PQR vs Usuario)
- Funcionarios EPS que gestionan las PQRD
- Histórico de cambios (cierre, reapertura por inconformidad o ente territorial)
- Tablas maestras: tipo PQRD, estados, departamento, ciudad, regional, canal de entrada, SLA normativo
- Motor de SLA: Riesgo Vital 24h, Riesgo Priorizado 48h, Riesgo Simple 72h, Petición General 15 días hábiles
- Radicado automático: formato `PQRD-AAAA-00000000001` (11 dígitos por año)
- Clasificación automática mediante IA (próximamente)
- Alertas por vencimiento y reportes (próximamente)

## Estructura del backend (modo aprendizaje)

```
backend/
├── config.py        # Configuración (DATABASE_URL)
├── database.py      # Motor SQL y sesión (get_db)
├── models.py        # Modelos SQLAlchemy (tablas)
├── schema.sql       # Script SQL completo para generar la BD a mano
├── schemas.py       # Modelos Pydantic (validación API)
├── sla.py           # Cálculo de fecha de vencimiento (horas / días hábiles)
├── radicado.py      # Generador de número de radicado por año
├── main.py          # FastAPI: creación de tablas, carga de maestras, endpoints
└── pqrd.db          # Base SQLite (se crea al ejecutar)
```

## Estructura del frontend (React + Vite)

```
frontend/
├── index.html
├── package.json
├── vite.config.js   # Proxy /api -> backend en desarrollo
├── src/
│   ├── main.jsx
│   ├── App.jsx      # Rutas
│   ├── index.css    # Estilos globales
│   ├── api.js       # Cliente HTTP hacia el backend
│   ├── components/
│   │   └── Layout.jsx
│   └── pages/
│       ├── Home.jsx
│       ├── ListaPQRD.jsx
│       ├── NuevaPQRD.jsx
│       └── VerPQRD.jsx
```

## Cómo ejecutar el backend

1. Instalar dependencias (en la raíz del repo):
   ```bash
   pip install -r requirements.txt
   ```
2. Entrar en la carpeta backend e iniciar la API:
   ```bash
   cd backend
   uvicorn main:app --reload
   ```
3. Abrir en el navegador: **http://127.0.0.1:8000/docs** (Swagger UI).

La primera vez que se usen los endpoints de maestros o se cree una PQRD, se crearán las tablas y se cargarán los datos iniciales (tipos PQRD, estados, canales, SLA).

## Cómo ejecutar el frontend

1. El **backend debe estar corriendo** (ver arriba).
2. Instalar dependencias del frontend:
   ```bash
   cd frontend
   npm install
   ```
3. Iniciar el servidor de desarrollo:
   ```bash
   npm run dev
   ```
4. Abrir en el navegador: **http://127.0.0.1:5173**

En desarrollo, las peticiones a `/api` se redirigen al backend (puerto 8000) gracias al proxy de Vite.

## Generar la BD solo con SQL (opcional)

Desde la raíz del proyecto:

```bash
cd backend
sqlite3 pqrd.db < schema.sql
```

## Endpoints principales

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/maestros/tipos-pqrd` | Listar tipos de PQRD |
| GET | `/maestros/estados` | Listar estados |
| GET | `/maestros/canales-entrada` | Listar canales de entrada |
| POST | `/usuarios` | Crear usuario (afiliado/ciudadano) |
| GET | `/usuarios` | Listar usuarios |
| POST | `/funcionarios` | Crear funcionario EPS |
| GET | `/funcionarios` | Listar funcionarios |
| POST | `/pqrd` | Crear PQRD (radicado y SLA automáticos) |
| GET | `/pqrd` | Listar PQRD |
| GET | `/pqrd/{id}` | Ver una PQRD |
| GET | `/pqrd/{id}/historico` | Histórico de la PQRD |
| PUT | `/pqrd/{id}/cerrar` | Cerrar PQRD |
| PUT | `/pqrd/{id}/reabrir` | Reabrir PQRD (motivo en query) |

## Tecnologías

- **Backend:** FastAPI, SQLAlchemy, Pydantic, SQLite (cambiable a PostgreSQL)
- **Frontend:** React 18, Vite, React Router
- **IA:** Procesamiento de lenguaje natural para clasificación de motivos (próximo módulo)

## Estado del proyecto

En desarrollo como proyecto de portafolio profesional. Los módulos de administrador, informes, alertas por vencimiento e IA se irán añadiendo paso a paso.