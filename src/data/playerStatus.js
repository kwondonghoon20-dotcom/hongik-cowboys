// 선수 부상/군입대 상태. 백엔드가 없어서 확정 데이터를 여기 직접 커밋한다(touchdownClips.js와
// 동일한 { [key]: value } 맵 + getter 패턴).
// status: 'injury'(부상) | 'military'(군대) | 'healthy'(정상 — 기본값, UI에 표시 안 함)
// note: 짧은 부연 메모(선택)
const PLAYER_STATUS = {
  p16: { status: 'injury' },
  p14: { status: 'injury' },
  p3: { status: 'injury' },
  p1: { status: 'injury' },
  p2: { status: 'injury' },
  p7: { status: 'military' },
  p18: { status: 'military' },
  p12: { status: 'military' },
  p15: { status: 'military' },
}

export function getPlayerStatus(playerId) {
  return PLAYER_STATUS[playerId] ?? { status: 'healthy' }
}
