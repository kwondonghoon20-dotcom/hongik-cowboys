const SESSION_KEY = 'hicowboys_authenticated'

export function isAuthenticated() {
  return sessionStorage.getItem(SESSION_KEY) === 'true'
}

export function login(password) {
  const correct = password === import.meta.env.VITE_APP_PASSWORD
  if (correct) sessionStorage.setItem(SESSION_KEY, 'true')
  return correct
}

export function logout() {
  sessionStorage.removeItem(SESSION_KEY)
}
