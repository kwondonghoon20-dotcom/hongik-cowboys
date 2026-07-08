import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import './Navbar.css'

const links = [
  { to: '/', label: '홈' },
  { to: '/games', label: '경기' },
  { to: '/roster', label: '로스터' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <NavLink to="/" className="navbar-logo" onClick={() => setOpen(false)}>
          HONGIK <span>COWBOYS</span>
        </NavLink>
        <button
          className={'navbar-hamburger' + (open ? ' open' : '')}
          onClick={() => setOpen((v) => !v)}
          aria-label="메뉴 열기"
        >
          <span /><span /><span />
        </button>
        <nav className={'navbar-links' + (open ? ' open' : '')}>
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) => 'navbar-link' + (isActive ? ' active' : '')}
              onClick={() => setOpen(false)}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  )
}
