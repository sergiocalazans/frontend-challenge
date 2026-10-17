export interface SessionUser { id: string; name: string; email: string }
export interface Session { user: SessionUser | null }
export interface Credentials { email: string; password: string }
export interface Registration extends Credentials { name: string; confirmPassword: string }
export interface AuthResult { user: SessionUser; token: string }
export interface ApiProblem { code: string; message: string; fields?: Record<string, string> }

export function safeReturnTo(value: unknown): string {
  if (typeof value !== 'string' || !value.startsWith('/') || value.startsWith('//') || /[\\\r\n]/.test(value)) return '/'
  const path = value.split(/[?#]/)[0]
  return path === '/login' || path === '/register' ? '/' : value
}

export function validateCredentials(input: Credentials, registration?: Registration): Record<string, string> {
  const errors: Record<string, string> = {}
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email) || input.email.length > 254) errors.email = 'Informe um e-mail válido.'
  if (input.password.length < 8 || input.password.length > 128) errors.password = 'Use uma senha de 8 a 128 caracteres.'
  if (registration) {
    if (registration.name.trim().length < 2 || registration.name.trim().length > 80) errors.name = 'Informe um nome de 2 a 80 caracteres.'
    if (registration.confirmPassword !== input.password) errors.confirmPassword = 'As senhas devem ser iguais.'
  }
  return errors
}
