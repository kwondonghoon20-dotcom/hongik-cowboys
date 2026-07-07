import { useState, useEffect } from 'react'
import { games as dummyGames, players } from './dummy'
import { calcTeamStats, toPlayLogEntries, pickRushMvp, parseGame, OUR_TEAM } from '../utils/parseExcel'
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

// 빌드 시 src/data/games/*.xlsm 파일을 자동 감지 (asset URL로 import)
const _globUrls = import.meta.glob('./games/*.xlsm', { query: '?url', import: 'default', eager: true })

// 모듈 로드 시 한 번만 실행되는 Promise — 여러 컴포넌트가 공유
const _globGamesPromise = (async () => {
  const entries = Object.entries(_globUrls)
  if (entries.length === 0) return []
  const results = await Promise.all(
    entries.map(async ([path, url]) => {
      try {
        const { meta, plays } = await parseGame(url)
        const filename = path.split('/').pop()
        return buildFromUpload({ id: `glob-${filename}`, meta, plays })
      } catch (e) {
        console.error('[gameRepository] 파싱 실패:', path, e)
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
