const TD_CLIPS = {
  'HIcowboys_20250913_vs_KMrazorbacks': {
    HIcowboys: 'https://drive.google.com/file/d/1tcPi8GOerk40n64aHqrG8SkZjKvoVqBh/preview',
    KMrazorbacks: 'https://drive.google.com/file/d/1hX_BQsN8K2sOfQvIwtBSU_3E7DZEjVRt/preview',
  },
}

export function getTouchdownClip(gameKey, offenseTeam) {
  return TD_CLIPS[gameKey]?.[offenseTeam] ?? null
}
