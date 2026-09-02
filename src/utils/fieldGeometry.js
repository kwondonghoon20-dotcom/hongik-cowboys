export const FIELD_W = 53.33
export const CENTER  = 26.665
export const TOP_D   = 25
export const BOT_D   = -15
export const FIELD_H = 40

export const HASH_L = 20.0
export const HASH_R = 33.33

export const toSvgY = (depth) => TOP_D - depth
export const toDepth = (y) => TOP_D - y

// TouchdownFieldDiagram에서 옮겨온 catmullRomPath
export function catmullRomPath(pts) {
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

export function polylinePath(points) {
  if (!points || points.length === 0) return ''
  const [first, ...rest] = points
  return `M ${first.x.toFixed(2)} ${first.y.toFixed(2)}` +
    rest.map((p) => ` L ${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join('')
}
