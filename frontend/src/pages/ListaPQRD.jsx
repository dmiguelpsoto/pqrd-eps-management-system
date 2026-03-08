import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { api } from '../api'

const ESTADOS = { 1: 'Abierta', 2: 'En trámite', 3: 'Cerrada', 4: 'Reabierta' }
const ESTADO_CLASS = { 1: 'badge-abierta', 2: 'badge-tramite', 3: 'badge-cerrada', 4: 'badge-reabierta' }

function formatFecha(s) {
  if (!s) return '—'
  try {
    const d = new Date(s)
    return d.toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' })
  } catch {
    return s
  }
}

export default function ListaPQRD() {
  const [searchParams] = useSearchParams()
  const estadoFilter = searchParams.get('estado')
  const [lista, setLista] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    api.getPqrd()
      .then(setLista)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const listaFiltrada =
    estadoFilter && /^[1-4]$/.test(estadoFilter)
      ? lista.filter((p) => p.estado_id === Number(estadoFilter))
      : lista

  if (loading) return <p>Cargando PQRD...</p>
  if (error) return <div className="alert alert-error">{error}</div>

  return (
    <div className="card">
      <h2>Listado de PQRD</h2>
      {estadoFilter && (
        <p className="text-muted">
          Filtro: {ESTADOS[estadoFilter]} — <Link to="/pqrd">Ver todas</Link>
        </p>
      )}
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Radicado</th>
              <th>Descripción</th>
              <th>Estado</th>
              <th>Vencimiento</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {listaFiltrada.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-muted">No hay PQRD registradas.</td>
              </tr>
            ) : (
              listaFiltrada.map((p) => (
                <tr key={p.id}>
                  <td><strong>{p.radicado}</strong></td>
                  <td>{p.descripcion?.slice(0, 60)}{p.descripcion?.length > 60 ? '…' : ''}</td>
                  <td>
                    <span className={`badge ${ESTADO_CLASS[p.estado_id] || ''}`}>
                      {ESTADOS[p.estado_id] ?? p.estado_id}
                    </span>
                  </td>
                  <td>{formatFecha(p.fecha_vencimiento)}</td>
                  <td>
                    <Link to={`/pqrd/${p.id}`} className="btn btn-secondary">Ver</Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="mt-2">
        <Link to="/pqrd/nueva" className="btn btn-primary">Nueva PQRD</Link>
      </div>
    </div>
  )
}
