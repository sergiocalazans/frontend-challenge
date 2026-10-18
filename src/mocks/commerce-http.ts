import { delay, HttpResponse } from 'msw'
import { mockState } from './state'
import { resolveDetailSession } from './session-store'
import { readCommerce, type CommerceStore } from './commerce-store'
export const commerceProblem = (code: string, message: string, status: number, fields?: Record<string,string>) => HttpResponse.json({ code, message, fields }, { status })
export interface CommerceContext { owner: string; userId: string | null; database: CommerceStore }
export async function commerceResponse(request: Request, privateOnly: boolean, action: (context: CommerceContext) => Response | Promise<Response>) {
  await delay(mockState.scenario === 'slow' ? 1800 : 100)
  if (mockState.scenario === 'offline') return HttpResponse.error()
  if (mockState.scenario === 'error') return commerceProblem('UNAVAILABLE', 'Serviço temporariamente indisponível. Tente novamente.', 503)
  const user = resolveDetailSession(request)
  if ((request.headers.get('Authorization') || privateOnly) && !user) return commerceProblem('SESSION_EXPIRED', 'Sua sessão expirou. Entre novamente.', 401)
  const guest = request.headers.get('X-Cart-Id') ?? ''
  if (!user && !/^[a-f0-9-]{36}$/.test(guest)) return commerceProblem('INVALID_CART', 'Identificação do carrinho ausente.', 400)
  return action({ owner: user ? `user:${user.id}` : `guest:${guest}`, userId: user?.id ?? null, database: readCommerce() })
}
export async function requestBody<T>(request: Request): Promise<T | null> { try { const value: unknown = await request.json(); return value && typeof value === 'object' && !Array.isArray(value) ? value as T : null } catch { return null } }
