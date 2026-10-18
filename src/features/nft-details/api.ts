import { queryOptions } from '@tanstack/react-query'
import { http } from '@/lib/http'
import { readToken } from '@/features/auth/token'
import type { Favorites, NftDetail } from './contracts'
export { readToken as sessionToken } from '@/features/auth/token'
function sessionHeaders() { const token = readToken(); return { Authorization: token ? `Bearer ${token}` : '' } }
export const detailOptions = (id: string) => queryOptions({ queryKey: ['nft-detail', id], queryFn: async ({ signal }) => (await http.get<NftDetail>(`/nfts/${encodeURIComponent(id)}`, { signal })).data })
export const favoritesKey = (userId: string) => ['private', userId, 'favorites'] as const
export const favoritesOptions = (userId: string) => queryOptions({ queryKey: favoritesKey(userId), queryFn: async ({ signal }) => (await http.get<Favorites>('/favorites', { signal, headers: sessionHeaders() })).data })
export async function setFavorite(id: string, saved: boolean, token: string | null) {
  const config = { headers: { Authorization: token ? `Bearer ${token}` : '' } }
  if (saved) return (await http.put<Favorites>(`/favorites/${encodeURIComponent(id)}`, {}, config)).data
  return (await http.delete<Favorites>(`/favorites/${encodeURIComponent(id)}`, config)).data
}
