import { Link } from 'react-router-dom'
import './GameCard.css'

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']

// "2026-09-05" 같은 날짜 문자열을 로컬 자정 기준 Date로 변환.
// new Date('YYYY-MM-DD')는 UTC로 해석돼 시간대에 따라 하루 밀릴 수 있어 직접 파싱한다.
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

export default function GameCard({ game }) {
  const hasScore = game.homeScore != null && game.awayScore != null
  const opponent = game.isHome ? game.awayTeam : game.homeTeam
  const dday = daysUntil(game.date)
  const isUpcoming = !hasScore && (dday == null || dday >= 0)

  if (hasScore) {
    const ourScore = game.isHome ? game.homeScore : game.awayScore
    const oppScore = game.isHome ? game.awayScore : game.homeScore
    const isWin = ourScore > oppScore

    return (
      <Link to={`/games/${game.id}`} className="game-card">
        <div className="game-card-top">
          <span className="game-card-type">{game.gameType}</span>
          <span className={'game-card-result ' + (isWin ? 'win' : 'loss')}>{isWin ? '승' : '패'}</span>
        </div>
        <h3 className="game-card-opponent">vs {opponent}</h3>
        <div className="game-card-score">
          {ourScore} : {oppScore}
        </div>
        <div className="game-card-meta">
          <span>{game.date}</span>
          <span>{game.isHome ? '홈' : '어웨이'}</span>
        </div>
      </Link>
    )
  }

  if (isUpcoming) {
    return (
      <div className="game-card game-card-upcoming">
        <div className="game-card-top">
          <span className="game-card-type">{game.gameType}</span>
          <span className="game-card-badge upcoming">{dday == null ? '일정 조정 중' : dday === 0 ? 'D-DAY' : `D-${dday}`}</span>
        </div>
        <h3 className="game-card-opponent">vs {opponent}</h3>
        <div className="game-card-schedule">
          <span>{game.date ? formatDate(game.date) : '일정 조정 중'}</span>
          {game.time && <span>{game.time}</span>}
        </div>
        <div className="game-card-meta">
          <span>{game.venue || '장소 미정'}</span>
          <span>{game.isHome ? '홈' : '어웨이'}</span>
        </div>
      </div>
    )
  }

  // 날짜가 지났는데 점수가 없는 경우: 결과 입력 대기
  return (
    <div className="game-card game-card-pending">
      <div className="game-card-top">
        <span className="game-card-type">{game.gameType}</span>
        <span className="game-card-badge pending">결과 대기</span>
      </div>
      <h3 className="game-card-opponent">vs {opponent}</h3>
      <p className="game-card-pending-note">경기 종료 · 결과 입력 대기</p>
      <div className="game-card-meta">
        <span>{game.date}</span>
        <span>{game.isHome ? '홈' : '어웨이'}</span>
      </div>
    </div>
  )
}
