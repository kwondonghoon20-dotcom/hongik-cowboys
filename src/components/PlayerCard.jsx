import { Link } from 'react-router-dom'
import { getPlayerStatus } from '../data/playerStatus'
import './PlayerCard.css'

const STATUS_LABEL = { out: '결장', questionable: '출전불투명' }

export default function PlayerCard({ player }) {
  const { status } = getPlayerStatus(player.id)

  return (
    <Link to={`/roster/${player.id}`} className="player-card">
      {status !== 'healthy' && (
        <span className={'player-status-badge ' + status}>{STATUS_LABEL[status]}</span>
      )}
      <div className="player-photo-placeholder">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm0 2c-4.4 0-9 2.2-9 5v2h18v-2c0-2.8-4.6-5-9-5Z" />
        </svg>
      </div>
      <div className="player-card-number">{player.number ? `#${player.number}` : '#-'}</div>
      <h3 className="player-card-name">{player.name}</h3>
      <div className="player-card-positions">
        <span className="position-badge offense">{player.positions.offense}</span>
        <span className="position-badge defense">{player.positions.defense}</span>
        {player.positions?.special && (
          <span className="position-badge special">{player.positions.special}</span>
        )}
      </div>
      <div className="player-card-meta">
        <span>
          {player.grade}학년 · {player.year}학번
        </span>
        <span>
          {player.height ? `${player.height}cm` : '-'} / {player.weight ? `${player.weight}kg` : '-'}
        </span>
      </div>
    </Link>
  )
}
