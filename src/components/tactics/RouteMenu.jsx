import { useState } from 'react'
import { ROUTES } from '../../data/routes'
import './RouteMenu.css'

const GROUPS = [
  { key: 'pass', label: '패스' },
  { key: 'run', label: '런' },
  { key: 'block', label: '블로킹' },
]

export default function RouteMenu({ player, assignment, onSetRoute, onClearRoute, onFlip }) {
  const [activeGroup, setActiveGroup] = useState('pass')

  if (!player) return null

  const routesInGroup = Object.entries(ROUTES).filter(([, r]) => r.group === activeGroup)
  const currentRoute = assignment?.route ?? null

  return (
    <div className="route-menu">
      <div className="route-menu-header">
        <span>선택: {player.name}</span>
        <span className="route-menu-number">
          #{player.number != null ? player.number : '–'}
        </span>
      </div>
      <div className="route-group-tabs">
        {GROUPS.map(({ key, label }) => (
          <button
            key={key}
            className={'route-group-tab' + (activeGroup === key ? ' active' : '')}
            onClick={() => setActiveGroup(key)}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="route-btns">
        {routesInGroup.map(([key, route]) => (
          <button
            key={key}
            className={'route-btn' + (currentRoute === key ? ' active' : '')}
            onClick={() => onSetRoute(key)}
          >
            {route.label}
          </button>
        ))}
      </div>
      <div className="route-actions">
        <button
          className={'route-btn' + (assignment?.flip ? ' active' : '')}
          onClick={onFlip}
        >
          ↔ 좌우 반전
        </button>
        <button className="route-btn" onClick={onClearRoute}>
          라우트 없음
        </button>
      </div>
    </div>
  )
}
