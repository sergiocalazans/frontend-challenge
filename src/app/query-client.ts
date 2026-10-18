import { QueryClient } from '@tanstack/react-query'
import axios from 'axios'

export function createQueryClient() {
  return new QueryClient({ defaultOptions: {
    queries: {
      staleTime: 30_000, gcTime: 5 * 60_000,
      retry: (count, error) => count < 1 && (!axios.isAxiosError(error) || !error.response || error.response.status >= 500),
      refetchOnWindowFocus: true,
    },
    mutations: { retry: false },
  } })
}
