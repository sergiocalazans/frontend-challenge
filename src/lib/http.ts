import axios from 'axios'
import { env } from './env'
import { readToken } from '@/features/auth/token'

export const http = axios.create({ baseURL: env.apiUrl, timeout: 10_000, headers: { Accept: 'application/json' } })
http.interceptors.request.use(config => {
  const token = readToken()
  if (token) config.headers.set('Authorization', `Bearer ${token}`)
  return config
})
http.interceptors.response.use(response => response, (error: unknown) => {
  if (axios.isAxiosError(error) && error.response?.status === 401 && !(error.config?.method === 'post' && ['/session', '/users'].includes(error.config.url ?? '')) && error.config?.headers.get('Authorization') === `Bearer ${readToken()}` && typeof window !== 'undefined') {
    window.dispatchEvent(new Event('kurio:unauthorized'))
  }
  return Promise.reject(error)
})

export function errorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    if (error.code === 'ECONNABORTED') return 'A conexão demorou demais. Tente novamente.'
    if (error.response?.status === 503) return 'O mercado está temporariamente indisponível.'
  }
  return 'Não foi possível carregar os dados. Tente novamente.'
}
