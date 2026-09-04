// 예정 경기 일정. 백엔드가 없어서 확정 데이터를 여기 직접 커밋한다(touchdownClips.js,
// playerStatus.js와 동일한 하드코딩 맵/배열 패턴).
// date/time이 null이면 일정 미정 경기 — 리스트에는 노출하되 카운트다운 대상에서는 제외한다.
export const UPCOMING_GAMES = [
  { opponent: '동국대 터스커스', opponentEng: 'DGTuskers', date: '2026-09-05', time: '16:00', location: '양천구 해마루 축구장' },
  { opponent: '중앙대 블루드래곤즈', opponentEng: 'CABluedragons', date: '2026-09-12', time: '16:00', location: '양천구 해마루 축구장' },
  { opponent: '숭실대 크루세이더스', opponentEng: 'SSCrussadors', date: null, time: null, location: null },
]
