import {
  BarChart, Bar, Cell, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ReferenceLine,
} from 'recharts'
import {
  getPenaltyStats, getPlayerTotalYards,
  getDriveMomentum, getKeyStats,
} from '../utils/parseExcel'
import './GameCharts.css'

const SCARLET = '#CC0000'
const CHARCOAL_GRAY = '#888888'

const TICK_STYLE = { fill: '#ccc', fontSize: 12 }
const TOOLTIP_STYLE = {
  contentStyle: { background: '#242424', border: '1px solid #444', color: '#fff' },
  labelStyle: { color: '#fff' },
}

const TEAM_ABBR_MAP = {
  gunwipheonix: 'PH',
  samsungbt: 'BT',
  samsungbluestorm: 'BT',
  hicowboys: 'HIC',
}

function teamAbbr(teamName) {
  const key = String(teamName ?? '').toLowerCase().replace(/[^a-z0-9]/g, '')
  return TEAM_ABBR_MAP[key] ?? String(teamName ?? '').replace(/[^a-zA-Z가-힣]/g, '').slice(0, 3).toUpperCase()
}

function PlayerTooltip({ active, payload, topPlayers }) {
  if (!active || !payload?.length) return null
  const p = topPlayers.find((r) => r.label === payload[0]?.payload?.label)
  if (!p) return null

  const {
    number, team,
    rushAttempts, rushYards, rushTD,
    receptions, recYards, recTD,
    passAttempts, completions, passYards, passTD, passINT,
    scrimmageYards,
  } = p
  const abbr = teamAbbr(team)
  const divider = { borderTop: '1px solid #333', margin: '8px 0' }
  const lbl = { color: '#888', paddingRight: 14, paddingBottom: 4, whiteSpace: 'nowrap' }

  const showPassing = passAttempts > 0
  const showRushing = rushAttempts > 0
  const showReceiving = receptions > 0 || (p.recTargets ?? 0) > 0

  return (
    <div style={{
      background: '#1a1a1a', border: '1px solid #333', borderRadius: 6,
      padding: 12, fontSize: 13, color: '#ddd', minWidth: 240,
    }}>
      <div style={{ color: SCARLET, fontWeight: 700, fontSize: 15, marginBottom: 8 }}>
        #{number} <span style={{ color: '#aaa', fontWeight: 400 }}>({abbr})</span>
      </div>
      <div style={divider} />
      <table style={{ borderCollapse: 'collapse' }}>
        <tbody>
          {showPassing && (
            <tr>
              <td style={lbl}>Passing</td>
              <td style={{ paddingBottom: 4 }}>{completions}/{passAttempts} comp, {passYards} yds, {passTD} TD, {passINT} INT</td>
            </tr>
          )}
          {showRushing && (
            <tr>
              <td style={lbl}>Rushing</td>
              <td style={{ paddingBottom: 4 }}>{rushAttempts} carries, {rushYards} yds, {rushTD} TD</td>
            </tr>
          )}
          {showReceiving && (
            <tr>
              <td style={lbl}>Receiving</td>
              <td style={{ paddingBottom: 4 }}>{receptions} rec, {recYards} yds, {recTD} TD</td>
            </tr>
          )}
        </tbody>
      </table>
      <div style={divider} />
      <span style={{ color: SCARLET, fontWeight: 600 }}>Scrimmage</span>
      &nbsp;&nbsp;{scrimmageYards} yds
    </div>
  )
}

// 더미 playLog에는 패널티 기록이 없어 항상 0으로 처리한다.
function approximatePenaltyStats(game) {
  return {
    home: { team: game.homeTeam, count: 0, yards: 0 },
    away: { team: game.awayTeam, count: 0, yards: 0 },
  }
}


// ── Drive 전진 거리 차트 ────────────────────────────────────────────────────

function XMark({ cx, cy, color }) {
  return (
    <g>
      <line x1={cx - 5} y1={cy - 5} x2={cx + 5} y2={cy + 5} stroke={color} strokeWidth={2.5} />
      <line x1={cx + 5} y1={cy - 5} x2={cx - 5} y2={cy + 5} stroke={color} strokeWidth={2.5} />
    </g>
  )
}

function DriveEventDot(props) {
  const { cx, cy, payload } = props
  const event = payload?.event
  if (!event || cx == null || cy == null) return null

  if (event === 'TD') return <circle cx={cx} cy={cy} r={6} fill="#FFD700" stroke="#000" strokeWidth={1} />
  if (event === 'FG') return <circle cx={cx} cy={cy} r={5} fill="#00BFFF" stroke="#000" strokeWidth={1} />
  // 인터셉트/펌블/턴오버/다운 실패 → 모두 빨간 X로 통합
  if (event === 'INTERCEPT' || event === 'FUMBLE' || event === 'TURNOVER' || event === 'DOWN_FAIL') {
    return <XMark cx={cx} cy={cy} color="#FF6B00" />
  }
  if (event === 'PUNT') return (
    <polygon points={`${cx},${cy + 6} ${cx - 5},${cy - 3} ${cx + 5},${cy - 3}`} fill="#AAA" />
  )
  if (event === 'DOWN_FAIL') return (
    <rect x={cx - 5} y={cy - 5} width={10} height={10} fill="#888" rx={1} />
  )
  return null
}

function driveResultText(d) {
  const g = d.gainYard ?? 0
  const sign = g >= 0 ? '+' : ''
  if (!d.event) return `${sign}${g}야드`
  if (d.event === 'TD') return '터치다운!'
  if (d.event === 'FG') return `필드골 성공${d.fgDist ? ` (${d.fgDist}야드)` : ''}`
  if (d.event === 'PUNT') return '펀트'
  if (d.event === 'INTERCEPT') return '인터셉트 턴오버'
  if (d.event === 'FUMBLE') return '펌블 턴오버'
  if (d.event === 'TURNOVER') return '턴오버'
  if (d.event === 'DOWN_FAIL') return '4th Down 실패'
  return `${sign}${g}야드`
}

function DriveMomentumChart({ game }) {
  const { points: chartData, quarterBoundaries } = getDriveMomentum(
    game.plays, game.homeTeam, game.awayTeam,
  )

  const dividers = quarterBoundaries.filter((b) => b.quarter > 1)
  const q1Boundary = quarterBoundaries.find((b) => b.quarter === 1)

  return (
    <div className="flow-chart-wrapper chart-card">
      <h4 className="chart-title">드라이브 전진 거리</h4>
      <div className="momentum-legend">
        <span style={{ color: SCARLET }}>■</span> {game.homeTeam}&nbsp;&nbsp;
        <span style={{ color: '#555' }}>■</span> {game.awayTeam}&nbsp;&nbsp;
        <span style={{ color: '#FFD700' }}>●</span> TD&nbsp;
        <span style={{ color: '#00BFFF' }}>●</span> FG&nbsp;
        <span style={{ color: '#FF6B00' }}>✕</span> 턴오버&nbsp;
        <span style={{ color: '#AAA' }}>▽</span> PUNT
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={chartData} margin={{ top: 30, right: 10, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="homeGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={SCARLET} stopOpacity={0.7} />
              <stop offset="95%" stopColor={SCARLET} stopOpacity={0.05} />
            </linearGradient>
            <linearGradient id="awayGrad" x1="0" y1="1" x2="0" y2="0">
              <stop offset="5%" stopColor="#555" stopOpacity={0.7} />
              <stop offset="95%" stopColor="#555" stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
          <XAxis dataKey="index" tick={false} height={0} />
          <YAxis
            domain={[-105, 105]}
            ticks={[-100, -50, 0, 50, 100]}
            tick={{ fill: '#999', fontSize: 10 }}
            tickFormatter={(v) => String(Math.abs(v))}
            width={30}
          />
          <Tooltip
            {...TOOLTIP_STYLE}
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null
              const d = payload[0]?.payload
              if (d.home == null && d.away == null) return null
              const isHome = d.home != null
              const team = isHome ? game.homeTeam : game.awayTeam
              const teamColor = isHome ? SCARLET : '#aaa'
              const eventColors = {
                TD: '#FFD700', FG: '#00BFFF',
                INTERCEPT: SCARLET, FUMBLE: SCARLET, TURNOVER: SCARLET,
                DOWN_FAIL: SCARLET, PUNT: '#AAA',
              }
              const resultStr = driveResultText(d)
              const g = d.gainYard ?? 0
              return (
                <div style={{ ...TOOLTIP_STYLE.contentStyle, padding: '6px 10px', minWidth: 160 }}>
                  <div style={{ color: '#888', fontSize: 11, marginBottom: 4 }}>
                    {d.quarter ? `Q${d.quarter}` : ''}{d.driveNum ? ` · 드라이브 ${d.driveNum}` : ''}
                  </div>
                  <div style={{ color: teamColor, fontWeight: 600 }}>{team}</div>
                  <div style={{ color: '#ddd', fontSize: 12, marginTop: 2 }}>
                    {d.playTypeStr ?? ''}&nbsp;
                    <span style={{ color: g >= 0 ? '#6f6' : '#f66' }}>
                      {g >= 0 ? '+' : ''}{g}야드
                    </span>
                  </div>
                  <div style={{ color: '#bbb', fontSize: 12 }}>
                    필드 위치 {d.fieldPosition != null ? `${d.fieldPosition}야드` : '-'}
                  </div>
                  <div style={{ color: eventColors[d.event] ?? '#ccc', marginTop: 4, fontSize: 12 }}>
                    {resultStr}
                  </div>
                </div>
              )
            }}
          />
          <ReferenceLine y={0} stroke="#fff" strokeWidth={1.5} strokeOpacity={0.3} />
          {q1Boundary != null && (
            <ReferenceLine
              x={q1Boundary.index}
              stroke="transparent"
              label={{ value: 'Q1', fill: '#666', fontSize: 11, position: 'insideTopRight', dy: 14 }}
            />
          )}
          {dividers.map((b) => (
            <ReferenceLine
              key={b.quarter}
              x={b.index}
              stroke="#555"
              strokeDasharray="4 4"
              strokeWidth={1.5}
              label={{ value: `Q${b.quarter}`, fill: '#777', fontSize: 11, position: 'insideTopRight', dy: 14 }}
            />
          ))}
          <Area
            type="monotone"
            dataKey="home"
            stroke={SCARLET}
            strokeWidth={1.5}
            fill="url(#homeGrad)"
            connectNulls={false}
            dot={(props) => <DriveEventDot {...props} />}
            activeDot={false}
            isAnimationActive={false}
          />
          <Area
            type="monotone"
            dataKey="away"
            stroke="#666"
            strokeWidth={1.5}
            fill="url(#awayGrad)"
            connectNulls={false}
            dot={(props) => <DriveEventDot {...props} />}
            activeDot={false}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

// ── Key Stats ────────────────────────────────────────────────────────────────

function KeyStatsPanel({ game }) {
  const stats = getKeyStats(game.plays, game.homeTeam, game.awayTeam)
  const { possession, touchdowns, redZone, thirdDown, turnovers } = stats

  const rows = [
    { label: 'TD', home: touchdowns.home, away: touchdowns.away },
    { label: '레드존 진입', home: redZone.home, away: redZone.away },
    { label: '3rd Down', home: thirdDown.home, away: thirdDown.away },
    { label: '턴오버', home: turnovers.home, away: turnovers.away },
  ]

  return (
    <div className="key-stats-wrapper chart-card">
      <h4 className="chart-title">Key Stats</h4>
      {/* 포제션 바 */}
      <div className="possession-section">
        <div className="possession-label-row">
          <span style={{ color: SCARLET }}>{game.homeTeam}</span>
          <span style={{ color: '#aaa' }}>{game.awayTeam}</span>
        </div>
        <div className="possession-bar">
          <div className="possession-fill home" style={{ width: `${possession.home}%` }} />
          <div className="possession-fill away" style={{ width: `${possession.away}%` }} />
        </div>
        <div className="possession-pct-row">
          <span style={{ color: SCARLET }}>{possession.home}%</span>
          <span style={{ color: '#aaa', fontSize: 11 }}>오펜스 플레이 점유</span>
          <span style={{ color: '#aaa' }}>{possession.away}%</span>
        </div>
      </div>
      {/* 스탯 행 */}
      <div className="key-stats-rows">
        {rows.map((row) => (
          <div key={row.label} className="key-stat-row">
            <span className="ks-home">{row.home}</span>
            <span className="ks-label">{row.label}</span>
            <span className="ks-away">{row.away}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── 경기 흐름 섹션 ─────────────────────────────────────────────────────────

function GameFlowSection({ game }) {
  const hasRawPlays = Array.isArray(game.plays) && game.plays.length > 0
  if (!hasRawPlays) return null

  return (
    <section className="section">
      <h3 className="section-title">경기 흐름</h3>
      <div className="game-flow-layout">
        <DriveMomentumChart game={game} />
        <KeyStatsPanel game={game} />
      </div>
    </section>
  )
}

// ── 기존 차트 4개 ─────────────────────────────────────────────────────────

export default function GameCharts({ game }) {
  const hasRawPlays = Array.isArray(game.plays) && game.plays.length > 0
  const teamNameOf = (seriesKey) => (seriesKey === 'home' ? game.homeTeam : game.awayTeam)

  const penaltyStats = hasRawPlays
    ? getPenaltyStats(game.plays, game.homeTeam, game.awayTeam)
    : approximatePenaltyStats(game)

  const penaltyComparison = [
    { metric: '횟수', home: penaltyStats.home.count, away: penaltyStats.away.count },
    { metric: '야드', home: penaltyStats.home.yards, away: penaltyStats.away.yards },
  ]

  const topPlayers = hasRawPlays
    ? (() => {
        const raw = getPlayerTotalYards(game.plays, game.homeTeam, game.awayTeam, 5)
        console.log('[Total Yards TOP 5] getPlayerTotalYards 결과:', raw)
        return raw.map((r) => ({
          ...r,
          label: `#${r.number} (${teamAbbr(r.team)})`,
          fill: r.isHome ? SCARLET : CHARCOAL_GRAY,
        }))
      })()
    : []

  return (
    <>
    <GameFlowSection game={game} />
    <section className="section">
      <h3 className="section-title">경기 분석</h3>
      <div className="charts-grid">
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
          <h4 className="chart-title">Total Yards TOP 5</h4>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={topPlayers} layout="vertical" margin={{ left: 16 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis type="number" tick={TICK_STYLE} />
              <YAxis type="category" dataKey="label" tick={TICK_STYLE} width={90} />
              <Tooltip
                content={(props) => <PlayerTooltip {...props} topPlayers={topPlayers} />}
                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
              />
              <Bar dataKey="scrimmageYards" name="Scrimmage Yds">
                {topPlayers.map((entry, idx) => (
                  <Cell key={idx} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
    </>
  )
}
