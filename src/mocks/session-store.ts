import type { SessionUser } from '@/features/auth/contracts'
import type { ProfileInput } from '@/features/profile/contracts'
export interface SessionStore { users: (SessionUser & { salt: string; passwordHash: string; profile?:Omit<ProfileInput,'name'|'email'> })[]; sessions: Record<string, { userId: string; expiresAt: number }> }
let memory: SessionStore = { users: demoUsers(), sessions: {} }
export function readSessionStore(): SessionStore {
  try { return JSON.parse(localStorage.getItem('kurio.mock-auth.v1') ?? 'null') as SessionStore ?? memory } catch { return memory }
}
export function resolveDetailSession(request: Request): SessionUser | null {
  const database = readSessionStore()
  const token = request.headers.get('Authorization')?.replace(/^Bearer /, '') ?? ''
  const session = database.sessions[token]
  const user = session && session.expiresAt > Date.now() ? database.users.find(user => user.id === session.userId) : undefined
  return user ? { id: user.id, name: user.name, email: user.email } : null
}
// Deterministic fixture used by details tests; real UI flows use POST /session.
export function fixtureSession(userId: string) {
  const database = readSessionStore()
  if (!database.users.some(user => user.id === userId)) return null
  const token = crypto.randomUUID()
  database.sessions[token] = { userId, expiresAt: Date.now() + 30 * 60_000 }
  writeSessionStore(database)
  return { token, user: database.users.find(user => user.id === userId)! }
}
export function expireDetailSessions() {
  memory = readSessionStore()
  for (const session of Object.values(memory.sessions)) session.expiresAt = 0
  writeSessionStore(memory)
}
function demoUsers(): SessionStore['users'] {
  return [
    { id: 'ana', name: 'Ana Colecionadora', email: 'ana@example.com', salt: 'kurio-ana-demo', passwordHash: '94f623f9bdab5e376e2e84362873e4d8cc29b7ae34a997d793f6f546da27c931' },
    { id: 'bruno', name: 'Bruno Colecionador', email: 'bruno@example.com', salt: 'kurio-bruno-demo', passwordHash: 'cf5140c59adcaac03cb33ff0fd68cceec8b4b6908d7d4bd09bcf378f9b94dd3e' },
  ]
}
export function writeSessionStore(database: SessionStore) {
  memory = database
  try { localStorage.setItem('kurio.mock-auth.v1', JSON.stringify(database)) } catch { /* Node or unavailable storage uses shared memory. */ }
}
export function seedDetailSessions() { writeSessionStore({ users: demoUsers(), sessions: {} }) }
