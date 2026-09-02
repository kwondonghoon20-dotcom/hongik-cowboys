import { useState, useEffect } from 'react'
import { players } from '../data/dummy'
import { FORMATIONS } from '../data/formations'
import { PLAYBOOK } from '../data/playbook'
import { getSavedPlays, savePlay, removeSavedPlay } from '../data/savedPlays'
import { CENTER } from '../utils/fieldGeometry'
import FieldCanvas from '../components/tactics/FieldCanvas'
import RosterRail from '../components/tactics/RosterRail'
import RouteMenu from '../components/tactics/RouteMenu'
import './Tactics.css'

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2)
}

function exportCode(play) {
  const p = JSON.parse(JSON.stringify(play))
  p.players = p.players.map((pp) => ({
    ...pp,
    x: Number(pp.x.toFixed(2)),
    d: Number(pp.d.toFixed(2)),
  }))
  return JSON.stringify(p, null, 2)
}

export default function Tactics() {
  const [playName, setPlayName] = useState('I-Form 26 Power')
  const [offFormation, setOffFormation] = useState('iform')
  const [defFormation, setDefFormation] = useState('d43')
  const [placedPlayers, setPlacedPlayers] = useState([])
  const [assignments, setAssignments] = useState({})
  const [selectedId, setSelectedId] = useState(null)
  const [railSide, setRailSide] = useState('offense')
  const [savedPlays, setSavedPlays] = useState([])

  const applyFormation = (formationKey, side) => {
    const formation = FORMATIONS[formationKey]
    if (!formation) return

    const posKey = side // 'offense' or 'defense'

    setPlacedPlayers((prev) => {
      // Remove existing players of this side
      const kept = prev.filter((p) => p.side !== side)
      const alreadyUsed = new Set(kept.map((p) => p.playerId))

      const newPlacements = []
      formation.slots.forEach((slot) => {
        // Find a matching player: positions[side] matches slot.pos, not yet used
        const posMatch = players
          .filter((p) => p.positions[posKey] === slot.pos && !alreadyUsed.has(p.id))
          .sort((a, b) => {
            // Grade higher first
            if (b.grade !== a.grade) return b.grade - a.grade
            // Number lower first (null goes to end)
            const na = a.number ?? Infinity
            const nb = b.number ?? Infinity
            return na - nb
          })

        let chosen = posMatch[0] ?? null
        if (!chosen) {
          // Fall back to any unused player
          const fallback = players.find((p) => !alreadyUsed.has(p.id))
          chosen = fallback ?? null
        }

        if (chosen) {
          alreadyUsed.add(chosen.id)
          newPlacements.push({
            playerId: chosen.id,
            side,
            x: slot.x,
            d: slot.d,
            role: slot.role,
            pos: slot.pos,
          })
        }
      })

      return [...kept, ...newPlacements]
    })
  }

  useEffect(() => {
    applyFormation('iform', 'offense')
    applyFormation('d43', 'defense')
    setSavedPlays(getSavedPlays())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleFormationChange = (formationKey, side) => {
    if (side === 'offense') setOffFormation(formationKey)
    else setDefFormation(formationKey)
    applyFormation(formationKey, side)
  }

  const clearSide = (side) => {
    setPlacedPlayers((prev) => prev.filter((p) => p.side !== side))
  }

  const resetAll = () => {
    setPlacedPlayers([])
    setAssignments({})
    setSelectedId(null)
    setOffFormation('iform')
    setDefFormation('d43')
    applyFormation('iform', 'offense')
    applyFormation('d43', 'defense')
  }

  const togglePlayer = (player) => {
    setPlacedPlayers((prev) => {
      const existing = prev.find((p) => p.playerId === player.id)
      if (existing) {
        return prev.filter((p) => p.playerId !== player.id)
      }
      // Add to sideline position
      const side = railSide
      const sideCount = prev.filter((p) => p.side === side).length
      const d = side === 'offense' ? -13.5 : 22.5
      const x = 4 + sideCount * 9
      return [...prev, {
        playerId: player.id,
        side,
        x: Math.min(x, 48),
        d,
        role: player.positions[side] ?? '?',
        pos: player.positions[side] ?? '?',
      }]
    })
  }

  const handleMovePlayer = (playerId, newX, newD) => {
    setPlacedPlayers((prev) =>
      prev.map((p) => p.playerId === playerId ? { ...p, x: newX, d: newD } : p)
    )
  }

  const handleSave = () => {
    const play = {
      id: generateId(),
      name: playName,
      offFormation,
      defFormation,
      players: placedPlayers.map((p) => ({
        playerId: p.playerId,
        side: p.side,
        x: p.x,
        d: p.d,
        role: p.role,
        pos: p.pos,
      })),
      assignments: { ...assignments },
    }
    savePlay(play)
    setSavedPlays(getSavedPlays())
  }

  const loadPlay = (play) => {
    setPlayName(play.name)
    if (play.offFormation) setOffFormation(play.offFormation)
    if (play.defFormation) setDefFormation(play.defFormation)
    setPlacedPlayers(play.players || [])
    setAssignments(play.assignments || {})
    setSelectedId(null)
  }

  const deletePlay = (id) => {
    removeSavedPlay(id)
    setSavedPlays(getSavedPlays())
  }

  const copyCode = (play) => {
    const code = exportCode(play)
    navigator.clipboard.writeText(code).catch(() => {
      // Fallback: alert with code
      window.alert('클립보드 복사 실패.\n\n' + code)
    })
  }

  const committedIds = new Set(PLAYBOOK.map((p) => p.id))
  const isCommitted = (id) => committedIds.has(id)

  // Merge PLAYBOOK and savedPlays: localStorage wins on same id
  const savedMap = {}
  savedPlays.forEach((p) => { savedMap[p.id] = p })
  const allPlays = [
    ...PLAYBOOK.filter((p) => !savedMap[p.id]),
    ...savedPlays,
  ]

  const offFormations = Object.entries(FORMATIONS).filter(([, f]) => f.side === 'offense')
  const defFormations = Object.entries(FORMATIONS).filter(([, f]) => f.side === 'defense')

  const selectedPlayer = selectedId ? players.find((p) => p.id === selectedId) : null

  return (
    <div className="page-tactics">
      <div className="tactics-hero">
        <div className="container">
          <h1>전술판</h1>
          <input
            className="play-name-input"
            value={playName}
            onChange={(e) => setPlayName(e.target.value)}
            placeholder="플레이 이름"
          />
        </div>
      </div>
      <div className="container">
        <div className="tactics-toolbar">
          <div className="tactics-toolbar-group">
            <span className="toolbar-label">오펜스:</span>
            {offFormations.map(([key, f]) => (
              <button
                key={key}
                className={'tactics-formation-btn' + (offFormation === key ? ' active' : '')}
                onClick={() => handleFormationChange(key, 'offense')}
              >
                {f.label}
              </button>
            ))}
          </div>
          <div className="tactics-toolbar-group">
            <span className="toolbar-label">디펜스:</span>
            {defFormations.map(([key, f]) => (
              <button
                key={key}
                className={'tactics-formation-btn' + (defFormation === key ? ' active' : '')}
                onClick={() => handleFormationChange(key, 'defense')}
              >
                {f.label}
              </button>
            ))}
          </div>
          <div className="tactics-toolbar-actions">
            <button className="tactics-action-btn" onClick={() => clearSide('offense')}>오펜스 비우기</button>
            <button className="tactics-action-btn" onClick={() => clearSide('defense')}>디펜스 비우기</button>
            <button className="tactics-action-btn" onClick={resetAll}>전체 초기화</button>
          </div>
        </div>

        <div className="tactics-main">
          <div className="tactics-field-col">
            <FieldCanvas
              players={placedPlayers}
              assignments={assignments}
              selectedId={selectedId}
              onSelectPlayer={setSelectedId}
              onMovePlayer={handleMovePlayer}
              rosterPlayers={players}
            />
          </div>
          <div className="tactics-rail-col">
            <RosterRail
              side={railSide}
              onSideChange={setRailSide}
              placedIds={new Set(placedPlayers.filter((p) => p.side === railSide).map((p) => p.playerId))}
              onTogglePlayer={togglePlayer}
              playerCount={placedPlayers.filter((p) => p.side === railSide).length}
            />
            {selectedId && selectedPlayer && (
              <RouteMenu
                player={selectedPlayer}
                assignment={assignments[selectedId] ?? null}
                onSetRoute={(r) =>
                  setAssignments((a) => ({
                    ...a,
                    [selectedId]: { route: r, flip: assignments[selectedId]?.flip ?? false },
                  }))
                }
                onClearRoute={() =>
                  setAssignments((a) => {
                    const n = { ...a }
                    delete n[selectedId]
                    return n
                  })
                }
                onFlip={() =>
                  setAssignments((a) => ({
                    ...a,
                    [selectedId]: {
                      ...a[selectedId],
                      flip: !(a[selectedId]?.flip ?? false),
                    },
                  }))
                }
              />
            )}
          </div>
        </div>

        <div className="tactics-playbook">
          <h3 className="s-section-title">플레이북</h3>
          <div className="playbook-save-row">
            <button className="btn-save-play" onClick={handleSave}>현재 플레이 저장</button>
          </div>
          {allPlays.length === 0 && (
            <p className="empty-note">저장된 플레이가 없습니다.</p>
          )}
          <div className="playbook-list">
            {allPlays.map((play) => (
              <div key={play.id} className="playbook-item">
                <span className="playbook-name">{play.name}</span>
                <span className={'playbook-badge ' + (isCommitted(play.id) ? 'committed' : 'temp')}>
                  {isCommitted(play.id) ? '커밋됨' : '임시'}
                </span>
                <button className="playbook-btn" onClick={() => loadPlay(play)}>불러오기</button>
                <button className="playbook-btn" onClick={() => copyCode(play)}>코드 복사</button>
                {!isCommitted(play.id) && (
                  <button className="playbook-btn danger" onClick={() => deletePlay(play.id)}>삭제</button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
