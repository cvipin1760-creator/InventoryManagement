import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import './Layout.css'
import { useAuth } from '../context/AuthContext'

export default function Layout() {
  const { username, role, logout } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `nav-link ${isActive ? 'active' : ''}`

  const toggleMenu = () => setMenuOpen(!menuOpen)
  const closeMenu = () => setMenuOpen(false)

  return (
    <div className="layout">
      <button className="mobile-menu-toggle" onClick={toggleMenu} aria-label="Toggle Menu">
        <span className={`hamburger ${menuOpen ? 'open' : ''}`}></span>
      </button>

      <aside className={`sidebar ${menuOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h1 className="logo">StockPilot</h1>
          <span className="logo-sub">Spare Parts</span>
        </div>
        <nav className="nav" onClick={closeMenu}>
          <NavLink to="/dashboard" className={navLinkClass}>Dashboard</NavLink>
          <NavLink to="/customers" className={navLinkClass}>Customers</NavLink>
          <NavLink to="/suppliers" className={navLinkClass}>Suppliers</NavLink>
          <NavLink to="/products" className={navLinkClass}>Products</NavLink>
          <NavLink to="/bills" className={navLinkClass}>Bills</NavLink>
          <NavLink to="/payments" className={navLinkClass}>Payments</NavLink>
          <NavLink to="/purchases" className={navLinkClass}>Purchases</NavLink>
          <NavLink to="/bills/new" className={navLinkClass}>New Bill</NavLink>
          <NavLink to="/purchases/new" className={navLinkClass}>New Purchase</NavLink>
          {(role === 'ADMIN' || username === 'admin') && <NavLink to="/users" className={navLinkClass}>Users</NavLink>}
        </nav>
        <div className="sidebar-footer">
          <span className="user">{username}</span>
          <button type="button" className="btn btn-ghost" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </aside>

      {menuOpen && <div className="mobile-overlay" onClick={closeMenu}></div>}

      <main className="main">
        <Outlet />
      </main>
    </div>
  )
}
