import * as XLSX from 'xlsx'

export const OUR_TEAM = 'HIcowboys'
const OUR_TEAM_ALIASES = ['홍익', 'hongik', 'hicowboys', 'hi cowboys']

const META_KEYS = ['GameKey', 'Date', 'Type', 'Score', 'Region', 'Location', 'Home', 'Away']

function normalizeTeamName(name) {
  if (!name) return name
  const lower = String(name).toLowerCase()
  return OUR_TEAM_ALIASES.some((alias) => lower.includes(alias)) ? OUR_TEAM : String(name).trim()
}

async function toArrayBuffer(input) {
  if (input instanceof ArrayBuffer) return input
  if (typeof input === 'string') {
    const res = await fetch(input)
    return res.arrayBuffer()
  }
  // File / Blob
  return input.arrayBuffer()
}

async function readWorkbook(input) {
  const buffer = await toArrayBuffer(input)
  return XLSX.read(buffer, { type: 'array' })
}

function parseDate(rawDate) {
  // "2024-09-07(토) 10:00" -> { date: '2024-09-07', time: '10:00' }
  const str = String(rawDate ?? '')
  const dateMatch = str.match(/\d{4}-\d{2}-\d{2}/)
  const timeMatch = str.match(/\d{2}:\d{2}/)
  return {
    raw: str,
    date: dateMatch ? dateMatch[0] : null,
    time: timeMatch ? timeMatch[0] : null,
  }
}

function parseScore(rawScore) {
  // "38:7" -> { home: 38, away: 7 }
  const str = String(rawScore ?? '')
  const match = str.match(/(-?\d+)\s*:\s*(-?\d+)/)
  if (!match) return { home: null, away: null }
  return { home: Number(match[1]), away: Number(match[2]) }
}

/**
 * Index 시트는 키-값 쌍이 맨 위 몇 행 안에 여러 컬럼에 걸쳐 가로로 흩어져 있다.
 * 예: GameKey(B1) | 값(C1) | Type(E1) | 값(F1) | ... | Home(L1) | 값(M1)
 * 시트 하단에는 같은 키워드(예: "Home")가 드롭다운 목록 등으로 다시 등장할 수 있으므로,
 * 위쪽 몇 개 행만 스캔하고 "행 순서대로 처음 발견된 값"만 채택해 오검색을 막는다.
 */
const META_SCAN_ROW_COUNT = 5

export async function parseGameMeta(input) {
  const workbook = input?.SheetNames ? input : await readWorkbook(input)
  const sheet = workbook.Sheets['Index']
  if (!sheet) throw new Error('Index 시트를 찾을 수 없습니다.')

  const allRows = XLSX.utils.sheet_to_json(sheet, { header: 1 })
  const rows = allRows.slice(0, META_SCAN_ROW_COUNT)
  console.log('[엑셀 파싱 디버그] Index 시트 스캔 대상 행:', rows)

  const raw = {}
  for (const row of rows) {
    for (let i = 0; i < row.length; i++) {
      const cell = row[i]
      if (cell == null) continue
      const key = String(cell).trim()
      if (META_KEYS.includes(key) && raw[key] === undefined) {
        raw[key] = row[i + 1]
      }
    }
  }

  const { date, time } = parseDate(raw.Date)
  const score = parseScore(raw.Score)
  const home = normalizeTeamName(raw.Home)
  const away = normalizeTeamName(raw.Away)

  return {
    gameKey: raw.GameKey ?? null,
    date,
    time,
    dateRaw: raw.Date ?? null,
    type: raw.Type ?? null,
    region: raw.Region ?? null,
    location: raw.Location ?? null,
    home,
    away,
    homeScore: score.home,
    awayScore: score.away,
  }
}

function resolveOffenseTeam(offenseTeam, meta) {
  if (!meta) return offenseTeam
  const value = String(offenseTeam ?? '').trim().toLowerCase()
  // meta.home/away를 못 읽어온 경우에도 Home/Away 자체로는 구분이 가능하도록 fallback
  if (value === 'home') return meta.home ?? 'Home'
  if (value === 'away') return meta.away ?? 'Away'
  return normalizeTeamName(offenseTeam)
}

export async function parsePlays(input, meta) {
  const workbook = input?.SheetNames ? input : await readWorkbook(input)
  const sheet = workbook.Sheets['DataSheet']
  if (!sheet) throw new Error('DataSheet 시트를 찾을 수 없습니다.')

  const resolvedMeta = meta ?? (await parseGameMeta(workbook))
  const rows = XLSX.utils.sheet_to_json(sheet, { defval: null })

  const uniquePlayTypes = [...new Set(rows.map((row) => row.PlayType))]
  const uniqueOffenseTeams = [...new Set(rows.map((row) => row.OffenseTeam))]
  console.log('[엑셀 파싱 디버그] PlayType 값 목록:', uniquePlayTypes)
  console.log('[엑셀 파싱 디버그] OffenseTeam 값 목록(원본):', uniqueOffenseTeams)
  console.log('[엑셀 파싱 디버그] meta.home / meta.away:', resolvedMeta.home, '/', resolvedMeta.away)

  return rows.map((row) => ({
    ...row,
    OffenseTeam: resolveOffenseTeam(row.OffenseTeam, resolvedMeta),
  }))
}

export async function parseGame(input) {
  const workbook = input?.SheetNames ? input : await readWorkbook(input)
  const meta = await parseGameMeta(workbook)
  const plays = await parsePlays(workbook, meta)
  return { meta, plays }
}

function significantPlayTags(play) {
  return [play.SignificantPlay, play.SignificantPlay2, play.SignificantPlay3, play.SignificantPlay4]
    .filter(Boolean)
    .map((tag) => String(tag).toUpperCase())
}

function playType(play) {
  return String(play.PlayType ?? '').trim().toUpperCase()
}

function hasTag(play, tag) {
  return significantPlayTags(play).includes(tag)
}

// 실제 PlayType enum: RUN, PASS, NOPAS, NOPASS, KICKOFF, PUNT, PAT, TPT, FG, RETURN, SACK, NONE
function isRun(play) {
  return playType(play) === 'RUN'
}

// PASS = 성공, NOPAS/NOPASS = 실패(시도이지만 게인 없음) — 모두 패스 시도로 취급
function isPassAttempt(play) {
  const pt = playType(play)
  return pt === 'PASS' || pt === 'NOPAS' || pt === 'NOPASS'
}

function isCompletePass(play) {
  return playType(play) === 'PASS'
}

function isSackPlay(play) {
  return playType(play) === 'SACK' || hasTag(play, 'SACK')
}

function isTouchdown(play) {
  return hasTag(play, 'TOUCHDOWN')
}

// 실제 스크리미지(공격) 플레이만: RUN/PASS/NOPAS. KICKOFF/PUNT/PAT/FG/RETURN/SACK 등 스페셜팀·기타 플레이는 제외.
function isScrimmagePlay(play) {
  return isRun(play) || isPassAttempt(play)
}

// 턴오버: 수비가 회수한 펌블(FUMBLERECDEF), 인터셉트, 명시적 TURNOVER 태그 기준
// (FUMBLERECOFF는 오펜스가 자기 펌블을 다시 잡은 경우라 턴오버가 아님)
// 스크리미지 플레이로 한정하는 이유: 턴오버 직후 RETURN 플레이 행에도 같은 태그가
// 남아있는 경우가 있어, 회수한 팀 쪽에서 한 번 더 중복 집계되는 것을 막기 위함.
function isTurnover(play) {
  if (!isScrimmagePlay(play)) return false
  return hasTag(play, 'FUMBLERECDEF') || hasTag(play, 'INTERCEPT') || hasTag(play, 'TURNOVER')
}

function isInterception(play) {
  return hasTag(play, 'INTERCEPT')
}

function isTFL(play) {
  return hasTag(play, 'TFL')
}

function gain(play) {
  return Number(play.GainYard ?? 0) || 0
}

function isOffensePlay(play) {
  return isRun(play) || isPassAttempt(play) || isSackPlay(play)
}

export function calcTeamStats(plays, teamName) {
  const offensePlays = plays.filter((play) => play.OffenseTeam === teamName)
  const totalYards = offensePlays.filter(isOffensePlay).reduce((sum, play) => sum + gain(play), 0)
  const rushYards = offensePlays.filter(isRun).reduce((sum, play) => sum + gain(play), 0)
  const passYards = offensePlays
    .filter((play) => isPassAttempt(play) || isSackPlay(play))
    .reduce((sum, play) => sum + gain(play), 0)
  const turnovers = offensePlays.filter(isTurnover).length

  const thirdDownPlays = offensePlays.filter(
    (play) => Number(play.Down) === 3 && isOffensePlay(play),
  )
  const thirdDownConversions = thirdDownPlays.filter(
    (play) => gain(play) >= Number(play.ToGoYard ?? Infinity) || isTouchdown(play),
  )

  return {
    totalYards,
    rushYards,
    passYards,
    turnovers,
    thirdDownAttempts: thirdDownPlays.length,
    thirdDownConversions: thirdDownConversions.length,
    // GameDetail의 STAT_ROWS가 참조하는 키 (dummy 데이터와 동일한 형식: "성공/시도")
    thirdDown: `${thirdDownConversions.length}/${thirdDownPlays.length}`,
  }
}

export function calcPlayerStats(plays, playerNum) {
  const num = String(playerNum)

  const rushing = { attempts: 0, yards: 0, td: 0 }
  const passing = { attempts: 0, completions: 0, yards: 0, td: 0, interceptions: 0 }
  const receiving = { receptions: 0, yards: 0, td: 0 }
  const defense = { tackles: 0, sacks: 0, tfl: 0, interceptions: 0 }

  for (const play of plays) {
    const carNum = play.CARNum != null ? String(play.CARNum) : null
    const car2Num = play.CAR2Num != null ? String(play.CAR2Num) : null
    const tklNum = play.TKLNum != null ? String(play.TKLNum) : null
    const tkl2Num = play.TKL2Num != null ? String(play.TKL2Num) : null

    if (isRun(play) && carNum === num) {
      rushing.attempts += 1
      rushing.yards += gain(play)
      if (isTouchdown(play)) rushing.td += 1
    }

    if (isPassAttempt(play)) {
      if (carNum === num) {
        passing.attempts += 1
        if (isCompletePass(play)) {
          passing.completions += 1
          passing.yards += gain(play)
          if (isTouchdown(play)) passing.td += 1
        }
        if (isInterception(play)) passing.interceptions += 1
      }
      if (car2Num === num && isCompletePass(play)) {
        receiving.receptions += 1
        receiving.yards += gain(play)
        if (isTouchdown(play)) receiving.td += 1
      }
    }

    if (tklNum === num || tkl2Num === num) {
      defense.tackles += 1
      if (isSackPlay(play)) defense.sacks += 1
      if (isTFL(play)) defense.tfl += 1
    }

    if (isInterception(play) && (tklNum === num || tkl2Num === num)) {
      defense.interceptions += 1
    }
  }

  return { rushing, passing, receiving, defense }
}

export function pickRushMvp(plays, teamName) {
  const top = getTopRushers(plays, teamName, 1)
  return top[0] ?? null
}

// CARNum이 없거나(null/빈문자) 0인 경우는 캐리어가 지정되지 않은 플레이이므로 제외.
// isRun()이 이미 PlayType==='RUN'만 통과시키므로 KICKOFF/RETURN/PAT 등 스페셜팀 플레이는 자동 제외됨.
function hasValidCarrier(play) {
  const raw = play.CARNum
  if (raw == null || raw === '') return false
  return Number(raw) !== 0
}

export function getTopRushers(plays, teamName, limit = 5) {
  const yardsByCarrier = new Map()

  for (const play of plays) {
    if (!isRun(play) || play.OffenseTeam !== teamName || !hasValidCarrier(play)) continue
    const num = String(play.CARNum)
    yardsByCarrier.set(num, (yardsByCarrier.get(num) ?? 0) + gain(play))
  }

  return [...yardsByCarrier.entries()]
    .map(([number, yards]) => ({ number, yards }))
    .sort((a, b) => b.yards - a.yards)
    .slice(0, limit)
}

const QUARTER_LABELS = ['Q1', 'Q2', 'Q3', 'Q4']

export function getQuarterPlayCounts(plays, homeTeam, awayTeam) {
  return QUARTER_LABELS.map((label, idx) => {
    const quarterPlays = plays.filter((play) => Number(play.Quarter) === idx + 1 && isScrimmagePlay(play))
    return {
      quarter: label,
      home: quarterPlays.filter((play) => play.OffenseTeam === homeTeam).length,
      away: quarterPlays.filter((play) => play.OffenseTeam === awayTeam).length,
    }
  })
}

const PLAY_TYPE_CATEGORIES = ['RUN', 'PASS', 'NOPAS', 'NOPASS', 'KICKOFF', 'PUNT', 'PAT', 'FG', 'RETURN']

export function getPlayTypeDistribution(plays, teamName) {
  const counts = new Map()
  for (const play of plays.filter((p) => p.OffenseTeam === teamName)) {
    const type = playType(play)
    const key = PLAY_TYPE_CATEGORIES.includes(type) ? type : '기타'
    counts.set(key, (counts.get(key) ?? 0) + 1)
  }
  return [...counts.entries()].map(([name, value]) => ({ name, value }))
}

// 패널티는 필드 포지션 변화로 기록되기 때문에 GainYard/ToGoYard가 비어있는 경우가 많고,
// 실제 야드는 StartYard와 EndYard의 차이로 계산해야 한다.
function penaltyYards(play) {
  const start = Number(play.StartYard)
  const end = Number(play.EndYard)
  if (Number.isNaN(start) || Number.isNaN(end)) return 0
  return Math.abs(end - start)
}

// 패널티는 OffenseTeam이 아니라 SignificantPlay 태그("PENALTY.HOME"/"PENALTY.AWAY")로
// 어느 팀이 범했는지 직접 표시되므로 OffenseTeam 매칭과 무관하게 태그만으로 집계한다.
export function getPenaltyStats(plays, homeTeam, awayTeam) {
  const stats = {
    home: { team: homeTeam, count: 0, yards: 0 },
    away: { team: awayTeam, count: 0, yards: 0 },
  }

  for (const play of plays) {
    const tags = significantPlayTags(play)
    const isHomePenalty = tags.includes('PENALTY.HOME')
    const isAwayPenalty = tags.includes('PENALTY.AWAY')
    if (!isHomePenalty && !isAwayPenalty) continue

    const yards = penaltyYards(play)
    console.log('[엑셀 파싱 디버그] 패널티 플레이:', {
      tags,
      GainYard: play.GainYard,
      ToGoYard: play.ToGoYard,
      StartYard: play.StartYard,
      EndYard: play.EndYard,
      적용야드: yards,
    })

    if (isHomePenalty) {
      stats.home.count += 1
      stats.home.yards += yards
    }
    if (isAwayPenalty) {
      stats.away.count += 1
      stats.away.yards += yards
    }
  }

  return stats
}

export function toPlayLogEntries(plays) {
  return plays.map((play, idx) => {
    const tags = significantPlayTags(play).filter((tag) => !tag.startsWith('PENALTY'))
    const parts = [playType(play)]
    if (play.Down != null && play.ToGoYard != null) parts.push(`${play.Down}&${play.ToGoYard}`)
    if (tags.length) parts.push(tags.join(', '))

    return {
      quarter: play.Quarter ?? null,
      time: play.ClipKey ?? String(idx + 1),
      team: play.OffenseTeam,
      description: parts.join(' · '),
      yards: gain(play),
    }
  })
}

/**
 * 드라이브 전진 거리 차트용 데이터.
 * - 각 플레이의 StartYard + StartYardLocation으로 실제 필드 포지션 계산
 * - OWN N → fieldPos = N, OPP N → fieldPos = 100 - N
 * - 홈팀 드라이브: 양수 방향, 어웨이팀 드라이브: 음수 방향
 * - 드라이브 종료 후 null 구분자 삽입
 */
function fieldPos(play) {
  const loc = String(play.StartYardLocation ?? '').trim().toUpperCase()
  const yard = Number(play.StartYard ?? 0)
  return loc === 'OPP' ? 100 - yard : yard
}

export function getDriveMomentum(plays, homeTeam, awayTeam) {
  const relevant = plays.filter((p) => {
    const pt = playType(p)
    return isScrimmagePlay(p) || pt === 'FG' || pt === 'PUNT'
  })

  // 드라이브 그룹핑: 공격팀 전환 또는 종결 이벤트에서 새 드라이브
  const drives = []
  let current = null

  for (const play of relevant) {
    const team = play.OffenseTeam
    const tags = significantPlayTags(play)
    const isDriveEnder =
      tags.includes('TOUCHDOWN') ||
      playType(play) === 'FG' ||
      playType(play) === 'PUNT' ||
      tags.includes('FUMBLERECDEF') ||
      tags.includes('INTERCEPT') ||
      tags.includes('TURNOVER')

    if (!current || current.team !== team) {
      current = { team, plays: [] }
      drives.push(current)
    }
    current.plays.push(play)
    if (isDriveEnder) current = null
  }

  // 4th Down 실패 여부 사전 계산:
  // 실제 4th Down 플레이이고, 종결 이벤트 없이 팀이 바뀌었으며, 쿼터가 같은 경우만 해당
  // (쿼터 종료로 끊기는 경우는 sameQuarter=false → is4thDownFail=false)
  drives.forEach((drive, driveIdx) => {
    const nextDrive = drives[driveIdx + 1]
    const lastPlay = drive.plays[drive.plays.length - 1]
    if (!lastPlay || !nextDrive) return
    const lastTags = significantPlayTags(lastPlay)
    const lastPt = playType(lastPlay)
    const hasTerminal =
      lastTags.includes('TOUCHDOWN') || lastPt === 'FG' || lastPt === 'PUNT' ||
      lastTags.includes('FUMBLERECDEF') || lastTags.includes('INTERCEPT') || lastTags.includes('TURNOVER')
    const teamChanged = nextDrive.team !== drive.team
    const sameQuarter = Number(nextDrive.plays[0]?.Quarter) === Number(lastPlay.Quarter)
    const isActual4thDown = Number(lastPlay.Down) === 4
    drive.is4thDownFail = !hasTerminal && teamChanged && sameQuarter && isActual4thDown
  })

  // 차트 포인트 생성: 플레이의 실제 필드 포지션 기반 + null 구분자
  // - OWN N → fieldPos = N, OPP N → fieldPos = 100 - N
  // - 홈팀: 양수, 어웨이팀: 음수
  const chartPoints = []
  const quarterBoundaries = []
  let pointIndex = 0
  let lastQuarter = null

  drives.forEach((drive, driveIdx) => {
    const isHome = drive.team === homeTeam
    const firstPlay = drive.plays[0]

    // 드라이브 시작점: 첫 플레이의 실제 필드 포지션
    const firstQ = Number(firstPlay?.Quarter ?? 1)
    if (firstQ !== lastQuarter) {
      quarterBoundaries.push({ index: pointIndex, quarter: firstQ })
      lastQuarter = firstQ
    }
    const startFieldPos = firstPlay ? fieldPos(firstPlay) : 0
    const startDisplay = isHome ? startFieldPos : -startFieldPos
    chartPoints.push({
      index: pointIndex,
      home: isHome ? startDisplay : null,
      away: isHome ? null : startDisplay,
      event: null,
      quarter: firstQ,
      driveNum: driveIdx + 1,
    })
    pointIndex++

    drive.plays.forEach((play, playIdx) => {
      const q = Number(play.Quarter)
      if (q !== lastQuarter) {
        quarterBoundaries.push({ index: pointIndex, quarter: q })
        lastQuarter = q
      }

      const pt = playType(play)
      const isLastPlay = playIdx === drive.plays.length - 1
      const tags = significantPlayTags(play)

      let event = null
      if (isLastPlay) {
        if (tags.includes('TOUCHDOWN')) event = 'TD'
        else if (pt === 'FG') event = 'FG'
        else if (tags.includes('INTERCEPT')) event = 'INTERCEPT'
        else if (tags.includes('FUMBLERECDEF')) event = 'FUMBLE'
        else if (tags.includes('TURNOVER')) event = 'TURNOVER'
        else if (pt === 'PUNT') event = 'PUNT'
        else if (drive.is4thDownFail) event = 'DOWN_FAIL'
      }

      // TD: 마지막 포인트를 ±100으로 강제 설정
      const pos = event === 'TD' ? 100 : fieldPos(play)
      const displayValue = isHome ? pos : -pos

      // FG 거리: OPP {n}야드 기준 → n + 17야드 (스냅 + 엔드존)
      const fgDist = pt === 'FG'
        ? (() => {
            const loc = String(play.StartYardLocation ?? '').trim().toUpperCase()
            const yard = Number(play.StartYard ?? 0)
            return loc === 'OPP' ? yard + 17 : Math.max(0, (100 - yard) + 17)
          })()
        : null

      chartPoints.push({
        index: pointIndex,
        home: isHome ? displayValue : null,
        away: isHome ? null : displayValue,
        event,
        quarter: q,
        driveNum: driveIdx + 1,
        fieldPosition: pos,
        gainYard: gain(play),
        playTypeStr: pt,
        fgDist,
      })
      pointIndex++
    })

    // 드라이브 간 null 구분자
    chartPoints.push({ index: pointIndex, home: null, away: null, event: null, quarter: null })
    pointIndex++
  })

  return { points: chartPoints, quarterBoundaries }
}

/**
 * Key Stats 섹션용 집계.
 * 볼 포제션(스크리미지 플레이 수 비율), TD, 레드존 진입, 3rd Down, 턴오버를 반환한다.
 */
export function getKeyStats(plays, homeTeam, awayTeam) {
  const homeStats = calcTeamStats(plays, homeTeam)
  const awayStats = calcTeamStats(plays, awayTeam)

  const homeScrimmage = plays.filter((p) => p.OffenseTeam === homeTeam && isScrimmagePlay(p)).length
  const awayScrimmage = plays.filter((p) => p.OffenseTeam === awayTeam && isScrimmagePlay(p)).length
  const total = homeScrimmage + awayScrimmage || 1

  // PAT 플레이는 TD 집계에서 제외 (PAT도 TOUCHDOWN 태그를 가질 수 있음)
  const isTDPlay = (p) => isTouchdown(p) && playType(p) !== 'PAT'
  const homeTDPlays = plays.filter((p) => p.OffenseTeam === homeTeam && isTDPlay(p))
  const awayTDPlays = plays.filter((p) => p.OffenseTeam === awayTeam && isTDPlay(p))
  console.log('[Key Stats 디버그] 홈팀 TD 플레이 (총', homeTDPlays.length, '개):', homeTDPlays.map((p) => ({
    ClipKey: p.ClipKey, Quarter: p.Quarter, PlayType: p.PlayType,
    OffenseTeam: p.OffenseTeam,
    SP: p.SignificantPlay, SP2: p.SignificantPlay2, SP3: p.SignificantPlay3, SP4: p.SignificantPlay4,
  })))
  console.log('[Key Stats 디버그] 어웨이팀 TD 플레이 (총', awayTDPlays.length, '개):', awayTDPlays.map((p) => ({
    ClipKey: p.ClipKey, Quarter: p.Quarter, PlayType: p.PlayType,
    OffenseTeam: p.OffenseTeam,
    SP: p.SignificantPlay, SP2: p.SignificantPlay2, SP3: p.SignificantPlay3, SP4: p.SignificantPlay4,
  })))
  // TOUCHDOWN 태그가 있는 모든 플레이 (PAT 포함) — 혹시 누락된 플레이 확인용
  const allTDCandidates = plays.filter(isTouchdown)
  console.log('[Key Stats 디버그] TOUCHDOWN 태그 전체 (PAT 포함, 총', allTDCandidates.length, '개):',
    allTDCandidates.map((p) => ({
      ClipKey: p.ClipKey, PlayType: p.PlayType, OffenseTeam: p.OffenseTeam,
      SP: p.SignificantPlay, SP2: p.SignificantPlay2,
    }))
  )
  const homeTDs = homeTDPlays.length
  const awayTDs = awayTDPlays.length

  // 레드존: 스크리미지 플레이에서만, 드라이브당 최대 1회 카운트
  // - EndYardLocation=OPP && EndYard<=20  또는  StartYardLocation=OPP && StartYard<=20
  const isRedZonePlay = (p) => {
    if (!isOffensePlay(p)) return false
    const endLoc = String(p.EndYardLocation ?? '').trim().toUpperCase()
    const startLoc = String(p.StartYardLocation ?? '').trim().toUpperCase()
    return (endLoc === 'OPP' && Number(p.EndYard) <= 20) ||
           (startLoc === 'OPP' && Number(p.StartYard) <= 20)
  }

  // 드라이브당 1회 카운트: 팀별로 플레이를 순회하며 드라이브 전환을 감지
  function countRedZoneDrives(teamName) {
    const teamPlays = plays.filter((p) => p.OffenseTeam === teamName)
    let count = 0
    let inRedZoneDrive = false
    let prevDriveKey = null

    for (const p of teamPlays) {
      // 드라이브 식별: Quarter + 드라이브 번호가 없으므로 연속 플레이를 기준으로
      // 레드존 진입 후 레드존 밖으로 나가면 다음 진입을 새 드라이브로 취급하지 않으나,
      // 실제로는 드라이브가 바뀌면 레드존에서 벗어남. isScrimmagePlay 흐름 상 드라이브
      // 내에서 레드존을 벗어나는 경우는 없으므로, 첫 진입만 카운트하면 충분.
      //
      // 단순 구현: 레드존 진입 플레이가 나올 때마다 직전 플레이가 레드존이 아니었으면 카운트
      const inRZ = isRedZonePlay(p)
      if (inRZ && !inRedZoneDrive) {
        count++
        inRedZoneDrive = true
      } else if (!inRZ && isOffensePlay(p)) {
        inRedZoneDrive = false
      }
    }
    return count
  }

  const homeRedZone = countRedZoneDrives(homeTeam)
  const awayRedZone = countRedZoneDrives(awayTeam)

  return {
    possession: {
      home: Math.round((homeScrimmage / total) * 100),
      away: Math.round((awayScrimmage / total) * 100),
    },
    touchdowns: { home: homeTDs, away: awayTDs },
    redZone: { home: homeRedZone, away: awayRedZone },
    thirdDown: { home: homeStats.thirdDown, away: awayStats.thirdDown },
    turnovers: { home: homeStats.turnovers, away: awayStats.turnovers },
  }
}

const GAME_FILE_PATTERN = /^HIcowboys_(\d{8})_vs_(.+)\.xlsm$/i

export function parseGameFilename(filename) {
  const match = filename.match(GAME_FILE_PATTERN)
  if (!match) return null
  const [, dateStr, opponent] = match
  const date = `${dateStr.slice(0, 4)}-${dateStr.slice(4, 6)}-${dateStr.slice(6, 8)}`
  return { date, opponent }
}

/**
 * src/data/games/*.xlsm 파일을 모두 읽어 파싱 결과 배열로 반환.
 * Vite의 import.meta.glob으로 빌드 시 폴더 내 파일을 자동 수집한다.
 */
export async function loadGamesFromFolder() {
  const modules = import.meta.glob('../data/games/*.xlsm', {
    eager: true,
    query: '?url',
    import: 'default',
  })

  const entries = Object.entries(modules)
  const games = await Promise.all(
    entries.map(async ([path, url]) => {
      const filename = path.split('/').pop()
      const fileInfo = parseGameFilename(filename)
      const game = await parseGame(url)
      return { filename, fileInfo, ...game }
    }),
  )

  return games
}
