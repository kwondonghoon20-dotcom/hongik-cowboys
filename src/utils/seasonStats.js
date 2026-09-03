// PlayerDetail(단일 선수)과 Compare(두 선수 비교)가 공유하는 시즌 누적 스탯 로직.
// getSeasonPlayerStats()가 돌려주는 경기별 {offense, defense, kicking} 로우를 합산하고,
// 어떤 스탯 카테고리를 표시할지 판단한 뒤, 표시용 로우(seasonBoxes/compareRows)로 변환한다.

export const ZERO_OFF = {
  rushAttempts: 0, rushYards: 0, rushTD: 0,
  recTargets: 0, receptions: 0, recYards: 0, recTD: 0,
  passAttempts: 0, completions: 0, passYards: 0, passTD: 0, passINT: 0,
}
export const ZERO_DEF = { tackles: 0, assists: 0, sacks: 0, tfl: 0, interceptions: 0, fumbleRec: 0 }
export const ZERO_KICK = {
  kickoffs: 0, kickoffYards: 0, kickoffYardsCounted: 0,
  punts: 0, puntYards: 0, puntYardsCounted: 0, puntLong: 0,
  patMade: 0, patAtt: 0, fgMade: 0, fgAtt: 0,
  returns: 0, returnYards: 0,
  points: 0,
}

export function addStats(a, b) {
  const r = { ...a }
  for (const k of Object.keys(b)) r[k] = (r[k] ?? 0) + (b[k] ?? 0)
  return r
}

// puntLong은 누적 합이 아니라 시즌 최장 기록이어야 하므로 일반 합산과 분리한다.
export function addKicking(a, b) {
  const r = { ...a }
  for (const k of Object.keys(b)) {
    r[k] = k === 'puntLong' ? Math.max(r[k] ?? 0, b[k] ?? 0) : (r[k] ?? 0) + (b[k] ?? 0)
  }
  return r
}

export function hasActivity(offense, defense, kicking) {
  return (
    offense.rushAttempts > 0 || offense.recTargets > 0 || offense.passAttempts > 0 ||
    defense.tackles > 0 || defense.assists > 0 || defense.sacks > 0 ||
    defense.tfl > 0 || defense.interceptions > 0 || defense.fumbleRec > 0 ||
    (kicking?.kickoffs > 0 || kicking?.punts > 0 || kicking?.patAtt > 0 ||
      kicking?.fgAtt > 0 || kicking?.returns > 0)
  )
}

// 경기별 로우 배열 → 시즌 누적 {sOff, sDef, sKick}.
export function computeSeasonTotals(gameRows) {
  const sOff = gameRows.reduce((acc, r) => addStats(acc, r.offense), { ...ZERO_OFF })
  const sDef = gameRows.reduce((acc, r) => addStats(acc, r.defense), { ...ZERO_DEF })
  const sKick = gameRows.reduce((acc, r) => addKicking(acc, r.kicking ?? ZERO_KICK), { ...ZERO_KICK })
  return { sOff, sDef, sKick }
}

// 시즌 누적값에서 어떤 스탯 카테고리를 표시할지 판단하는 플래그.
export function getStatFlags(sOff, sDef, sKick) {
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
  return {
    hasRushing, hasReceiving, hasPassing, hasTackles, hasSacks, hasTFL, hasINT,
    hasFumbleRec, hasFG, hasPAT, hasKickoffs, hasPunts, hasReturns, hasKicking, hasAnyStats,
  }
}

// 표시할 스탯 행의 단일 소스. flag는 getStatFlags()의 키(또는 그 중 하나라도 참이면 되는 배열).
// get()은 표시용 값(숫자 또는 포맷된 문자열), compare()는 두 선수 비교용 순수 숫자(비교 불가하면
// undefined/null)를 반환한다. compare가 없으면 get()의 결과를 그대로 숫자 비교에 쓴다.
const STAT_ROWS = [
  { name: 'Carries', flag: 'hasRushing', get: (o) => o.rushAttempts },
  { name: 'Rush Yds', flag: 'hasRushing', get: (o) => o.rushYards },
  { name: 'Rush TD', flag: 'hasRushing', get: (o) => o.rushTD },
  { name: 'Receptions', flag: 'hasReceiving', get: (o) => o.receptions },
  { name: 'Rec Yds', flag: 'hasReceiving', get: (o) => o.recYards },
  { name: 'Rec TD', flag: 'hasReceiving', get: (o) => o.recTD },
  {
    name: 'Comp/Att', flag: 'hasPassing',
    get: (o) => (o.passAttempts > 0 ? `${o.completions}/${o.passAttempts}` : '-'),
    compare: (o) => o.completions,
  },
  {
    name: 'Comp %', flag: 'hasPassing',
    get: (o) => (o.passAttempts > 0 ? `${Math.round((o.completions / o.passAttempts) * 100)}%` : '-'),
    compare: (o) => (o.passAttempts > 0 ? (o.completions / o.passAttempts) * 100 : null),
  },
  { name: 'Pass Yds', flag: 'hasPassing', get: (o) => o.passYards },
  { name: 'Pass TD', flag: 'hasPassing', get: (o) => o.passTD },
  { name: 'INT', flag: 'hasPassing', get: (o) => o.passINT },
  { name: 'Tackles', flag: 'hasTackles', get: (_o, d) => d.tackles },
  { name: 'Assists', flag: 'hasTackles', get: (_o, d) => d.assists },
  { name: 'Sacks', flag: 'hasSacks', get: (_o, d) => d.sacks },
  { name: 'TFL', flag: 'hasTFL', get: (_o, d) => d.tfl },
  { name: 'Interceptions', flag: 'hasINT', get: (_o, d) => d.interceptions },
  { name: 'Fum Rec', flag: 'hasFumbleRec', get: (_o, d) => d.fumbleRec },
  {
    name: 'FG', flag: 'hasFG',
    get: (_o, _d, k) => (k.fgAtt > 0 ? `${k.fgMade}/${k.fgAtt}` : '-'),
    compare: (_o, _d, k) => k.fgMade,
  },
  {
    name: 'PAT', flag: 'hasPAT',
    get: (_o, _d, k) => (k.patAtt > 0 ? `${k.patMade}/${k.patAtt}` : '-'),
    compare: (_o, _d, k) => k.patMade,
  },
  { name: 'Kickoffs', flag: 'hasKickoffs', get: (_o, _d, k) => k.kickoffs },
  { name: 'Punts', flag: 'hasPunts', get: (_o, _d, k) => k.punts },
  {
    name: 'Punt Avg', flag: 'hasPunts',
    get: (_o, _d, k) => (k.puntYardsCounted > 0 ? (k.puntYards / k.puntYardsCounted).toFixed(1) : '-'),
    compare: (_o, _d, k) => (k.puntYardsCounted > 0 ? k.puntYards / k.puntYardsCounted : null),
  },
  { name: 'Returns', flag: 'hasReturns', get: (_o, _d, k) => k.returns },
  { name: 'Return Yds', flag: 'hasReturns', get: (_o, _d, k) => k.returnYards },
  { name: 'Points', flag: ['hasFG', 'hasPAT'], get: (_o, _d, k) => k.points },
]

function flagActive(flag, flags) {
  return Array.isArray(flag) ? flag.some((f) => flags[f]) : flags[flag]
}

// PlayerDetail용: 단일 선수의 {name, value} 카드 목록.
export function buildSeasonBoxes(sOff, sDef, sKick, flags) {
  return STAT_ROWS
    .filter((row) => flagActive(row.flag, flags))
    .map((row) => ({ name: row.name, value: row.get(sOff, sDef, sKick) }))
}

// Compare용: 두 선수의 {name, displayA, displayB, winner} 행 목록.
// 두 선수 중 한쪽이라도 해당 카테고리 활동이 있으면 행을 표시하고, 없는 쪽은 get()이
// 알아서 0 또는 '-'를 반환한다(시즌 합계가 전부 0인 ZERO_* 기본값 기준으로 계산되므로).
export function buildCompareRows(a, b) {
  return STAT_ROWS
    .filter((row) => flagActive(row.flag, a.flags) || flagActive(row.flag, b.flags))
    .map((row) => {
      const displayA = row.get(a.sOff, a.sDef, a.sKick)
      const displayB = row.get(b.sOff, b.sDef, b.sKick)
      const compareFn = row.compare ?? row.get
      const rawA = compareFn(a.sOff, a.sDef, a.sKick)
      const rawB = compareFn(b.sOff, b.sDef, b.sKick)
      const cmpA = typeof rawA === 'number' ? rawA : null
      const cmpB = typeof rawB === 'number' ? rawB : null
      const winner = cmpA != null && cmpB != null && cmpA !== cmpB ? (cmpA > cmpB ? 'A' : 'B') : null
      return { name: row.name, displayA, displayB, winner }
    })
}
