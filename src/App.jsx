import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Games from './pages/Games'
import GameDetail from './pages/GameDetail'
import Roster from './pages/Roster'
import PlayerDetail from './pages/PlayerDetail'

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/games" element={<Games />} />
        <Route path="/games/:id" element={<GameDetail />} />
        <Route path="/roster" element={<Roster />} />
        <Route path="/roster/:id" element={<PlayerDetail />} />
      </Routes>
    </>
  )
}
