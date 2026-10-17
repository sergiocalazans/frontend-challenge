import type { SessionIdentity } from '@/features/nft-details/contracts'
interface SessionStore { users: (SessionIdentity & { salt?: string; passwordHash?: string })[]; sessions: Record<string, { userId: string; expiresAt: number }> }
let memory: SessionStore = { users: [], sessions: {} }
export function readSessionStore(): SessionStore {
  try { return JSON.parse(localStorage.getItem('kurio.mock-auth.v1') ?? 'null') as SessionStore ?? memory } catch { return memory }
}
export function resolveDetailSession(request: Request): SessionIdentity | null {
  const database = readSessionStore()
  const token = request.headers.get('Authorization')?.replace(/^Bearer /, '') ?? ''
  const session = database.sessions[token]
  const user = session && session.expiresAt > Date.now() ? database.users.find(user => user.id === session.userId) : undefined
  return user ? { id: user.id, name: user.name, email: user.email } : null
}
// Standalone contract fixture for the independent details PR. No login UI or password handling.
export function fixtureSession(userId: string) {
  const database = readSessionStore()
  if (!database.users.some(user => user.id === userId)) return null
  const token = crypto.randomUUID()
  database.sessions[token] = { userId, expiresAt: Date.now() + 30 * 60_000 }
  memory = database
  try { localStorage.setItem('kurio.mock-auth.v1', JSON.stringify(database)) } catch { /* Unit tests use memory. */ }
  return { token, user: database.users.find(user => user.id === userId)! }
}
export function expireDetailSessions() {
  memory = readSessionStore()
  for (const session of Object.values(memory.sessions)) session.expiresAt = 0
  try { localStorage.setItem('kurio.mock-auth.v1', JSON.stringify(memory)) } catch { /* Unit tests use memory. */ }
}
export function seedDetailSessions() {
  // Same persisted fixture schema as feature/authentication, to avoid destroying hashes when integrated.
  memory = { users: [
    { id: 'ana', name: 'Ana Colecionadora', email: 'ana@example.com', salt: 'kurio-ana-demo', passwordHash: '94f623f9bdab5e376e2e84362873e4d8cc29b7ae34a997d793f6f546da27c931' },
    { id: 'bruno', name: 'Bruno Colecionador', email: 'bruno@example.com', salt: 'kurio-bruno-demo', passwordHash: 'cf5140c59adcaac03cb33ff0fd68cceec8b4b6908d7d4bd09bcf378f9b94dd3e' },
  ], sessions: {} }
  try { localStorage.setItem('kurio.mock-auth.v1', JSON.stringify(memory)) } catch { /* Unit tests use memory. */ }
}
