import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import './Navbar.css'

const links = [
  { to: '/', label: '홈' },
  { to: '/games', label: '경기' },
  { to: '/season', label: '시즌' },
  { to: '/tactics', label: '전술판' },
  { to: '/roster', label: '로스터' },
  { to: '/compare', label: '스탯 비교' },
]

export default function Navbar({ darkMode, toggleDark }) {
  const [open, setOpen] = useState(false)

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <NavLink to="/" className="navbar-logo" onClick={() => setOpen(false)}>
          HONGIK <span>COWBOYS</span>
        </NavLink>
        <div className="navbar-right">
          <button
            className="theme-toggle"
            onClick={toggleDark}
            aria-label="테마 전환"
          >
            {darkMode ? '☀️' : '🌙'}
          </button>
          <button
            className={'navbar-hamburger' + (open ? ' open' : '')}
            onClick={() => setOpen((v) => !v)}
            aria-label="메뉴 열기"
          >
            <span /><span /><span />
          </button>
        </div>
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
