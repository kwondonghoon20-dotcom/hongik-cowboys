import { players } from '../../data/dummy'
import './RosterRail.css'

const OFFENSE_ORDER = ['QB', 'WR', 'RB', 'TE', 'OL']
const DEFENSE_ORDER = ['DL', 'LB', 'DB']

export default function RosterRail({
  side,
  onSideChange,
  placedOffenseIds,
  placedDefenseIds,
  onTogglePlayer,
  playerCount,
  dualCount,
}) {
  const order = side === 'offense' ? OFFENSE_ORDER : DEFENSE_ORDER
  const posKey = side === 'offense' ? 'offense' : 'defense'
  const placedIds = side === 'offense' ? placedOffenseIds : placedDefenseIds
  const otherIds = side === 'offense' ? placedDefenseIds : placedOffenseIds
  const otherLabel = side === 'offense' ? 'D' : 'O'

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
        <span className="roster-dual-count"> · 양면 출전 {dualCount}명</span>
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
                const isOnOtherSide = otherIds.has(player.id)
                return (
                  <div
                    key={player.id}
                    className={'roster-player-row' + (isPlaced ? ' placed' : '') + (side === 'defense' ? ' defense' : '')}
                    onClick={() => onTogglePlayer(player)}
                  >
                    <div className={'roster-player-indicator' + (isPlaced ? ' placed' : '') + (isPlaced && side === 'defense' ? ' defense' : '')} />
                    <span className="roster-player-number">
                      #{player.number != null ? player.number : '–'}
                    </span>
                    <span className="roster-player-name">{player.name}</span>
                    {isOnOtherSide && (
                      <span className="roster-player-badge">{otherLabel}</span>
                    )}
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
