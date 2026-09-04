import { Link } from 'react-router-dom'
import { UPCOMING_GAMES } from '../data/upcomingGames'
import './Home.css'

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']

// "2026-09-05" 같은 날짜 문자열을 로컬 자정 기준 Date로 변환.
// new Date('YYYY-MM-DD')는 UTC로 해석돼 시간대에 따라 하루가 밀릴 수 있어 직접 파싱한다.
function parseLocalDate(dateStr) {
  if (!dateStr) return null
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(y, m - 1, d)
}

function formatDate(dateStr) {
  const d = parseLocalDate(dateStr)
  if (!d) return null
  return `${dateStr} (${WEEKDAYS[d.getDay()]})`
}

// 오늘(로컬 자정) 기준 남은 일수. 날짜 미정이면 null.
function daysUntil(dateStr) {
  const target = parseLocalDate(dateStr)
  if (!target) return null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return Math.round((target - today) / 86400000)
}

export default function Home() {
  const nextGame = UPCOMING_GAMES
    .map((g) => ({ ...g, dday: daysUntil(g.date) }))
    .filter((g) => g.dday != null && g.dday >= 0)
    .sort((a, b) => a.dday - b.dday)[0] ?? null

  // 날짜 미정 경기는 리스트 맨 뒤로.
  const scheduleList = [...UPCOMING_GAMES].sort((a, b) => {
    if (!a.date && !b.date) return 0
    if (!a.date) return 1
    if (!b.date) return -1
    return a.date.localeCompare(b.date)
  })

  return (
    <div className="page-home">
      <div className="home-hero">
        <div className="container">
          <h1>
            HONGIK <span>COWBOYS</span>
          </h1>
          <p>홍익대학교 미식축구팀 공식 스탯 사이트</p>
          <div className="home-actions">
            <Link to="/games" className="btn btn-primary">
              경기 보기
            </Link>
            <Link to="/roster" className="btn btn-outline">
              로스터 보기
            </Link>
          </div>
        </div>
      </div>

      <div className="container home-section">
        <h2 className="home-section-title">다음 경기</h2>
        {nextGame ? (
          <div className="countdown-card">
            <div className="countdown-dday">{nextGame.dday === 0 ? 'D-DAY' : `D-${nextGame.dday}`}</div>
            <div className="countdown-info">
              <div className="countdown-opponent">vs {nextGame.opponent}</div>
              <div className="countdown-meta">{formatDate(nextGame.date)} · {nextGame.time}</div>
              <div className="countdown-location">{nextGame.location}</div>
            </div>
          </div>
        ) : (
          <p className="home-empty-note">예정된 경기가 없습니다.</p>
        )}
      </div>

      <div className="container home-section">
        <h2 className="home-section-title">예정 경기 일정</h2>
        <div className="schedule-list">
          {scheduleList.map((g) => (
            <div key={g.opponentEng} className="schedule-row">
              <div className="schedule-matchup">홍익 카우보이스 vs {g.opponent}</div>
              <div className="schedule-datetime">
                {g.date ? `${formatDate(g.date)} · ${g.time}` : '일정 조정 중'}
              </div>
              <div className="schedule-location">{g.location ?? '장소 미정'}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
