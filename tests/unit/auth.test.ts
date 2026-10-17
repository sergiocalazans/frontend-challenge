import { expect, test } from 'vitest'
import { http } from '@/lib/http'
import { login, register, logout } from '@/features/auth/api'
import { saveToken } from '@/features/auth/token'
import { safeReturnTo } from '@/features/auth/contracts'
http.defaults.baseURL = 'http://localhost/api'

test('session follows REST login, expiry, logout and user switching', async () => {
  expect((await http.get('/session')).data.user).toBeNull()
  const ana = await login({ email: 'ana@example.com', password: 'Collector123!' })
  saveToken(ana.token)
  expect((await http.get('/session')).data.user.id).toBe('ana')
  await http.post('/demo/auth', { action: 'expire' })
  await expect(http.get('/session')).rejects.toMatchObject({ response: { status: 401 } })
  saveToken(null)
  const bruno = await login({ email: 'bruno@example.com', password: 'Collector123!' })
  saveToken(bruno.token)
  expect((await http.get('/session')).data.user.id).toBe('bruno')
  await logout()
  await expect(http.get('/session')).rejects.toMatchObject({ response: { status: 401 } })
})
test('registration validates server input, hashes passwords and rejects duplicate emails', async () => {
  const input = { name: 'Nova Pessoa', email: 'nova@example.com', password: 'Example123!', confirmPassword: 'Example123!' }
  await expect(register({ ...input, confirmPassword: 'different' })).rejects.toMatchObject({ response: { status: 422 } })
  const result = await register(input)
  expect(result).not.toHaveProperty('password')
  saveToken(result.token)
  expect((await http.get('/session')).data.user.email).toBe(input.email)
  await expect(register(input)).rejects.toMatchObject({ response: { status: 409 } })
  await expect(login({ email: input.email, password: 'incorrect' })).rejects.toMatchObject({ response: { status: 401 } })
})
test('return target only accepts local non-auth destinations', () => {
  for (const target of ['https://evil.test', '//evil.test', '/\\evil.test', '/login?returnTo=/login', undefined]) expect(safeReturnTo(target)).toBe('/')
  expect(safeReturnTo('/checkout?edition=limited#review')).toBe('/checkout?edition=limited#review')
})
