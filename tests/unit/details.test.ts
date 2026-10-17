import axios from 'axios'
import { beforeEach, expect, test } from 'vitest'
import { resetDetails } from '@/mocks/details'
import { seedDetailSessions } from '@/mocks/session-store'
import type { NftDetail } from '@/features/nft-details/contracts'
import { validateDetailSearch } from '@/features/nft-details/contracts'
const api = axios.create({ baseURL: 'http://localhost/api', adapter: 'http' })
beforeEach(() => { resetDetails(); seedDetailSessions() })
const login = async (userId: string) => ({ Authorization: `Bearer ${(await api.post('/demo/details/session', { userId })).data.token}` })
test('detail and edition stock reconcile with catalog availability', async () => {
  const detail = (await api.get<NftDetail>('/nfts/emerald-ape')).data
  expect(detail.priceEth).toBe('1.19')
  expect(detail.editions.reduce((sum, edition) => sum + edition.available, 0)).toBe(detail.available)
  expect(detail.editions.find(edition => edition.id === 'open')?.available).toBe(0)
  expect(detail.related.every(nft => nft.id !== detail.id)).toBe(true)
  await expect(api.get('/nfts/unknown')).rejects.toMatchObject({ response: { status: 404 } })
})
test('favorites require session, remain idempotent and isolate users', async () => {
  await expect(api.get('/favorites')).rejects.toMatchObject({ response: { status: 401 } })
  const ana = { headers: await login('ana') }
  const bruno = { headers: await login('bruno') }
  expect((await api.get('/favorites', ana)).data.ids).toEqual([])
  await api.put('/favorites/emerald-ape', {}, ana)
  await api.put('/favorites/emerald-ape', {}, ana)
  expect((await api.get('/favorites', ana)).data.ids).toEqual(['emerald-ape'])
  expect((await api.get('/favorites', bruno)).data.ids).toEqual([])
  await api.delete('/favorites/emerald-ape', ana)
  expect((await api.get('/favorites', ana)).data.ids).toEqual([])
})
test('failed favorite mutation preserves server state and recovers', async () => {
  const config = { headers: await login('ana') }
  await api.post('/demo/favorites/fail-next')
  await expect(api.put('/favorites/emerald-ape', {}, config)).rejects.toMatchObject({ response: { status: 503 } })
  expect((await api.get('/favorites', config)).data.ids).toEqual([])
  await api.put('/favorites/emerald-ape', {}, config)
  expect((await api.get('/favorites', config)).data.ids).toEqual(['emerald-ape'])
  await expect(api.put('/favorites/unknown', {}, config)).rejects.toMatchObject({ response: { status: 404 } })
})
test('REST availability change recomputes edition capacities', async () => {
  await api.post('/demo/nfts/emerald-ape/update', { available: 2 })
  const detail = (await api.get<NftDetail>('/nfts/emerald-ape')).data
  expect(detail.available).toBe(2)
  expect(detail.editions.map(item => item.available)).toEqual([1, 1, 0, 0])
  await expect(api.post('/demo/nfts/emerald-ape/update', { available: -1 })).rejects.toMatchObject({ response: { status: 422 } })
})
test('selection URL validates edition and integral positive quantities', () => {
  expect(validateDetailSearch({ edition: 'fifty', quantity: '4' })).toEqual({ edition: 'fifty', quantity: 4 })
  expect(validateDetailSearch({ edition: 'fake', quantity: '1.5' })).toEqual({ edition: undefined, quantity: undefined })
})
test('expired session cannot read or modify favorites', async () => {
  const config = { headers: await login('ana') }
  await api.post('/demo/details/expire')
  await expect(api.get('/favorites', config)).rejects.toMatchObject({ response: { status: 401 } })
  await expect(api.put('/favorites/emerald-ape', {}, config)).rejects.toMatchObject({ response: { status: 401 } })
})
