import { delay, http, HttpResponse } from 'msw'
import type { Credentials, Registration, SessionUser } from '@/features/auth/contracts'
import { validateCredentials } from '@/features/auth/contracts'

interface MockUser extends SessionUser { salt: string; passwordHash: string }
interface Database { users: MockUser[]; sessions: Record<string, { userId: string; expiresAt: number }> }
const storageKey = 'kurio.mock-auth.v1'
const seeded: MockUser[] = [
  { id: 'ana', name: 'Ana Colecionadora', email: 'ana@example.com', salt: 'kurio-ana-demo', passwordHash: '94f623f9bdab5e376e2e84362873e4d8cc29b7ae34a997d793f6f546da27c931' },
  { id: 'bruno', name: 'Bruno Colecionador', email: 'bruno@example.com', salt: 'kurio-bruno-demo', passwordHash: 'cf5140c59adcaac03cb33ff0fd68cceec8b4b6908d7d4bd09bcf378f9b94dd3e' },
]
function load(): Database {
  try { const value = JSON.parse(localStorage.getItem(storageKey) ?? 'null') as Database | null; if (value?.users && value.sessions) return value } catch { /* Node or unavailable storage. */ }
  return { users: structuredClone(seeded), sessions: {} }
}
let database = load()
let mode: 'default' | 'slow' | 'error' = 'default'
function persist() { try { localStorage.setItem(storageKey, JSON.stringify(database)) } catch { /* Node uses memory. */ } }
export function resetAuth() { database = { users: structuredClone(seeded), sessions: {} }; mode = 'default'; persist() }
export function sessionUser(request: Request): SessionUser | null {
  // Reload before each operation so tabs share the same simulated server state.
  if (typeof localStorage !== 'undefined') database = load()
  const token = request.headers.get('Authorization')?.replace(/^Bearer /, '') ?? ''
  const session = database.sessions[token]
  const user = session && session.expiresAt > Date.now() ? database.users.find(user => user.id === session.userId) : undefined
  return user ? { id: user.id, name: user.name, email: user.email } : null
}
async function hash(password: string, salt: string) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits'])
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt: new TextEncoder().encode(salt), iterations: 100_000, hash: 'SHA-256' }, key, 256)
  return Array.from(new Uint8Array(bits), byte => byte.toString(16).padStart(2, '0')).join('')
}
function authenticate(user: MockUser) {
  const token = crypto.randomUUID()
  database.sessions[token] = { userId: user.id, expiresAt: Date.now() + 30 * 60_000 }
  persist()
  return HttpResponse.json({ token, user: { id: user.id, name: user.name, email: user.email } })
}
const problem = (code: string, message: string, status: number, fields?: Record<string, string>) => HttpResponse.json({ code, message, fields }, { status })
async function network() { await delay(mode === 'slow' ? 1800 : 120); return mode === 'error' }
async function body(request: Request): Promise<Registration | null> {
  try {
    const value: unknown = await request.json()
    if (!value || typeof value !== 'object' || !('email' in value) || !('password' in value) || typeof value.email !== 'string' || typeof value.password !== 'string') return null
    return { email: value.email.trim().toLowerCase(), password: value.password, name: 'name' in value && typeof value.name === 'string' ? value.name.trim() : '', confirmPassword: 'confirmPassword' in value && typeof value.confirmPassword === 'string' ? value.confirmPassword : '' }
  } catch { return null }
}
export const authHandlers = [
  http.get('*/api/session', async ({ request }) => {
    if (await network()) return problem('UNAVAILABLE', 'Não foi possível verificar a sessão.', 503)
    const user = sessionUser(request)
    if (request.headers.has('Authorization') && !user) return problem('SESSION_EXPIRED', 'Sua sessão expirou. Entre novamente.', 401)
    return HttpResponse.json({ user })
  }),
  http.post('*/api/session', async ({ request }) => {
    if (await network()) return problem('UNAVAILABLE', 'Serviço indisponível. Tente novamente.', 503)
    const input: Credentials | null = await body(request)
    if (!input) return problem('INVALID_INPUT', 'Dados inválidos.', 400)
    const errors = validateCredentials(input)
    if (Object.keys(errors).length) return problem('VALIDATION', 'Revise os campos.', 422, errors)
    if (typeof localStorage !== 'undefined') database = load()
    const user = database.users.find(user => user.email === input.email)
    if (!user || await hash(input.password, user.salt) !== user.passwordHash) return problem('INVALID_CREDENTIALS', 'E-mail ou senha incorretos.', 401)
    return authenticate(user)
  }),
  http.post('*/api/users', async ({ request }) => {
    if (await network()) return problem('UNAVAILABLE', 'Serviço indisponível. Tente novamente.', 503)
    const input = await body(request)
    if (!input) return problem('INVALID_INPUT', 'Dados inválidos.', 400)
    const errors = validateCredentials(input, input)
    if (Object.keys(errors).length) return problem('VALIDATION', 'Revise os campos.', 422, errors)
    if (typeof localStorage !== 'undefined') database = load()
    if (database.users.some(user => user.email === input.email)) return problem('EMAIL_CONFLICT', 'Este e-mail já está cadastrado.', 409, { email: 'Este e-mail já está cadastrado.' })
    const salt = crypto.randomUUID()
    const user = { id: crypto.randomUUID(), name: input.name, email: input.email, salt, passwordHash: await hash(input.password, salt) }
    // Recheck after async hashing to reject concurrent registrations with the same email.
    if (typeof localStorage !== 'undefined') database = load()
    if (database.users.some(user => user.email === input.email)) return problem('EMAIL_CONFLICT', 'Este e-mail já está cadastrado.', 409)
    database.users.push(user)
    return authenticate(user)
  }),
  http.delete('*/api/session', async ({ request }) => {
    if (await network()) return problem('UNAVAILABLE', 'Não foi possível sair. Tente novamente.', 503)
    sessionUser(request)
    delete database.sessions[request.headers.get('Authorization')?.replace(/^Bearer /, '') ?? '']
    persist()
    return new HttpResponse(null, { status: 204 })
  }),
  http.post('*/api/demo/auth', async ({ request }) => {
    const input = await request.json() as { action?: string }
    if (input.action === 'reset') resetAuth()
    else if (input.action === 'expire') { sessionUser(request); for (const session of Object.values(database.sessions)) session.expiresAt = 0; persist() }
    else if (input.action === 'slow' || input.action === 'error' || input.action === 'default') mode = input.action
    else return problem('INVALID_SCENARIO', 'Cenário inválido.', 400)
    return HttpResponse.json({ ok: true })
  }),
]
