import { useMemo, useState } from 'react'
import { getAllGames, useGlobGames } from '../data/gameRepository'
import { OUR_TEAM } from '../utils/parseExcel'
import GameCard from '../components/GameCard'
import ExcelUploader from '../components/ExcelUploader'
import './Games.css'

export default function Games() {
  const [uploadedGames, setUploadedGames] = useState(() => getAllGames())
  const globGames = useGlobGames()

  const games = useMemo(() => {
    const uploadedIds = new Set(uploadedGames.map((g) => g.id))
    const deduped = globGames.filter((g) => !uploadedIds.has(g.id))
    return [...uploadedGames, ...deduped]
  }, [uploadedGames, globGames])

  const tabs = useMemo(() => {
    const hicSeasons = [
      ...new Set(
        games
          .filter((g) => g.homeTeam === OUR_TEAM || g.awayTeam === OUR_TEAM)
          .map((g) => g.season)
      ),
    ].sort((a, b) => b - a)
    const hasSocial = games.some(
      (g) => g.homeTeam !== OUR_TEAM && g.awayTeam !== OUR_TEAM
    )
    return [
      ...hicSeasons.map((s) => ({ key: s, label: `${s} 추계` })),
      ...(hasSocial ? [{ key: 'social', label: '사회인' }] : []),
    ]
  }, [games])

  const [activeTab, setActiveTab] = useState(null)
  const currentTab = activeTab ?? tabs[0]?.key

  const filteredGames = useMemo(() => {
    if (currentTab === 'social') {
      return games
        .filter((g) => g.homeTeam !== OUR_TEAM && g.awayTeam !== OUR_TEAM)
        .sort((a, b) => new Date(a.date) - new Date(b.date))
    }
    return games
      .filter(
        (g) =>
          g.season === currentTab &&
          (g.homeTeam === OUR_TEAM || g.awayTeam === OUR_TEAM)
      )
      .sort((a, b) => new Date(a.date) - new Date(b.date))
  }, [games, currentTab])

  return (
    <div className="page-games">
      <div className="page-hero">
        <div className="container">
          <h1>경기 일정 & 결과</h1>
          <p>홍익대학교 카우보이스</p>
        </div>
      </div>
      <div className="container">
        {import.meta.env.DEV && <ExcelUploader onUploaded={() => setUploadedGames(getAllGames())} />}
        <div className="season-tabs">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              className={'season-tab' + (tab.key === currentTab ? ' active' : '')}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
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
