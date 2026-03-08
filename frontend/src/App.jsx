import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import ListaPQRD from './pages/ListaPQRD'
import NuevaPQRD from './pages/NuevaPQRD'
import VerPQRD from './pages/VerPQRD'
import ListaUsuarios from './pages/ListaUsuarios'
import NuevoUsuario from './pages/NuevoUsuario'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="pqrd" element={<ListaPQRD />} />
        <Route path="pqrd/nueva" element={<NuevaPQRD />} />
        <Route path="pqrd/:id" element={<VerPQRD />} />
        <Route path="usuarios" element={<ListaUsuarios />} />
        <Route path="usuarios/nuevo" element={<NuevoUsuario />} />
      </Route>
    </Routes>
  )
}
