import type { CheckoutAttempt,Collector,Network } from './contracts'
interface CheckoutDraft {collector:Collector;walletId:string;network:Network}
const memory = new Map<string,unknown>()
function read<T>(key:string):T | null {try {return JSON.parse(localStorage.getItem(key) ?? 'null') as T | null} catch {return memory.get(key) as T ?? null}}
function write(key:string,value:unknown) {if(value === null) memory.delete(key);else memory.set(key,value);try {if(value === null) localStorage.removeItem(key);else localStorage.setItem(key,JSON.stringify(value))} catch { /* Only in-memory recovery is possible without storage. */ }}
export const readAttempt = (userId:string) => read<CheckoutAttempt>(`kurio.checkout-attempt.${userId}`)
export const saveAttempt = (userId:string,value:CheckoutAttempt | null) => write(`kurio.checkout-attempt.${userId}`,value)
export const readCheckoutDraft = (userId:string) => read<CheckoutDraft>(`kurio.checkout-draft.${userId}`)
export const saveCheckoutDraft = (userId:string,value:CheckoutDraft | null) => write(`kurio.checkout-draft.${userId}`,value)
