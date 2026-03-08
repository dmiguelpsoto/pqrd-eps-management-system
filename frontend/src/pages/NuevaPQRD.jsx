import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api'

export default function NuevaPQRD() {
  const navigate = useNavigate()
  const [tipos, setTipos] = useState([])
  const [canales, setCanales] = useState([])
  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState(null)

  const [form, setForm] = useState({
    tipo_pqrd_id: '',
    descripcion: '',
    canal_entrada_id: '',
    anonima: true,
    usuario_id: '',
  })

  useEffect(() => {
    Promise.all([
      api.getTiposPqrd(),
      api.getCanalesEntrada(),
      api.getUsuarios(),
    ])
      .then(([t, c, u]) => {
        setTipos(t)
        setCanales(c)
        setUsuarios(u)
        if (t.length) setForm((f) => ({ ...f, tipo_pqrd_id: t[0].id }))
        if (c.length) setForm((f) => ({ ...f, canal_entrada_id: c[0].id }))
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value === '' ? null : Number(value) || value,
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setError(null)
    setSending(true)
    const payload = {
      tipo_pqrd_id: Number(form.tipo_pqrd_id),
      descripcion: form.descripcion.trim(),
      canal_entrada_id: Number(form.canal_entrada_id),
      anonima: form.anonima,
      usuario_id: form.anonima ? null : (form.usuario_id ? Number(form.usuario_id) : null),
      funcionario_id: null,
    }
    api.crearPqrd(payload)
      .then((pqrd) => navigate(`/pqrd/${pqrd.id}`))
      .catch((e) => {
        setError(e.message)
        setSending(false)
      })
  }

  if (loading) return <p>Cargando formulario...</p>

  return (
    <div className="card">
      <h2>Registrar nueva PQRD</h2>
      {error && <div className="alert alert-error">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Tipo de PQRD *</label>
          <select
            name="tipo_pqrd_id"
            value={form.tipo_pqrd_id}
            onChange={handleChange}
            required
          >
            {tipos.map((t) => (
              <option key={t.id} value={t.id}>{t.nombre}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Descripción *</label>
          <textarea
            name="descripcion"
            value={form.descripcion}
            onChange={handleChange}
            required
            placeholder="Describa su petición, queja, reclamo, denuncia o sugerencia..."
          />
        </div>
        <div className="form-group">
          <label>Canal de entrada *</label>
          <select
            name="canal_entrada_id"
            value={form.canal_entrada_id}
            onChange={handleChange}
            required
          >
            {canales.map((c) => (
              <option key={c.id} value={c.id}>{c.nombre}</option>
            ))}
          </select>
        </div>
        <div className="form-group checkbox-group">
          <input
            type="checkbox"
            name="anonima"
            id="anonima"
            checked={form.anonima}
            onChange={handleChange}
          />
          <label htmlFor="anonima">PQRD anónima</label>
        </div>
        {!form.anonima && (
          <div className="form-group">
            <label>Usuario (titular)</label>
            <select
              name="usuario_id"
              value={form.usuario_id}
              onChange={handleChange}
            >
              <option value="">— Seleccione —</option>
              {usuarios.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.nombre_completo} ({u.numero_documento})
                </option>
              ))}
            </select>
          </div>
        )}
        <div className="mt-2">
          <button type="submit" className="btn btn-primary" disabled={sending}>
            {sending ? 'Enviando...' : 'Registrar PQRD'}
          </button>
        </div>
      </form>
    </div>
  )
}
