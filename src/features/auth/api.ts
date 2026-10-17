import { queryOptions, useQuery } from '@tanstack/react-query'
import { http } from '@/lib/http'
import type { AuthResult, Credentials, Registration, Session } from './contracts'

export const sessionKey = ['session'] as const
export const sessionOptions = () => queryOptions({ queryKey: sessionKey, queryFn: async ({ signal }) => (await http.get<Session>('/session', { signal })).data, staleTime: 0, retry: false, refetchInterval: 30_000 })
export function useSession() { return useQuery(sessionOptions()) }
export async function login(input: Credentials) { return (await http.post<AuthResult>('/session', input)).data }
export async function register(input: Registration) { return (await http.post<AuthResult>('/users', input)).data }
export async function logout() { await http.delete('/session') }
