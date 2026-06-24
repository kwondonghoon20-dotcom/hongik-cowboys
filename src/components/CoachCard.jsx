import './CoachCard.css'

export default function CoachCard({ coach, large = false }) {
  return (
    <div className={'coach-card' + (large ? ' large' : '')}>
      <div className="coach-photo-placeholder">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm0 2c-4.4 0-9 2.2-9 5v2h18v-2c0-2.8-4.6-5-9-5Z" />
        </svg>
      </div>
      <span className="coach-role">{coach.role}</span>
      <h3 className="coach-name">{coach.name}</h3>
      <div className="coach-meta">
        <span>{coach.year}학번</span>
        {coach.isOB && <span className="ob-badge">OB</span>}
      </div>
    </div>
  )
}
