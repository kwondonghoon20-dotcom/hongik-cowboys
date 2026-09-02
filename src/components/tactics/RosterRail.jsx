import { players } from '../../data/dummy'
import './RosterRail.css'

const OFFENSE_ORDER = ['QB', 'WR', 'RB', 'TE', 'OL']
const DEFENSE_ORDER = ['DL', 'LB', 'DB']

export default function RosterRail({ side, onSideChange, placedIds, onTogglePlayer, playerCount }) {
  const order = side === 'offense' ? OFFENSE_ORDER : DEFENSE_ORDER
  const posKey = side === 'offense' ? 'offense' : 'defense'

  const grouped = {}
  order.forEach((pos) => { grouped[pos] = [] })

  players.forEach((p) => {
    const pos = p.positions[posKey]
    if (!grouped[pos]) grouped[pos] = []
    grouped[pos].push(p)
  })

  const isOver = playerCount > 11

  return (
    <div className="roster-rail">
      <div className="roster-tabs">
        <button
          className={'roster-tab' + (side === 'offense' ? ' active' : '')}
          onClick={() => onSideChange('offense')}
        >
          오펜스
        </button>
        <button
          className={'roster-tab' + (side === 'defense' ? ' active' : '')}
          onClick={() => onSideChange('defense')}
        >
          디펜스
        </button>
      </div>
      <div className={'roster-count' + (isOver ? ' over' : '')}>
        필드 위 {playerCount} / 11{isOver && ' · 인원 초과'}
      </div>
      <div className="roster-player-list">
        {order.map((pos) => {
          const group = grouped[pos] || []
          if (group.length === 0) return null
          return (
            <div key={pos}>
              <div className="roster-group-label">{pos}</div>
              {group.map((player) => {
                const isPlaced = placedIds.has(player.id)
                return (
                  <div
                    key={player.id}
                    className={'roster-player-row' + (isPlaced ? ' placed' : '')}
                    onClick={() => onTogglePlayer(player)}
                  >
                    <div className={'roster-player-indicator' + (isPlaced ? ' placed' : '')} />
                    <span className="roster-player-number">
                      #{player.number != null ? player.number : '–'}
                    </span>
                    <span className="roster-player-name">{player.name}</span>
                    <span className="roster-player-meta">
                      {player.grade}학년 {player.year}학번
                    </span>
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>
    </div>
  )
}
