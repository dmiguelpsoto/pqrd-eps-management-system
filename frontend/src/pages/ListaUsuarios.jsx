import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'

export default function ListaUsuarios() {
  const [lista, setLista] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    api.getUsuarios()
      .then(setLista)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p>Cargando usuarios...</p>
  if (error) return <div className="alert alert-error">{error}</div>

  return (
    <div className="card">
      <h2>Usuarios (afiliados / ciudadanos)</h2>
      <p className="text-muted">Personas que pueden ser titulares de una PQRD.</p>
      <div className="table-wrap mt-2">
        <table>
          <thead>
            <tr>
              <th>Documento</th>
              <th>Nombre</th>
              <th>Correo</th>
              <th>Teléfono</th>
            </tr>
          </thead>
          <tbody>
            {lista.length === 0 ? (
              <tr>
                <td colSpan="4" className="text-muted">
                  No hay usuarios. <Link to="/usuarios/nuevo">Registrar uno</Link>.
                </td>
              </tr>
            ) : (
              lista.map((u) => (
                <tr key={u.id}>
                  <td>
                    {u.tipo_documento} {u.numero_documento}
                  </td>
                  <td>{u.nombre_completo}</td>
                  <td>{u.correo_electronico || '—'}</td>
                  <td>{u.telefono || '—'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="mt-2">
        <Link to="/usuarios/nuevo" className="btn btn-primary">
          Nuevo usuario
        </Link>
      </div>
    </div>
  )
}
