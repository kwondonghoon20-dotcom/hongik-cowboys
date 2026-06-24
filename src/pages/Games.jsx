import { useMemo, useState } from 'react'
import { getAllGames } from '../data/gameRepository'
import GameCard from '../components/GameCard'
import ExcelUploader from '../components/ExcelUploader'
import './Games.css'

export default function Games() {
  const [games, setGames] = useState(() => getAllGames())
  const seasons = useMemo(() => [...new Set(games.map((g) => g.season))].sort((a, b) => b - a), [games])
  const [activeSeason, setActiveSeason] = useState(null)
  const currentSeason = activeSeason ?? seasons[0]

  const filteredGames = games
    .filter((g) => g.season === currentSeason)
    .sort((a, b) => new Date(a.date) - new Date(b.date))

  return (
    <div className="page-games">
      <div className="page-hero">
        <div className="container">
          <h1>경기 일정 & 결과</h1>
          <p>홍익대학교 카우보이스</p>
        </div>
      </div>
      <div className="container">
        {import.meta.env.DEV && <ExcelUploader onUploaded={() => setGames(getAllGames())} />}
        <div className="season-tabs">
          {seasons.map((season) => (
            <button
              key={season}
              className={'season-tab' + (season === currentSeason ? ' active' : '')}
              onClick={() => setActiveSeason(season)}
            >
              {season}
            </button>
          ))}
        </div>
        <div className="game-grid">
          {filteredGames.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      </div>
    </div>
  )
}
