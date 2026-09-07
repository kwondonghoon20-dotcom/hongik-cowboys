import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { players, coaches, managers, getRosterForYear, getRosterYears } from '../data/dummy'
import PlayerCard from '../components/PlayerCard'
import CoachCard from '../components/CoachCard'
import ManagerCard from '../components/ManagerCard'
import './Roster.css'

export const POSITIONS = ['OL', 'DL', 'RB', 'LB', 'WR', 'DB', 'QB', 'TE', 'K']
const TABS = [
  { key: 'players', label: '선수단' },
  { key: 'coaches', label: '코치진' },
  { key: 'managers', label: '매니저' },
]

export default function Roster() {
  const [activeTab, setActiveTab] = useState('players')
  const [positionFilter, setPositionFilter] = useState('전체')
  const [yearFilter, setYearFilter] = useState('전체')
  const [searchParams, setSearchParams] = useSearchParams()

  const rosterYears = useMemo(() => getRosterYears(), [])

  // 시즌(연도) 필터 — URL 쿼리(?year=)와 연동된다. 초기값: URL에 year가 있으면 그 값,
  // 없으면 최신 시즌. "전체 선수" 선택 시에만 명시적으로 null이 되고 URL 쿼리가 제거된다
  // (URL 쿼리를 매 렌더 다시 읽어 기본값으로 되돌리면 "전체 선수" 클릭이 무효화되므로
  // 별도 state로 관리하고 클릭 시에만 URL과 함께 갱신한다).
  const [seasonYear, setSeasonYear] = useState(() => {
    const fromUrl = searchParams.get('year')
    if (fromUrl != null) return Number(fromUrl)
    return rosterYears[0] ?? null
  })

  const selectAllSeasons = () => {
    setSeasonYear(null)
    const next = new URLSearchParams(searchParams)
    next.delete('year')
    setSearchParams(next)
  }

  const selectSeason = (year) => {
    setSeasonYear(year)
    const next = new URLSearchParams(searchParams)
    next.set('year', String(year))
    setSearchParams(next)
  }

  const years = useMemo(() => [...new Set(players.map((p) => p.year))].sort((a, b) => b - a), [])

  let seasonPlayers = players
  let seasonNoDataMessage = null
  if (seasonYear != null) {
    const rosterForYear = getRosterForYear(seasonYear)
    if (rosterForYear == null) {
      seasonPlayers = []
      seasonNoDataMessage = `아직 ${seasonYear}년 로스터 데이터가 입력되지 않았습니다.`
    } else {
      seasonPlayers = rosterForYear
    }
  }

  const filteredPlayers = seasonPlayers
    .filter((p) => {
      const matchesPosition =
        positionFilter === '전체' ||
        p.positions.offense === positionFilter ||
        p.positions.defense === positionFilter ||
        p.positions.special === positionFilter
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
              <span className="filter-label">시즌</span>
              <div className="filter-chips">
                <button
                  className={'filter-chip' + (seasonYear === null ? ' active' : '')}
                  onClick={selectAllSeasons}
                >
                  전체 선수
                </button>
                {rosterYears.map((year) => (
                  <button
                    key={year}
                    className={'filter-chip' + (seasonYear === year ? ' active' : '')}
                    onClick={() => selectSeason(year)}
                  >
                    {year}
                  </button>
                ))}
              </div>
            </div>

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

            {seasonNoDataMessage ? (
              <p className="empty-note">{seasonNoDataMessage}</p>
            ) : (
              <div className="roster-grid">
                {filteredPlayers.map((player) => (
                  <PlayerCard key={player.id} player={player} year={seasonYear} />
                ))}
                {filteredPlayers.length === 0 && <p className="empty-note">해당 조건의 선수가 없습니다.</p>}
              </div>
            )}
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
