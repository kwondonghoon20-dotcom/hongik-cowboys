import { useState, useRef, useEffect } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import './Navbar.css'

const links = [
  { to: '/', label: '홈' },
  { to: '/games', label: '경기' },
  { to: '/season', label: '시즌' },
  { to: '/roster', label: '로스터' },
]

const betaLinks = [
  { to: '/tactics', label: '전술판' },
  { to: '/coverage-quiz', label: '커버리지 훈련' },
  { to: '/compare', label: '스탯 비교' },
]

export default function Navbar({ darkMode, toggleDark }) {
  const [open, setOpen] = useState(false)
  const [betaOpen, setBetaOpen] = useState(false)
  const location = useLocation()
  const betaWrapRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(e) {
      if (betaWrapRef.current && !betaWrapRef.current.contains(e.target)) {
        setBetaOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function toggleHamburger() {
    setOpen((v) => {
      const next = !v
      if (!next) setBetaOpen(false)
      return next
    })
  }

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <NavLink to="/" className="navbar-logo" onClick={() => setOpen(false)}>
          HONGIK <span>COWBOYS</span>
        </NavLink>
        <div className="navbar-right">
          <button
            className={'navbar-hamburger' + (open ? ' open' : '')}
            onClick={toggleHamburger}
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
          <div className="navbar-beta-wrap" ref={betaWrapRef}>
            <button
              type="button"
              className={'navbar-link navbar-beta-trigger' + (betaLinks.some((l) => location.pathname.startsWith(l.to)) ? ' active' : '')}
              onClick={() => setBetaOpen((v) => !v)}
            >
              Beta <span className="navbar-beta-caret">{betaOpen ? '▲' : '▼'}</span>
            </button>
            {betaOpen && (
              <div className="navbar-beta-menu">
                {betaLinks.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    className={({ isActive }) => 'navbar-beta-item' + (isActive ? ' active' : '')}
                    onClick={() => { setBetaOpen(false); setOpen(false) }}
                  >
                    {link.label}
                    <span className="beta-badge">BETA</span>
                  </NavLink>
                ))}
              </div>
            )}
          </div>
          <button
            className="theme-toggle"
            onClick={toggleDark}
            aria-label="테마 전환"
          >
            {darkMode ? '라이트 모드' : '다크 모드'}
          </button>
        </nav>
      </div>
    </header>
  )
}
