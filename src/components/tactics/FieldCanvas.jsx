import { useRef, useCallback } from 'react'
import { CENTER, FIELD_W, HASH_L, HASH_R, toSvgY, toDepth, polylinePath } from '../../utils/fieldGeometry'
import { ROUTES } from '../../data/routes'
import { COVERAGES } from '../../data/coverages'
import './FieldCanvas.css'

const CHALK = '#EDF2EA'
const SCARLET = '#CC0000'
const ZONE_COLOR = '#8FA8C4'
const MAN_COLOR = '#FF8FA3'
const BLITZ_COLOR = '#E0AC3E'

// Field constants
const FIELD_DISPLAY_W = FIELD_W

// Marker geometry
const OL_SIDE = 2.12
const OL_R = OL_SIDE / 2 // label-offset radius approximation
const CIRCLE_R = 1.15
const DIAMOND_SIDE = 1.93
const DIAMOND_R = (DIAMOND_SIDE * Math.SQRT2) / 2 // corner distance (pointed top/bottom)

// OL5 슬롯의 role 코드(LT/LG/C/RG/RT) — pos가 세부 포지션명으로 바뀌어도
// 마커 모양(사각형)은 role로 판별한다.
const OL_ROLES = new Set(['LT', 'LG', 'C', 'RG', 'RT'])

function isOLPlayer(p) {
  return p.side === 'offense' && (OL_ROLES.has(p.role) || p.pos === 'OL')
}

function labelRadiusOf(p) {
  const isOffense = p.side === 'offense'
  if (isOLPlayer(p)) return OL_R
  if (!isOffense) return DIAMOND_R
  return CIRCLE_R
}

// 라우트/커버리지 공용: 선수 위치 기준 상대 오프셋(dx,dy)을 필드 좌표로 변환한다.
// 선수가 필드 왼쪽(x < CENTER)에 있으면 dx를 반전하고, 배치별 flip 토글도 추가로 반전한다.
function getAssignmentSvgPoints(player, presetId, flip, presets) {
  const preset = presets[presetId]
  if (!preset) return []
  const mirrorLeft = player.x < CENTER
  return preset.pts.map(([dx, dy]) => {
    let finalDx = dx
    if (mirrorLeft) finalDx = -finalDx
    if (flip) finalDx = -finalDx
    return {
      x: player.x + finalDx,
      y: toSvgY(player.d) - dy,
    }
  })
}

function arrowHead(pts, color) {
  const last = pts[pts.length - 1]
  const prev = pts[pts.length - 2]
  const dx = last.x - prev.x
  const dy = last.y - prev.y
  const len = Math.sqrt(dx * dx + dy * dy) || 1
  const ux = dx / len
  const uy = dy / len
  const nx = -uy
  const ny = ux
  const aLen = 0.8
  const aW = 0.35
  const tip = last
  const b1x = tip.x - ux * aLen + nx * aW
  const b1y = tip.y - uy * aLen + ny * aW
  const b2x = tip.x - ux * aLen - nx * aW
  const b2y = tip.y - uy * aLen - ny * aW
  return (
    <polygon
      points={`${tip.x.toFixed(2)},${tip.y.toFixed(2)} ${b1x.toFixed(2)},${b1y.toFixed(2)} ${b2x.toFixed(2)},${b2y.toFixed(2)}`}
      fill={color}
    />
  )
}

function barCap(pts, color) {
  const last = pts[pts.length - 1]
  const prev = pts[pts.length - 2]
  const dx = last.x - prev.x
  const dy = last.y - prev.y
  const len = Math.sqrt(dx * dx + dy * dy) || 1
  const nx = -dy / len
  const ny = dx / len
  const barLen = 0.4
  const x1 = last.x + nx * barLen
  const y1 = last.y + ny * barLen
  const x2 = last.x - nx * barLen
  const y2 = last.y - ny * barLen
  return (
    <line
      x1={x1.toFixed(2)} y1={y1.toFixed(2)}
      x2={x2.toFixed(2)} y2={y2.toFixed(2)}
      stroke={color} strokeWidth={0.32} strokeLinecap="round"
    />
  )
}

// 오펜스 라우트 화살표: 초크색(선택 시 스칼렛), 진행방향 화살표 또는 블로킹 바.
function RouteArrow({ pts, isSelected, cap }) {
  if (!pts || pts.length < 2) return null
  const d = polylinePath(pts)
  const color = isSelected ? SCARLET : CHALK

  return (
    <g>
      <path d={d} fill="none" stroke={color} strokeWidth={0.32} strokeLinecap="round" strokeLinejoin="round" />
      {cap === 'bar' ? barCap(pts, color) : arrowHead(pts, color)}
    </g>
  )
}

// 존 커버리지 프리셋의 기본 영역(shape)을 실제 필드 좌표(cx,cy 포함)로 변환한다.
// assignments[key].shape가 있으면 이 함수는 쓰지 않고 override 값을 그대로 쓴다.
function defaultShapeFor(preset, center) {
  const s = preset?.shape
  if (!s) return null
  if (s.type === 'ellipse') return { cx: center.x, cy: center.y, rx: s.rx, ry: s.ry }
  return { cx: center.x, cy: center.y, w: s.w, h: s.h }
}

function isEllipseShape(shape) {
  return shape != null && 'rx' in shape
}

// 존 도형이 필드 경계(x: 0~FIELD_DISPLAY_W, y: 0~40)를 벗어나지 않도록 렌더링 직전에 clamp한다.
function clampShapeToField(shape) {
  const ellipse = isEllipseShape(shape)
  const halfW = ellipse ? shape.rx : shape.w / 2
  const halfH = ellipse ? shape.ry : shape.h / 2
  const cx = Math.min(Math.max(shape.cx, halfW), FIELD_DISPLAY_W - halfW)
  const cy = Math.min(Math.max(shape.cy, halfH), 40 - halfH)
  return { ...shape, cx, cy }
}

// 존 영역 도형(딥존=타원, 언더존=사각형). 점선 테두리 + 옅은 채움으로 실제 팀 플레이북 스타일.
function ZoneShape({ shape }) {
  if (isEllipseShape(shape)) {
    return (
      <ellipse
        cx={shape.cx.toFixed(2)} cy={shape.cy.toFixed(2)} rx={shape.rx} ry={shape.ry}
        fill={ZONE_COLOR} fillOpacity="0.12"
        stroke={ZONE_COLOR} strokeOpacity="0.4" strokeWidth="0.15" strokeDasharray=".5,.4"
      />
    )
  }
  return (
    <rect
      x={(shape.cx - shape.w / 2).toFixed(2)} y={(shape.cy - shape.h / 2).toFixed(2)}
      width={shape.w} height={shape.h} rx="0.4"
      fill={ZONE_COLOR} fillOpacity="0.12"
      stroke={ZONE_COLOR} strokeOpacity="0.4" strokeWidth="0.15" strokeDasharray=".5,.4"
    />
  )
}

// 도형 위쪽 가장자리 y좌표(라벨 배치용).
function shapeTopY(shape) {
  return isEllipseShape(shape) ? shape.cy - shape.ry : shape.cy - shape.h / 2
}

// 선택된 존 배정에만 뜨는 이동/리사이즈 핸들. 본체를 끌면 이동, 오른쪽 핸들은 가로(rx/w),
// 아래쪽 핸들은 세로(ry/h) 크기를 조절한다.
function ZoneShapeHandles({ shape, onBodyPointerDown, onXHandlePointerDown, onYHandlePointerDown }) {
  const ellipse = isEllipseShape(shape)
  const halfW = ellipse ? shape.rx : shape.w / 2
  const halfH = ellipse ? shape.ry : shape.h / 2
  const handleR = 0.55

  return (
    <g>
      {ellipse ? (
        <ellipse
          cx={shape.cx.toFixed(2)} cy={shape.cy.toFixed(2)} rx={halfW} ry={halfH}
          fill="transparent" stroke={SCARLET} strokeWidth="0.2" strokeDasharray=".4,.3"
          style={{ cursor: 'move' }} onPointerDown={onBodyPointerDown}
        />
      ) : (
        <rect
          x={(shape.cx - halfW).toFixed(2)} y={(shape.cy - halfH).toFixed(2)}
          width={halfW * 2} height={halfH * 2}
          fill="transparent" stroke={SCARLET} strokeWidth="0.2" strokeDasharray=".4,.3"
          style={{ cursor: 'move' }} onPointerDown={onBodyPointerDown}
        />
      )}
      <circle
        cx={(shape.cx + halfW).toFixed(2)} cy={shape.cy.toFixed(2)} r={handleR}
        fill={SCARLET} stroke="#fff" strokeWidth="0.12"
        style={{ cursor: 'ew-resize' }} onPointerDown={onXHandlePointerDown}
      />
      <circle
        cx={shape.cx.toFixed(2)} cy={(shape.cy + halfH).toFixed(2)} r={handleR}
        fill={SCARLET} stroke="#fff" strokeWidth="0.12"
        style={{ cursor: 'ns-resize' }} onPointerDown={onYHandlePointerDown}
      />
    </g>
  )
}

// 디펜스 커버리지 화살표: group에 따라 존(점선+영역 도형 또는 랜드마크 원)/맨(실선 코럴)/
// 블리츠(굵은 실선 앰버). 존은 shape 프리셋이 있으면 실제 영역(타원/사각형)을, 없으면
// (spy 등) 기존처럼 작은 랜드마크 원을 그린다.
function CoverageArrow({ pts, group, preset, shapeOverride, showLabel }) {
  if (!pts || pts.length < 2) return null
  const start = pts[0]
  const defaultEnd = pts[pts.length - 1]

  if (group === 'zone') {
    const rawShape = shapeOverride ?? defaultShapeFor(preset, defaultEnd)
    const shape = rawShape ? clampShapeToField(rawShape) : rawShape
    const lineEnd = shape ? { x: shape.cx, y: shape.cy } : defaultEnd
    const d = polylinePath([start, lineEnd])
    return (
      <g>
        <path
          d={d} fill="none" stroke={ZONE_COLOR} strokeWidth={0.32}
          strokeDasharray=".5,.4" strokeLinecap="round" strokeLinejoin="round"
        />
        {shape ? (
          <ZoneShape shape={shape} />
        ) : (
          <circle
            cx={defaultEnd.x.toFixed(2)} cy={defaultEnd.y.toFixed(2)} r={1}
            fill={CHALK} fillOpacity="0.1" stroke={CHALK} strokeOpacity="0.35" strokeWidth="0.15"
          />
        )}
        {showLabel && (
          <text
            x={(shape ? shape.cx : defaultEnd.x).toFixed(2)}
            y={(shape ? shapeTopY(shape) - 0.6 : defaultEnd.y - 1.3).toFixed(2)}
            textAnchor="middle" fontSize="1.4" fill={ZONE_COLOR}
            style={{ pointerEvents: 'none', fontFamily: 'var(--font-body)', fontWeight: 600 }}
          >
            {preset.label}
          </text>
        )}
      </g>
    )
  }

  const d = polylinePath(pts)
  const color = group === 'blitz' ? BLITZ_COLOR : MAN_COLOR
  const width = group === 'blitz' ? 0.26 : 0.32
  return (
    <g>
      <path d={d} fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" />
      {arrowHead(pts, color)}
    </g>
  )
}

// 맨/블리츠 배정 시 배치(마커) 바로 아래에 뜨는 짧은 표식(M / ⚡). 커버리지 라벨 토글로 제어.
function AssignmentBadge({ p, group }) {
  if (group !== 'man' && group !== 'blitz') return null
  const svgY = toSvgY(p.d)
  const r = labelRadiusOf(p)
  const text = group === 'man' ? 'M' : '⚡'
  const color = group === 'man' ? MAN_COLOR : BLITZ_COLOR
  return (
    <text
      x={p.x.toFixed(2)}
      y={(svgY + r + 0.9).toFixed(2)}
      textAnchor="middle"
      fontSize="1.5"
      fill={color}
      fontWeight="700"
      style={{ pointerEvents: 'none', fontFamily: 'var(--font-impact)' }}
    >
      {text}
    </text>
  )
}

function PlayerMarker({ p, rp, isSelected, showName, onPointerDown, onRemove }) {
  const svgY = toSvgY(p.d)
  const isOL = isOLPlayer(p)
  const isOffense = p.side === 'offense'
  const rp_number = rp && rp.number != null ? String(rp.number) : null
  const numLabel = rp_number ?? p.pos
  const nameLabel = rp ? rp.name : ''

  const strokeWidth = isSelected ? 0.32 : 0.15
  const labelR = labelRadiusOf(p)

  const shouldShowName = showName || isSelected

  return (
    <g
      onPointerDown={onPointerDown}
      style={{ cursor: 'grab' }}
    >
      {/* Marker shape */}
      {isOL ? (
        <rect
          x={(p.x - OL_SIDE / 2).toFixed(2)}
          y={(svgY - OL_SIDE / 2).toFixed(2)}
          width={OL_SIDE}
          height={OL_SIDE}
          rx="0.3"
          ry="0.3"
          fill="var(--color-scarlet)"
          stroke="#fff"
          strokeWidth={strokeWidth}
        />
      ) : isOffense ? (
        <circle
          cx={p.x.toFixed(2)}
          cy={svgY.toFixed(2)}
          r={CIRCLE_R}
          fill="var(--color-scarlet)"
          stroke="#fff"
          strokeWidth={strokeWidth}
        />
      ) : (
        // Diamond for defense
        <rect
          x={(p.x - DIAMOND_SIDE / 2).toFixed(2)}
          y={(svgY - DIAMOND_SIDE / 2).toFixed(2)}
          width={DIAMOND_SIDE}
          height={DIAMOND_SIDE}
          fill="#15191C"
          stroke={CHALK}
          strokeWidth={strokeWidth}
          transform={`rotate(45 ${p.x.toFixed(2)} ${svgY.toFixed(2)})`}
        />
      )}

      {/* Number inside */}
      <text
        x={p.x.toFixed(2)}
        y={(svgY + 0.48).toFixed(2)}
        textAnchor="middle"
        fontSize="1.4"
        fill="#fff"
        style={{ pointerEvents: 'none', fontFamily: 'var(--font-impact)', userSelect: 'none' }}
      >
        {numLabel}
      </text>

      {/* Name below (conditional) */}
      {shouldShowName && (
        <text
          x={p.x.toFixed(2)}
          y={(svgY + (labelR + 1.75)).toFixed(2)}
          textAnchor="middle"
          fontSize="1.4"
          fontWeight="500"
          fill={CHALK}
          style={{ pointerEvents: 'none', fontFamily: 'var(--font-body)' }}
        >
          {nameLabel}
        </text>
      )}

      {/* Remove X button when selected */}
      {isSelected && (
        <g
          onClick={(e) => { e.stopPropagation(); onRemove() }}
          style={{ cursor: 'pointer' }}
        >
          <circle
            cx={(p.x + labelR + 0.5).toFixed(2)}
            cy={(svgY - labelR - 0.5).toFixed(2)}
            r="1.1"
            fill={SCARLET}
          />
          <text
            x={(p.x + labelR + 0.5).toFixed(2)}
            y={(svgY - labelR - 0.5 + 0.55).toFixed(2)}
            textAnchor="middle"
            fontSize="1.6"
            fill="#fff"
            style={{ pointerEvents: 'none', userSelect: 'none', fontFamily: 'var(--font-body)' }}
          >
            ×
          </text>
        </g>
      )}
    </g>
  )
}

export default function FieldCanvas({
  players,
  assignments,
  selectedKey,
  onSelectPlayer,
  onMovePlayer,
  onRemovePlayer,
  onSetShape,
  rosterPlayers,
  showNames,
  showCovLabels,
}) {
  const svgRef = useRef(null)
  const dragRef = useRef(null)
  const hasDraggedRef = useRef(false)
  const justInteractedRef = useRef(false)

  const getSvgCoords = useCallback((clientX, clientY) => {
    const svg = svgRef.current
    if (!svg) return { x: 0, y: 0 }
    const ctm = svg.getScreenCTM()
    if (!ctm) return { x: 0, y: 0 }
    const inv = ctm.inverse()
    return {
      x: inv.a * clientX + inv.c * clientY + inv.e,
      y: inv.b * clientX + inv.d * clientY + inv.f,
    }
  }, [])

  const snap = (v) => Math.round(v * 2) / 2

  const handlePointerDown = useCallback((e, key) => {
    e.stopPropagation()
    justInteractedRef.current = true
    e.currentTarget.setPointerCapture(e.pointerId)
    const start = getSvgCoords(e.clientX, e.clientY)
    dragRef.current = { type: 'player', key, startX: start.x, startY: start.y, moved: false }
    hasDraggedRef.current = false
  }, [getSvgCoords])

  // 존 도형 본체(이동) 또는 리사이즈 핸들(x축=rx/w, y축=ry/h) 드래그 시작.
  // shape는 드래그 시작 시점의 유효 도형(override 또는 기본값)을 그대로 baseline으로 쓴다.
  const handleShapePointerDown = useCallback((e, key, mode, shape) => {
    e.stopPropagation()
    justInteractedRef.current = true
    e.currentTarget.setPointerCapture(e.pointerId)
    const start = getSvgCoords(e.clientX, e.clientY)
    dragRef.current = { type: mode, key, startX: start.x, startY: start.y, initial: shape, moved: false }
    hasDraggedRef.current = false
  }, [getSvgCoords])

  const handlePointerMove = useCallback((e) => {
    if (!dragRef.current) return
    const { type, startX, startY } = dragRef.current
    const cur = getSvgCoords(e.clientX, e.clientY)
    const dist = Math.sqrt((cur.x - startX) ** 2 + (cur.y - startY) ** 2)
    if (dist > 0.3) {
      dragRef.current.moved = true
      hasDraggedRef.current = true
    }
    if (!dragRef.current.moved) return

    if (type === 'player') {
      const { key } = dragRef.current
      const rawX = snap(cur.x)
      const rawD = snap(toDepth(cur.y))
      const clampedX = Math.max(0.8, Math.min(52.53, rawX))
      const clampedD = Math.max(-14.2, Math.min(24.2, rawD))
      onMovePlayer(key, clampedX, clampedD)
      return
    }

    const { key, initial } = dragRef.current
    if (type === 'shapeMove') {
      const dx = snap(cur.x - startX)
      const dy = snap(cur.y - startY)
      onSetShape(key, { ...initial, cx: initial.cx + dx, cy: initial.cy + dy })
      return
    }

    const ellipse = isEllipseShape(initial)
    if (type === 'shapeResizeX') {
      const half = Math.max(1.5, snap(Math.abs(cur.x - initial.cx)))
      onSetShape(key, ellipse ? { ...initial, rx: half } : { ...initial, w: half * 2 })
    } else if (type === 'shapeResizeY') {
      const half = Math.max(1.5, snap(Math.abs(cur.y - initial.cy)))
      onSetShape(key, ellipse ? { ...initial, ry: half } : { ...initial, h: half * 2 })
    }
  }, [getSvgCoords, onMovePlayer, onSetShape])

  const handlePointerUp = useCallback((e) => {
    if (!dragRef.current) return
    const { type, key, moved } = dragRef.current
    if (!moved && type === 'player') {
      onSelectPlayer(selectedKey === key ? null : key)
    }
    dragRef.current = null
  }, [onSelectPlayer, selectedKey])

  const handleSvgClick = useCallback((e) => {
    if (hasDraggedRef.current) {
      hasDraggedRef.current = false
      return
    }
    if (justInteractedRef.current) {
      // A marker's own pointerdown/pointerup just handled selection —
      // don't let the resulting bubbled click event immediately deselect it.
      justInteractedRef.current = false
      return
    }
    onSelectPlayer(null)
  }, [onSelectPlayer])

  // Draw yard lines: y-values in SVG coord (TOP_D = 25 = LOS)
  // depth 0 => y=25, depth 5 => y=20, etc.
  // We show depths -15 to +25 => y = 0 to 40
  const yardLineDepths = [-15, -10, -5, 0, 5, 10, 15, 20, 25]
  const bandDepths = [[0, 5], [10, 15], [20, 25], [-10, -5]]

  const depthLabels = [
    { d: -15, label: '-15' },
    { d: -10, label: '-10' },
    { d: -5, label: '-5' },
    { d: 0, label: 'LOS', isLos: true },
    { d: 5, label: '+5' },
    { d: 10, label: '+10' },
    { d: 15, label: '+15' },
    { d: 20, label: '+20' },
    { d: 25, label: '+25' },
  ]

  return (
    <div className="field-canvas-wrap">
      <svg
        ref={svgRef}
        viewBox="-4.5 -3 61.83 46"
        style={{ width: '100%', height: 'auto', touchAction: 'none', display: 'block' }}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onClick={handleSvgClick}
      >
        {/* Background */}
        <rect x={0} y={0} width={FIELD_DISPLAY_W} height={40} fill="#1E4230" />

        {/* Alternating bands */}
        {bandDepths.map(([d1, d2], i) => {
          const y1 = toSvgY(d2)
          const y2 = toSvgY(d1)
          return (
            <rect key={i} x={0} y={y1.toFixed(2)} width={FIELD_DISPLAY_W} height={(y2 - y1).toFixed(2)} fill="#234B37" />
          )
        })}

        {/* Hash marks */}
        {[HASH_L, HASH_R].map((hx) =>
          yardLineDepths.map((d) => {
            const y = toSvgY(d)
            return (
              <line
                key={`${hx}-${d}`}
                x1={(hx - 0.35).toFixed(2)} y1={(y - 0.3).toFixed(2)}
                x2={(hx + 0.35).toFixed(2)} y2={(y + 0.3).toFixed(2)}
                stroke={CHALK} strokeOpacity="0.3" strokeWidth="0.13"
              />
            )
          })
        )}

        {/* 5-yard lines */}
        {[5, 10, 15, 20, 25, 30, 35].map((yLine) => (
          <line
            key={yLine}
            x1={0} y1={yLine}
            x2={FIELD_DISPLAY_W} y2={yLine}
            stroke={CHALK} opacity="0.3" strokeWidth="0.12"
          />
        ))}

        {/* LOS */}
        <line
          x1={0} y1={toSvgY(0)}
          x2={FIELD_DISPLAY_W} y2={toSvgY(0)}
          stroke="white" opacity="0.95" strokeWidth="0.32"
        />

        {/* Depth labels on left */}
        {depthLabels.map(({ d, label, isLos }) => (
          <text
            key={d}
            x="-1.2"
            y={(toSvgY(d) + 0.6).toFixed(2)}
            textAnchor="end"
            fontSize={isLos ? '2.0' : '1.7'}
            opacity={isLos ? '1' : '0.5'}
            fill={CHALK}
            style={{
              fontFamily: isLos ? 'var(--font-impact)' : 'var(--font-body)',
              pointerEvents: 'none',
              userSelect: 'none',
            }}
          >
            {label}
          </text>
        ))}

        {/* Sideline border */}
        <rect
          x={0} y={0}
          width={FIELD_DISPLAY_W} height={40}
          fill="none"
          stroke={CHALK} strokeWidth="0.34" opacity="0.85"
        />

        {/* Routes / coverages (아래 레이어 — 마커보다 먼저 그린다) */}
        {players.map((p) => {
          const asgn = assignments[p.key]
          if (!asgn) return null

          if (asgn.kind === 'route') {
            const pts = getAssignmentSvgPoints(p, asgn.id, asgn.flip ?? false, ROUTES)
            const route = ROUTES[asgn.id]
            return (
              <RouteArrow
                key={`asgn-${p.key}`}
                pts={pts}
                isSelected={p.key === selectedKey}
                cap={route?.cap}
              />
            )
          }

          // coverage
          const pts = getAssignmentSvgPoints(p, asgn.id, asgn.flip ?? false, COVERAGES)
          const preset = COVERAGES[asgn.id]
          if (!preset) return null
          return (
            <g key={`asgn-${p.key}`}>
              <CoverageArrow
                pts={pts}
                group={preset.group}
                preset={preset}
                shapeOverride={asgn.shape ?? null}
                showLabel={showCovLabels}
              />
              {showCovLabels && <AssignmentBadge p={p} group={preset.group} />}
            </g>
          )
        })}

        {/* Player markers */}
        {players.map((p) => {
          const rp = rosterPlayers ? rosterPlayers.find((r) => r.id === p.playerId) : null
          return (
            <PlayerMarker
              key={p.key}
              p={p}
              rp={rp}
              isSelected={p.key === selectedKey}
              showName={showNames}
              onPointerDown={(e) => handlePointerDown(e, p.key)}
              onRemove={() => onRemovePlayer(p.key)}
            />
          )
        })}

        {/* 선택된 존 커버리지 배정에만 뜨는 이동/리사이즈 핸들 — 항상 최상단 레이어 */}
        {selectedKey && (() => {
          const p = players.find((pp) => pp.key === selectedKey)
          const asgn = p ? assignments[selectedKey] : null
          if (!p || !asgn || asgn.kind !== 'coverage') return null
          const preset = COVERAGES[asgn.id]
          if (!preset || preset.group !== 'zone' || !preset.shape) return null

          const pts = getAssignmentSvgPoints(p, asgn.id, asgn.flip ?? false, COVERAGES)
          const defaultEnd = pts[pts.length - 1]
          const shape = clampShapeToField(asgn.shape ?? defaultShapeFor(preset, defaultEnd))

          return (
            <ZoneShapeHandles
              shape={shape}
              onBodyPointerDown={(e) => handleShapePointerDown(e, selectedKey, 'shapeMove', shape)}
              onXHandlePointerDown={(e) => handleShapePointerDown(e, selectedKey, 'shapeResizeX', shape)}
              onYHandlePointerDown={(e) => handleShapePointerDown(e, selectedKey, 'shapeResizeY', shape)}
            />
          )
        })()}
      </svg>
    </div>
  )
}
