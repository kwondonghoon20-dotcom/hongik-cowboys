import React, { useState, useRef, useEffect } from 'react'
import { players } from '../data/dummy'
import { getTouchdownRoute } from '../data/touchdownRoutes'
import { getTouchdownClip } from '../data/touchdownClips'
import { OUR_TEAM, normalizeTeamName } from '../utils/parseExcel'

// ── 유틸 ──────────────────────────────────────────────────────

function findRosterPlayer(number) {
  const n = parseInt(number, 10)
  if (isNaN(n)) return null
  return players.find((p) => p.number === n) ?? null
}

function catmullRomPath(pts) {
  // pts: [{x, y}]
  if (pts.length < 2) return ''
  const p = pts.map((pt) => [pt.x, pt.y])
  let d = `M ${p[0][0].toFixed(2)} ${p[0][1].toFixed(2)}`
  for (let i = 0; i < p.length - 1; i++) {
    const p0 = p[Math.max(0, i - 1)]
    const p1 = p[i]
    const p2 = p[i + 1]
    const p3 = p[Math.min(p.length - 1, i + 2)]
    const cp1x = p1[0] + (p2[0] - p0[0]) / 6
    const cp1y = p1[1] + (p2[1] - p0[1]) / 6
    const cp2x = p2[0] - (p3[0] - p1[0]) / 6
    const cp2y = p2[1] - (p3[1] - p1[1]) / 6
    d += ` C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)},${cp2x.toFixed(2)} ${cp2y.toFixed(2)},${p2[0].toFixed(2)} ${p2[1].toFixed(2)}`
  }
  return d
}

function sampleRoute(route, step = 5) {
  const pts = []
  for (let i = 0; i < route.length; i += step) pts.push(route[i])
  if (pts[pts.length - 1] !== route[route.length - 1]) pts.push(route[route.length - 1])
  return pts
}

// 5야드 이상 점프 구간에서 세그먼트를 분리 (다른 선수 track_id 섞임 방지)
function segmentRoute(route, maxGap = 5) {
  if (!route.length) return []
  const segs = []
  let cur = [route[0]]
  for (let i = 1; i < route.length; i++) {
    const dx = route[i].x_yards - route[i - 1].x_yards
    const dy = route[i].y_yards - route[i - 1].y_yards
    if (Math.sqrt(dx * dx + dy * dy) > maxGap) {
      segs.push(cur)
      cur = [route[i]]
    } else {
      cur.push(route[i])
    }
  }
  segs.push(cur)
  return segs
}

// ── 실측 야드 좌표 SVG (새 형식: route[].x_yards/y_yards) ──────

const FIELD_W = 120
const FIELD_H = 53.333

function AnimatedRouteSvg({ routeData, isOurTD }) {
  const mainPathRef = useRef(null)

  // HIcowboys는 x축 반전 + 오프셋으로 경로를 엔드존까지 이동
  const HONGIK_TD_OFFSET = 10.9
  const toSvgX = (xYards) => isOurTD ? (FIELD_W - xYards + HONGIK_TD_OFFSET) : xYards

  useEffect(() => {
    const el = mainPathRef.current
    if (!el) return
    try {
      const len = el.getTotalLength()
      el.style.strokeDasharray = `${len}`
      el.style.strokeDashoffset = `${len}`
      el.getBoundingClientRect() // force reflow
      el.style.transition = 'stroke-dashoffset 2s ease'
      el.style.strokeDashoffset = '0'
    } catch (_) {}
  }, [])

  const rawPts = routeData.route ?? []
  // 5야드 이상 점프 구간에서 세그먼트 분리 → 가장 긴 세그먼트만 사용
  const segments = segmentRoute(rawPts, 5)
  const mainIdx = segments.reduce((best, seg, i) => seg.length > segments[best].length ? i : best, 0)
  const mainSeg = segments[mainIdx]

  const pathColor = isOurTD ? '#CC0000' : '#888'

  const end = mainSeg[mainSeg.length - 1]

  // 메인 세그먼트 path
  const mainSampled = sampleRoute(mainSeg, 5)
  const mainPathD = catmullRomPath(mainSampled.map((p) => ({ x: toSvgX(p.x_yards), y: p.y_yards })))

  const tdEndX = end ? toSvgX(end.x_yards) : null
  const tdEndY = end ? end.y_yards : null

  const yardLines = []
  for (let x = 0; x <= 120; x += 10) yardLines.push(x)

  return (
    <div className="td-field-wrap">
      <svg
        viewBox={`0 0 ${FIELD_W} ${FIELD_H}`}
        preserveAspectRatio="xMidYMid meet"
        className="td-field-svg"
        aria-label="터치다운 경로"
      >
        {/* 필드: 플레이 필드 */}
        <rect x={0} y={0} width={FIELD_W} height={FIELD_H} fill="#1a5c1a" />
        {/* 엔드존 (진한 초록으로 구분) */}
        <rect x={0} y={0} width={10} height={FIELD_H} fill="#0d3d0d" />
        <rect x={110} y={0} width={10} height={FIELD_H} fill="#0d3d0d" />
        {/* 야드 라인 */}
        {yardLines.map((x) => (
          <line
            key={x}
            x1={x} y1={0} x2={x} y2={FIELD_H}
            stroke="rgba(255,255,255,0.22)"
            strokeWidth={x === 0 || x === 60 || x === 120 ? 0.5 : 0.2}
          />
        ))}
        {/* 필드 테두리 */}
        <rect x={0} y={0} width={FIELD_W} height={FIELD_H}
          fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth={0.4}
        />
        {/* 메인 세그먼트 (실제 TD 경로, 애니메이션) */}
        {mainPathD && (
          <path
            ref={mainPathRef}
            d={mainPathD}
            fill="none"
            stroke={pathColor}
            strokeWidth={1.3}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
        {/* TD 지점 */}
        {tdEndX != null && tdEndY != null && (
          <circle
            cx={tdEndX} cy={tdEndY} r={1.8}
            fill={pathColor} stroke="#fff" strokeWidth={0.4}
          />
        )}
      </svg>
      <div className="td-field-legend">
        <span style={{ color: pathColor }}>● 득점 경로</span>
        <span style={{ color: pathColor }}>● TD</span>
      </div>
    </div>
  )
}

// ── 구 좌표계 SVG (points 기반, 하위 호환) ─────────────────────

function LegacyRouteSvg({ routeData }) {
  const fieldLength = routeData.fieldLength ?? 120
  const pts = routeData.points ?? []
  const passerPts = routeData.passerPoints ?? []
  const yardLineXs = []
  for (let x = 0; x <= fieldLength; x += 10) yardLineXs.push(x)
  const hasEndZones = fieldLength >= 110

  return (
    <div className="td-field-wrap">
      <svg
        viewBox={`0 0 ${fieldLength} ${FIELD_H}`}
        preserveAspectRatio="xMidYMid meet"
        className="td-field-svg"
        aria-label="터치다운 경로"
      >
        <rect x={0} y={0} width={fieldLength} height={FIELD_H} fill="#193f19" />
        {hasEndZones && (
          <>
            <rect x={0} y={0} width={10} height={FIELD_H} fill="#122e12" />
            <rect x={fieldLength - 10} y={0} width={10} height={FIELD_H} fill="#1b361b" />
          </>
        )}
        {yardLineXs.map((x) => (
          <line key={x} x1={x} y1={0} x2={x} y2={FIELD_H}
            stroke="rgba(255,255,255,0.22)"
            strokeWidth={x === 0 || x === fieldLength || x === fieldLength / 2 ? 0.45 : 0.2}
          />
        ))}
        {passerPts.length >= 2 && (
          <path d={catmullRomPath(passerPts)} fill="none"
            stroke="rgba(255,255,255,0.55)" strokeWidth={0.8}
            strokeDasharray="2 1.5" strokeLinecap="round"
          />
        )}
        {pts.length >= 2 && (
          <path d={catmullRomPath(pts)} fill="none"
            stroke="#CC0000" strokeWidth={1.4}
            strokeLinecap="round" strokeLinejoin="round"
          />
        )}
        {pts.length > 0 && <circle cx={pts[0].x} cy={pts[0].y} r={1.3} fill="#ffd700" />}
        {pts.length > 1 && (
          <circle cx={pts[pts.length - 1].x} cy={pts[pts.length - 1].y}
            r={1.6} fill="#CC0000" stroke="#fff" strokeWidth={0.35}
          />
        )}
      </svg>
      <div className="td-field-legend">
        <span className="td-legend-scorer">● 득점 경로</span>
        {passerPts.length >= 2 && <span className="td-legend-passer">- - QB 경로</span>}
        <span className="td-legend-dot-start">● 시작</span>
        <span className="td-legend-dot-end">● TD</span>
      </div>
    </div>
  )
}

// ── 메인 컴포넌트 ──────────────────────────────────────────────

export default function TouchdownFieldDiagram({ play, game }) {
  const [tab, setTab] = useState('video')

  const pt = String(play.PlayType ?? '').trim().toUpperCase()
  const isPass = pt === 'PASS'
  const isRun = pt === 'RUN'
  const isOurTD = normalizeTeamName(play.OffenseTeam) === OUR_TEAM

  const scorerNum = play.CARNum ? String(play.CARNum) : null
  const qbNum = play.CAR2Num ? String(play.CAR2Num) : null
  const yards = play.GainYard ?? play.Gain ?? 0
  const quarter = play.Quarter ? `Q${play.Quarter}` : '-'

  const scorerPlayer = isOurTD && scorerNum ? findRosterPlayer(scorerNum) : null
  const qbPlayer = isOurTD && qbNum ? findRosterPlayer(qbNum) : null
  const scorerName = scorerPlayer ? scorerPlayer.name : scorerNum ? `#${scorerNum}` : '-'
  const qbName = qbPlayer ? qbPlayer.name : qbNum ? `#${qbNum}` : null

  const teamLabel = isOurTD ? 'HIcowboys' : (play.OffenseTeam ?? '?')
  const tdTypeLabel = isPass ? 'PASS TD' : isRun ? 'RUN TD' : 'TD'

  const routeData = game.gameKey ? getTouchdownRoute(game.gameKey, play.ClipKey) : null
  const clipUrl = game.gameKey ? getTouchdownClip(game.gameKey, play.OffenseTeam) : null

  const hasNewRoute = (routeData?.route?.length ?? 0) > 0
  const hasLegacyRoute = (routeData?.points?.length ?? 0) > 0
  const hasRoute = hasNewRoute || hasLegacyRoute
  const hasBoth = clipUrl && hasRoute

  const showVideo = clipUrl && (!hasRoute || tab === 'video')
  const showRoute = hasRoute && (!clipUrl || tab === 'route')

  return (
    <div className="td-card">
      <div className="td-card-header">
        <span className={`td-team-label ${isOurTD ? 'ours' : 'opponent'}`}>{teamLabel}</span>
        <span className="td-quarter">{quarter}</span>
        <span className={`td-badge ${isPass ? 'pass' : 'run'}`}>{tdTypeLabel}</span>
        <span className="td-yards">{yards}야드</span>
      </div>

      <div className="td-card-scorer">
        {isPass && qbName ? (
          <>
            <span className="td-name">{qbName}</span>
            <span className="td-arrow"> → </span>
            <span className="td-name highlight">{scorerName}</span>
          </>
        ) : (
          <span className="td-name highlight">{scorerName}</span>
        )}
      </div>

      {hasBoth && (
        <div className="td-tabs">
          <button
            className={`td-tab ${tab === 'video' ? 'active' : ''}`}
            onClick={() => setTab('video')}
          >
            📹 영상
          </button>
          <button
            className={`td-tab ${tab === 'route' ? 'active' : ''}`}
            onClick={() => setTab('route')}
          >
            📍 경로
          </button>
        </div>
      )}

      {showVideo && (
        <div className="td-video-wrap">
          <iframe
            src={clipUrl}
            title={`TD 클립 · ${teamLabel} · ${quarter}`}
            allow="autoplay"
            allowFullScreen
            className="td-video-iframe"
          />
        </div>
      )}

      {showRoute && hasNewRoute && (
        <AnimatedRouteSvg key={tab} routeData={routeData} isOurTD={isOurTD} />
      )}
      {showRoute && !hasNewRoute && hasLegacyRoute && (
        <LegacyRouteSvg routeData={routeData} />
      )}

      {!clipUrl && !hasRoute && (
        <div className="td-no-route">
          <span className="td-no-route-icon">📹</span>
          <span>영상 준비 중</span>
        </div>
      )}
    </div>
  )
}
