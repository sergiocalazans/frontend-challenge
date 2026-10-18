const tokenKey = 'kurio.session-token'
let memoryToken: string | null = null
export function readToken() {
  try { return typeof localStorage === 'undefined' ? memoryToken : localStorage.getItem(tokenKey) } catch { return memoryToken }
}
export function saveToken(token: string | null) {
  memoryToken = token
  try { if (token) localStorage.setItem(tokenKey, token); else localStorage.removeItem(tokenKey) } catch { /* In-memory session still works until refresh. */ }
}
