import axios from 'axios'
import { beforeEach,expect,test } from 'vitest'
import { ethToWei,weiToEth } from '@/lib/eth'
import { mockState } from '@/mocks/state'
import type { Cart,Collector,Order,Quote,WalletInput,Wallets } from '@/features/commerce/contracts'
const api = axios.create({baseURL:'http://localhost/api',adapter:'http'})
const walletInput:WalletInput = {slot:'primary',displayName:'Ana',nickname:'Principal',profileName:'Colecionadora',network:'Ethereum',address:`0x${'1'.repeat(40)}`,provider:'MetaMask',email:'ana@example.com',referral:'DEMO',ens:'ana.eth'}
const collector:Collector = {displayName:'Ana',username:'ana',profileName:'Colecionadora',email:'ana@example.com',referral:'DEMO',ens:'ana.eth',notes:''}
beforeEach(() => {api.defaults.headers.common.Authorization = '';api.defaults.headers.common['X-Cart-Id'] = crypto.randomUUID()})
async function login(email='ana@example.com') {const result = (await api.post('/session',{email,password:'Collector123!'})).data;api.defaults.headers.common.Authorization = `Bearer ${result.token}`;return result as {token:string;user:{id:string}}}
const add = async (quantity=1,nftId='emerald-ape',edition='fifty',key=crypto.randomUUID()) => (await api.post<Cart>('/cart/items',{nftId,edition,quantity},{headers:{'Idempotency-Key':key}})).data
async function wallet(input=walletInput) {const result = (await api.put<Wallets>(`/wallets/${input.slot}`,input)).data;const current = result.items.find(wallet => wallet.slot === input.slot)!;await api.post(`/wallets/${current.id}/connection`,{action:'connect'});return current}
async function quote() {const wallets = (await api.get<Wallets>('/wallets')).data;return (await api.post<Quote>('/quotes',{walletId:wallets.items[0]!.id,network:'Ethereum'})).data}
const submit = async (quote:Quote,key=crypto.randomUUID(),input=collector) => (await api.post<Order>('/orders',{quoteId:quote.id,collector:input},{headers:{'Idempotency-Key':key}})).data
async function prepare() {await login();await wallet();await add();return quote()}
const scenario = (action:string) => api.post('/demo/commerce',{action})

test('cart keeps exact ETH totals, validates stock and deduplicates additions',async () => {
  mockState.items[0]!.priceEth = '0.100000000000000001'
  const key = crypto.randomUUID(),cart = await add(2,'emerald-ape','fifty',key)
  expect(cart.totals.subtotalEth).toBe('0.200000000000000002')
  expect(cart.totals.totalEth).toBe('0.201600000000000002')
  expect((await add(2,'emerald-ape','fifty',key)).items[0]!.quantity).toBe(2)
  await expect(add(3)).rejects.toMatchObject({response:{status:409}})
  await expect(add(0)).rejects.toMatchObject({response:{status:422}})
  for(const value of ['0','1.19','0.000000000000000001','999999999.123456789012345678']) expect(weiToEth(ethToWei(value))).toBe(value)
})
test('guest cart merges once after login without dropping quantities and stays isolated on logout',async () => {
  await add(2)
  await login()
  const merged = (await api.post<Cart>('/cart/merge')).data
  expect(merged.items[0]!.quantity).toBe(2)
  expect((await api.post<Cart>('/cart/merge')).data.items[0]!.quantity).toBe(2)
  await api.delete('/session');api.defaults.headers.common.Authorization = ''
  expect((await api.get<Cart>('/cart')).data.items).toEqual([])
  await login('bruno@example.com');expect((await api.get<Cart>('/cart')).data.items).toEqual([])
  await login();expect((await api.get<Cart>('/cart')).data.items[0]!.quantity).toBe(2)
})
test('coupon and quantities use server totals and preserve the cart on invalid operations',async () => {
  let cart = await add(2)
  await expect(api.put('/cart/coupon',{code:'WRONG'})).rejects.toMatchObject({response:{status:422}})
  await expect(api.put('/cart/coupon',{code:'EXPIRED'})).rejects.toMatchObject({response:{status:410}})
  cart = (await api.put<Cart>('/cart/coupon',{code:'kurio10'})).data
  expect(cart.totals).toEqual({subtotalEth:'2.38',discountEth:'0.238',feeEth:'0.0016',totalEth:'2.1436'})
  cart = (await api.patch<Cart>(`/cart/items/${cart.items[0]!.id}`,{quantity:1})).data
  expect(cart.totals.totalEth).toBe('1.0726')
  cart = (await api.delete<Cart>('/cart/coupon')).data
  expect(cart.totals.totalEth).toBe('1.1916')
  cart = (await api.delete<Cart>(`/cart/items/${cart.items[0]!.id}`)).data
  expect(cart.items).toEqual([]);expect(cart.totals.totalEth).toBe('0')
})
test('wallet validation, conflict, editing and connection refusal pass through MSW',async () => {
  await expect(api.get('/wallets')).rejects.toMatchObject({response:{status:401}})
  await login()
  await expect(api.put('/wallets/primary',{...walletInput,address:'invalid'})).rejects.toMatchObject({response:{status:422,data:{fields:{address:expect.any(String)}}}})
  let current = await wallet()
  await expect(api.put('/wallets/secondary',{...walletInput,slot:'secondary'})).rejects.toMatchObject({response:{status:409}})
  await api.put('/wallets/primary',{...walletInput,nickname:'Editada'})
  expect((await api.get<Wallets>('/wallets')).data.connection).toBeNull()
  await scenario('reject-connection')
  await expect(api.post(`/wallets/${current.id}/connection`,{action:'connect'})).rejects.toMatchObject({response:{status:409}})
  current = await wallet({...walletInput,nickname:'Atualizada'})
  await api.post(`/wallets/${current.id}/connection`,{action:'disconnect'})
  expect((await api.get<Wallets>('/wallets')).data.connection).toBeNull()
})
test('price change forces a fresh quote and explicit confirmation',async () => {
  const old = await prepare()
  await api.post('/demo/nfts/emerald-ape/update')
  await expect(submit(old)).rejects.toMatchObject({response:{status:409,data:{code:'QUOTE_CHANGED'}}})
  const fresh = await quote()
  expect(fresh.totals.totalEth).toBe('1.2916')
  expect((await submit(fresh)).status).toBe('pending')
})
test('expired coupon, quote and disconnected or incompatible wallets cannot create an order',async () => {
  await prepare()
  await api.put('/cart/coupon',{code:'KURIO10'})
  let current = await quote()
  await scenario('expire-coupon')
  await expect(submit(current)).rejects.toMatchObject({response:{status:410}})
  await api.delete('/cart/coupon');current = await quote();await scenario('expire-quotes')
  await expect(submit(current)).rejects.toMatchObject({response:{status:409}})
  current = await quote();await scenario('disconnect')
  await expect(submit(current)).rejects.toMatchObject({response:{status:409}})
  await wallet({...walletInput,network:'Polygon'})
  await expect(api.post('/quotes',{walletId:(await api.get<Wallets>('/wallets')).data.items[0]!.id,network:'Polygon'})).rejects.toMatchObject({response:{status:409,data:{code:'NETWORK_MISMATCH'}}})
})
test('idempotent orders reserve once, retain immutable receipts and remove only purchased quantities',async () => {
  const current = await prepare(),key = crypto.randomUUID()
  await scenario('pending')
  const [one,two] = await Promise.all([submit(current,key),submit(current,key)])
  expect(one.id).toBe(two.id)
  const cart = (await api.get<Cart>('/cart')).data
  expect(cart.items[0]!.available).toBe(3)
  await api.patch(`/cart/items/${cart.items[0]!.id}`,{quantity:2})
  await expect(submit(current,key,{...collector,notes:'different'})).rejects.toMatchObject({response:{status:409,data:{code:'IDEMPOTENCY_CONFLICT'}}})
  await scenario('settle')
  const confirmed = (await api.get<Order>(`/orders/${one.id}`)).data
  expect(confirmed.status).toBe('confirmed')
  expect((await api.get<Cart>('/cart')).data.items[0]!.quantity).toBe(1)
  await api.post('/demo/nfts/emerald-ape/update')
  const receipt = (await api.get<Order>(`/orders/${one.id}`)).data
  expect(receipt.quote.items[0]!.unitPriceEth).toBe('1.19');expect(receipt.version).toBe(2)
  await login('bruno@example.com')
  await expect(api.get(`/orders/${one.id}`)).rejects.toMatchObject({response:{status:404}})
  await expect(api.get('/orders/constructor')).rejects.toMatchObject({response:{status:404}})
})
test('declined payments release reserved stock and preserve cart and coupon',async () => {
  await prepare();await api.put('/cart/coupon',{code:'KURIO10'});const current = await quote()
  await scenario('declined');const order = await submit(current);await scenario('settle')
  const declined = (await api.get<Order>(`/orders/${order.id}`)).data
  expect(declined.status).toBe('declined');expect(declined.transaction).toBeNull()
  const cart = (await api.get<Cart>('/cart')).data
  expect(cart.items[0]!.quantity).toBe(1);expect(cart.items[0]!.available).toBe(4);expect(cart.coupon).toBe('KURIO10')
  expect((await api.get<Order>(`/orders/${order.id}`)).data.version).toBe(2)
})
test('timeout after creation recovers the same order key instead of creating a second purchase',async () => {
  const current = await prepare(),key = crypto.randomUUID()
  await scenario('timeout')
  await expect(api.post('/orders',{quoteId:current.id,collector},{headers:{'Idempotency-Key':key},timeout:350})).rejects.toMatchObject({code:'ECONNABORTED'})
  const recovered = await submit(current,key)
  expect((await submit(current,key)).id).toBe(recovered.id)
  expect((await api.get<Cart>('/cart')).data.items[0]!.available).toBe(3)
})
test('session expiration blocks order access but a renewed identity can recover its pending order',async () => {
  const current = await prepare();await scenario('pending');const order = await submit(current)
  await api.post('/demo/auth',{action:'expire'})
  await expect(api.get(`/orders/${order.id}`)).rejects.toMatchObject({response:{status:401}})
  await login();expect((await api.get<Order>(`/orders/${order.id}`)).data.status).toBe('pending')
})
