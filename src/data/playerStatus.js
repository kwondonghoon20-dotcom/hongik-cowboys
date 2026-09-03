// 선수 부상/결장 상태. 백엔드가 없어서 확정 데이터를 여기 직접 커밋한다(touchdownClips.js와
// 동일한 { [key]: value } 맵 + getter 패턴).
// status: 'out'(결장 확정) | 'questionable'(출전 불투명) | 'healthy'(정상 — 기본값, UI에 표시 안 함)
// note: 짧은 부연 메모(선택)
//
// ⚠️ 아래 항목은 배지 렌더링 확인용 테스트 예시 데이터다. 실제 팀 상태로 교체해야 한다.
const PLAYER_STATUS = {
  p18: { status: 'out', note: '무릎 부상 - 시즌아웃' },
  p24: { status: 'questionable', note: '발목 부상 - 출전 여부 경기 당일 결정' },
}

export function getPlayerStatus(playerId) {
  return PLAYER_STATUS[playerId] ?? { status: 'healthy' }
}
