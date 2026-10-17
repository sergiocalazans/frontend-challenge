import { ethToWei, isEthDecimal } from '@/lib/eth'

export const networks = ['Ethereum', 'Polygon', 'Solana'] as const
export const categories = [
  { value: 'art', label: 'Arte digital' }, { value: 'photography', label: 'Fotografia' },
  { value: 'music', label: 'Música' }, { value: '3d', label: 'Arte 3D' },
  { value: 'collectibles', label: 'Colecionáveis' }, { value: 'generative', label: 'Generativa' },
  { value: 'games', label: 'Jogos' }, { value: 'memberships', label: 'Assinaturas' },
  { value: 'utility', label: 'Utilidade' },
] as const
export const sorts = [
  { value: 'featured', label: 'Destaques' }, { value: 'newest', label: 'Listados recentemente' },
  { value: 'price-asc', label: 'Menor preço' }, { value: 'price-desc', label: 'Maior preço' },
] as const
export type Network = typeof networks[number]
export type Category = typeof categories[number]['value']
export type CatalogSort = typeof sorts[number]['value']
export interface CatalogSearch {
  q?: string
  network?: Network
  category?: Category
  minPrice?: string
  maxPrice?: string
  sort?: CatalogSort
  page?: number
}

/** Keep decimal text intact, including direct links (the router's JSON parser coerces numbers). */
export function parseUrlSearch(value: string): Record<string, string> {
  return Object.fromEntries(new URLSearchParams(value))
}

export function stringifyUrlSearch(value: Record<string, unknown>): string {
  const params = new URLSearchParams()
  for (const [key, item] of Object.entries(value)) if (item !== undefined && item !== null) params.set(key, String(item))
  return params.size ? `?${params}` : ''
}

/** The URL boundary is forgiving; invalid values fall back to the default view. */
export function validateCatalogSearch(raw: Record<string, unknown>): CatalogSearch {
  const q = typeof raw.q === 'string' ? raw.q.trim().slice(0, 120) : ''
  const page = typeof raw.page === 'string' && /^\d+$/.test(raw.page) ? Number(raw.page) : raw.page
  let minPrice = isEthDecimal(raw.minPrice) ? raw.minPrice : undefined
  let maxPrice = isEthDecimal(raw.maxPrice) ? raw.maxPrice : undefined
  if (minPrice && maxPrice && ethToWei(minPrice) > ethToWei(maxPrice)) {
    minPrice = undefined
    maxPrice = undefined
  }
  return {
    q: q || undefined,
    network: networks.find(value => value === raw.network),
    category: categories.find(({ value }) => value === raw.category)?.value,
    minPrice, maxPrice,
    sort: sorts.find(({ value }) => value !== 'featured' && value === raw.sort)?.value,
    page: typeof page === 'number' && Number.isSafeInteger(page) && page > 1 && page <= 100_000 ? page : undefined,
  }
}

export function catalogParams(search: CatalogSearch = {}, pageSize = 9) {
  const normalized = validateCatalogSearch({ ...search })
  return { ...normalized, page: normalized.page ?? 1, pageSize, sort: normalized.sort ?? 'featured' }
}
