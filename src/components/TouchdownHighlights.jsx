import { getTouchdownPlays } from '../utils/parseExcel'
import TouchdownFieldDiagram from './TouchdownFieldDiagram'
import './TouchdownHighlights.css'

export default function TouchdownHighlights({ game }) {
  if (!Array.isArray(game.plays) || game.plays.length === 0) return null

  const tdPlays = getTouchdownPlays(game.plays)
  if (tdPlays.length === 0) return null

  return (
    <section className="section">
      <h3 className="section-title">터치다운 하이라이트</h3>
      <div className="td-highlights-grid">
        {tdPlays.map((play, idx) => (
          <TouchdownFieldDiagram key={idx} play={play} game={game} />
        ))}
      </div>
    </section>
  )
}
