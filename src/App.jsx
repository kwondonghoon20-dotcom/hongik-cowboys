import { useState, useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import Home from './pages/Home'
import Games from './pages/Games'
import GameDetail from './pages/GameDetail'
import Roster from './pages/Roster'
import PlayerDetail from './pages/PlayerDetail'
import Season from './pages/Season'
import Tactics from './pages/Tactics'
import Compare from './pages/Compare'
import CoverageQuiz from './pages/CoverageQuiz'

export default function App() {
  const location = useLocation()
  const isLoginPage = location.pathname === '/login'

  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('hicowboys_theme') === 'dark'
  })

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
    localStorage.setItem('hicowboys_theme', darkMode ? 'dark' : 'light')
  }, [darkMode])

  const toggleDark = () => setDarkMode((v) => !v)

  return (
    <>
      {!isLoginPage && <Navbar darkMode={darkMode} toggleDark={toggleDark} />}
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/games"
          element={
            <ProtectedRoute>
              <Games />
            </ProtectedRoute>
          }
        />
        <Route
          path="/games/:id"
          element={
            <ProtectedRoute>
              <GameDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/season"
          element={
            <ProtectedRoute>
              <Season />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tactics"
          element={
            <ProtectedRoute>
              <Tactics />
            </ProtectedRoute>
          }
        />
        <Route
          path="/roster"
          element={
            <ProtectedRoute>
              <Roster />
            </ProtectedRoute>
          }
        />
        <Route
          path="/compare"
          element={
            <ProtectedRoute>
              <Compare />
            </ProtectedRoute>
          }
        />
        <Route
          path="/coverage-quiz"
          element={
            <ProtectedRoute>
              <CoverageQuiz />
            </ProtectedRoute>
          }
        />
        <Route
          path="/roster/:id"
          element={
            <ProtectedRoute>
              <PlayerDetail />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  )
}
