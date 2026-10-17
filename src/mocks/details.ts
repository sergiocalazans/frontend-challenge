import { delay, http, HttpResponse } from 'msw'
import type { NftDetail } from '@/features/nft-details/contracts'
import { mockState } from './state'
import { expireDetailSessions, fixtureSession, readSessionStore, resolveDetailSession, seedDetailSessions } from './session-store'

let favorites: Record<string, string[]> = {}
let failFavorite = false
let holdWrites = false
const pendingWrites = new Set<() => void>()
function releaseWrites() { holdWrites = false; pendingWrites.forEach(resolve => resolve()); pendingWrites.clear() }
function readFavorites() { try { favorites = JSON.parse(localStorage.getItem('kurio.mock-favorites.v1') ?? '{}') as Record<string, string[]> } catch { /* Node uses memory. */ } }
function persistFavorites() { try { localStorage.setItem('kurio.mock-favorites.v1', JSON.stringify(favorites)) } catch { /* Node uses memory. */ } }
export function resetDetails() { favorites = {}; failFavorite = false; releaseWrites(); persistFavorites() }
export function nftDetail(id: string): NftDetail | undefined {
  const nft = mockState.items.find(item => item.id === id)
  if (!nft) return undefined
  const unique = Math.min(nft.available, 1)
  const ten = Math.min(Math.max(nft.available - unique, 0), 3)
  return { ...nft, description: `Um colecionável digital da coleção Kurio Editions na rede ${nft.network}, com arte para colecionadores.`, collection: 'Kurio Apes', attributes: ['Arte digital', nft.network, 'Kurio Editions'], editions: [
    { id: 'unique', label: '1/1', available: unique },
    { id: 'ten', label: '1/10', available: ten },
    { id: 'fifty', label: '1/50', available: nft.available - unique - ten },
    { id: 'open', label: 'ABERTA', available: 0 },
  ], related: mockState.items.filter(item => item.id !== nft.id && item.category === nft.category).slice(0, 4) }
}
const unauthorized = () => HttpResponse.json({ code: 'SESSION_EXPIRED', message: 'Entre para gerenciar favoritos.' }, { status: 401 })
async function changeFavorite(request: Request, id: string, saved: boolean) {
  const user = resolveDetailSession(request)
  if (!user) return unauthorized()
  if (holdWrites) await new Promise<void>(resolve => pendingWrites.add(resolve))
  else await delay(500)
  // Revalidate after latency, so expired/revoked sessions cannot complete a delayed write.
  if (resolveDetailSession(request)?.id !== user.id) return unauthorized()
  if (failFavorite) { failFavorite = false; return HttpResponse.json({ code: 'UNAVAILABLE' }, { status: 503 }) }
  if (!nftDetail(id)) return HttpResponse.json({ code: 'NOT_FOUND' }, { status: 404 })
  readFavorites()
  const previous = favorites[user.id] ?? []
  favorites[user.id] = saved ? [...new Set([...previous, id])] : previous.filter(value => value !== id)
  persistFavorites()
  return HttpResponse.json({ ids: favorites[user.id] })
}
export const detailHandlers = [
  http.get('*/api/nfts/:id', async ({ params }) => {
    const scenario = mockState.scenario
    await delay(scenario === 'slow' ? 1800 : 150)
    if (scenario === 'offline') return HttpResponse.error()
    if (scenario === 'error') return HttpResponse.json({ code: 'UNAVAILABLE' }, { status: 503 })
    const nft = nftDetail(String(params.id))
    return nft ? HttpResponse.json(nft) : HttpResponse.json({ code: 'NOT_FOUND' }, { status: 404 })
  }),
  http.get('*/api/favorites', async ({ request }) => {
    await delay(150)
    const user = resolveDetailSession(request)
    if (!user) return unauthorized()
    readFavorites()
    return HttpResponse.json({ ids: favorites[user.id] ?? [] })
  }),
  http.put('*/api/favorites/:id', ({ request, params }) => changeFavorite(request, String(params.id), true)),
  http.delete('*/api/favorites/:id', ({ request, params }) => changeFavorite(request, String(params.id), false)),
  http.post('*/api/demo/favorites/fail-next', () => { failFavorite = true; return HttpResponse.json({ ok: true }) }),
  http.post('*/api/demo/favorites/hold', () => { holdWrites = true; return HttpResponse.json({ ok: true }) }),
  http.post('*/api/demo/details/reset', () => { resetDetails(); seedDetailSessions(); return HttpResponse.json({ ok: true }) }),
  http.post('*/api/demo/details/expire', () => { expireDetailSessions(); releaseWrites(); return HttpResponse.json({ ok: true }) }),
  http.post('*/api/demo/details/session', async ({ request }) => {
    const input = await request.json() as { userId?: string }
    if (!readSessionStore().users.length) seedDetailSessions()
    const result = fixtureSession(input.userId ?? '')
    return result ? HttpResponse.json(result) : HttpResponse.json({ code: 'INVALID_USER' }, { status: 400 })
  }),
]
