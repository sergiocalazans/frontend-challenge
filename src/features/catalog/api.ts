import { queryOptions } from '@tanstack/react-query'
import { http } from '@/lib/http'
import type { NftList } from './contracts'
import { catalogParams, type CatalogSearch } from './search'

export const catalogKeys = { all: ['catalog'] as const, list: (search: CatalogSearch, pageSize = 9) => ['catalog', 'list', catalogParams(search, pageSize)] as const }
export function catalogOptions(search: CatalogSearch = {}, pageSize = 9) {
  return queryOptions({ queryKey: catalogKeys.list(search, pageSize), queryFn: async ({ signal }) => {
    const { data } = await http.get<NftList>('/nfts', { params: catalogParams(search, pageSize), signal })
    return data
  } })
}
