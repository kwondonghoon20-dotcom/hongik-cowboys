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
  // 샷건보다 얕은 QB 위치 + 단일 백(HB). 커버리지 판단 훈련(/coverage-quiz)에서 쓰인다.
  // 2026 오펜스 플레이북 pistol 패스 작전 전부에서 SL/HB와 별개로 등장하는 인물 —
  // 블로킹 노트엔 FB, 일부 커버리지 리드 텍스트엔 TE로 표기되지만 실측 결과 SL/HB와
  // 구분되는 세 번째 스킬 포지션이 맞다. 라인업은 항상 OL 우측에 타이트하게 붙는다.
  pistol: {
    label: 'Pistol', side: 'offense',
    slots: [...OL5,
      { role: 'QB', x: C,      d: -4.2, pos: 'QB' },
      { role: 'HB', x: C,      d: -7.5, pos: 'RB' },
      { role: 'SL', x: 12.5,   d: -2.6, pos: 'WR' },
      { role: 'X',  x: 5,      d: -1,   pos: 'WR' },
      { role: 'FB', x: C + 8.5, d: -1.6, pos: 'RB' },
    ],
  },
  // 양쪽 스플릿 리시버(X/Y) + 인라인 TE + 투백(HB/FB) 샷건 세트.
  twins: {
    label: 'Twins', side: 'offense',
    slots: [...OL5,
      { role: 'TE', x: C - 9,   d: -1,   pos: 'TE' },
      { role: 'QB', x: C,       d: -6.2, pos: 'QB' },
      { role: 'HB', x: C + 4.6, d: -6.2, pos: 'RB' },
      { role: 'FB', x: C - 4.6, d: -6.2, pos: 'RB' },
      { role: 'X',  x: 5,       d: -1,   pos: 'WR' },
      { role: 'Y',  x: 48,      d: -1,   pos: 'WR' },
    ],
  },
  d44: {
    label: 'Cowboy (4-4)', side: 'defense',
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
    label: 'Rodeo (4-3)', side: 'defense',
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
