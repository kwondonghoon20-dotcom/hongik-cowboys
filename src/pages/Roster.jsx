import { useMemo, useState } from 'react'
import { players, coaches, managers } from '../data/dummy'
import PlayerCard from '../components/PlayerCard'
import CoachCard from '../components/CoachCard'
import ManagerCard from '../components/ManagerCard'
import './Roster.css'

const POSITIONS = ['OL', 'DL', 'RB', 'LB', 'WR', 'DB', 'QB', 'TE']
const TABS = [
  { key: 'players', label: '선수단' },
  { key: 'coaches', label: '코치진' },
  { key: 'managers', label: '매니저' },
]

export default function Roster() {
  const [activeTab, setActiveTab] = useState('players')
  const [positionFilter, setPositionFilter] = useState('전체')
  const [yearFilter, setYearFilter] = useState('전체')

  const years = useMemo(() => [...new Set(players.map((p) => p.year))].sort((a, b) => b - a), [])

  const filteredPlayers = players
    .filter((p) => {
      const matchesPosition =
        positionFilter === '전체' || p.positions.offense === positionFilter || p.positions.defense === positionFilter
      const matchesYear = yearFilter === '전체' || p.year === yearFilter
      return matchesPosition && matchesYear
    })
    .sort((a, b) => b.grade - a.grade || a.year - b.year)

  const headCoach = coaches.find((c) => c.isHeadCoach)
  const otherCoaches = coaches.filter((c) => !c.isHeadCoach)

  return (
    <div className="page-roster">
      <div className="page-hero">
        <div className="container">
          <h1>선수 로스터</h1>
          <p>홍익대학교 카우보이스</p>
        </div>
      </div>
      <div className="container">
        <div className="roster-tabs">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              className={'roster-tab' + (activeTab === tab.key ? ' active' : '')}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'players' && (
          <>
            <div className="filter-group">
              <span className="filter-label">포지션</span>
              <div className="filter-chips">
                <button
                  className={'filter-chip' + (positionFilter === '전체' ? ' active' : '')}
                  onClick={() => setPositionFilter('전체')}
                >
                  전체
                </button>
                {POSITIONS.map((pos) => (
                  <button
                    key={pos}
                    className={'filter-chip' + (positionFilter === pos ? ' active' : '')}
                    onClick={() => setPositionFilter(pos)}
                  >
                    {pos}
                  </button>
                ))}
              </div>
            </div>

            <div className="filter-group">
              <span className="filter-label">학번</span>
              <div className="filter-chips">
                <button
                  className={'filter-chip' + (yearFilter === '전체' ? ' active' : '')}
                  onClick={() => setYearFilter('전체')}
                >
                  전체
                </button>
                {years.map((year) => (
                  <button
                    key={year}
                    className={'filter-chip' + (yearFilter === year ? ' active' : '')}
                    onClick={() => setYearFilter(year)}
                  >
                    {year}학번
                  </button>
                ))}
              </div>
            </div>

            <div className="roster-grid">
              {filteredPlayers.map((player) => (
                <PlayerCard key={player.id} player={player} />
              ))}
              {filteredPlayers.length === 0 && <p className="empty-note">해당 조건의 선수가 없습니다.</p>}
            </div>
          </>
        )}

        {activeTab === 'coaches' && (
          <>
            {headCoach && (
              <div className="head-coach-wrap">
                <CoachCard coach={headCoach} large />
              </div>
            )}
            <div className="coach-grid">
              {otherCoaches.map((coach) => (
                <CoachCard key={coach.id} coach={coach} />
              ))}
            </div>
          </>
        )}

        {activeTab === 'managers' && (
          <div className="manager-grid">
            {managers.map((manager) => (
              <ManagerCard key={manager.id} manager={manager} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
