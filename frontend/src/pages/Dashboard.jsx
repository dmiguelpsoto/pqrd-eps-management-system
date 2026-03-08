import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'

const ESTADOS = { 1: 'Abierta', 2: 'En trámite', 3: 'Cerrada', 4: 'Reabierta' }

export default function Dashboard() {
  const [pqrd, setPqrd] = useState([])
  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    Promise.all([api.getPqrd(), api.getUsuarios()])
      .then(([p, u]) => {
        setPqrd(p)
        setUsuarios(u)
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p>Cargando...</p>
  if (error) return <div className="alert alert-error">{error}</div>

  const porEstado = pqrd.reduce((acc, p) => {
    acc[p.estado_id] = (acc[p.estado_id] || 0) + 1
    return acc
  }, {})

  const cards = [
    { titulo: 'Total PQRD', valor: pqrd.length, link: '/pqrd', color: 'primary' },
    { titulo: 'Abiertas', valor: porEstado[1] || 0, link: '/pqrd?estado=1', color: 'abierta' },
    { titulo: 'En trámite', valor: porEstado[2] || 0, link: '/pqrd?estado=2', color: 'tramite' },
    { titulo: 'Cerradas', valor: porEstado[3] || 0, link: '/pqrd?estado=3', color: 'cerrada' },
    { titulo: 'Reabiertas', valor: porEstado[4] || 0, link: '/pqrd?estado=4', color: 'reabierta' },
    { titulo: 'Usuarios registrados', valor: usuarios.length, link: '/usuarios', color: 'primary' },
  ]

  return (
    <div>
      <h2 className="mb-2">Dashboard</h2>
      <p className="text-muted mb-2">Resumen del sistema PQRD.</p>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}
      >
        {cards.map((c) => (
          <Link
            key={c.titulo}
            to={c.link}
            className="card"
            style={{
              textDecoration: 'none',
              color: 'inherit',
              textAlign: 'center',
            }}
          >
            <div
              className={`badge badge-${c.color}`}
              style={{
                marginBottom: '0.5rem',
                fontSize: '0.75rem',
              }}
            >
              {c.titulo}
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: '700' }}>{c.valor}</div>
          </Link>
        ))}
      </div>
      <div className="card">
        <h2>Acciones rápidas</h2>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link to="/pqrd/nueva" className="btn btn-primary">
            Nueva PQRD
          </Link>
          <Link to="/usuarios/nuevo" className="btn btn-secondary">
            Registrar usuario
          </Link>
          <Link to="/pqrd" className="btn btn-secondary">
            Ver listado PQRD
          </Link>
          <Link to="/usuarios" className="btn btn-secondary">
            Ver usuarios
          </Link>
        </div>
      </div>
    </div>
  )
}
