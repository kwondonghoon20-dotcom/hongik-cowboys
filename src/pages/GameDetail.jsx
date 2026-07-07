import { useParams, Link } from 'react-router-dom'
import { getGameById, useGlobGames } from '../data/gameRepository'
import { pickOffenseMvp, pickDefenseMvp } from '../utils/parseExcel'
import { players } from '../data/dummy'
import GameCharts from '../components/GameCharts'
import './GameDetail.css'

function findPlayer(number) {
  return players.find((p) => String(p.number) === String(number))
}

const STAT_ROWS = [
  { key: 'totalYards', label: '총 오펜스 야드' },
  { key: 'rushYards', label: '러시 야드' },
  { key: 'passYards', label: '패스 야드' },
  { key: 'turnovers', label: '턴오버' },
  { key: 'thirdDown', label: '3rd Down 성공률' },
  { key: 'totalPlays', label: '총 플레이 수' },
  { key: 'rushAttempts', label: '러시 시도' },
  { key: 'passAttempts', label: '패스 시도' },
]

export default function GameDetail() {
  const { id } = useParams()
  const globGames = useGlobGames()
  const game = getGameById(id) ?? globGames.find((g) => g.id === id) ?? null

  if (!game) {
    return (
      <div className="container page-detail">
        <p>경기를 찾을 수 없습니다.</p>
        <Link to="/games">목록으로 돌아가기</Link>
      </div>
    )
  }

  return (
    <div className="page-detail">
      <div className="scoreboard">
        <div className="container">
          <Link to="/games" className="back-link">
            ← 경기 목록
          </Link>
          <div className="scoreboard-meta">
            <span className="badge">{game.gameType}</span>
            <span>{game.date}</span>
            <span>{game.venue}</span>
          </div>
          <div className="scoreboard-main">
            <div className="scoreboard-team">
              <h2>{game.homeTeam}</h2>
              <span className="scoreboard-tag">HOME</span>
            </div>
            <div className="scoreboard-score">
              {game.homeScore} <span className="scoreboard-dash">:</span> {game.awayScore}
            </div>
            <div className="scoreboard-team">
              <h2>{game.awayTeam}</h2>
              <span className="scoreboard-tag">AWAY</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        <section className="section">
          <h3 className="section-title">팀 스탯 비교</h3>
          <table className="stats-table">
            <thead>
              <tr>
                <th>{game.homeTeam}</th>
                <th></th>
                <th>{game.awayTeam}</th>
              </tr>
            </thead>
            <tbody>
              {STAT_ROWS.map((row) => (
                <tr key={row.key}>
                  <td>{game.teamStats.home[row.key]}</td>
                  <td className="stats-table-label">{row.label}</td>
                  <td>{game.teamStats.away[row.key]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {Array.isArray(game.plays) && game.plays.length > 0 && (() => {
          const offMvp = pickOffenseMvp(game.plays, game.homeTeam)
          const defMvp = pickDefenseMvp(game.plays, game.homeTeam)
          const offPlayer = offMvp ? findPlayer(offMvp.number) : null
          const defPlayer = defMvp ? findPlayer(defMvp.number) : null

          return (
            <section className="section">
              <h3 className="section-title">이 경기의 MVP</h3>
              <div className="mvp-grid">
                {offMvp && (
                  <Link to={offPlayer ? `/roster/${offPlayer.id}` : '#'} className="mvp-card">
                    <div className="mvp-badge">⚔️ 오펜스</div>
                    <div className="mvp-info">
                      <div className="mvp-name">{offPlayer ? offPlayer.name : `#${offMvp.number}`}</div>
                      <div className="mvp-meta">
                        {[offMvp.position, `#${offMvp.number}`].filter(Boolean).join(' · ')}
                      </div>
                      <div className="mvp-divider" />
                      <div className="mvp-stats">
                        {offMvp.passYards > 0 && (
                          <div>Passing: {offMvp.completions}/{offMvp.passAttempts} comp · {offMvp.passYards} yds · {offMvp.passTD} TD · {offMvp.passINT} INT</div>
                        )}
                        {offMvp.rushYards > 0 && (
                          <div>Rushing: {offMvp.rushAttempts} car · {offMvp.rushYards} yds · {offMvp.rushTD} TD</div>
                        )}
                        {offMvp.recYards > 0 && (
                          <div>Receiving: {offMvp.receptions} rec · {offMvp.recYards} yds · {offMvp.recTD} TD</div>
                        )}
                        <div className="mvp-total">Total {offMvp.total} yds</div>
                      </div>
                    </div>
                  </Link>
                )}
                {defMvp && (
                  <Link to={defPlayer ? `/roster/${defPlayer.id}` : '#'} className="mvp-card">
                    <div className="mvp-badge">🛡️ 디펜스</div>
                    <div className="mvp-info">
                      <div className="mvp-name">{defPlayer ? defPlayer.name : `#${defMvp.number}`}</div>
                      <div className="mvp-meta">
                        {[defMvp.position, `#${defMvp.number}`].filter(Boolean).join(' · ')}
                      </div>
                      <div className="mvp-divider" />
                      <div className="mvp-stats">
                        <div>Tackles: {defMvp.tackles}</div>
                        {defMvp.sacks > 0 && <div>Sacks: {defMvp.sacks}</div>}
                        {defMvp.tfl > 0 && <div>TFL: {defMvp.tfl}</div>}
                        {defMvp.interceptions > 0 && <div>Interceptions: {defMvp.interceptions}</div>}
                        {defMvp.fumbleRec > 0 && <div>Fumble Recoveries: {defMvp.fumbleRec}</div>}
                        {defMvp.turnoversForced > 0 && (
                          <div className="mvp-total">Turnovers Forced: {defMvp.turnoversForced}</div>
                        )}
                      </div>
                    </div>
                  </Link>
                )}
              </div>
            </section>
          )
        })()}

        <GameCharts game={game} />

        <section className="section">
          <h3 className="section-title">플레이 로그</h3>
          <table className="playlog-table">
            <thead>
              <tr>
                <th>쿼터</th>
                <th>시간</th>
                <th>팀</th>
                <th>플레이</th>
              </tr>
            </thead>
            <tbody>
              {game.playLog.map((play, idx) => (
                <tr key={idx}>
                  <td>{play.quarter != null ? `Q${play.quarter}` : '-'}</td>
                  <td>{play.time}</td>
                  <td>{play.team}</td>
                  <td>{play.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  )
}
