import { useParams, Link } from 'react-router-dom'
import { players } from '../data/dummy'
import { getSeasonStats, getGameLog } from '../data/playerStats'
import './PlayerDetail.css'

export default function PlayerDetail() {
  const { id } = useParams()
  const player = players.find((p) => p.id === id)

  if (!player) {
    return (
      <div className="container page-detail">
        <p>선수를 찾을 수 없습니다.</p>
        <Link to="/roster">로스터로 돌아가기</Link>
      </div>
    )
  }

  const season = getSeasonStats(player)
  const gameLog = getGameLog(player)

  return (
    <div className="page-detail">
      <div className="player-hero">
        <div className="container player-hero-inner">
          <div>
            <Link to="/roster" className="back-link">
              ← 로스터
            </Link>
            <div className="player-hero-number">{player.number ? `#${player.number}` : '#-'}</div>
            <h1>{player.name}</h1>
            <div className="player-hero-positions">
              <span className="position-badge offense">{player.positions.offense}</span>
              <span className="position-badge defense">{player.positions.defense}</span>
            </div>
            <p className="player-hero-meta">
              {player.year}학번 · {player.height ? `${player.height}cm` : '-'} /{' '}
              {player.weight ? `${player.weight}kg` : '-'}
            </p>
          </div>
        </div>
      </div>

      <div className="container">
        <section className="section">
          <h3 className="section-title">시즌 누적 스탯 ({season.category})</h3>
          <div className="season-stats">
            {season.stats.map((stat) => (
              <div key={stat.name} className="season-stat-box">
                <span className="season-stat-value">{stat.value}</span>
                <span className="season-stat-name">{stat.name}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="section">
          <h3 className="section-title">경기별 스탯</h3>
          <table className="gamelog-table">
            <thead>
              <tr>
                <th>날짜</th>
                <th>상대</th>
                {gameLog[0]?.stats.map((stat) => <th key={stat.name}>{stat.name}</th>)}
              </tr>
            </thead>
            <tbody>
              {gameLog.map((log) => (
                <tr key={log.gameId}>
                  <td>
                    <Link to={`/games/${log.gameId}`}>{log.date}</Link>
                  </td>
                  <td>{log.opponent}</td>
                  {log.stats.map((stat) => <td key={stat.name}>{stat.value}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  )
}
