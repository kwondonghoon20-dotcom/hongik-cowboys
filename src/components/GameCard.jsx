import { Link } from 'react-router-dom'
import './GameCard.css'

export default function GameCard({ game }) {
  const ourScore = game.isHome ? game.homeScore : game.awayScore
  const oppScore = game.isHome ? game.awayScore : game.homeScore
  const isWin = ourScore > oppScore
  const opponent = game.isHome ? game.awayTeam : game.homeTeam

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
