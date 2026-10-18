import type { Nft, NftList } from '@/features/catalog/contracts'
import { categories, networks, sorts, validateCatalogSearch } from '@/features/catalog/search'
import { ethToWei, isEthDecimal } from '@/lib/eth'

/** REST rejects malformed parameters instead of silently serving a different query. */
export function listNfts(items: Nft[], params: URLSearchParams): NftList | null {
  const raw = Object.fromEntries(params)
  if (params.size !== Object.keys(raw).length || Object.keys(raw).some(key => !['q', 'network', 'category', 'minPrice', 'maxPrice', 'sort', 'page', 'pageSize'].includes(key))) return null
  if (raw.q && raw.q.length > 120) return null
  if (raw.network && !networks.some(value => value === raw.network)) return null
  if (raw.category && !categories.some(({ value }) => value === raw.category)) return null
  if (raw.sort && !sorts.some(({ value }) => value === raw.sort)) return null
  for (const key of ['minPrice', 'maxPrice']) if (raw[key] !== undefined && !isEthDecimal(raw[key])) return null
  if (raw.minPrice && raw.maxPrice && ethToWei(raw.minPrice) > ethToWei(raw.maxPrice)) return null
  const page = raw.page === undefined ? 1 : Number(raw.page)
  const pageSize = raw.pageSize === undefined ? 9 : Number(raw.pageSize)
  if (!Number.isSafeInteger(page) || page < 1 || page > 100_000 || ![4, 9, 18].includes(pageSize)) return null
  const search = validateCatalogSearch(raw)
  const filtered = items.filter(nft =>
    (!search.q || nft.name.toLocaleLowerCase('pt-BR').includes(search.q.toLocaleLowerCase('pt-BR'))) &&
    (!search.network || nft.network === search.network) &&
    (!search.category || nft.category === search.category) &&
    (!search.minPrice || ethToWei(nft.priceEth) >= ethToWei(search.minPrice)) &&
    (!search.maxPrice || ethToWei(nft.priceEth) <= ethToWei(search.maxPrice)),
  )
  if (search.sort) filtered.sort((a, b) => {
    if (search.sort === 'newest') return b.listedAt.localeCompare(a.listedAt) || a.id.localeCompare(b.id)
    const difference = ethToWei(a.priceEth) - ethToWei(b.priceEth)
    return (difference === 0n ? 0 : difference < 0n ? -1 : 1) * (search.sort === 'price-desc' ? -1 : 1) || a.id.localeCompare(b.id)
  })
  return { items: filtered.slice((page - 1) * pageSize, page * pageSize), total: filtered.length, page, pageSize, totalPages: Math.ceil(filtered.length / pageSize) }
}
