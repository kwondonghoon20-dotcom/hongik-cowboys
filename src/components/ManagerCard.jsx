import './ManagerCard.css'

export default function ManagerCard({ manager }) {
  return (
    <div className="manager-card">
      <div className="manager-photo-placeholder">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm0 2c-4.4 0-9 2.2-9 5v2h18v-2c0-2.8-4.6-5-9-5Z" />
        </svg>
      </div>
      <h3 className="manager-name">{manager.name}</h3>
      <span className="manager-year">{manager.year}학번</span>
    </div>
  )
}
