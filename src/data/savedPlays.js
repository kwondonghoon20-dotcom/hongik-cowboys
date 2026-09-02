const STORAGE_KEY = 'hicowboys_tactics_plays'

export function getSavedPlays() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function savePlay(play) {
  const plays = getSavedPlays().filter((p) => p.id !== play.id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...plays, play]))
}

export function removeSavedPlay(id) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(getSavedPlays().filter((p) => p.id !== id)))
}
