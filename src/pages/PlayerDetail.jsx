import { useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { players } from '../data/dummy'
import { getAllGames, useGlobGames } from '../data/gameRepository'
import { getSeasonPlayerStats, OUR_TEAM } from '../utils/parseExcel'
import './PlayerDetail.css'

const ZERO_OFF = {
  rushAttempts: 0, rushYards: 0, rushTD: 0,
  recTargets: 0, receptions: 0, recYards: 0, recTD: 0,
  passAttempts: 0, completions: 0, passYards: 0, passTD: 0, passINT: 0,
}
const ZERO_DEF = { tackles: 0, assists: 0, sacks: 0, tfl: 0, interceptions: 0, fumbleRec: 0 }


function addStats(a, b) {
  const r = { ...a }
  for (const k of Object.keys(b)) r[k] = (r[k] ?? 0) + (b[k] ?? 0)
  return r
}

function hasActivity(offense, defense) {
  return (
    offense.rushAttempts > 0 || offense.recTargets > 0 || offense.passAttempts > 0 ||
    defense.tackles > 0 || defense.assists > 0 || defense.sacks > 0 ||
    defense.tfl > 0 || defense.interceptions > 0 || defense.fumbleRec > 0
  )
}

export default function PlayerDetail() {
  const { id } = useParams()
  const globGames = useGlobGames()

  const player = players.find((p) => p.id === id)

  const realGames = useMemo(() => {
    const sync = getAllGames()
    const globIds = new Set(globGames.map((g) => g.id))
    const deduped = sync.filter((g) => !globIds.has(g.id))
    return [...deduped, ...globGames]
  }, [globGames])

  const gameRows = useMemo(() => {
    if (!player || player.number == null) return []
    return getSeasonPlayerStats(realGames, player.number, OUR_TEAM)
  }, [realGames, player])

  if (!player) {
    return (
      <div className="container page-detail">
        <p>선수를 찾을 수 없습니다.</p>
        <Link to="/roster">로스터로 돌아가기</Link>
      </div>
    )
  }

  // 시즌 누적
  const sOff = gameRows.reduce((acc, r) => addStats(acc, r.offense), { ...ZERO_OFF })
  const sDef = gameRows.reduce((acc, r) => addStats(acc, r.defense), { ...ZERO_DEF })

  const hasRushing   = sOff.rushAttempts > 0
  const hasReceiving = sOff.recTargets > 0
  const hasPassing   = sOff.passAttempts > 0
  const hasTackles   = sDef.tackles + sDef.assists > 0
  const hasSacks     = sDef.sacks > 0
  const hasTFL       = sDef.tfl > 0
  const hasINT       = sDef.interceptions > 0
  const hasFumbleRec = sDef.fumbleRec > 0
  const hasAnyStats  = hasRushing || hasReceiving || hasPassing ||
                       hasTackles || hasSacks || hasTFL || hasINT || hasFumbleRec

  // 시즌 스탯 박스
  const seasonBoxes = []
  if (hasRushing) {
    seasonBoxes.push({ name: 'Carries', value: sOff.rushAttempts })
    seasonBoxes.push({ name: 'Rush Yds', value: sOff.rushYards })
    seasonBoxes.push({ name: 'Rush TD', value: sOff.rushTD })
  }
  if (hasReceiving) {
    seasonBoxes.push({ name: 'Receptions', value: sOff.receptions })
    seasonBoxes.push({ name: 'Rec Yds', value: sOff.recYards })
    seasonBoxes.push({ name: 'Rec TD', value: sOff.recTD })
  }
  if (hasPassing) {
    const pct = sOff.passAttempts > 0
      ? Math.round((sOff.completions / sOff.passAttempts) * 100)
      : 0
    seasonBoxes.push({ name: 'Comp/Att', value: `${sOff.completions}/${sOff.passAttempts}` })
    seasonBoxes.push({ name: 'Comp %', value: `${pct}%` })
    seasonBoxes.push({ name: 'Pass Yds', value: sOff.passYards })
    seasonBoxes.push({ name: 'Pass TD', value: sOff.passTD })
    seasonBoxes.push({ name: 'INT', value: sOff.passINT })
  }
  if (hasTackles) {
    seasonBoxes.push({ name: 'Tackles', value: sDef.tackles })
    seasonBoxes.push({ name: 'Assists', value: sDef.assists })
  }
  if (hasSacks)     seasonBoxes.push({ name: 'Sacks', value: sDef.sacks })
  if (hasTFL)       seasonBoxes.push({ name: 'TFL', value: sDef.tfl })
  if (hasINT)       seasonBoxes.push({ name: 'Interceptions', value: sDef.interceptions })
  if (hasFumbleRec) seasonBoxes.push({ name: 'Fum Rec', value: sDef.fumbleRec })

  // 경기별 테이블 컬럼 정의
  const cols = []
  if (hasRushing) cols.push({
    key: 'rush', label: 'Rushing',
    render: (o) => `${o.rushAttempts} car · ${o.rushYards} yds${o.rushTD ? ` · ${o.rushTD} TD` : ''}`,
  })
  if (hasReceiving) cols.push({
    key: 'rec', label: 'Receiving',
    render: (o) => `${o.receptions} rec · ${o.recYards} yds${o.recTD ? ` · ${o.recTD} TD` : ''}`,
  })
  if (hasPassing) cols.push({
    key: 'pass', label: 'Passing',
    render: (o) => `${o.completions}/${o.passAttempts} · ${o.passYards} yds · ${o.passTD} TD · ${o.passINT} INT`,
  })
  if (hasTackles) cols.push({
    key: 'tkl', label: 'Tackles',
    render: (_, d) => `${d.tackles} solo · ${d.assists} ast`,
  })
  if (hasSacks)     cols.push({ key: 'sck', label: 'Sacks',   render: (_, d) => d.sacks })
  if (hasTFL)       cols.push({ key: 'tfl', label: 'TFL',     render: (_, d) => d.tfl })
  if (hasINT)       cols.push({ key: 'int', label: 'INT',     render: (_, d) => d.interceptions })
  if (hasFumbleRec) cols.push({ key: 'fur', label: 'Fum Rec', render: (_, d) => d.fumbleRec })

  const activeRows = gameRows.filter((r) => hasActivity(r.offense, r.defense))

  return (
    <div className="page-detail">
      <div className="player-hero">
        <div className="container player-hero-inner">
          <div>
            <Link to="/roster" className="back-link">← 로스터</Link>
            <div className="player-hero-number">{player.number ? `#${player.number}` : '#-'}</div>
            <h1>{player.name}</h1>
            <div className="player-hero-positions">
              <span className="position-badge offense">{player.positions.offense}</span>
              <span className="position-badge defense">{player.positions.defense}</span>
            </div>
            <p className="player-hero-meta">
              {player.grade}학년 · {player.year}학번 · {player.height ? `${player.height}cm` : '-'} /{' '}
              {player.weight ? `${player.weight}kg` : '-'}
            </p>
          </div>
        </div>
      </div>

      <div className="container">
        {hasAnyStats ? (
          <>
            <section className="section">
              <h3 className="section-title">시즌 누적 스탯</h3>
              <div className="season-stats">
                {seasonBoxes.map((s) => (
                  <div key={s.name} className="season-stat-box">
                    <span className="season-stat-value">{s.value}</span>
                    <span className="season-stat-name">{s.name}</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="section">
              <h3 className="section-title">경기별 스탯</h3>
              {activeRows.length === 0 ? (
                <p className="empty-note">아직 경기 데이터가 없습니다.</p>
              ) : (
                <div className="gamelog-scroll">
                  <table className="gamelog-table">
                    <thead>
                      <tr>
                        <th>날짜</th>
                        <th>상대</th>
                        {cols.map((c) => <th key={c.key}>{c.label}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {activeRows.map(({ game, opponent, offense, defense }) => (
                        <tr key={game.id}>
                          <td><Link to={`/games/${game.id}`}>{game.date}</Link></td>
                          <td>{opponent}</td>
                          {cols.map((c) => (
                            <td key={c.key}>{c.render(offense, defense)}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </>
        ) : (
          <section className="section">
            <p className="empty-note">플레이별 데이터가 있는 경기가 로드되면 스탯이 표시됩니다.</p>
          </section>
        )}
      </div>
    </div>
  )
}
