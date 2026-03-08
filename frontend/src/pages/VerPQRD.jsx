import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { api } from '../api'

const ESTADOS = { 1: 'Abierta', 2: 'En trámite', 3: 'Cerrada', 4: 'Reabierta' }
const ESTADO_CLASS = { 1: 'badge-abierta', 2: 'badge-tramite', 3: 'badge-cerrada', 4: 'badge-reabierta' }

function formatFecha(s) {
  if (!s) return '—'
  try {
    return new Date(s).toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' })
  } catch {
    return s
  }
}

export default function VerPQRD() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [pqrd, setPqrd] = useState(null)
  const [historico, setHistorico] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [accionando, setAccionando] = useState(false)

  useEffect(() => {
    api.getPqrdById(id)
      .then(setPqrd)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    if (!id) return
    api.getHistorico(id)
      .then(setHistorico)
      .catch(() => setHistorico([]))
  }, [id])

  const cerrar = () => {
    setAccionando(true)
    api.cerrarPqrd(id)
      .then(() => {
        setPqrd((p) => (p ? { ...p, estado_id: 3, fecha_cierre: new Date().toISOString() } : p))
        return api.getHistorico(id)
      })
      .then(setHistorico)
      .catch((e) => setError(e.message))
      .finally(() => setAccionando(false))
  }

  const reabrir = () => {
    const motivo = window.prompt('Motivo de reapertura (opcional):', 'Inconformidad con la respuesta')
    if (motivo === null) return
    setAccionando(true)
    api.reabrirPqrd(id, motivo)
      .then(() => {
        setPqrd((p) => (p ? { ...p, estado_id: 4, fecha_cierre: null } : p))
        return api.getHistorico(id)
      })
      .then(setHistorico)
      .catch((e) => setError(e.message))
      .finally(() => setAccionando(false))
  }

  if (loading) return <p>Cargando...</p>
  if (error || !pqrd) return <div className="alert alert-error">{error || 'PQRD no encontrada'}</div>

  const puedeCerrar = pqrd.estado_id !== 3
  const puedeReabrir = pqrd.estado_id === 3

  return (
    <div>
      <div className="card">
        <div className="mb-2">
          <Link to="/pqrd" className="btn btn-secondary">← Volver al listado</Link>
        </div>
        <h2>{pqrd.radicado}</h2>
        <p>
          <span className={`badge ${ESTADO_CLASS[pqrd.estado_id] || ''}`}>
            {ESTADOS[pqrd.estado_id] ?? pqrd.estado_id}
          </span>
        </p>
        <p><strong>Descripción:</strong></p>
        <p>{pqrd.descripcion}</p>
        <p className="text-muted">
          Fecha registro: {formatFecha(pqrd.fecha_registro)} · Vencimiento: {formatFecha(pqrd.fecha_vencimiento)}
          {pqrd.fecha_cierre && ` · Cierre: ${formatFecha(pqrd.fecha_cierre)}`}
        </p>
        {pqrd.respuesta && (
          <p><strong>Respuesta:</strong><br />{pqrd.respuesta}</p>
        )}
        <div className="mt-2">
          {puedeCerrar && (
            <button className="btn btn-success" onClick={cerrar} disabled={accionando}>
              Cerrar PQRD
            </button>
          )}
          {puedeReabrir && (
            <button className="btn btn-secondary" onClick={reabrir} disabled={accionando}>
              Reabrir PQRD
            </button>
          )}
        </div>
      </div>

      <div className="card">
        <h2>Histórico</h2>
        {historico.length === 0 ? (
          <p className="text-muted">Sin registros.</p>
        ) : (
          <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
            {historico.map((h) => (
              <li key={h.id} style={{ padding: '0.5rem 0', borderBottom: '1px solid #eee' }}>
                <span className="text-muted">{formatFecha(h.fecha)}</span>
                {' — '}
                {h.tipo_cambio && <strong>{h.tipo_cambio}: </strong>}
                {h.cambio || '—'}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
