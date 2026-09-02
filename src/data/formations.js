import { CENTER as C } from '../utils/fieldGeometry'

// 오펜스 라인 5명 — 실제 스플릿은 1야드지만 마커가 겹쳐서 3야드로 벌려 그린다.
// (마커 반지름 1.15야드 → 간격 3야드면 마커 사이에 0.7야드가 남는다)
const OL5 = [
  { role: 'LT', x: C - 6, d: -1, pos: 'OL' },
  { role: 'LG', x: C - 3, d: -1, pos: 'OL' },
  { role: 'C',  x: C,     d: -1, pos: 'OL' },
  { role: 'RG', x: C + 3, d: -1, pos: 'OL' },
  { role: 'RT', x: C + 6, d: -1, pos: 'OL' },
]

export const FORMATIONS = {
  iform: {
    label: 'I-Form', side: 'offense',
    slots: [...OL5,
      { role: 'TE', x: C + 9,  d: -1,    pos: 'TE' },
      { role: 'QB', x: C,      d: -3.4,  pos: 'QB' },
      { role: 'FB', x: C,      d: -6.6,  pos: 'RB' },
      { role: 'TB', x: C,      d: -10,   pos: 'RB' },
      { role: 'X',  x: 5.5,    d: -1,    pos: 'WR' },
      { role: 'Z',  x: 47.8,   d: -1.4,  pos: 'WR' },
    ],
  },
  gun: {
    label: 'Shotgun', side: 'offense',
    slots: [...OL5,
      { role: 'QB', x: C,       d: -6.2, pos: 'QB' },
      { role: 'RB', x: C + 4.6, d: -6.2, pos: 'RB' },
      { role: 'X',  x: 5,       d: -1,   pos: 'WR' },
      { role: 'SL', x: 12.5,    d: -2.6, pos: 'WR' },
      { role: 'SR', x: 41,      d: -2.6, pos: 'WR' },
      { role: 'Z',  x: 48.4,    d: -1,   pos: 'WR' },
    ],
  },
  trips: {
    label: 'Trips Rt', side: 'offense',
    slots: [...OL5,
      { role: 'TE', x: C - 9,   d: -1,   pos: 'TE' },
      { role: 'QB', x: C,       d: -6.2, pos: 'QB' },
      { role: 'RB', x: C - 4.6, d: -6.2, pos: 'RB' },
      { role: 'Z',  x: 41,      d: -1,   pos: 'WR' },
      { role: 'SL', x: 45.5,    d: -3.2, pos: 'WR' },
      { role: 'X',  x: 50,      d: -1,   pos: 'WR' },
    ],
  },
  d44: {
    label: '4-4', side: 'defense',
    slots: [
      { role: 'LE',   x: C - 6, d: 1.6, pos: 'DL' },
      { role: 'DT1',  x: C - 2, d: 1.6, pos: 'DL' },
      { role: 'DT2',  x: C + 2, d: 1.6, pos: 'DL' },
      { role: 'RE',   x: C + 6, d: 1.6, pos: 'DL' },
      { role: 'WLB',  x: C - 9, d: 5.2, pos: 'LB' },
      { role: 'MLB1', x: C - 3, d: 5.2, pos: 'LB' },
      { role: 'MLB2', x: C + 3, d: 5.2, pos: 'LB' },
      { role: 'SLB',  x: C + 9, d: 5.2, pos: 'LB' },
      { role: 'CBL',  x: 5.5,     d: 2.2,  pos: 'DB' },
      { role: 'CBR',  x: 47.8,    d: 2.2,  pos: 'DB' },
      { role: 'FS',   x: C,       d: 12.5, pos: 'DB' },
    ],
  },
  d43: {
    label: '4-3', side: 'defense',
    slots: [
      { role: 'LE',  x: C - 6,   d: 1.6,  pos: 'DL' },
      { role: 'DT',  x: C - 2,   d: 1.6,  pos: 'DL' },
      { role: 'NT',  x: C + 2,   d: 1.6,  pos: 'DL' },
      { role: 'RE',  x: C + 6,   d: 1.6,  pos: 'DL' },
      { role: 'WLB', x: C - 7,   d: 5.6,  pos: 'LB' },
      { role: 'MLB', x: C,       d: 5.6,  pos: 'LB' },
      { role: 'SLB', x: C + 7,   d: 5.6,  pos: 'LB' },
      { role: 'CBL', x: 5.5,     d: 2.2,  pos: 'DB' },
      { role: 'CBR', x: 47.8,    d: 2.2,  pos: 'DB' },
      { role: 'FS',  x: C - 7.5, d: 12.5, pos: 'DB' },
      { role: 'SS',  x: C + 7.5, d: 12.5, pos: 'DB' },
    ],
  },
}
