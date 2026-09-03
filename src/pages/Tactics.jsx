import { useState, useEffect, useCallback } from 'react'
import { players } from '../data/dummy'
import { FORMATIONS } from '../data/formations'
import { SHELLS } from '../data/coverages'
import { PLAYBOOK } from '../data/playbook'
import { getSavedPlays, savePlay, removeSavedPlay } from '../data/savedPlays'
import FieldCanvas from '../components/tactics/FieldCanvas'
import RosterRail from '../components/tactics/RosterRail'
import AssignMenu from '../components/tactics/AssignMenu'
import './Tactics.css'

const SHOWNAMES_KEY = 'hicowboys_tactics_shownames'
const COVLABELS_KEY = 'hicowboys_tactics_covlabels'

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2)
}

function keyOf(side, playerId) {
  return side + ':' + playerId
}

// 포메이션 슬롯에 로스터 선수를 자동 배정한다(순수 함수 — 상태에 의존하지 않는다).
// 1) 슬롯 순서대로 positions[side]가 slot.pos와 같고 이 사이드에서 아직 안 쓰인 선수 중
//    학년 높은 순 → 등번호 낮은 순으로 1명 선택
// 2) 후보가 없으면 이 사이드에서 안 쓰인 아무 선수나 배정(TE처럼 로스터에 1명뿐인 포지션 대비)
function computeSidePlacements(formationKey, side) {
  const formation = FORMATIONS[formationKey]
  if (!formation) return []

  const alreadyUsed = new Set()
  const placements = []

  formation.slots.forEach((slot) => {
    const posMatch = players
      .filter((p) => p.positions[side] === slot.pos && !alreadyUsed.has(p.id))
      .sort((a, b) => {
        if (b.grade !== a.grade) return b.grade - a.grade
        const na = a.number ?? Infinity
        const nb = b.number ?? Infinity
        return na - nb
      })

    let chosen = posMatch[0] ?? null
    if (!chosen) {
      chosen = players.find((p) => !alreadyUsed.has(p.id)) ?? null
    }

    if (chosen) {
      alreadyUsed.add(chosen.id)
      placements.push({
        key: keyOf(side, chosen.id),
        playerId: chosen.id,
        side,
        x: slot.x,
        d: slot.d,
        role: slot.role,
        pos: slot.pos,
      })
    }
  })

  return placements
}

// 쉘의 assign 맵(role → coverage id)을 현재 배치된 디펜스 선수들에게 적용한다.
// assign에 없는 role(DL 전부)은 배정하지 않는다 — 기본 러시로 간주해 화살표를 그리지 않는다.
function buildShellAssignments(shellKey, defensePlacements) {
  const shell = SHELLS[shellKey]
  if (!shell) return {}
  const out = {}
  defensePlacements.forEach((p) => {
    const covId = shell.assign[p.role]
    if (covId) out[p.key] = { kind: 'coverage', id: covId, flip: false }
  })
  return out
}

// 초기 상태: I-Form vs 4-3 + Cover 3이 이미 배치된 채로 열린다.
const INITIAL_OFFENSE = computeSidePlacements('iform', 'offense')
const INITIAL_DEFENSE = computeSidePlacements('d43', 'defense')
const INITIAL_ASSIGNMENTS = buildShellAssignments('cover3_43', INITIAL_DEFENSE)

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
  const [playName, setPlayName] = useState('I-Form vs Cover 3')
  const [offFormation, setOffFormation] = useState('iform')
  const [defFormation, setDefFormation] = useState('d43')
  const [placedPlayers, setPlacedPlayers] = useState(() => [...INITIAL_OFFENSE, ...INITIAL_DEFENSE])
  const [assignments, setAssignments] = useState(() => ({ ...INITIAL_ASSIGNMENTS }))
  const [selectedKey, setSelectedKey] = useState(null)
  const [railSide, setRailSide] = useState('offense')
  const [savedPlays, setSavedPlays] = useState([])
  const [showNames, setShowNames] = useState(() => {
    try {
      return localStorage.getItem(SHOWNAMES_KEY) === 'true'
    } catch {
      return false
    }
  })
  const [showCovLabels, setShowCovLabels] = useState(() => {
    try {
      const raw = localStorage.getItem(COVLABELS_KEY)
      return raw === null ? true : raw === 'true'
    } catch {
      return true
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(SHOWNAMES_KEY, String(showNames))
    } catch {
      // ignore
    }
  }, [showNames])

  useEffect(() => {
    try {
      localStorage.setItem(COVLABELS_KEY, String(showCovLabels))
    } catch {
      // ignore
    }
  }, [showCovLabels])

  useEffect(() => {
    setSavedPlays(getSavedPlays())
  }, [])

  const applyFormation = useCallback((formationKey, side) => {
    const newPlacements = computeSidePlacements(formationKey, side)

    // Only clear the given side; the other side's placements stay untouched.
    setPlacedPlayers((prev) => [...prev.filter((p) => p.side !== side), ...newPlacements])

    // Drop dangling route/coverage assignments left over from the cleared side.
    setAssignments((prev) => {
      const next = {}
      Object.entries(prev).forEach(([k, v]) => {
        if (!k.startsWith(side + ':')) next[k] = v
      })
      return next
    })
  }, [])

  const handleFormationChange = (formationKey, side) => {
    if (side === 'offense') setOffFormation(formationKey)
    else setDefFormation(formationKey)
    applyFormation(formationKey, side)
    setSelectedKey(null)
  }

  const applyShell = useCallback((shellKey) => {
    const defensePlacements = placedPlayers.filter((p) => p.side === 'defense')
    setAssignments((prev) => {
      const next = {}
      Object.entries(prev).forEach(([k, v]) => {
        if (!k.startsWith('defense:')) next[k] = v
      })
      return { ...next, ...buildShellAssignments(shellKey, defensePlacements) }
    })
  }, [placedPlayers])

  const removePlacement = useCallback((key) => {
    setPlacedPlayers((prev) => prev.filter((p) => p.key !== key))
    setAssignments((prev) => {
      if (!(key in prev)) return prev
      const next = { ...prev }
      delete next[key]
      return next
    })
    setSelectedKey((prev) => (prev === key ? null : prev))
  }, [])

  const clearSide = (side) => {
    setPlacedPlayers((prev) => prev.filter((p) => p.side !== side))
    setAssignments((prev) => {
      const next = {}
      Object.entries(prev).forEach(([k, v]) => {
        if (!k.startsWith(side + ':')) next[k] = v
      })
      return next
    })
    setSelectedKey((prev) => (prev && prev.startsWith(side + ':') ? null : prev))
  }

  const resetAll = () => {
    setPlacedPlayers([...INITIAL_OFFENSE, ...INITIAL_DEFENSE])
    setAssignments({ ...INITIAL_ASSIGNMENTS })
    setSelectedKey(null)
    setOffFormation('iform')
    setDefFormation('d43')
  }

  const togglePlayer = (player) => {
    const side = railSide
    const key = keyOf(side, player.id)
    const existing = placedPlayers.find((p) => p.key === key)
    if (existing) {
      removePlacement(key)
      return
    }

    const sideEntries = placedPlayers.filter((p) => p.side === side)
    const formationKey = side === 'offense' ? offFormation : defFormation
    const formation = FORMATIONS[formationKey]
    const occupied = new Set(sideEntries.map((p) => `${p.x}|${p.d}`))

    let slot = null
    if (formation) {
      const wantedPos = player.positions[side]
      slot = formation.slots.find((s) => s.pos === wantedPos && !occupied.has(`${s.x}|${s.d}`))
      if (!slot) {
        slot = formation.slots.find((s) => !occupied.has(`${s.x}|${s.d}`))
      }
    }

    let x, d, role, pos
    if (slot) {
      x = slot.x
      d = slot.d
      role = slot.role
      pos = slot.pos
    } else {
      const sideCount = sideEntries.length
      d = side === 'offense' ? -13.5 : 22.5
      x = Math.min(4 + sideCount * 9, 48)
      role = player.positions[side] ?? '?'
      pos = player.positions[side] ?? '?'
    }

    setPlacedPlayers((prev) => [...prev, { key, playerId: player.id, side, x, d, role, pos }])
  }

  const handleMovePlayer = useCallback((key, newX, newD) => {
    setPlacedPlayers((prev) =>
      prev.map((p) => (p.key === key ? { ...p, x: newX, d: newD } : p))
    )
  }, [])

  const handleSetShape = useCallback((key, shape) => {
    setAssignments((a) => (a[key] ? { ...a, [key]: { ...a[key], shape } } : a))
  }, [])

  const handleResetShape = useCallback(() => {
    setAssignments((a) => {
      if (!selectedKey || !a[selectedKey]?.shape) return a
      const { shape, ...rest } = a[selectedKey]
      return { ...a, [selectedKey]: rest }
    })
  }, [selectedKey])

  // Delete/Backspace removes the selected marker, Escape deselects.
  useEffect(() => {
    const onKeyDown = (e) => {
      const active = document.activeElement
      if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA')) return
      if (!selectedKey) return
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault()
        removePlacement(selectedKey)
      } else if (e.key === 'Escape') {
        setSelectedKey(null)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [selectedKey, removePlacement])

  const handleSave = () => {
    const play = {
      id: generateId(),
      name: playName,
      formation: { offense: offFormation, defense: defFormation },
      players: placedPlayers.map((p) => ({
        key: p.key,
        playerId: p.playerId,
        side: p.side,
        x: p.x,
        d: p.d,
        role: p.role,
        pos: p.pos,
      })),
      assignments: { ...assignments },
      notes: '',
      updatedAt: new Date().toISOString().slice(0, 10),
    }
    savePlay(play)
    setSavedPlays(getSavedPlays())
  }

  const loadPlay = (play) => {
    setPlayName(play.name)
    if (play.formation?.offense) setOffFormation(play.formation.offense)
    if (play.formation?.defense) setDefFormation(play.formation.defense)

    const rawPlayers = play.players || []
    const seen = new Set()
    const rebuilt = []
    rawPlayers.forEach((p) => {
      const key = keyOf(p.side, p.playerId) // recompute — source of truth per spec
      if (seen.has(key)) return // guard against dangling/duplicate data
      seen.add(key)
      rebuilt.push({ ...p, key })
    })

    const validKeys = new Set(rebuilt.map((p) => p.key))
    const rawAssignments = play.assignments || {}
    const rebuiltAssignments = {}
    Object.entries(rawAssignments).forEach(([k, v]) => {
      if (validKeys.has(k)) rebuiltAssignments[k] = v
    })

    setPlacedPlayers(rebuilt)
    setAssignments(rebuiltAssignments)
    setSelectedKey(null)
  }

  const deletePlay = (id) => {
    removeSavedPlay(id)
    setSavedPlays(getSavedPlays())
  }

  const copyCode = (play) => {
    const code = exportCode(play)
    navigator.clipboard.writeText(code).catch(() => {
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
  const shellEntries = Object.entries(SHELLS)

  const selectedPlacement = selectedKey ? placedPlayers.find((p) => p.key === selectedKey) : null
  const selectedPlayer = selectedPlacement ? players.find((p) => p.id === selectedPlacement.playerId) : null

  const offenseIds = new Set(placedPlayers.filter((p) => p.side === 'offense').map((p) => p.playerId))
  const defenseIds = new Set(placedPlayers.filter((p) => p.side === 'defense').map((p) => p.playerId))
  const dualCount = [...offenseIds].filter((id) => defenseIds.has(id)).length

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
          <div className="tactics-toolbar-group">
            <span className="toolbar-label">커버리지:</span>
            {shellEntries.map(([key, shell]) => {
              const disabled = shell.base !== defFormation
              return (
                <button
                  key={key}
                  className="tactics-formation-btn"
                  disabled={disabled}
                  title={disabled ? `${FORMATIONS[shell.base].label}에서만 사용 가능` : `${shell.label} · ${shell.tag}`}
                  onClick={() => applyShell(key)}
                >
                  {shell.label}
                </button>
              )
            })}
          </div>
          <label className="tactics-shownames-toggle">
            <input
              type="checkbox"
              checked={showNames}
              onChange={(e) => setShowNames(e.target.checked)}
            />
            이름 표시
          </label>
          <label className="tactics-shownames-toggle">
            <input
              type="checkbox"
              checked={showCovLabels}
              onChange={(e) => setShowCovLabels(e.target.checked)}
            />
            커버리지 라벨
          </label>
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
              selectedKey={selectedKey}
              onSelectPlayer={setSelectedKey}
              onMovePlayer={handleMovePlayer}
              onRemovePlayer={removePlacement}
              onSetShape={handleSetShape}
              rosterPlayers={players}
              showNames={showNames}
              showCovLabels={showCovLabels}
            />
          </div>
          <div className="tactics-rail-col">
            <RosterRail
              side={railSide}
              onSideChange={setRailSide}
              placedOffenseIds={offenseIds}
              placedDefenseIds={defenseIds}
              onTogglePlayer={togglePlayer}
              playerCount={placedPlayers.filter((p) => p.side === railSide).length}
              dualCount={dualCount}
            />
            {selectedKey && selectedPlayer && (
              <AssignMenu
                placement={selectedPlacement}
                player={selectedPlayer}
                assignment={assignments[selectedKey] ?? null}
                onSetAssignment={(kind, id) =>
                  setAssignments((a) => ({
                    ...a,
                    [selectedKey]: { kind, id, flip: a[selectedKey]?.flip ?? false },
                  }))
                }
                onClearAssignment={() =>
                  setAssignments((a) => {
                    const n = { ...a }
                    delete n[selectedKey]
                    return n
                  })
                }
                onFlip={() =>
                  setAssignments((a) => ({
                    ...a,
                    [selectedKey]: {
                      ...a[selectedKey],
                      flip: !(a[selectedKey]?.flip ?? false),
                    },
                  }))
                }
                onResetShape={handleResetShape}
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
