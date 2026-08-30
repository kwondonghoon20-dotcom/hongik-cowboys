const TD_CLIPS = {
  'HIcowboys_20250913_vs_KMrazorbacks': {
    HIcowboys: 'https://drive.google.com/file/d/1tcPi8GOerk40n64aHqrG8SkZjKvoVqBh/preview',
    KMrazorbacks: 'https://drive.google.com/file/d/1hX_BQsN8K2sOfQvIwtBSU_3E7DZEjVRt/preview',
  },
}

export function getTouchdownClip(gameKey, offenseTeam) {
  return TD_CLIPS[gameKey]?.[offenseTeam] ?? null
}

// 엑셀에 잘못 기록된 플레이 필드를 보정 (PlayType, CAR2Num 등)
// 형식: { [gameKey]: { [clipKey]: { 덮어쓸 필드... } } }
const TD_PLAY_OVERRIDES = {
  'YonseiEagles_20250921_vs_HIcowboys': {
    '96': { PlayType: 'PASS', CAR2Num: '09' },
  },
}

export function getTDPlayOverride(gameKey, clipKey) {
  return TD_PLAY_OVERRIDES[gameKey]?.[String(clipKey)] ?? null
}
