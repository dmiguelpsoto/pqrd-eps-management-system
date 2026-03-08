import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <div className="card">
      <h2>Bienvenido al Sistema PQRD EPS</h2>
      <p className="text-muted">
        Gestión de Peticiones, Quejas, Reclamos, Denuncias y Sugerencias.
      </p>
      <div className="mt-2">
        <Link to="/pqrd" className="btn btn-primary">Ver listado de PQRD</Link>
        {' '}
        <Link to="/pqrd/nueva" className="btn btn-secondary">Registrar nueva PQRD</Link>
        {' '}
        <Link to="/dashboard" className="btn btn-secondary">Dashboard</Link>
        {' '}
        <Link to="/usuarios" className="btn btn-secondary">Usuarios</Link>
      </div>
    </div>
  )
}
