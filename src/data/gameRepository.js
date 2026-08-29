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
      home: calcTeamStats(plays, homeTeam),
      away: calcTeamStats(plays, awayTeam),
    },
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
  '건국(Away) vs 홍익 경기 데이터.xlsx': {
    gameKey: 'HIcowboys_20241019_vs_Konkuk',
    date: '2024-10-19',
    type: 'League',
    home: 'Konkuk',
    away: OUR_TEAM,
    homeScore: 25,
    awayScore: 8,
    location: '',
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
