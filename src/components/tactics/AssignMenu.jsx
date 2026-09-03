import { useState, useEffect } from 'react'
import { ROUTES } from '../../data/routes'
import { COVERAGES } from '../../data/coverages'
import './AssignMenu.css'

const OFFENSE_GROUPS = [
  { key: 'pass', label: '패스' },
  { key: 'run', label: '런' },
  { key: 'block', label: '블로킹' },
]

const DEFENSE_GROUPS = [
  { key: 'zone', label: '존' },
  { key: 'man', label: '맨' },
  { key: 'blitz', label: '블리츠' },
]

export default function AssignMenu({ placement, player, assignment, onSetAssignment, onClearAssignment, onFlip, onResetShape }) {
  const isOffense = placement?.side === 'offense'
  const presets = isOffense ? ROUTES : COVERAGES
  const groups = isOffense ? OFFENSE_GROUPS : DEFENSE_GROUPS
  const kind = isOffense ? 'route' : 'coverage'

  const [activeGroup, setActiveGroup] = useState(groups[0].key)

  // 다른 배치를 선택했을 때 그룹 탭을 첫 그룹으로 되돌린다(선택된 배정이 있으면 그 그룹으로).
  useEffect(() => {
    if (assignment?.id && presets[assignment.id]) {
      setActiveGroup(presets[assignment.id].group)
    } else {
      setActiveGroup(groups[0].key)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [placement?.key])

  if (!placement || !player) return null

  const itemsInGroup = Object.entries(presets).filter(([, r]) => r.group === activeGroup)
  const currentId = assignment?.id ?? null
  const currentPreset = currentId ? presets[currentId] : null
  const canResetShape = !isOffense && currentPreset?.group === 'zone' && !!currentPreset?.shape

  return (
    <div className="assign-menu">
      <div className="assign-menu-header">
        <span>선택: {player.name}</span>
        <span className="assign-menu-number">
          #{player.number != null ? player.number : '–'}
        </span>
      </div>
      <div className="assign-group-tabs">
        {groups.map(({ key, label }) => (
          <button
            key={key}
            className={'assign-group-tab' + (activeGroup === key ? ' active' : '')}
            onClick={() => setActiveGroup(key)}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="assign-btns">
        {itemsInGroup.map(([id, preset]) => (
          <button
            key={id}
            className={'assign-btn' + (currentId === id ? ' active' : '')}
            onClick={() => onSetAssignment(kind, id)}
          >
            {preset.label}
          </button>
        ))}
      </div>
      <div className="assign-actions">
        <button
          className={'assign-btn' + (assignment?.flip ? ' active' : '')}
          onClick={onFlip}
        >
          ↔ 좌우 반전
        </button>
        <button className="assign-btn" onClick={onClearAssignment}>
          없음
        </button>
        {canResetShape && (
          <button className="assign-btn" onClick={onResetShape}>
            존 크기 초기화
          </button>
        )}
      </div>
    </div>
  )
}
