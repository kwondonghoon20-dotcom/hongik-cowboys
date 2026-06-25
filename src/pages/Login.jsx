import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { login } from '../utils/auth'
import './Login.css'

export default function Login() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const location = useLocation()

  function handleSubmit(e) {
    e.preventDefault()

    if (login(password)) {
      const redirectTo = location.state?.from ?? '/'
      navigate(redirectTo, { replace: true })
    } else {
      setError('비밀번호가 올바르지 않습니다.')
      setPassword('')
    }
  }

  return (
    <div className="page-login">
      <form className="login-card" onSubmit={handleSubmit}>
        <h1 className="login-logo">
          HONGIK <span>COWBOYS</span>
        </h1>
        <p className="login-subtitle">팀 공용 비밀번호를 입력하세요</p>

        <input
          type="password"
          className="login-input"
          placeholder="비밀번호"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoFocus
        />

        {error && <p className="login-error">{error}</p>}

        <button type="submit" className="login-button">
          로그인
        </button>
      </form>
    </div>
  )
}
