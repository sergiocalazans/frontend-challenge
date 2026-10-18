import axios from 'axios'
import { errorMessage } from '@/lib/http'
export function purchaseError(error:unknown) { return axios.isAxiosError<{message?:string}>(error) && typeof error.response?.data.message === 'string' ? error.response.data.message : errorMessage(error) }
