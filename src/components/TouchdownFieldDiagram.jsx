import React from 'react'
import { players } from '../data/dummy'
import { getTouchdownRoute } from '../data/touchdownRoutes'
import { OUR_TEAM } from '../utils/parseExcel'

const FIELD_WIDTH = 53.333

function findRosterPlayer(number) {
  return players.find((p) => String(p.number) === String(number)) ?? null
}

// Catmull-Rom → cubic bezier SVG path
function catmullRomPath(pts) {
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

function FieldSvg({ route }) {
  const fieldLength = route.fieldLength ?? 120
  const pts = route.points ?? []
  const passerPts = route.passerPoints ?? []

  const yardLineXs = []
  for (let x = 0; x <= fieldLength; x += 10) yardLineXs.push(x)
  const hasEndZones = fieldLength >= 110

  return (
    <svg
      viewBox={`0 0 ${fieldLength} ${FIELD_WIDTH}`}
      preserveAspectRatio="xMidYMid meet"
      className="td-field-svg"
      aria-label="터치다운 경로"
    >
      {/* 필드 배경 */}
      <rect x={0} y={0} width={fieldLength} height={FIELD_WIDTH} fill="#193f19" />
      {/* 엔드존 */}
      {hasEndZones && (
        <>
          <rect x={0} y={0} width={10} height={FIELD_WIDTH} fill="#122e12" />
          <rect x={fieldLength - 10} y={0} width={10} height={FIELD_WIDTH} fill="#1b361b" />
        </>
      )}
      {/* 야드 라인 */}
      {yardLineXs.map((x) => (
        <line
          key={x}
          x1={x} y1={0} x2={x} y2={FIELD_WIDTH}
          stroke="rgba(255,255,255,0.22)"
          strokeWidth={x === 0 || x === fieldLength || x === fieldLength / 2 ? 0.45 : 0.2}
        />
      ))}
      {/* QB 경로 (있을 때만, 흰색 점선) */}
      {passerPts.length >= 2 && (
        <path
          d={catmullRomPath(passerPts)}
          fill="none"
          stroke="rgba(255,255,255,0.55)"
          strokeWidth={0.8}
          strokeDasharray="2 1.5"
          strokeLinecap="round"
        />
      )}
      {/* 득점 선수 경로 */}
      {pts.length >= 2 && (
        <path
          d={catmullRomPath(pts)}
          fill="none"
          stroke="#CC0000"
          strokeWidth={1.4}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
      {/* 시작 점 (노란색) */}
      {pts.length > 0 && (
        <circle cx={pts[0].x} cy={pts[0].y} r={1.3} fill="#ffd700" />
      )}
      {/* 터치다운 지점 (빨간 ���두리) */}
      {pts.length > 1 && (
        <circle
          cx={pts[pts.length - 1].x}
          cy={pts[pts.length - 1].y}
          r={1.6}
          fill="#CC0000"
          stroke="#fff"
          strokeWidth={0.35}
        />
      )}
    </svg>
  )
}

export default function TouchdownFieldDiagram({ play, game }) {
  const pt = String(play.PlayType ?? '').trim().toUpperCase()
  const isPass = pt === 'PASS'
  const isRun = pt === 'RUN'
  const isOurTD = play.OffenseTeam === OUR_TEAM

  // 득점 선수/QB 정보
  const scorerNum = play.CARNum ? String(play.CARNum) : null
  const qbNum = play.CAR2Num ? String(play.CAR2Num) : null
  const yards = play.GainYard ?? play.Gain ?? 0
  const quarter = play.Quarter ? `Q${play.Quarter}` : '-'

  // 이름: OUR_TEAM 소속일 때만 로스터 매칭
  const scorerPlayer = isOurTD && scorerNum ? findRosterPlayer(scorerNum) : null
  const qbPlayer = isOurTD && qbNum ? findRosterPlayer(qbNum) : null
  const scorerName = scorerPlayer ? scorerPlayer.name : scorerNum ? `#${scorerNum}` : '-'
  const qbName = qbPlayer ? qbPlayer.name : qbNum ? `#${qbNum}` : null

  const teamLabel = play.OffenseTeam === OUR_TEAM ? 'HIC' : (play.OffenseTeam ?? '?')
  const tdTypeLabel = isPass ? '패스 TD' : isRun ? '러시 TD' : 'TD'

  const route = game.gameKey ? getTouchdownRoute(game.gameKey, play.ClipKey) : null

  return (
    <div className="td-card">
      <div className="td-card-header">
        <span className="td-badge">{quarter} · {teamLabel}</span>
        <span className="td-type">{tdTypeLabel}</span>
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

      {route ? (
        <div className="td-field-wrap">
          <FieldSvg route={route} />
          <div className="td-field-legend">
            <span className="td-legend-scorer">● 득점 경로</span>
            {(route.passerPoints?.length ?? 0) >= 2 && (
              <span className="td-legend-passer">- - QB 경로</span>
            )}
            <span className="td-legend-dot-start">● 시작</span>
            <span className="td-legend-dot-end">● TD</span>
          </div>
        </div>
      ) : (
        <div className="td-no-route">
          <span className="td-no-route-icon">📹</span>
          <span>��밀 경로 데이터 준비 중</span>
        </div>
      )}
    </div>
  )
}
