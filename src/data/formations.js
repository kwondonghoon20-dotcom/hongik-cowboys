import { CENTER as C } from '../utils/fieldGeometry'

// slot.pos(마커 표시용 세부 포지션, 예: LT/CB/ILB)를 로스터 데이터의 넓은 포지션
// 카테고리(positions.offense/defense — 'OL'/'WR'/'RB'/'DL'/'LB'/'DB' 등)로 되돌리는 맵.
// 로스터 자동 배정(Tactics.jsx의 computeSidePlacements/togglePlayer)에서 실제 선수를
// 매칭할 때 쓴다 — 매핑에 없는 값(gun/trips의 'WR'/'OL'/'RB' 등)은 이미 넓은 카테고리라
// 그대로 반환한다.
export const POS_GROUP = {
  LT: 'OL', LG: 'OL', C: 'OL', RG: 'OL', RT: 'OL',
  X: 'WR', Z: 'WR',
  HB: 'RB', FB: 'RB',
  DE: 'DL', DT: 'DL',
  OLB: 'LB', ILB: 'LB',
  CB: 'DB', FS: 'DB', SS: 'DB',
}

export function posGroupOf(pos) {
  return POS_GROUP[pos] ?? pos
}

// 오펜스 라인 5명 — 실제 스플릿은 1야드지만 마커가 겹쳐서 3야드로 벌려 그린다.
// (마커 반지름 1.15야드 → 간격 3야드면 마커 사이에 0.7야드가 남는다)
const OL5 = [
  { role: 'LT', x: C - 6, d: -1, pos: 'LT' },
  { role: 'LG', x: C - 3, d: -1, pos: 'LG' },
  { role: 'C',  x: C,     d: -1, pos: 'C' },
  { role: 'RG', x: C + 3, d: -1, pos: 'RG' },
  { role: 'RT', x: C + 6, d: -1, pos: 'RT' },
]

export const FORMATIONS = {
  iform: {
    label: 'I-Form', side: 'offense',
    slots: [...OL5,
      { role: 'TE', x: C + 9,  d: -1,    pos: 'TE' },
      { role: 'QB', x: C,      d: -3.4,  pos: 'QB' },
      { role: 'FB', x: C,      d: -6.6,  pos: 'FB' },
      { role: 'HB', x: C,      d: -10,   pos: 'HB' },
      { role: 'X',  x: 5.5,    d: -1,    pos: 'X' },
      { role: 'Z',  x: 47.8,   d: -1.4,  pos: 'Z' },
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
  // 2026 오펜스 플레이북 "Formation" 범례(Pistol/Shotgun 페이지) 기준 11명 전원 반영.
  // 범례 표기 → 코드 role 매핑: X(WR)=X, SL/Slot Back(#3,F)=FB(백필드 포지션이라 RB 계열로 통일),
  // TE(6번째 OL 슬롯, 우측 태클 옆 타이트 인라인)=TE, QB(#1)=QB, A(딥백,#2)=HB(블로킹 노트의
  // "HB"와 동일 인물), WB(#4,Y, 우측 X와 대칭되는 와이드 리시버)=Z(표준 WR 표기 통일).
  pistol: {
    label: 'Pistol', side: 'offense',
    slots: [...OL5,
      { role: 'QB', x: C,        d: -4.2, pos: 'QB' },
      { role: 'HB', x: C,        d: -7.5, pos: 'HB' },
      { role: 'FB', x: 12.5,     d: -2.6, pos: 'FB' },
      { role: 'X',  x: 5,        d: -1,   pos: 'X'  },
      { role: 'TE', x: C + 8.5,  d: -1.6, pos: 'TE' },
      { role: 'Z',  x: 48.33,    d: -1,   pos: 'Z'  },
    ],
  },
  // 양쪽 스플릿 리시버(X/Z) + 인라인 TE + 투백(HB/FB) 샷건 세트.
  twins: {
    label: 'Twins', side: 'offense',
    slots: [...OL5,
      { role: 'TE', x: C - 9,   d: -1,   pos: 'TE' },
      { role: 'QB', x: C,       d: -6.2, pos: 'QB' },
      { role: 'HB', x: C + 4.6, d: -6.2, pos: 'HB' },
      { role: 'FB', x: C - 4.6, d: -6.2, pos: 'FB' },
      { role: 'X',  x: 5,       d: -1,   pos: 'X' },
      { role: 'Z',  x: 48,      d: -1,   pos: 'Z' },
    ],
  },
  d44: {
    label: 'Cowboy (4-4)', side: 'defense',
    slots: [
      { role: 'LE',   x: C - 6, d: 1.6, pos: 'DE' },
      { role: 'DT1',  x: C - 2, d: 1.6, pos: 'DT' },
      { role: 'DT2',  x: C + 2, d: 1.6, pos: 'DT' },
      { role: 'RE',   x: C + 6, d: 1.6, pos: 'DE' },
      { role: 'WLB',  x: C - 9, d: 5.2, pos: 'OLB' },
      { role: 'MLB1', x: C - 3, d: 5.2, pos: 'ILB' },
      { role: 'MLB2', x: C + 3, d: 5.2, pos: 'ILB' },
      { role: 'SLB',  x: C + 9, d: 5.2, pos: 'OLB' },
      { role: 'CBL',  x: 5.5,     d: 2.2,  pos: 'CB' },
      { role: 'CBR',  x: 47.8,    d: 2.2,  pos: 'CB' },
      { role: 'FS',   x: C,       d: 12.5, pos: 'FS' },
    ],
  },
  d43: {
    label: 'Rodeo (4-3)', side: 'defense',
    slots: [
      { role: 'LE',  x: C - 6,   d: 1.6,  pos: 'DE' },
      { role: 'DT',  x: C - 2,   d: 1.6,  pos: 'DT' },
      { role: 'NT',  x: C + 2,   d: 1.6,  pos: 'DT' },
      { role: 'RE',  x: C + 6,   d: 1.6,  pos: 'DE' },
      { role: 'WLB', x: C - 7,   d: 5.6,  pos: 'OLB' },
      { role: 'MLB', x: C,       d: 5.6,  pos: 'ILB' },
      { role: 'SLB', x: C + 7,   d: 5.6,  pos: 'OLB' },
      { role: 'CBL', x: 5.5,     d: 2.2,  pos: 'CB' },
      { role: 'CBR', x: 47.8,    d: 2.2,  pos: 'CB' },
      { role: 'FS',  x: C - 7.5, d: 12.5, pos: 'FS' },
      { role: 'SS',  x: C + 7.5, d: 12.5, pos: 'SS' },
    ],
  },
}
