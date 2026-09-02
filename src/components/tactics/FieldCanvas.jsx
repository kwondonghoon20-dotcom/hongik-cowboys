import { useRef, useCallback } from 'react'
import { CENTER, TOP_D, toSvgY, toDepth, polylinePath } from '../../utils/fieldGeometry'
import { ROUTES } from '../../data/routes'
import './FieldCanvas.css'

const CHALK = '#EDF2EA'
const SCARLET = '#CC0000'

// Field constants
const FIELD_DISPLAY_W = 53.33
const HASH_L = 20.0
const HASH_R = 33.33

// Marker geometry
const OL_SIDE = 2.12
const OL_R = OL_SIDE / 2 // label-offset radius approximation
const CIRCLE_R = 1.15
const DIAMOND_SIDE = 1.93
const DIAMOND_R = (DIAMOND_SIDE * Math.SQRT2) / 2 // corner distance (pointed top/bottom)

function getRouteSvgPoints(player, routeKey, flip) {
  const route = ROUTES[routeKey]
  if (!route) return []
  const mirrorLeft = player.x < CENTER
  return route.pts.map(([dx, dy]) => {
    let finalDx = dx
    if (mirrorLeft) finalDx = -finalDx
    if (flip) finalDx = -finalDx
    return {
      x: player.x + finalDx,
      y: toSvgY(player.d) - dy,
    }
  })
}

function RouteArrow({ pts, isSelected, cap }) {
  if (!pts || pts.length < 2) return null
  const d = polylinePath(pts)
  const color = isSelected ? SCARLET : CHALK
  const last = pts[pts.length - 1]
  const prev = pts[pts.length - 2]

  let capEl = null
  if (cap === 'bar') {
    // T-bar: perpendicular to direction at end
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
    capEl = (
      <line
        x1={x1.toFixed(2)} y1={y1.toFixed(2)}
        x2={x2.toFixed(2)} y2={y2.toFixed(2)}
        stroke={color} strokeWidth={0.32} strokeLinecap="round"
      />
    )
  } else {
    // Arrow triangle
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
    capEl = (
      <polygon
        points={`${tip.x.toFixed(2)},${tip.y.toFixed(2)} ${b1x.toFixed(2)},${b1y.toFixed(2)} ${b2x.toFixed(2)},${b2y.toFixed(2)}`}
        fill={color}
      />
    )
  }

  return (
    <g>
      <path d={d} fill="none" stroke={color} strokeWidth={0.32} strokeLinecap="round" strokeLinejoin="round" />
      {capEl}
    </g>
  )
}

function PlayerMarker({ p, rp, isSelected, showName, onPointerDown, onRemove }) {
  const svgY = toSvgY(p.d)
  const isOL = p.side === 'offense' && p.pos === 'OL'
  const isOffense = p.side === 'offense'
  const numLabel = rp && rp.number != null ? String(rp.number) : '–'
  const nameLabel = rp ? rp.name : ''

  const strokeWidth = isSelected ? 0.32 : 0.15

  let labelR = CIRCLE_R
  if (isOL) labelR = OL_R
  else if (!isOffense) labelR = DIAMOND_R

  const shouldShowName = showName || isSelected

  return (
    <g
      onPointerDown={onPointerDown}
      style={{ cursor: 'grab' }}
    >
      {/* Role label above */}
      <text
        x={p.x.toFixed(2)}
        y={(svgY - (labelR + 0.55)).toFixed(2)}
        textAnchor="middle"
        fontSize="1.4"
        opacity="0.6"
        fill={CHALK}
        style={{ pointerEvents: 'none', fontFamily: 'var(--font-impact)' }}
      >
        {p.role}
      </text>

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
  rosterPlayers,
  showNames,
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
    dragRef.current = { key, startX: start.x, startY: start.y, moved: false }
    hasDraggedRef.current = false
  }, [getSvgCoords])

  const handlePointerMove = useCallback((e) => {
    if (!dragRef.current) return
    const { key, startX, startY } = dragRef.current
    const cur = getSvgCoords(e.clientX, e.clientY)
    const dist = Math.sqrt((cur.x - startX) ** 2 + (cur.y - startY) ** 2)
    if (dist > 0.3) {
      dragRef.current.moved = true
      hasDraggedRef.current = true
    }
    if (!dragRef.current.moved) return

    const rawX = snap(cur.x)
    const rawD = snap(toDepth(cur.y))
    const clampedX = Math.max(0.8, Math.min(52.53, rawX))
    const clampedD = Math.max(-14.2, Math.min(24.2, rawD))

    onMovePlayer(key, clampedX, clampedD)
  }, [getSvgCoords, onMovePlayer])

  const handlePointerUp = useCallback((e) => {
    if (!dragRef.current) return
    const { key, moved } = dragRef.current
    if (!moved) {
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
  const bandDepths = [[0,5],[10,15],[20,25],[-10,-5]]

  const depthLabels = [
    { d: -15, label: '-15' },
    { d: -10, label: '-10' },
    { d: -5,  label: '-5' },
    { d: 0,   label: 'LOS', isLos: true },
    { d: 5,   label: '+5' },
    { d: 10,  label: '+10' },
    { d: 15,  label: '+15' },
    { d: 20,  label: '+20' },
    { d: 25,  label: '+25' },
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

        {/* Routes */}
        {players.map((p) => {
          const asgn = assignments[p.key]
          if (!asgn || !asgn.route) return null
          const pts = getRouteSvgPoints(p, asgn.route, asgn.flip ?? false)
          const route = ROUTES[asgn.route]
          return (
            <RouteArrow
              key={`route-${p.key}`}
              pts={pts}
              isSelected={p.key === selectedKey}
              cap={route?.cap}
            />
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
      </svg>
    </div>
  )
}
