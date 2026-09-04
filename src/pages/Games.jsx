import { useMemo, useState } from 'react'
import { getAllGames, useGlobGames } from '../data/gameRepository'
import { OUR_TEAM } from '../utils/parseExcel'
import GameCard from '../components/GameCard'
import ExcelUploader from '../components/ExcelUploader'
import './Games.css'

// 날짜 미정(date: null) 경기는 new Date(null)이 1970년으로 취급돼 맨 앞으로 밀리므로
// 항상 목록 맨 뒤로 보낸다.
function byDate(a, b) {
  if (!a.date && !b.date) return 0
  if (!a.date) return 1
  if (!b.date) return -1
  return new Date(a.date) - new Date(b.date)
}

export default function Games() {
  const [uploadedGames, setUploadedGames] = useState(() => getAllGames())
  const globGames = useGlobGames()

  const games = useMemo(() => {
    const uploadedIds = new Set(uploadedGames.map((g) => g.id))
    const deduped = globGames.filter((g) => !uploadedIds.has(g.id))
    return [...uploadedGames, ...deduped]
  }, [uploadedGames, globGames])

  const tabs = useMemo(() => {
    const hicGames = games.filter((g) => g.homeTeam === OUR_TEAM || g.awayTeam === OUR_TEAM)
    const tabKeySet = new Set(hicGames.map((g) => `${g.season}-${g.semester ?? 'fall'}`))
    const sortedKeys = [...tabKeySet].sort((a, b) => {
      const [ay, as] = a.split('-')
      const [by, bs] = b.split('-')
      if (ay !== by) return Number(by) - Number(ay)
      // 같은 연도: 춘계(spring) 먼저
      return as === 'spring' ? -1 : 1
    })
    const hasSocial = games.some((g) => g.homeTeam !== OUR_TEAM && g.awayTeam !== OUR_TEAM)
    return [
      ...sortedKeys.map((k) => {
        const [year, sem] = k.split('-')
        return { key: k, label: `${year} ${sem === 'spring' ? '춘계' : '추계'}` }
      }),
      ...(hasSocial ? [{ key: 'social', label: '사회인' }] : []),
    ]
  }, [games])

  const [activeTab, setActiveTab] = useState(null)
  const currentTab = activeTab ?? tabs[0]?.key

  const filteredGames = useMemo(() => {
    if (currentTab === 'social') {
      return games
        .filter((g) => g.homeTeam !== OUR_TEAM && g.awayTeam !== OUR_TEAM)
        .sort(byDate)
    }
    const [tabYear, tabSem] = currentTab ? currentTab.split('-') : ['', '']
    return games
      .filter(
        (g) =>
          String(g.season) === tabYear &&
          (g.semester ?? 'fall') === tabSem &&
          (g.homeTeam === OUR_TEAM || g.awayTeam === OUR_TEAM)
      )
      .sort(byDate)
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
