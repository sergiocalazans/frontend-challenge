import { describe, expect, it } from 'vitest'
import axios from 'axios'
import type { NftList } from '@/features/catalog/contracts'
import { parseUrlSearch, stringifyUrlSearch, validateCatalogSearch } from '@/features/catalog/search'
import { ethToWei } from '@/lib/eth'
import { resetMocks } from '@/mocks/state'

const api = axios.create({ baseURL: 'http://localhost/api', adapter: 'http' })
const list = async (params: Record<string, string | number | undefined> = {}) => (await api.get<NftList>('/nfts', { params })).data

describe('catalog REST contract through MSW', () => {
  it('combines category, network and price before sorting and pagination', async () => {
    const result = await list({ network: 'Ethereum', category: 'art', minPrice: '1.20', maxPrice: '2.00', sort: 'price-desc' })
    expect(result.items.map(item => item.id)).toEqual(['neon-vessel', 'cosmic-bloom'])
    expect(result).toMatchObject({ total: 2, page: 1, pageSize: 9, totalPages: 1 })
    expect((await list({ q: 'cosmic', network: 'Ethereum', category: 'art' })).items.map(item => item.id)).toEqual(['cosmic-bloom'])
  })
  it('has non-overlapping pages, a partial last page and explicit out-of-range results', async () => {
    const pages = await Promise.all([1, 2, 3].map(page => list({ page })))
    expect(pages.map(page => page.items.length)).toEqual([9, 9, 6])
    expect(new Set(pages.flatMap(page => page.items.map(item => item.id))).size).toBe(24)
    expect(await list({ page: 99 })).toMatchObject({ items: [], page: 99, total: 24, totalPages: 3 })
  })
  it('sorts exact ETH values, breaks ties consistently and sorts by listing date', async () => {
    const first = await list({ sort: 'price-asc', pageSize: 18 })
    const second = await list({ sort: 'price-asc', pageSize: 18, page: 2 })
    const prices = [...first.items, ...second.items].map(item => ethToWei(item.priceEth))
    expect(prices.every((price, index) => index === 0 || price >= prices[index - 1]!)).toBe(true)
    expect(first.items.filter(item => item.priceEth === '1.19').map(item => item.id)).toEqual(['azure-token', 'emerald-ape', 'orbit-sage'])
    expect((await list({ sort: 'newest' })).items[0]?.id).toBe('azure-token')
    const exact = await list({ minPrice: '1.190000000000000001', maxPrice: '1.29' })
    expect(exact.items.map(item => item.id)).toEqual(['cosmic-bloom', 'terra-pulse'])
  })
  it.each([{ page: -1 }, { page: 1.5 }, { pageSize: 100 }, { network: 'unknown' }, { minPrice: '1e2' }, { minPrice: '2', maxPrice: '1' }, { sort: 'random' }, { category: 'invalid' }])('rejects invalid REST parameters: %j', async params => {
    await expect(list(params)).rejects.toMatchObject({ response: { status: 400 } })
  })
  it('provides reproducible failure and recovery without bypassing handlers', async () => {
    resetMocks('flaky')
    await expect(list()).rejects.toMatchObject({ response: { status: 503 } })
    await expect(list()).rejects.toMatchObject({ response: { status: 503 } })
    expect((await list()).total).toBe(24)
    resetMocks('empty')
    expect(await list()).toMatchObject({ total: 0, totalPages: 0, items: [] })
  })
  it('delivers the newer search before the older one in the race scenario', async () => {
    resetMocks('race')
    const completed: string[] = []
    const [oldResult, newResult] = await Promise.all(['Emerald', 'Golden'].map(async q => {
      const result = await list({ q })
      completed.push(q)
      return result
    }))
    expect(completed).toEqual(['Golden', 'Emerald'])
    expect(oldResult?.items[0]?.id).toBe('emerald-ape')
    expect(newResult?.items[0]?.id).toBe('golden-beat')
  })
})

it('preserves decimal strings in direct URLs and sanitizes invalid navigation state', () => {
  const input = { q: '042', minPrice: '1.190000000000000001', maxPrice: '2.00', page: 2 }
  expect(validateCatalogSearch(parseUrlSearch(stringifyUrlSearch(input)))).toMatchObject(input)
  expect(validateCatalogSearch(parseUrlSearch('?minPrice=1.190000000000000001'))).toMatchObject({ minPrice: '1.190000000000000001' })
  expect(validateCatalogSearch({ page: -3, network: 'invalid', category: [], sort: true })).toMatchObject({ page: undefined, network: undefined, category: undefined, sort: undefined })
  expect(ethToWei('0.000000000000000001')).toBe(1n)
})
