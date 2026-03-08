import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api'

export default function NuevoUsuario() {
  const navigate = useNavigate()
  const [sending, setSending] = useState(false)
  const [error, setError] = useState(null)
  const [form, setForm] = useState({
    tipo_documento: 'CC',
    numero_documento: '',
    nombre_completo: '',
    correo_electronico: '',
    telefono: '',
    direccion: '',
    departamento_id: null,
    ciudad_id: null,
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: value === '' ? null : value,
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setError(null)
    setSending(true)
    const payload = {
      tipo_documento: form.tipo_documento,
      numero_documento: form.numero_documento.trim(),
      nombre_completo: form.nombre_completo.trim(),
      correo_electronico: form.correo_electronico.trim() || null,
      telefono: form.telefono.trim() || null,
      direccion: form.direccion.trim() || null,
      departamento_id: form.departamento_id,
      ciudad_id: form.ciudad_id,
    }
    api.crearUsuario(payload)
      .then(() => navigate('/usuarios'))
      .catch((e) => {
        setError(e.message)
        setSending(false)
      })
  }

  return (
    <div className="card">
      <h2>Registrar usuario</h2>
      <p className="text-muted">Datos del afiliado o ciudadano (titular de PQRD).</p>
      {error && <div className="alert alert-error">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Tipo de documento *</label>
          <select
            name="tipo_documento"
            value={form.tipo_documento}
            onChange={handleChange}
            required
          >
            <option value="CC">Cédula de ciudadanía</option>
            <option value="CE">Cédula de extranjería</option>
            <option value="TI">Tarjeta de identidad</option>
            <option value="PAS">Pasaporte</option>
          </select>
        </div>
        <div className="form-group">
          <label>Número de documento *</label>
          <input
            type="text"
            name="numero_documento"
            value={form.numero_documento}
            onChange={handleChange}
            required
            placeholder="Ej: 123456789"
          />
        </div>
        <div className="form-group">
          <label>Nombre completo *</label>
          <input
            type="text"
            name="nombre_completo"
            value={form.nombre_completo}
            onChange={handleChange}
            required
            placeholder="Ej: Juan Pérez García"
          />
        </div>
        <div className="form-group">
          <label>Correo electrónico</label>
          <input
            type="email"
            name="correo_electronico"
            value={form.correo_electronico}
            onChange={handleChange}
            placeholder="correo@ejemplo.com"
          />
        </div>
        <div className="form-group">
          <label>Teléfono</label>
          <input
            type="text"
            name="telefono"
            value={form.telefono}
            onChange={handleChange}
            placeholder="Ej: 3001234567"
          />
        </div>
        <div className="form-group">
          <label>Dirección</label>
          <input
            type="text"
            name="direccion"
            value={form.direccion}
            onChange={handleChange}
            placeholder="Calle, número, barrio"
          />
        </div>
        <div className="mt-2">
          <button type="submit" className="btn btn-primary" disabled={sending}>
            {sending ? 'Guardando...' : 'Guardar usuario'}
          </button>
          <Link to="/usuarios" className="btn btn-secondary" style={{ marginLeft: '0.5rem' }}>
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  )
}
