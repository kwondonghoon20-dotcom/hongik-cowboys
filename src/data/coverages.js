// 디펜스 커버리지 프리셋 + 포메이션 역할(role) → 커버리지 매핑(쉘).
// 좌표계·미러링 규칙은 routes.js와 동일: 선수 x가 CENTER보다 작으면 dx 반전,
// 배치별 flip 토글도 동일하게 적용된다.

// shape: 딥존은 타원(ellipse), 언더존은 사각형(rect)으로 필드 위에 실제 "영역"을 그린다.
// 도형 중심의 기본값은 pts[1](선수 기준 오프셋 끝점)이다. spy/man/blitz는 영역 개념이
// 없는 매치업이라 shape를 붙이지 않는다(기존 점선+랜드마크 원 표시 유지).
export const COVERAGES = {
  deep3rd:     { label: '딥 3rd',  group: 'zone', pts: [[0, 0], [0, 10]], shape: { type: 'ellipse', rx: 7.5, ry: 4 } },
  deepHalf:    { label: '딥 하프', group: 'zone', pts: [[0, 0], [0, 9]],  shape: { type: 'ellipse', rx: 10.5, ry: 4 } },
  deepQuarter: { label: '딥 쿼터', group: 'zone', pts: [[0, 0], [0, 10]], shape: { type: 'ellipse', rx: 6, ry: 4 } },
  flat:        { label: '플랫',    group: 'zone', pts: [[0, 0], [5, 2]],  shape: { type: 'rect', w: 8, h: 6.5 } },
  hookCurl:    { label: '훅/커얼', group: 'zone', pts: [[0, 0], [0, 4]],  shape: { type: 'rect', w: 8, h: 6.5 } },
  under:       { label: '언더',    group: 'zone', pts: [[0, 0], [0, 3]],  shape: { type: 'rect', w: 8, h: 5 } },
  spy:         { label: '스파이',  group: 'zone', pts: [[0, 0], [0, 3]] },
  man:         { label: '맨',      group: 'man',  pts: [[0, 0], [3, 5]] },
  blitz:       { label: '블리츠',  group: 'blitz', pts: [[0, 0], [0, -2]] },
}

// base: 이 쉘이 적용 가능한 디펜스 포메이션 키(formations.js). 다른 포메이션이 배치돼
// 있으면 해당 쉘 버튼은 비활성화된다.
export const SHELLS = {
  cover1: {
    base: 'd44', label: 'Cover 1', tag: '맨 프리',
    assign: { FS: 'deep3rd', CBL: 'man', CBR: 'man', WLB: 'man', SLB: 'man', MLB1: 'spy', MLB2: 'blitz' },
  },
  cover3_44: {
    base: 'd44', label: 'Cover 3', tag: '3딥·스카이',
    assign: {
      FS: 'deep3rd', CBL: 'deep3rd', CBR: 'deep3rd', WLB: 'flat', SLB: 'flat',
      MLB1: 'hookCurl', MLB2: 'hookCurl',
    },
  },
  cover0: {
    base: 'd44', label: 'Cover 0', tag: '올아웃 블리츠',
    assign: { FS: 'man', CBL: 'man', CBR: 'man', WLB: 'man', SLB: 'man', MLB1: 'blitz', MLB2: 'blitz' },
  },
  cover2: {
    base: 'd43', label: 'Cover 2', tag: '2딥 하프',
    assign: {
      FS: 'deepHalf', SS: 'deepHalf', CBL: 'flat', CBR: 'flat', WLB: 'flat',
      MLB: 'hookCurl', SLB: 'flat',
    },
  },
  cover3_43: {
    base: 'd43', label: 'Cover 3', tag: '3딥·스카이',
    assign: {
      FS: 'deep3rd', CBL: 'deep3rd', CBR: 'deep3rd', SS: 'hookCurl', WLB: 'flat',
      MLB: 'hookCurl', SLB: 'flat',
    },
  },
  cover4: {
    base: 'd43', label: 'Cover 4', tag: '쿼터스',
    assign: {
      FS: 'deepQuarter', SS: 'deepQuarter', CBL: 'deepQuarter', CBR: 'deepQuarter',
      WLB: 'under', MLB: 'under', SLB: 'under',
    },
  },
}
