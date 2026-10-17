import { queryOptions } from '@tanstack/react-query'
import { http } from '@/lib/http'
import type { NftList } from './contracts'

export const catalogKeys = { all: ['catalog'] as const, list: (q: string) => ['catalog', 'list', q] as const }
export function catalogOptions(q = '') {
  return queryOptions({ queryKey: catalogKeys.list(q), queryFn: async ({ signal }) => {
    const { data } = await http.get<NftList>('/nfts', { params: { q }, signal })
    return data
  } })
}
