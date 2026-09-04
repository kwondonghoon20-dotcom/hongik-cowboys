export const PLAYBOOK = []

// 커버리지 판단 훈련(/coverage-quiz)용 패스 작전 16개.
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
//
// Pistol의 role 매핑(포메이션 범례 재대조 후 정정): FB=SL/Slot Back(#3,F, 좌측 백필드),
// TE=인라인 TE(6번째 라인 슬롯, 우측 태클 옆 타이트). Z(WB,#4)는 이번 10개 작전
// 어디에서도 드러난 라우트가 없어(원본 다이어그램 미표기) 후보에서 제외했다.
export const COVERAGE_QUIZ_PLAYS = [
  {
    id: 'pistol-x-dagger',
    name: 'Pistol X Dagger',
    formation: 'pistol',
    routes: { FB: 'go', X: 'dig', TE: 'curl' },
    coverageReads: { man: ['FB'], cover2: ['X'], cover3: ['FB'], cover4: ['TE'] },
    cover4Estimated: true,
  },
  {
    id: 'pistol-te-cnr',
    name: 'Pistol TE CNR',
    formation: 'pistol',
    routes: { X: 'slant', FB: 'flat', TE: 'corner' },
    coverageReads: { man: ['TE'], cover2: ['X'], cover3: ['FB'], cover4: ['X'] },
    cover4Estimated: true,
  },
  {
    id: 'pistol-sl-deep-out',
    name: 'Pistol SL Deep Out',
    formation: 'pistol',
    routes: { X: 'slant', FB: 'out', TE: 'corner' },
    coverageReads: { man: ['FB', 'TE'], cover2: ['FB'], cover3: ['X'], cover4: ['X'] },
    cover4Estimated: true,
  },
  {
    id: 'pistol-double-corner',
    name: 'Pistol Double Corner',
    formation: 'pistol',
    routes: { FB: 'corner', TE: 'seam', X: 'go' },
    coverageReads: { man: ['FB', 'TE'], cover2: ['TE'], cover3: ['X'], cover4: ['FB'] },
    cover4Estimated: true,
  },
  {
    id: 'pistol-x-hook-n-go',
    name: 'Pistol X Hook N Go',
    formation: 'pistol',
    // 훅앤고/훅앤아웃(더블무브)은 프리셋에 없어 첫 브레이크 없이 go/out으로 근사했다.
    routes: { X: 'go', FB: 'out' },
    coverageReads: { man: ['X'], cover2: ['X'], cover3: ['FB'], cover4: ['FB'] },
    cover4Estimated: true,
  },
  {
    id: 'pistol-124-f-in-out',
    name: 'Pistol 124 F In&Out',
    formation: 'pistol',
    routes: { X: 'out', FB: 'out', TE: 'curl' },
    coverageReads: { man: ['FB'], cover2: ['X'], cover3: ['FB'], cover4: ['TE'] },
    cover4Estimated: true,
  },
  {
    id: 'pistol-f-out-te-drive',
    name: 'Pistol F Out TE Drive',
    formation: 'pistol',
    routes: { X: 'go', FB: 'out', TE: 'seam' },
    coverageReads: { man: ['X'], cover2: ['TE'], cover3: ['FB'], cover4: ['FB'] },
    cover4Estimated: true,
  },
  {
    id: 'pistol-f-out-te-in',
    name: 'Pistol F Out TE In',
    formation: 'pistol',
    routes: { FB: 'out', TE: 'dig', X: 'go' },
    coverageReads: { man: ['FB'], cover2: ['FB'], cover3: ['X'], cover4: ['FB'] },
    cover4Estimated: true,
  },
  {
    id: 'pistol-126-f-dragon',
    name: 'Pistol 126 F Dragon',
    formation: 'pistol',
    // FB: drag 루트 뛰다가 RT 위치에서 go로 전환하는 더블무브 — 프리셋에 없어 wheel로 근사
    routes: { FB: 'wheel', TE: 'seam' },
    coverageReads: { man: ['FB'], cover2: ['FB'], cover3: ['TE'], cover4: ['TE'] },
    cover4Estimated: true,
  },
  {
    id: 'pistol-double-post',
    name: 'Pistol Double Post',
    formation: 'pistol',
    routes: { FB: 'post', TE: 'post' },
    // cover4는 두 루트 모두 딥이라 확신도 낮음 — 코치 검수 권장
    coverageReads: { man: ['FB'], cover2: ['TE'], cover3: ['FB'], cover4: ['FB'] },
    cover4Estimated: true,
  },

  // ── Twins ──
  {
    id: 'tw-x-slant-te-hook',
    name: 'TW x slant TE HOOK',
    formation: 'twins',
    routes: { X: 'slant', Z: 'slant', TE: 'curl' },
    coverageReads: { man: ['X'], cover2: ['TE'], cover3: ['X'] },
    cover4Estimated: true,
  },
  {
    id: 'tw-y-deep',
    name: 'TW Y Deep',
    formation: 'twins',
    routes: { Z: 'go', TE: 'out' },
    coverageReads: { man: ['Z'], cover2: ['TE'], cover3: ['TE'], cover4: ['TE'] },
    cover4Estimated: true,
  },
  {
    id: 'tw-te-wheel',
    name: 'TW TE Wheel',
    formation: 'twins',
    // HB의 정확한 루트 형태는 원본에서 화살표가 겹쳐 불확실 — checkdown 성격으로 근사(flat)
    routes: { TE: 'wheel', HB: 'flat', Z: 'curl' },
    coverageReads: { man: ['TE'], cover2: ['HB'], cover3: ['Z'], cover4: ['HB'] },
    cover4Estimated: true,
  },

  // ── I-Formation 3개 (신규 포메이션 사용, formations.js의 iform 그대로 재사용 — 코드 변경 불필요) ──
  {
    id: 'i-double-slnt',
    name: 'I Double Slnt',
    formation: 'iform',
    routes: { TE: 'drag', X: 'slant', Z: 'slant' },
    coverageReads: { man: ['TE'], cover2: ['Z'], cover3: ['TE'], cover4: ['X'] },
    cover4Estimated: true,
  },
  {
    id: 'i-te-wheel',
    name: 'I TE Wheel',
    formation: 'iform',
    routes: { TE: 'wheel', HB: 'seam', X: 'go' },
    coverageReads: { man: ['TE'], cover2: ['HB'], cover3: ['X'], cover4: ['HB'] },
    cover4Estimated: true,
  },
  {
    id: 'i-26-fake-te-leak',
    name: 'I 26 Fake TE Leak',
    formation: 'iform',
    routes: { TE: 'seam', Z: 'out', X: 'dig' },
    coverageReads: { man: ['TE'], cover2: ['Z'], cover3: ['X'], cover4: ['X'] },
    cover4Estimated: true,
  },
]
