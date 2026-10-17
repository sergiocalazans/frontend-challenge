import axios from 'axios'
import { env } from './env'

export const http = axios.create({ baseURL: env.apiUrl, timeout: 10_000, headers: { Accept: 'application/json' } })

export function errorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    if (error.code === 'ECONNABORTED') return 'A conexão demorou demais. Tente novamente.'
    if (error.response?.status === 503) return 'O mercado está temporariamente indisponível.'
  }
  return 'Não foi possível carregar os dados. Tente novamente.'
}
