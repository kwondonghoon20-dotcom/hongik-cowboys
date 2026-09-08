import { useMemo } from 'react'
import { useParams, useSearchParams, Link } from 'react-router-dom'
import { players, getPlayerNumberInSeason, getPlayerPositionsInSeason, getRosterForYear } from '../data/dummy'
import { getAllGames, useGlobGames } from '../data/gameRepository'
import { getSeasonPlayerStats, OUR_TEAM, passerRating } from '../utils/parseExcel'
import {
  ZERO_KICK, hasActivity, computeSeasonTotals, getStatFlags, buildSeasonBoxes,
} from '../utils/seasonStats'
import { getPlayerStatus } from '../data/playerStatus'
import './PlayerDetail.css'

const STATUS_LABEL = { injury: '부상', military: '군대' }

// 경기별 로우(rowsForSeason) → 시즌 누적 스탯 카드 + 경기별 스탯 테이블 컬럼 + 활동 있는 로우.
// 시즌마다 스탯 카테고리 구성(cols)이 다를 수 있어(예: 어떤 해는 패싱 기록이 없음) 연도별로 새로 계산한다.
function buildSeasonSection(rowsForSeason) {
  const { sOff, sDef, sKick } = computeSeasonTotals(rowsForSeason)
  const flags = getStatFlags(sOff, sDef, sKick)
  const {
    hasRushing, hasReceiving, hasPassing, hasTackles, hasSacks, hasTFL, hasINT,
    hasFumbleRec, hasDefTD, hasDefReturnYards, hasKicking, hasAnyStats,
  } = flags

  const seasonBoxes = buildSeasonBoxes(sOff, sDef, sKick, flags)

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
    render: (o) => {
      const rating = passerRating(o)
      const ratingStr = rating != null ? ` · ${rating.toFixed(1)} RTG` : ''
      return `${o.completions}/${o.passAttempts} · ${o.passYards} yds · ${o.passTD} TD · ${o.passINT} INT${ratingStr}`
    },
  })
  if (hasTackles) cols.push({
    key: 'tkl', label: 'Tackles',
    render: (_, d) => `${d.tackles} solo · ${d.assists} ast`,
  })
  if (hasSacks)     cols.push({ key: 'sck', label: 'Sacks',   render: (_, d) => d.sacks })
  if (hasTFL)       cols.push({ key: 'tfl', label: 'TFL',     render: (_, d) => d.tfl })
  if (hasINT)       cols.push({ key: 'int', label: 'INT',     render: (_, d) => d.interceptions })
  if (hasFumbleRec) cols.push({ key: 'fur', label: 'Fum Rec', render: (_, d) => d.fumbleRec })
  if (hasDefTD)     cols.push({ key: 'dtd', label: 'Def TD',  render: (_, d) => d.touchdowns })
  if (hasDefReturnYards) cols.push({ key: 'dret', label: 'Def Ret Yds', render: (_, d) => d.returnYards })
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

  const activeRows = rowsForSeason.filter((r) => hasActivity(r.offense, r.defense, r.kicking))

  return { seasonBoxes, cols, activeRows, hasAnyStats }
}

export default function PlayerDetail() {
  const { id } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const globGames = useGlobGames()

  const yearParam = searchParams.get('year')
  const seasonYear = yearParam != null ? Number(yearParam) : null

  const player = players.find((p) => p.id === id)

  const realGames = useMemo(() => {
    const sync = getAllGames()
    const globIds = new Set(globGames.map((g) => g.id))
    const deduped = sync.filter((g) => !globIds.has(g.id))
    return [...deduped, ...globGames]
  }, [globGames])

  const seasonGames = useMemo(() => {
    if (seasonYear == null) return realGames
    return realGames.filter((g) => g.season === seasonYear)
  }, [realGames, seasonYear])

  // 등번호는 시즌마다 바뀔 수 있어(numbersBySeason), 경기를 시즌별로 묶은 뒤 그 시즌에
  // 실제로 달았던 번호로 각각 조회해서 합친다 — player.number(최신 번호) 하나로 전체
  // 경기를 조회하면 번호가 바뀐 선수의 과거 시즌 경기가 누락된다.
  // numbersBySeason에 그 시즌 키가 없으면 player.number로 폴백하는데, 이 폴백은 그 해에
  // 실제로 로스터에 있었던 선수에게만 유효하다 — rosterByYear에 그 시즌 데이터가 있고
  // 이 선수가 명단에 없으면(예: 2026년에 합류해 2025년엔 아예 없었던 선수) 다른 선수가
  // 그 번호를 썼을 수 있으므로 조회 자체를 건너뛴다.
  const gameRows = useMemo(() => {
    if (!player) return []
    const seasonsPresent = [...new Set(seasonGames.map((g) => g.season))]
    return seasonsPresent.flatMap((season) => {
      const rosterForSeason = getRosterForYear(season)
      if (rosterForSeason != null && !rosterForSeason.some((p) => p.id === player.id)) return []
      const num = getPlayerNumberInSeason(player, season)
      if (num == null) return []
      const gamesInSeason = seasonGames.filter((g) => g.season === season)
      return getSeasonPlayerStats(gamesInSeason, num, OUR_TEAM)
    })
  }, [seasonGames, player])

  // ?year= 쿼리가 있으면 그 해만, 없으면 실제 경기 데이터가 있는 모든 시즌을 최신순으로 나열.
  const seasonsToShow = useMemo(() => {
    if (seasonYear != null) return [seasonYear]
    return [...new Set(gameRows.map((r) => r.game.season))].sort((a, b) => b - a)
  }, [gameRows, seasonYear])

  const availableSeasons = useMemo(
    () => [...new Set(gameRows.map((r) => r.game.season))].sort((a, b) => b - a),
    [gameRows]
  )

  function handleSeasonSelect(value) {
    const next = new URLSearchParams(searchParams)
    if (value === '') next.delete('year')
    else next.set('year', value)
    setSearchParams(next)
  }

  const rosterBackTo = seasonYear != null ? `/roster?year=${seasonYear}` : '/roster'

  if (!player) {
    return (
      <div className="container page-detail">
        <p>선수를 찾을 수 없습니다.</p>
        <Link to={rosterBackTo}>로스터로 돌아가기</Link>
      </div>
    )
  }

  const playerStatus = getPlayerStatus(player.id)
  const positions = getPlayerPositionsInSeason(player, seasonYear)
  const seasonLabel = seasonYear != null ? `${seasonYear} 시즌 스탯` : null

  // 연도별 섹션: 시즌마다 스탯 카테고리(cols)가 다를 수 있어 각각 따로 계산한다.
  const sections = seasonsToShow.map((season) => ({
    season,
    ...buildSeasonSection(gameRows.filter((r) => r.game.season === season)),
  }))
  const hasAnyStats = sections.some((s) => s.hasAnyStats)

  return (
    <div className="page-detail">
      <div className="player-hero">
        <div className="container player-hero-inner">
          <div>
            <Link to={rosterBackTo} className="back-link">← 로스터</Link>
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
              <span className="position-badge offense">{positions.offense}</span>
              <span className="position-badge defense">{positions.defense}</span>
              {positions?.special && (
                <span className="position-badge special">{positions.special}</span>
              )}
            </div>
            <p className="player-hero-meta">
              {player.year}학번 · {player.height ? `${player.height}cm` : '-'} /{' '}
              {player.weight ? `${player.weight}kg` : '-'}
            </p>
            {seasonLabel && <p className="player-hero-season-label">{seasonLabel}</p>}
            {playerStatus.status !== 'healthy' && playerStatus.note && (
              <p className="player-status-note">{playerStatus.note}</p>
            )}
          </div>
          <select
            className="season-select"
            value={seasonYear ?? ''}
            onChange={(e) => handleSeasonSelect(e.target.value)}
          >
            <option value="">전체 시즌</option>
            {availableSeasons.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="container">
        {hasAnyStats ? (
          sections.map(({ season, seasonBoxes, cols, activeRows }) => (
            <section className="section player-season-block" key={season}>
              <h2 className="player-season-heading">{season} 시즌</h2>
              <div className="season-stats">
                {seasonBoxes.map((s) => (
                  <div key={s.name} className="season-stat-box">
                    <span className="season-stat-value">{s.value}</span>
                    <span className="season-stat-name">{s.name}</span>
                  </div>
                ))}
              </div>

              <h3 className="section-title">{season} 경기별 스탯</h3>
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
          ))
        ) : (
          <section className="section">
            <p className="empty-note">플레이별 데이터가 있는 경기가 로드되면 스탯이 표시됩니다.</p>
          </section>
        )}
      </div>
    </div>
  )
}
