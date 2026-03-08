/**
 * Cliente API para el backend FastAPI.
 * Con proxy en desarrollo: /api -> http://127.0.0.1:8000
 */
const API_BASE = import.meta.env.DEV ? '/api' : '/api';

async function request(path, options = {}) {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || JSON.stringify(err));
  }
  return res.json();
}

export const api = {
  // Maestros
  getTiposPqrd: () => request('/maestros/tipos-pqrd'),
  getEstados: () => request('/maestros/estados'),
  getCanalesEntrada: () => request('/maestros/canales-entrada'),

  // Usuarios
  getUsuarios: () => request('/usuarios'),
  crearUsuario: (data) => request('/usuarios', { method: 'POST', body: JSON.stringify(data) }),

  // PQRD
  getPqrd: () => request('/pqrd'),
  getPqrdById: (id) => request(`/pqrd/${id}`),
  getHistorico: (id) => request(`/pqrd/${id}/historico`),
  crearPqrd: (data) => request('/pqrd', { method: 'POST', body: JSON.stringify(data) }),
  cerrarPqrd: (id) => request(`/pqrd/${id}/cerrar`, { method: 'PUT' }),
  reabrirPqrd: (id, motivo = '') =>
    request(`/pqrd/${id}/reabrir?motivo=${encodeURIComponent(motivo)}`, { method: 'PUT' }),
};
