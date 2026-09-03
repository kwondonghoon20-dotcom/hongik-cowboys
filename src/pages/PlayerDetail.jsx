import { useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { players } from '../data/dummy'
import { getAllGames, useGlobGames } from '../data/gameRepository'
import { getSeasonPlayerStats, OUR_TEAM } from '../utils/parseExcel'
import {
  ZERO_KICK, hasActivity, computeSeasonTotals, getStatFlags, buildSeasonBoxes,
} from '../utils/seasonStats'
import { getPlayerStatus } from '../data/playerStatus'
import './PlayerDetail.css'

const STATUS_LABEL = { injury: '부상', military: '군대' }

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

  const playerStatus = getPlayerStatus(player.id)

  // 시즌 누적
  const { sOff, sDef, sKick } = computeSeasonTotals(gameRows)
  const flags = getStatFlags(sOff, sDef, sKick)
  const {
    hasRushing, hasReceiving, hasPassing, hasTackles, hasSacks, hasTFL, hasINT,
    hasFumbleRec, hasKicking, hasAnyStats,
  } = flags

  // 시즌 스탯 박스
  const seasonBoxes = buildSeasonBoxes(sOff, sDef, sKick, flags)

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
            <div className="player-hero-name-row">
              <h1>{player.name}</h1>
              {playerStatus.status !== 'healthy' && (
                <span className={'player-status-badge large ' + playerStatus.status}>
                  {STATUS_LABEL[playerStatus.status]}
                </span>
              )}
            </div>
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
            {playerStatus.status !== 'healthy' && playerStatus.note && (
              <p className="player-status-note">{playerStatus.note}</p>
            )}
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
