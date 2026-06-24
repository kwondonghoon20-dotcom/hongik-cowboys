const STORAGE_KEY = 'hicowboys_uploaded_games'

export function getUploadedGames() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function addUploadedGame(record) {
  const games = getUploadedGames().filter((g) => g.id !== record.id)
  const next = [...games, record]
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  return next
}

export function removeUploadedGame(id) {
  const next = getUploadedGames().filter((g) => g.id !== id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  return next
}
