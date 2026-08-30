import { useState, useEffect } from 'react'
import { games as dummyGames, players } from './dummy'
import { calcTeamStats, toPlayLogEntries, pickRushMvp, parseGame, parseAlternateGame, OUR_TEAM } from '../utils/parseExcel'
import { getUploadedGames } from './uploadedGames'

function resolveMvp(plays, teamName) {
  const rushMvp = pickRushMvp(plays, teamName)
  if (!rushMvp) return null

  const player = players.find((p) => String(p.number) === rushMvp.number)
  if (player) {
    return {
      id: player.id,
      number: player.number,
      name: player.name,
      position: player.positions.offense,
      highlight: `${rushMvp.yards} 러시야드`,
    }
  }

  return {
    id: null,
    number: rushMvp.number,
    name: `#${rushMvp.number}`,
    position: '-',
    highlight: `${rushMvp.yards} 러시야드`,
  }
}

function buildFromUpload(record) {
  const { meta, plays } = record
  const homeTeam = meta.home ?? 'Home'
  const awayTeam = meta.away ?? 'Away'
  const isHome = homeTeam === OUR_TEAM
  const ourTeam = isHome ? homeTeam : awayTeam === OUR_TEAM ? awayTeam : homeTeam

  return {
    id: record.id,
    gameKey: meta.gameKey ?? record.id,
    source: 'upload',
    season: meta.date ? Number(meta.date.slice(0, 4)) : new Date().getFullYear(),
    week: null,
    date: meta.date ?? meta.dateRaw ?? '',
    gameType: meta.type ?? 'League',
    venue: meta.location ?? '',
    homeTeam,
    awayTeam,
    isHome,
    homeScore: meta.homeScore ?? 0,
    awayScore: meta.awayScore ?? 0,
    teamStats: {
      home: { ...calcTeamStats(plays, homeTeam), ...(meta.overrideStats?.home ?? {}) },
      away: { ...calcTeamStats(plays, awayTeam), ...(meta.overrideStats?.away ?? {}) },
    },
    overrideStats: meta.overrideStats ?? null,
    mvp: resolveMvp(plays, ourTeam),
    playLog: toPlayLogEntries(plays),
    plays,
  }
}

// 빌드 시 src/data/games/*.xlsm — 표준 형식 (Index 시트 포함)
const _xlsmUrls = import.meta.glob('./games/*.xlsm', { query: '?url', import: 'default', eager: true })

// 빌드 시 src/data/games/*.xlsx — 대체 형식 (한글 팀명, 헤더 6행, Index 시트 없음)
const _xlsxUrls = import.meta.glob('./games/*.xlsx', { query: '?url', import: 'default', eager: true })

// xlsx 파일별 하드코딩 메타 (Index 시트가 없는 파일용)
// 새 경기 파일 추가 시 여기에 파일명과 메타를 추가하면 자동 반영됨
const XLSX_META_MAP = {
  '홍익 1경기 vs 국민 플레이별 데이터.xlsx': {
    gameKey: 'HIcowboys_20250913_vs_KMrazorbacks',
    date: '2025-09-13',
    type: 'League',
    home: 'KMrazorbacks',
    away: OUR_TEAM,
    homeScore: 6,
    awayScore: 9,
    location: '',
  },
  '홍익 2경기 vs 한국외대 플레이별 데이터.xlsx': {
    gameKey: 'HIcowboys_20251004_vs_HufsBlackKnights',
    date: '2025-10-04',
    type: 'League',
    home: OUR_TEAM,
    away: 'HufsBlackKnights',
    homeScore: 3,
    awayScore: 6,
    location: '효창운동장',
    headerRow: 0,
    overrideStats: {
      home: {
        playerStats: {
          25: { rushAtt:11, rushYds:61,  rushTD:0, passAtt:0, passComp:0, passYds:0, passTD:0, passINT:0, recAtt:0, recYds:0,   recTD:0 },
          26: { rushAtt:9,  rushYds:51,  rushTD:0, passAtt:0, passComp:0, passYds:0, passTD:0, passINT:0, recAtt:1, recYds:-5,  recTD:0 },
          9:  { rushAtt:5,  rushYds:0,   rushTD:0, passAtt:3, passComp:1, passYds:2, passTD:0, passINT:0, recAtt:0, recYds:0,   recTD:0 },
          17: { rushAtt:3,  rushYds:53,  rushTD:0, passAtt:0, passComp:0, passYds:0, passTD:0, passINT:0, recAtt:0, recYds:0,   recTD:0 },
          33: { rushAtt:2,  rushYds:8,   rushTD:0, passAtt:0, passComp:0, passYds:0, passTD:0, passINT:0, recAtt:0, recYds:0,   recTD:0 },
          4:  { rushAtt:1,  rushYds:-8,  rushTD:0, passAtt:0, passComp:0, passYds:0, passTD:0, passINT:0, recAtt:1, recYds:2,   recTD:0 },
          15: { rushAtt:1,  rushYds:-10, rushTD:0, passAtt:3, passComp:1, passYds:0, passTD:0, passINT:0, recAtt:0, recYds:0,   recTD:0 },
          12: { rushAtt:0,  rushYds:0,   rushTD:0, passAtt:2, passComp:0, passYds:0, passTD:0, passINT:0, recAtt:0, recYds:0,   recTD:0 },
        },
        tackles: { 26:3.5, 57:3.0, 72:1.5, 49:1.0, 14:1.0, 17:1.0, 61:1.0, 77:1.0, 4:1.5, 9:2.0 },
      },
    },
  },
  '홍익 3경기 vs 연세대 플레이별 데이터.xlsx': {
    gameKey: 'YonseiEagles_20250921_vs_HIcowboys',
    date: '2025-09-21',
    type: 'League',
    home: 'YonseiEagles',
    away: OUR_TEAM,
    homeScore: 28,
    awayScore: 14,
    location: '성동구 살곶이 축구장',
    headerRow: 0,
    overrideStats: {
      home: {
        totalYards: 184,
        rushYards: 71,
        rushAttempts: 18,
        passYards: 113,
        passAttempts: 17,
        completions: 8,
        turnovers: 0,
      },
      away: {
        totalYards: 113,
        rushYards: 63,
        rushAttempts: 23,
        passYards: 50,
        passAttempts: 13,
        completions: 8,
        turnovers: 0,
        playerStats: {
          25: { rushAtt:4,  rushYds:9,   rushTD:0, passAtt:0,  passComp:0, passYds:0,  passTD:0, passINT:0, recAtt:1, recYds:0,   recTD:0 },
          26: { rushAtt:5,  rushYds:-1,  rushTD:0, passAtt:0,  passComp:0, passYds:0,  passTD:0, passINT:0, recAtt:0, recYds:0,   recTD:0 },
          9:  { rushAtt:2,  rushYds:6,   rushTD:0, passAtt:13, passComp:8, passYds:50, passTD:1, passINT:0, recAtt:0, recYds:0,   recTD:0 },
          17: { rushAtt:2,  rushYds:0,   rushTD:0, passAtt:0,  passComp:0, passYds:0,  passTD:0, passINT:0, recAtt:3, recYds:-2,  recTD:0 },
          81: { rushAtt:3,  rushYds:20,  rushTD:0, passAtt:0,  passComp:0, passYds:0,  passTD:0, passINT:0, recAtt:0, recYds:0,   recTD:0 },
          12: { rushAtt:1,  rushYds:6,   rushTD:0, passAtt:0,  passComp:0, passYds:0,  passTD:0, passINT:0, recAtt:1, recYds:9,   recTD:0 },
          19: { rushAtt:1,  rushYds:-1,  rushTD:0, passAtt:0,  passComp:0, passYds:0,  passTD:0, passINT:0, recAtt:0, recYds:0,   recTD:0 },
          49: { rushAtt:2,  rushYds:12,  rushTD:0, passAtt:0,  passComp:0, passYds:0,  passTD:0, passINT:0, recAtt:0, recYds:0,   recTD:0 },
          2:  { rushAtt:1,  rushYds:0,   rushTD:1, passAtt:0,  passComp:0, passYds:0,  passTD:0, passINT:0, recAtt:1, recYds:37,  recTD:1 },
        },
        tackles: { 57:3.5, 66:1.5, 60:1.0, 77:1.0, 49:2.5, 19:2.0, 33:1.0, 17:2.0, 4:1.0, 81:1.0, 61:3.0, 14:2.0, 25:2.0 },
      },
    },
  },
}

// 모듈 로드 시 한 번만 실행되는 Promise — 여러 컴포넌트가 공유
const _globGamesPromise = (async () => {
  const xlsmEntries = Object.entries(_xlsmUrls).map(([path, url]) => ({ path, url, type: 'xlsm' }))
  const xlsxEntries = Object.entries(_xlsxUrls).map(([path, url]) => ({ path, url, type: 'xlsx' }))
  const allEntries = [...xlsmEntries, ...xlsxEntries]

  if (allEntries.length === 0) return []

  const results = await Promise.all(
    allEntries.map(async ({ path, url, type }) => {
      const filename = path.split('/').pop()
      try {
        let meta, plays
        if (type === 'xlsx') {
          const overrideMeta = XLSX_META_MAP[filename]
          if (!overrideMeta) return null // 메타 미등록 파일 건너뜀
          ;({ meta, plays } = await parseAlternateGame(url, overrideMeta))
        } else {
          ;({ meta, plays } = await parseGame(url))
        }
        return buildFromUpload({ id: `glob-${filename}`, meta, plays })
      } catch (e) {
        console.error('[gameRepository] 파싱 실패:', filename, e)
        return null
      }
    })
  )
  return results.filter(Boolean)
})()

export function useGlobGames() {
  const [globGames, setGlobGames] = useState([])
  useEffect(() => {
    _globGamesPromise.then(setGlobGames)
  }, [])
  return globGames
}

export function getAllGames() {
  const uploaded = getUploadedGames().map(buildFromUpload)
  return [...dummyGames, ...uploaded]
}

export function getGameById(id) {
  return getAllGames().find((game) => game.id === id) ?? null
}
