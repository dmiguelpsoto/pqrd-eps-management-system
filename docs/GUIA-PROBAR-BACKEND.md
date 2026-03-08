# Guía paso a paso: Probar el backend PQRD EPS

## Requisito previo

- Python 3.10 o superior instalado.
- Opcional: crear y activar un entorno virtual antes de instalar:
  ```bash
  python -m venv venv
  venv\Scripts\activate
  ```

## Paso 1: Instalar dependencias

En la **raíz del proyecto** (donde está `requirements.txt`):

```bash
pip install -r requirements.txt
```

Deberías ver que se instalan: fastapi, uvicorn, sqlalchemy, pydantic, pydantic-settings.

---

## Paso 2: Iniciar el servidor

Abre una terminal y entra en la carpeta `backend`:

```bash
cd backend
```

Luego ejecuta:

```bash
uvicorn main:app --reload
```

Verás algo como:

```
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Application startup complete.
```

**Deja esta terminal abierta** (el servidor debe seguir corriendo).

---

## Paso 3: Abrir la documentación interactiva

En el navegador, abre:

**http://127.0.0.1:8000/docs**

Ahí verás Swagger UI con todos los endpoints. Desde aquí puedes probar la API sin escribir código.

---

## Paso 4: Probar los maestros (datos de referencia)

1. En `/docs`, busca **GET /maestros/tipos-pqrd**.
2. Haz clic en **"Try it out"** y luego **"Execute"**.
3. Deberías recibir **200** y una lista con los 4 tipos de PQRD (Riesgo Vital, Priorizado, Simple, Petición General).

Repite con:
- **GET /maestros/estados**
- **GET /maestros/canales-entrada**

Con esto se crean las tablas y se cargan los datos iniciales la primera vez.

---

## Paso 5: Crear un usuario (opcional, para PQRD con titular)

1. Busca **POST /usuarios**.
2. **Try it out**.
3. En el cuerpo (Request body) usa por ejemplo:

```json
{
  "tipo_documento": "CC",
  "numero_documento": "123456789",
  "nombre_completo": "Juan Pérez",
  "correo_electronico": "juan@ejemplo.com",
  "telefono": "3001234567",
  "direccion": "Calle 1 # 2-3",
  "departamento_id": null,
  "ciudad_id": null
}
```

4. **Execute**. Deberías recibir **200** y el mismo objeto con `id` y `creado_en`.

Anota el **id** del usuario si quieres usarlo en una PQRD no anónima (por ejemplo `1`).

---

## Paso 6: Crear una PQRD

1. Busca **POST /pqrd**.
2. **Try it out**.
3. Cuerpo de ejemplo (PQRD **anónima**):

```json
{
  "tipo_pqrd_id": 1,
  "descripcion": "Demora en entrega de medicamentos en la IPS asignada.",
  "canal_entrada_id": 1,
  "anonima": true,
  "usuario_id": null,
  "funcionario_id": null
}
```

4. **Execute**.

Comprueba en la respuesta:
- **radicado**: formato `PQRD-2025-00000000001` (año actual y 11 dígitos).
- **fecha_vencimiento**: unas 24 horas después (tipo 1 = Riesgo Vital).
- **estado_id**: 1 (Abierta).

**Otro ejemplo** (Petición General, 15 días hábiles):

```json
{
  "tipo_pqrd_id": 4,
  "descripcion": "Solicitud de certificado de afiliación.",
  "canal_entrada_id": 1,
  "anonima": false,
  "usuario_id": 1,
  "funcionario_id": null
}
```

---

## Paso 7: Listar y ver una PQRD

1. **GET /pqrd** → **Try it out** → **Execute**.  
   Deberías ver la(s) PQRD creada(s).
2. **GET /pqrd/{pqrd_id}** → pon el `id` (ej. `1`) → **Execute**.  
   Verás el detalle de esa PQRD.

---

## Paso 8: Ver el histórico

1. **GET /pqrd/{pqrd_id}/historico** → pon el mismo `id` (ej. `1`) → **Execute**.  
   Deberías ver al menos un registro: "PQRD creada".

---

## Paso 9: Cerrar una PQRD

1. **PUT /pqrd/{pqrd_id}/cerrar** → pon el `id` → **Execute**.  
   Respuesta: `{"mensaje": "PQRD cerrada correctamente"}`.
2. Vuelve a **GET /pqrd/1**: el `estado_id` será 3 (Cerrada) y tendrá `fecha_cierre`.
3. Vuelve a **GET /pqrd/1/historico**: aparecerá el cambio "PQRD cerrada".

---

## Paso 10: Reabrir una PQRD (opcional)

1. **PUT /pqrd/{pqrd_id}/reabrir** → pon el `id`.  
   Puedes añadir en "Parameters" el query **motivo**: `Inconformidad con la respuesta`.  
   **Execute**.  
   Respuesta: `{"mensaje": "PQRD reabierta"}`.
2. **GET /pqrd/1**: `estado_id` será 4 (Reabierta), `fecha_cierre` volverá a null.

---

## Resumen rápido

| Qué probar        | Endpoint                      | Método |
|-------------------|-------------------------------|--------|
| Tipos de PQRD     | /maestros/tipos-pqrd          | GET    |
| Crear usuario     | /usuarios                     | POST   |
| Crear PQRD        | /pqrd                         | POST   |
| Listar PQRD       | /pqrd                         | GET    |
| Ver una PQRD      | /pqrd/1                       | GET    |
| Histórico         | /pqrd/1/historico             | GET    |
| Cerrar            | /pqrd/1/cerrar                | PUT    |
| Reabrir           | /pqrd/1/reabrir?motivo=...    | PUT    |

