import { games as dummyGames, players } from './dummy'
import { calcTeamStats, toPlayLogEntries, pickRushMvp, OUR_TEAM } from '../utils/parseExcel'
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
  }
}

export function getAllGames() {
  const uploaded = getUploadedGames().map(buildFromUpload)
  return [...dummyGames, ...uploaded]
}

export function getGameById(id) {
  return getAllGames().find((game) => game.id === id) ?? null
}
