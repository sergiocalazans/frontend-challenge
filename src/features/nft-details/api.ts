import axios from 'axios'
import { queryOptions } from '@tanstack/react-query'
import { http } from '@/lib/http'
import type { DetailSession, Favorites, NftDetail } from './contracts'
export function sessionToken() { try { return localStorage.getItem('kurio.session-token') } catch { return null } }
function sessionHeaders() { const token = sessionToken(); return token ? { Authorization: `Bearer ${token}` } : {} }
function sessionFailure(error: unknown, token: string | null) {
  if (axios.isAxiosError(error) && error.response?.status === 401 && token === sessionToken()) {
    try { localStorage.removeItem('kurio.session-token') } catch { /* Unavailable storage. */ }
    if (typeof window !== 'undefined') window.dispatchEvent(new Event('kurio:unauthorized'))
  }
}
export const detailOptions = (id: string) => queryOptions({ queryKey: ['nft-detail', id], queryFn: async ({ signal }) => (await http.get<NftDetail>(`/nfts/${encodeURIComponent(id)}`, { signal })).data })
export const detailSessionOptions = () => queryOptions({ queryKey: ['session'], queryFn: async ({ signal }): Promise<DetailSession> => {
  const token = sessionToken()
  try { return (await http.get<DetailSession>('/session', { signal, headers: sessionHeaders() })).data }
  catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      sessionFailure(error, token)
      return { user: null }
    }
    throw error
  }
}, staleTime: 0, retry: false, refetchInterval: 30_000 })
export const favoritesKey = (userId: string) => ['private', userId, 'favorites'] as const
export const favoritesOptions = (userId: string) => queryOptions({ queryKey: favoritesKey(userId), queryFn: async ({ signal }) => {
  const token = sessionToken()
  try { return (await http.get<Favorites>('/favorites', { signal, headers: sessionHeaders() })).data }
  catch (error) { sessionFailure(error, token); throw error }
} })
export async function setFavorite(id: string, saved: boolean, token: string | null) {
  const config = { headers: token ? { Authorization: `Bearer ${token}` } : {} }
  try {
    if (saved) return (await http.put<Favorites>(`/favorites/${encodeURIComponent(id)}`, {}, config)).data
    return (await http.delete<Favorites>(`/favorites/${encodeURIComponent(id)}`, config)).data
  } catch (error) { sessionFailure(error, token); throw error }
}
