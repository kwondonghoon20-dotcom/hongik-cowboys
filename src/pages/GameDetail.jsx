import { useParams, Link } from 'react-router-dom'
import { getGameById } from '../data/gameRepository'
import './GameDetail.css'

const STAT_ROWS = [
  { key: 'totalYards', label: '총 오펜스 야드' },
  { key: 'rushYards', label: '러시 야드' },
  { key: 'passYards', label: '패스 야드' },
  { key: 'turnovers', label: '턴오버' },
  { key: 'thirdDown', label: '3rd Down 성공률' },
]

export default function GameDetail() {
  const { id } = useParams()
  const game = getGameById(id)

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

        {game.mvp && (
          <section className="section">
            <h3 className="section-title">이 경기의 MVP</h3>
            <Link to={game.mvp.id ? `/roster/${game.mvp.id}` : '#'} className="mvp-card">
              <div className="mvp-number">#{game.mvp.number}</div>
              <div className="mvp-info">
                <h3>{game.mvp.name}</h3>
                <span className="mvp-position">{game.mvp.position}</span>
                <p className="mvp-highlight">{game.mvp.highlight}</p>
              </div>
            </Link>
          </section>
        )}

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
