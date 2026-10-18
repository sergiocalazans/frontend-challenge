import { queryOptions } from '@tanstack/react-query'
import { http } from '@/lib/http'
import { readToken } from '@/features/auth/token'
import type { Cart, CartInput, CheckoutAttempt, Network, Order, Quote, WalletInput, Wallets } from './contracts'
export interface CommerceIdentity { userId: string | null; guestId: string; token: string | null }
const memoryGuest = crypto.randomUUID()
export function guestId() { try { const value = localStorage.getItem('kurio.guest-cart'); if(value && /^[a-f0-9-]{36}$/.test(value)) return value; localStorage.setItem('kurio.guest-cart',memoryGuest); return memoryGuest } catch { return memoryGuest } }
export function identity(userId: string | null): CommerceIdentity { return { userId,guestId:guestId(),token:readToken() } }
export const cartKey = (context: CommerceIdentity) => context.userId ? ['private',context.userId,'cart'] as const : ['guest',context.guestId,'cart'] as const
export const walletsKey = (userId: string) => ['private',userId,'wallets'] as const
export const orderKey = (userId: string,id: string) => ['private',userId,'order',id] as const
function config(context: CommerceIdentity) { return { headers:{ Authorization:context.token ? `Bearer ${context.token}` : '', 'X-Cart-Id':context.guestId } } }
export const cartOptions = (context: CommerceIdentity) => queryOptions({ queryKey:cartKey(context), queryFn:async ({signal}) => {
  if(context.userId) await http.post('/cart/merge',{}, {...config(context),signal})
  return (await http.get<Cart>('/cart',{...config(context),signal})).data
}, staleTime:0 })
export const walletsOptions = (context: CommerceIdentity) => queryOptions({ queryKey:walletsKey(context.userId!),queryFn:async ({signal}) => (await http.get<Wallets>('/wallets',{...config(context),signal})).data,staleTime:0 })
export const orderOptions = (context: CommerceIdentity,id: string) => queryOptions({queryKey:orderKey(context.userId!,id),queryFn:async ({signal}) => (await http.get<Order>(`/orders/${encodeURIComponent(id)}`,{...config(context),signal})).data,staleTime:0,refetchInterval:query => query.state.data?.status === 'pending' ? 15_000 : false})
export async function addCartItem(context: CommerceIdentity,input: CartInput,key: string) { return (await http.post<Cart>('/cart/items',input,{ headers:{...config(context).headers,'Idempotency-Key':key} })).data }
export async function changeCartItem(context: CommerceIdentity,id: string,quantity: number) { return (await http.patch<Cart>(`/cart/items/${encodeURIComponent(id)}`,{quantity},config(context))).data }
export async function removeCartItem(context: CommerceIdentity,id: string) { return (await http.delete<Cart>(`/cart/items/${encodeURIComponent(id)}`,config(context))).data }
export async function applyCoupon(context: CommerceIdentity,code: string) { return (await http.put<Cart>('/cart/coupon',{code},config(context))).data }
export async function removeCoupon(context: CommerceIdentity) { return (await http.delete<Cart>('/cart/coupon',config(context))).data }
export async function saveWallet(context: CommerceIdentity,input: WalletInput) { return (await http.put<Wallets>(`/wallets/${input.slot}`,input,config(context))).data }
export async function connectWallet(context: CommerceIdentity,id: string,action:'connect'|'disconnect') { return (await http.post<Wallets>(`/wallets/${encodeURIComponent(id)}/connection`,{action},config(context))).data }
export async function createQuote(context: CommerceIdentity,walletId: string,network: Network) { return (await http.post<Quote>('/quotes',{walletId,network},config(context))).data }
export async function createOrder(context: CommerceIdentity,attempt: CheckoutAttempt) { return (await http.post<Order>('/orders',attempt.input,{headers:{...config(context).headers,'Idempotency-Key':attempt.key}})).data }
