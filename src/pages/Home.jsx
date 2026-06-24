import { Link } from 'react-router-dom'
import './Home.css'

export default function Home() {
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
    </div>
  )
}
