export const PLAYBOOK = []

// 커버리지 판단 훈련(/coverage-quiz)용 패스 작전 6개.
// 2026 오펜스 플레이북 슬라이드의 "MAN COVER / COVER 2 / COVER 3" 정답 표기를 그대로
// 옮겼다(신뢰도 높음). Cover 4 정답은 원본 슬라이드에 표기가 없어 [이론 추정]이다 —
// 언더니스가 가장 얇은 쿼터스 특성상 가장 짧고 빠른 라우트를 정답으로 뒀다(cover4Estimated).
// 라우트 궤적(각도·야드)은 손그림 다이어그램 판독이라 완벽하지 않을 수 있음 —
// 원본 PDF와 재대조 필요.
//
// formation: formations.js의 키. routes: { role: routes.js의 라우트 id } —
// 이 role들이 실제로 이 작전에서 패스를 받을 수 있는 후보 리시버다.
// coverageReads: { man/cover2/cover3/cover4: [정답 role, ...] } — 배열인 이유는
// 정답이 여러 명일 수 있어서(그중 하나만 맞아도 정답 처리).
export const COVERAGE_QUIZ_PLAYS = [
  {
    id: 'pistol-x-dagger',
    name: 'Pistol X Dagger',
    formation: 'pistol',
    routes: { SL: 'go', X: 'dig', TE: 'curl', HB: 'swing' },
    coverageReads: { man: ['SL'], cover2: ['X'], cover3: ['SL'], cover4: ['HB'] },
    cover4Estimated: true,
  },
  {
    id: 'pistol-te-cnr',
    name: 'Pistol TE CNR',
    formation: 'pistol',
    routes: { X: 'slant', SL: 'flat', TE: 'corner' },
    coverageReads: { man: ['TE'], cover2: ['X'], cover3: ['SL'], cover4: ['X'] },
    cover4Estimated: true,
  },
  {
    id: 'pistol-sl-deep-out',
    name: 'Pistol SL Deep Out',
    formation: 'pistol',
    routes: { X: 'slant', SL: 'out', TE: 'corner' },
    coverageReads: { man: ['SL', 'TE'], cover2: ['SL'], cover3: ['X'], cover4: ['X'] },
    cover4Estimated: true,
  },
  {
    id: 'pistol-double-corner',
    name: 'Pistol Double Corner',
    formation: 'pistol',
    // 원본엔 SL/TE/HB(원본 표기 FB) 루트만 명시돼 있으나 cover3 정답이 X라,
    // 클리어아웃 성격의 go 루트를 X에 추가로 부여했다(원본 슬라이드 미표기, 추정).
    routes: { X: 'go', SL: 'corner', TE: 'corner', HB: 'flat' },
    coverageReads: { man: ['SL', 'TE'], cover2: ['HB'], cover3: ['X'], cover4: ['HB'] },
    cover4Estimated: true,
  },
  {
    id: 'pistol-x-hook-n-go',
    name: 'Pistol X Hook N Go',
    formation: 'pistol',
    // 훅앤고/훅앤아웃(더블무브)은 프리셋에 없어 첫 브레이크 없이 go/out으로 근사했다.
    routes: { X: 'go', SL: 'out' },
    coverageReads: { man: ['X'], cover2: ['X'], cover3: ['SL'], cover4: ['SL'] },
    cover4Estimated: true,
  },
  {
    id: 'tw-slant-te-hook',
    name: 'TW x slant TE HOOK',
    formation: 'twins',
    routes: { X: 'slant', Y: 'slant', TE: 'curl' },
    coverageReads: { man: ['X'], cover2: ['TE'], cover3: ['X'], cover4: ['X'] },
    cover4Estimated: true,
  },
]
