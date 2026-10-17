import { delay, http, HttpResponse } from 'msw'
import type { Credentials, Registration, SessionUser } from '@/features/auth/contracts'
import { validateCredentials } from '@/features/auth/contracts'

import { readSessionStore, writeSessionStore, seedDetailSessions, type SessionStore } from './session-store'
type MockUser = SessionStore['users'][number]
let database = readSessionStore()
let mode: 'default' | 'slow' | 'error' = 'default'
let holdLogout = false
const pendingLogouts = new Set<() => void>()
function releaseLogouts() { holdLogout = false; pendingLogouts.forEach(resolve => resolve()); pendingLogouts.clear() }
function persist() { writeSessionStore(database) }
export function resetAuth() { releaseLogouts(); seedDetailSessions(); database = readSessionStore(); mode = 'default' }
export function sessionUser(request: Request): SessionUser | null {
  // Reload before each operation so tabs share the same simulated server state.
  database = readSessionStore()
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
  database = readSessionStore()
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
    database = readSessionStore()
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
    database = readSessionStore()
    if (database.users.some(user => user.email === input.email)) return problem('EMAIL_CONFLICT', 'Este e-mail já está cadastrado.', 409, { email: 'Este e-mail já está cadastrado.' })
    const salt = crypto.randomUUID()
    const user = { id: crypto.randomUUID(), name: input.name, email: input.email, salt, passwordHash: await hash(input.password, salt) }
    // Recheck after async hashing to reject concurrent registrations with the same email.
    database = readSessionStore()
    if (database.users.some(user => user.email === input.email)) return problem('EMAIL_CONFLICT', 'Este e-mail já está cadastrado.', 409)
    database.users.push(user)
    persist()
    return authenticate(user)
  }),
  http.delete('*/api/session', async ({ request }) => {
    if (await network()) return problem('UNAVAILABLE', 'Não foi possível sair. Tente novamente.', 503)
    if (holdLogout) await new Promise<void>(resolve => pendingLogouts.add(resolve))
    sessionUser(request)
    delete database.sessions[request.headers.get('Authorization')?.replace(/^Bearer /, '') ?? '']
    persist()
    return new HttpResponse(null, { status: 204 })
  }),
  http.post('*/api/demo/auth', async ({ request }) => {
    const input = await request.json() as { action?: string }
    if (input.action === 'reset') resetAuth()
    else if (input.action === 'hold-logout') holdLogout = true
    else if (input.action === 'release-logout') releaseLogouts()
    else if (input.action === 'expire') { sessionUser(request); for (const session of Object.values(database.sessions)) session.expiresAt = 0; persist() }
    else if (input.action === 'slow' || input.action === 'error' || input.action === 'default') mode = input.action
    else return problem('INVALID_SCENARIO', 'Cenário inválido.', 400)
    return HttpResponse.json({ ok: true })
  }),
]
