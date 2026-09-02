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
const ZERO_KICK = {
  kickoffs: 0, kickoffYards: 0, kickoffYardsCounted: 0,
  punts: 0, puntYards: 0, puntYardsCounted: 0, puntLong: 0,
  patMade: 0, patAtt: 0, fgMade: 0, fgAtt: 0,
  returns: 0, returnYards: 0,
  points: 0,
}


function addStats(a, b) {
  const r = { ...a }
  for (const k of Object.keys(b)) r[k] = (r[k] ?? 0) + (b[k] ?? 0)
  return r
}

// puntLong은 누적 합이 아니라 시즌 최장 기록이어야 하므로 일반 합산과 분리한다.
function addKicking(a, b) {
  const r = { ...a }
  for (const k of Object.keys(b)) {
    r[k] = k === 'puntLong' ? Math.max(r[k] ?? 0, b[k] ?? 0) : (r[k] ?? 0) + (b[k] ?? 0)
  }
  return r
}

function hasActivity(offense, defense, kicking) {
  return (
    offense.rushAttempts > 0 || offense.recTargets > 0 || offense.passAttempts > 0 ||
    defense.tackles > 0 || defense.assists > 0 || defense.sacks > 0 ||
    defense.tfl > 0 || defense.interceptions > 0 || defense.fumbleRec > 0 ||
    (kicking?.kickoffs > 0 || kicking?.punts > 0 || kicking?.patAtt > 0 ||
      kicking?.fgAtt > 0 || kicking?.returns > 0)
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
  const sKick = gameRows.reduce((acc, r) => addKicking(acc, r.kicking ?? ZERO_KICK), { ...ZERO_KICK })

  const hasRushing   = sOff.rushAttempts > 0
  const hasReceiving = sOff.recTargets > 0
  const hasPassing   = sOff.passAttempts > 0
  const hasTackles   = sDef.tackles + sDef.assists > 0
  const hasSacks     = sDef.sacks > 0
  const hasTFL       = sDef.tfl > 0
  const hasINT       = sDef.interceptions > 0
  const hasFumbleRec = sDef.fumbleRec > 0
  const hasFG        = sKick.fgAtt > 0
  const hasPAT       = sKick.patAtt > 0
  const hasKickoffs  = sKick.kickoffs > 0
  const hasPunts     = sKick.punts > 0
  const hasReturns   = sKick.returns > 0
  const hasKicking   = hasFG || hasPAT || hasKickoffs || hasPunts || hasReturns
  const hasAnyStats  = hasRushing || hasReceiving || hasPassing ||
                       hasTackles || hasSacks || hasTFL || hasINT || hasFumbleRec ||
                       hasKicking

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
  if (hasFG) seasonBoxes.push({ name: 'FG', value: `${sKick.fgMade}/${sKick.fgAtt}` })
  if (hasPAT) seasonBoxes.push({ name: 'PAT', value: `${sKick.patMade}/${sKick.patAtt}` })
  if (hasKickoffs) seasonBoxes.push({ name: 'Kickoffs', value: sKick.kickoffs })
  if (hasPunts) {
    seasonBoxes.push({ name: 'Punts', value: sKick.punts })
    seasonBoxes.push({
      name: 'Punt Avg',
      value: sKick.puntYardsCounted > 0 ? (sKick.puntYards / sKick.puntYardsCounted).toFixed(1) : '-',
    })
  }
  if (hasReturns) {
    seasonBoxes.push({ name: 'Returns', value: sKick.returns })
    seasonBoxes.push({ name: 'Return Yds', value: sKick.returnYards })
  }
  if (hasFG || hasPAT) seasonBoxes.push({ name: 'Points', value: sKick.points })

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
  if (hasKicking) cols.push({
    key: 'kick', label: 'Kicking',
    render: (_o, _d, k) => {
      const parts = []
      if (k.kickoffs > 0) parts.push(`킥오프 ${k.kickoffs}개`)
      if (k.punts > 0) {
        const distance = k.puntYardsCounted > 0
          ? `평균 ${(k.puntYards / k.puntYardsCounted).toFixed(1)}yd`
          : '거리 미기록'
        parts.push(`펀트 ${k.punts}개(${distance})`)
      }
      if (k.patAtt > 0) parts.push(`PAT ${k.patMade}/${k.patAtt}`)
      if (k.fgAtt > 0) parts.push(`FG ${k.fgMade}/${k.fgAtt}`)
      if (k.returns > 0) parts.push(`리턴 ${k.returns}회${k.returnYards ? `(${k.returnYards}yd)` : ''}`)
      return parts.join(' · ')
    },
  })

  const activeRows = gameRows.filter((r) => hasActivity(r.offense, r.defense, r.kicking))

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
              {player.positions?.special && (
                <span className="position-badge special">{player.positions.special}</span>
              )}
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
                      {activeRows.map(({ game, opponent, offense, defense, kicking }) => (
                        <tr key={game.id}>
                          <td><Link to={`/games/${game.id}`}>{game.date}</Link></td>
                          <td>{opponent}</td>
                          {cols.map((c) => (
                            <td key={c.key}>{c.render(offense, defense, kicking ?? ZERO_KICK)}</td>
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
