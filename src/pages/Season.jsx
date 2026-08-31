import { useMemo } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, LabelList,
} from 'recharts'
import { getAllGames, useGlobGames } from '../data/gameRepository'
import { players } from '../data/dummy'
import { getPlayerTotalYards, OUR_TEAM } from '../utils/parseExcel'
import './Season.css'

const SCARLET = '#CC0000'
const GRAY = '#888888'

const OPPONENT_LABELS = {
  KMrazorbacks: '국민대',
  YonseiEagles: '연세대',
  HufsBlackKnights: '한국외대',
  UOScityhawks: '서울시립대',
}

const RANK_COLORS = ['#FFD700', '#C0C0C0', '#CD7F32']
const RANK_LABELS = ['1위', '2위', '3위']

function findPlayer(number) {
  return players.find((p) => p.number === number) ?? null
}

function getGamePlayerStats(game) {
  const side = game.homeTeam === OUR_TEAM ? 'home' : 'away'
  const overridePS = game.overrideStats?.[side]?.playerStats
  const overrideTackles = game.overrideStats?.[side]?.tackles

  if (overridePS) {
    return Object.entries(overridePS).map(([numStr, ps]) => {
      const num = parseInt(numStr, 10)
      return {
        number: num,
        rushYds: ps.rushYds ?? 0,
        passYds: ps.passYds ?? 0,
        recYds: ps.recYds ?? 0,
        tackles: overrideTackles?.[num] ?? 0,
      }
    })
  }

  if (!Array.isArray(game.plays) || !game.plays.length) return []

  const raw = getPlayerTotalYards(game.plays, game.homeTeam, game.awayTeam, 50)
  return raw
    .filter((p) => p.team === OUR_TEAM)
    .map((p) => ({
      number: parseInt(p.number, 10),
      rushYds: p.rushYards ?? 0,
      passYds: p.passYards ?? 0,
      recYds: p.recYards ?? 0,
      tackles: 0,
    }))
}

function RankCard({ title, players: list, statKey, unit }) {
  return (
    <div className="rank-card">
      <h4 className="rank-card-title">{title}</h4>
      {list.length === 0 ? (
        <div className="rank-empty">데이터 없음</div>
      ) : (
        list.map((p, i) => {
          const rp = findPlayer(p.number)
          const name = rp ? rp.name : `선수`
          const val = p[statKey]
          const display = typeof val === 'number' && !Number.isInteger(val)
            ? val.toFixed(1)
            : val
          return (
            <div key={p.number} className="rank-row">
              <span className="rank-badge" style={{ color: RANK_COLORS[i] }}>
                {RANK_LABELS[i]}
              </span>
              <span className="rank-name">
                {name}
                <span className="rank-number"> #{p.number}</span>
              </span>
              <span className="rank-val">
                {display}{unit ? ` ${unit}` : ''}
              </span>
            </div>
          )
        })
      )}
    </div>
  )
}

export default function Season() {
  const globGames = useGlobGames()

  const realGames = useMemo(() => {
    const sync = getAllGames()
    const globIds = new Set(globGames.map((g) => g.id))
    const deduped = sync.filter((g) => !globIds.has(g.id))
    return [...deduped, ...globGames]
      .filter((g) => g.season === 2025 && (g.homeTeam === OUR_TEAM || g.awayTeam === OUR_TEAM))
      .sort((a, b) => new Date(a.date) - new Date(b.date))
  }, [globGames])

  const { wins, losses, ties, totalFor, totalAgainst, chartData } = useMemo(() => {
    let w = 0, l = 0, t = 0, tf = 0, ta = 0
    const data = realGames.map((game) => {
      const isHome = game.homeTeam === OUR_TEAM
      const ours = isHome ? game.homeScore : game.awayScore
      const theirs = isHome ? game.awayScore : game.homeScore
      const opponent = isHome ? game.awayTeam : game.homeTeam
      tf += ours; ta += theirs
      if (ours > theirs) w++
      else if (ours < theirs) l++
      else t++
      return {
        name: OPPONENT_LABELS[opponent] ?? opponent,
        홍익대: ours,
        상대팀: theirs,
      }
    })
    return { wins: w, losses: l, ties: t, totalFor: tf, totalAgainst: ta, chartData: data }
  }, [realGames])

  const teamStats = useMemo(() => {
    const totals = { totalYards: 0, rushYards: 0, passYards: 0, turnovers: 0 }
    for (const game of realGames) {
      const side = game.homeTeam === OUR_TEAM ? 'home' : 'away'
      const s = game.teamStats?.[side] ?? {}
      totals.totalYards += s.totalYards ?? 0
      totals.rushYards += s.rushYards ?? 0
      totals.passYards += s.passYards ?? 0
      totals.turnovers += s.turnovers ?? 0
    }
    return { ...totals, games: realGames.length }
  }, [realGames])

  const playerRankings = useMemo(() => {
    const agg = {}
    for (const game of realGames) {
      for (const ps of getGamePlayerStats(game)) {
        if (isNaN(ps.number) || ps.number <= 0) continue
        if (!agg[ps.number]) {
          agg[ps.number] = { number: ps.number, rushYds: 0, passYds: 0, recYds: 0, tackles: 0 }
        }
        agg[ps.number].rushYds += ps.rushYds
        agg[ps.number].passYds += ps.passYds
        agg[ps.number].recYds += ps.recYds
        agg[ps.number].tackles += ps.tackles
      }
    }
    const list = Object.values(agg)
    const top3 = (key, min = 1) =>
      list.filter((p) => p[key] >= min).sort((a, b) => b[key] - a[key]).slice(0, 3)
    return {
      rush: top3('rushYds'),
      pass: top3('passYds'),
      rec: top3('recYds'),
      tackles: top3('tackles', 0.5),
    }
  }, [realGames])

  const n = teamStats.games
  const avg = (v) => (n > 0 ? Math.round(v / n) : 0)

  return (
    <div className="page-season">
      <div className="season-page-hero">
        <div className="container">
          <h1>2025 시즌</h1>
          <div className="season-record-row">
            <div className="season-record-badge">
              <span className="record-w">{wins}승</span>
              <span className="record-sep">-</span>
              <span className="record-l">{losses}패</span>
              {ties > 0 && (
                <>
                  <span className="record-sep">-</span>
                  <span className="record-t">{ties}무</span>
                </>
              )}
            </div>
            <div className="season-score-totals">
              <span className="score-for">{totalFor}득점</span>
              <span className="score-sep"> / </span>
              <span className="score-against">{totalAgainst}실점</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        <section className="s-section">
          <h3 className="s-section-title">경기별 득실점</h3>
          <div className="s-chart-card">
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={chartData} margin={{ top: 24, right: 24, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="name" tick={{ fill: '#ccc', fontSize: 13 }} />
                <YAxis tick={{ fill: '#ccc', fontSize: 12 }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ background: '#242424', border: '1px solid #444', color: '#fff' }}
                  labelStyle={{ color: '#fff' }}
                />
                <Legend wrapperStyle={{ color: '#ccc' }} />
                <Line
                  type="monotone" dataKey="홍익대" stroke={SCARLET} strokeWidth={2.5}
                  dot={{ r: 5, fill: SCARLET }} activeDot={{ r: 7 }}
                >
                  <LabelList
                    dataKey="홍익대" position="top"
                    style={{ fill: SCARLET, fontSize: 13, fontWeight: 700 }}
                  />
                </Line>
                <Line
                  type="monotone" dataKey="상대팀" stroke={GRAY} strokeWidth={2}
                  dot={{ r: 4, fill: GRAY }} activeDot={{ r: 6 }}
                >
                  <LabelList
                    dataKey="상대팀" position="bottom"
                    style={{ fill: '#aaa', fontSize: 13 }}
                  />
                </Line>
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="s-section">
          <h3 className="s-section-title">시즌 누적 팀 스탯</h3>
          <div className="season-stats-grid">
            <div className="season-stat-card">
              <span className="ssc-value">{avg(totalFor)}</span>
              <span className="ssc-label">경기당 평균 득점</span>
            </div>
            <div className="season-stat-card">
              <span className="ssc-value">{avg(totalAgainst)}</span>
              <span className="ssc-label">경기당 평균 실점</span>
            </div>
            <div className="season-stat-card">
              <span className="ssc-value">{teamStats.totalYards}</span>
              <span className="ssc-label">총 오펜스 야드</span>
              <span className="ssc-sub">{avg(teamStats.totalYards)} 경기당</span>
            </div>
            <div className="season-stat-card">
              <span className="ssc-value">{teamStats.rushYards}</span>
              <span className="ssc-label">총 러시 야드</span>
              <span className="ssc-sub">{avg(teamStats.rushYards)} 경기당</span>
            </div>
            <div className="season-stat-card">
              <span className="ssc-value">{teamStats.passYards}</span>
              <span className="ssc-label">총 패스 야드</span>
              <span className="ssc-sub">{avg(teamStats.passYards)} 경기당</span>
            </div>
            <div className="season-stat-card">
              <span className="ssc-value">{teamStats.turnovers}</span>
              <span className="ssc-label">총 턴오버</span>
            </div>
          </div>
        </section>

        <section className="s-section">
          <h3 className="s-section-title">선수별 시즌 스탯 랭킹</h3>
          <div className="rankings-grid">
            <RankCard title="🏃 러시 야드" players={playerRankings.rush} statKey="rushYds" unit="야드" />
            <RankCard title="🎯 패스 야드" players={playerRankings.pass} statKey="passYds" unit="야드" />
            <RankCard title="🙌 리시빙 야드" players={playerRankings.rec} statKey="recYds" unit="야드" />
            <RankCard title="🛡️ 태클" players={playerRankings.tackles} statKey="tackles" unit="" />
          </div>
        </section>
      </div>
    </div>
  )
}
