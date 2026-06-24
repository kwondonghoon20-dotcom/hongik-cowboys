import { games, OUR_TEAM } from './dummy'

const OFFENSE_SKILL_POSITIONS = ['QB', 'RB', 'WR', 'TE']

function seededRandom(seed) {
  const x = Math.sin(seed * 9301 + 49297) * 233280
  return x - Math.floor(x)
}

function primaryCategory(player) {
  if (OFFENSE_SKILL_POSITIONS.includes(player.positions.offense)) {
    return player.positions.offense
  }
  return player.positions.defense
}

function statLine(category, seed) {
  const r = (n, mult = 1) => Math.round(seededRandom(seed + n) * mult)

  switch (category) {
    case 'QB': {
      const attempts = 12 + r(1, 10)
      const completions = Math.min(attempts, Math.round(attempts * (0.5 + seededRandom(seed) * 0.3)))
      return {
        label: '패싱',
        stats: [
          { name: '패스 성공/시도', value: `${completions}/${attempts}` },
          { name: '패싱 야드', value: 80 + r(2, 140) },
          { name: '패싱 TD', value: r(3, 3) },
          { name: '인터셉트', value: r(4, 2) },
        ],
      }
    }
    case 'RB':
      return {
        label: '러싱',
        stats: [
          { name: '캐리', value: 5 + r(1, 12) },
          { name: '러싱 야드', value: 30 + r(2, 100) },
          { name: '러싱 TD', value: r(3, 2) },
        ],
      }
    case 'WR':
    case 'TE':
      return {
        label: '리시빙',
        stats: [
          { name: '리셉션', value: 1 + r(1, 7) },
          { name: '리시빙 야드', value: 15 + r(2, 90) },
          { name: '리시빙 TD', value: r(3, 2) },
        ],
      }
    default:
      return {
        label: '디펜스',
        stats: [
          { name: '태클', value: 2 + r(1, 8) },
          { name: '색', value: r(2, 2) },
          { name: '인터셉트', value: r(3, 1) },
        ],
      }
  }
}

export function getSeasonStats(player) {
  const category = primaryCategory(player)
  const seed = (player.number || 0) + player.year * 7 + player.id.length
  const line = statLine(category, seed * 3)
  return { category: line.label, stats: line.stats }
}

export function getGameLog(player) {
  const category = primaryCategory(player)
  const seed = (player.number || 0) + player.year * 7 + player.id.length

  return games
    .slice()
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .map((game, idx) => {
      const opponent = game.homeTeam === OUR_TEAM ? game.awayTeam : game.homeTeam
      const line = statLine(category, seed + idx * 13)
      return {
        gameId: game.id,
        date: game.date,
        opponent,
        category: line.label,
        stats: line.stats,
      }
    })
}
