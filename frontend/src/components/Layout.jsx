import { Outlet, Link } from 'react-router-dom'

export default function Layout() {
  return (
    <div className="layout">
      <header className="layout-header">
        <h1>Sistema PQRD EPS</h1>
        <nav className="layout-nav">
          <Link to="/">Inicio</Link>
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/pqrd">Listado PQRD</Link>
          <Link to="/pqrd/nueva">Nueva PQRD</Link>
          <Link to="/usuarios">Usuarios</Link>
        </nav>
      </header>
      <main className="layout-main">
        <Outlet />
      </main>
    </div>
  )
}
