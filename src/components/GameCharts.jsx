import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { getQuarterPlayCounts, getPenaltyStats, getTopRushers } from '../utils/parseExcel'
import { players } from '../data/dummy'
import './GameCharts.css'

const SCARLET = '#CC0000'
const CHARCOAL_GRAY = '#888888'

const TICK_STYLE = { fill: '#ccc', fontSize: 12 }
const TOOLTIP_STYLE = {
  contentStyle: { background: '#242424', border: '1px solid #444', color: '#fff' },
  labelStyle: { color: '#fff' },
}

function buildStatComparison(game) {
  const { home, away } = game.teamStats
  return [
    { category: '총 오펜스 야드', home: home.totalYards, away: away.totalYards },
    { category: '러시 야드', home: home.rushYards, away: away.rushYards },
    { category: '패스 야드', home: home.passYards, away: away.passYards },
    { category: '턴오버', home: home.turnovers, away: away.turnovers },
  ]
}

function approximateQuarterCounts(game) {
  const labels = ['Q1', 'Q2', 'Q3', 'Q4']
  // 더미 playLog는 하이라이트성 기록이라 PlayType이 없으므로, 설명 텍스트로 스페셜팀 플레이(필드골 등)만 걸러낸다.
  const scrimmagePlays = game.playLog.filter((play) => !play.description.includes('필드골'))
  return labels.map((label, idx) => {
    const quarterPlays = scrimmagePlays.filter((play) => play.quarter === idx + 1)
    return {
      quarter: label,
      home: quarterPlays.filter((play) => play.team === game.homeTeam).length,
      away: quarterPlays.filter((play) => play.team === game.awayTeam).length,
    }
  })
}

// 더미 playLog에는 패널티 기록이 없어 항상 0으로 처리한다.
function approximatePenaltyStats(game) {
  return {
    home: { team: game.homeTeam, count: 0, yards: 0 },
    away: { team: game.awayTeam, count: 0, yards: 0 },
  }
}

function approximateTopRushers(game) {
  const yardsByName = new Map()
  for (const play of game.playLog) {
    if (play.team !== game.homeTeam || !play.description.includes('런')) continue
    const name = play.description.split(' ')[0]
    yardsByName.set(name, (yardsByName.get(name) ?? 0) + play.yards)
  }

  return [...yardsByName.entries()]
    .map(([name, yards]) => {
      const player = players.find((p) => p.name === name)
      return { label: player ? `#${player.number}` : name, yards }
    })
    .sort((a, b) => b.yards - a.yards)
    .slice(0, 5)
}

export default function GameCharts({ game }) {
  const hasRawPlays = Array.isArray(game.plays) && game.plays.length > 0
  const teamNameOf = (seriesKey) => (seriesKey === 'home' ? game.homeTeam : game.awayTeam)

  const statComparison = buildStatComparison(game)

  const quarterCounts = hasRawPlays
    ? getQuarterPlayCounts(game.plays, game.homeTeam, game.awayTeam)
    : approximateQuarterCounts(game)

  const penaltyStats = hasRawPlays
    ? getPenaltyStats(game.plays, game.homeTeam, game.awayTeam)
    : approximatePenaltyStats(game)

  const penaltyComparison = [
    { metric: '횟수', home: penaltyStats.home.count, away: penaltyStats.away.count },
    { metric: '야드', home: penaltyStats.home.yards, away: penaltyStats.away.yards },
  ]

  const topRushers = hasRawPlays
    ? getTopRushers(game.plays, game.homeTeam, 5).map((r) => ({ label: `#${r.number}`, yards: r.yards }))
    : approximateTopRushers(game)

  return (
    <section className="section">
      <h3 className="section-title">경기 분석</h3>
      <div className="charts-grid">
        <div className="chart-card">
          <h4 className="chart-title">팀 스탯 비교</h4>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={statComparison} layout="vertical" margin={{ left: 16 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis type="number" tick={TICK_STYLE} />
              <YAxis type="category" dataKey="category" tick={TICK_STYLE} width={100} />
              <Tooltip {...TOOLTIP_STYLE} formatter={(value, name) => [value, teamNameOf(name)]} />
              <Legend wrapperStyle={{ color: '#ccc' }} formatter={teamNameOf} />
              <Bar dataKey="home" name="home" fill={SCARLET} />
              <Bar dataKey="away" name="away" fill={CHARCOAL_GRAY} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h4 className="chart-title">쿼터별 플레이 수</h4>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={quarterCounts}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="quarter" tick={TICK_STYLE} />
              <YAxis tick={TICK_STYLE} allowDecimals={false} />
              <Tooltip {...TOOLTIP_STYLE} formatter={(value, name) => [value, teamNameOf(name)]} />
              <Legend wrapperStyle={{ color: '#ccc' }} formatter={teamNameOf} />
              <Bar dataKey="home" name="home" fill={SCARLET} />
              <Bar dataKey="away" name="away" fill={CHARCOAL_GRAY} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h4 className="chart-title">패널티 비교</h4>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={penaltyComparison}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="metric" tick={TICK_STYLE} />
              <YAxis tick={TICK_STYLE} allowDecimals={false} />
              <Tooltip {...TOOLTIP_STYLE} formatter={(value, name) => [value, teamNameOf(name)]} />
              <Legend wrapperStyle={{ color: '#ccc' }} formatter={teamNameOf} />
              <Bar dataKey="home" name="home" fill={SCARLET} />
              <Bar dataKey="away" name="away" fill={CHARCOAL_GRAY} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h4 className="chart-title">{game.homeTeam} 러시 야드 TOP 5</h4>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={topRushers} layout="vertical" margin={{ left: 16 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis type="number" tick={TICK_STYLE} />
              <YAxis type="category" dataKey="label" tick={TICK_STYLE} width={60} />
              <Tooltip {...TOOLTIP_STYLE} />
              <Bar dataKey="yards" name="러시 야드" fill={SCARLET} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  )
}
