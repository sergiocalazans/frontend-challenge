import { describe, it, expect, vi } from 'vitest'
import axios from 'axios'
import { resetMocks } from '@/mocks/state'

const api = axios.create({ baseURL: 'http://localhost/api', adapter: 'http' })
describe('REST through MSW', () => {
  it('filters the fixture and preserves decimal prices as strings', async () => {
    const response = await api.get('/nfts', { params: { q: 'Emerald' } })
    expect(response.data.items).toHaveLength(1)
    expect(response.data.items[0].priceEth).toBe('1.19')
  })
  it('returns empty and HTTP failure scenarios without component overrides', async () => {
    resetMocks('empty')
    expect((await api.get('/nfts')).data.items).toEqual([])
    resetMocks('error')
    await expect(api.get('/nfts')).rejects.toMatchObject({ response: { status: 503 } })
  })
  it('rejects an invalid scenario and restores deterministic state', async () => {
    await expect(api.post('/demo/scenario', { scenario: 'invalid' })).rejects.toMatchObject({ response: { status: 400 } })
    await api.post('/demo/nfts/emerald-ape/update')
    expect((await api.get('/nfts')).data.items[0].priceEth).toBe('1.29')
    await api.post('/demo/scenario', { scenario: 'default' })
    expect((await api.get('/nfts')).data.items[0].priceEth).toBe('1.19')
  })
})

it('uses the real Socket.IO client, ignores stale events and releases listeners', async () => {
  // Import after MSW starts so Socket.IO captures the intercepted WebSocket.
  const { createMarketSocket, subscribeToCatalog } = await import('@/lib/realtime')
  const { listeners } = await import('@/mocks/state')
  const refresh = vi.fn()
  const socket = createMarketSocket()
  const dispose = subscribeToCatalog(socket, refresh)
  try {
    await vi.waitFor(() => expect(socket.connected).toBe(true))
    await vi.waitFor(() => expect(listeners.size).toBe(1))
    await vi.waitFor(() => expect(refresh).toHaveBeenCalledTimes(1))
    await api.post('/demo/nfts/emerald-ape/update')
    await vi.waitFor(() => expect(refresh).toHaveBeenCalledTimes(2))
    for (const emit of listeners) {
      emit({ eventId: 'duplicate', nftId: 'emerald-ape', version: 2 })
      emit({ eventId: 'old', nftId: 'emerald-ape', version: 1 })
    }
    // Wait for a newer event: it establishes that the queued older packets were processed.
    await api.post('/demo/nfts/emerald-ape/update')
    await vi.waitFor(() => expect(refresh).toHaveBeenCalledTimes(3))
  } finally { dispose() }
  expect(socket.connected).toBe(false)
  expect(socket.listeners('nft.updated')).toHaveLength(0)
  await vi.waitFor(() => expect(listeners.size).toBe(0))
})
