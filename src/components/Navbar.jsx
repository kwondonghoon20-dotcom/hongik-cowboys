import { NavLink } from 'react-router-dom'
import './Navbar.css'

const links = [
  { to: '/', label: '홈' },
  { to: '/games', label: '경기' },
  { to: '/roster', label: '로스터' },
]

export default function Navbar() {
  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <NavLink to="/" className="navbar-logo">
          HONGIK <span>COWBOYS</span>
        </NavLink>
        <nav className="navbar-links">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) => 'navbar-link' + (isActive ? ' active' : '')}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  )
}
