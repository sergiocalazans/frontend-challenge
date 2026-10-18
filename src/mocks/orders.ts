import { delay, http, HttpResponse } from 'msw'
import type { Collector, Network, Order, OrderInput, Quote } from '@/features/commerce/contracts'
import { validateCollector } from '@/features/commerce/validation'
import { cartSnapshot } from './cart'
import { changeInventory, resetInventory } from './inventory'
import { storedWallets, setConnectionRejection } from './wallets'
import { readCommerce, resetCommerceStore, storedCart, writeCommerce, type CommerceStore, type StoredOrder } from './commerce-store'
import { commerceProblem as problem, commerceResponse, requestBody } from './commerce-http'
import { resetMocks } from './state'
import { publishOrder } from './realtime-state'
export type PaymentMode = 'confirmed' | 'declined' | 'timeout' | 'pending'
let paymentMode: PaymentMode = 'confirmed'
export function resetCommerce() { resetCommerceStore(); resetInventory(); paymentMode = 'confirmed'; setConnectionRejection(false) }
function fingerprint(database: CommerceStore, owner: string, walletId: string, network: Network) {
  const cart = storedCart(database,owner), snapshot = cartSnapshot(cart,network)
  const wallets = storedWallets(database,owner), wallet = wallets.items.find(item => item.id === walletId)
  return JSON.stringify({ snapshot, wallet, connection: wallets.connection, couponExpiresAt: cart.couponExpiresAt })
}
function quoteProblem(database: CommerceStore, owner: string, walletId: string, network: Network) {
  const cart = storedCart(database,owner), snapshot = cartSnapshot(cart,network)
  if (cart.coupon && cart.couponExpiresAt <= Date.now()) return problem('COUPON_EXPIRED','O cupom expirou. Remova ou aplique novamente e revise a compra.',410)
  if (!snapshot.purchasable) return problem('STOCK_CONFLICT','Carrinho vazio ou quantidade indisponível. Revise os itens.',409)
  const wallets = storedWallets(database,owner), wallet = wallets.items.find(item => item.id === walletId)
  if (!wallet || wallet.network !== network || wallets.connection?.walletId !== walletId || wallets.connection.network !== network) return problem('WALLET_DISCONNECTED','Conecte uma carteira cadastrada na rede selecionada.',409)
  if (snapshot.items.some(item => item.network !== network)) return problem('NETWORK_MISMATCH','Separe os NFTs por rede antes de pagar. A carteira deve usar a rede dos itens.',409)
  return null
}
function normalizeInput(input: OrderInput): OrderInput {
  const source = input.collector
  const collector: Collector = { displayName: source.displayName.trim(), username: source.username.trim(), profileName: source.profileName.trim(), email: source.email.trim(), referral: source.referral.trim(), ens: source.ens.trim(), notes: source.notes.trim() }
  return { quoteId: input.quoteId, collector }
}
export function settleOrder(record: StoredOrder, database: CommerceStore) {
  if (record.order.status !== 'pending' || Date.now() < record.readyAt) return
  const order = record.order
  order.status = record.outcome; order.version++
  if (order.status === 'confirmed') {
    order.transaction = `sim-${order.id}`
    const cart = storedCart(database, `user:${order.userId}`)
    for (const purchased of order.quote.items) { const line = cart.items.find(item => item.id === purchased.id); if (line) line.quantity = Math.max(0,line.quantity - purchased.quantity) }
    cart.items = cart.items.filter(item => item.quantity > 0)
    if (!cart.items.length) { cart.coupon = null; cart.couponExpiresAt = 0 }
    cart.revision++
  } else { order.reason = 'Pagamento recusado na simulação. Seus itens foram preservados.'; changeInventory(order.quote.items,1) }
  writeCommerce(database)
  publishOrder({eventId:`${order.id}:${order.version}`,orderId:order.id,userId:order.userId,version:order.version,status:order.status})
}
// A connected subscriber drives the local simulator; REST also settles after refresh.
export function settleUserOrders(userId: string) {
  const database = readCommerce()
  for (const record of Object.values(database.orders)) {
    if (record.order.userId === userId) settleOrder(record,database)
  }
}
export const orderHandlers = [
  http.post('*/api/quotes', async ({request}) => {
    const input = await requestBody<{walletId:string;network:Network}>(request)
    return commerceResponse(request,true,({owner,database}) => {
      if (!input || typeof input.walletId !== 'string' || !['Ethereum','Polygon','Solana'].includes(input.network)) return problem('VALIDATION','Selecione carteira e rede.',422)
      const failure = quoteProblem(database,owner,input.walletId,input.network)
      if (failure) return failure
      const snapshot = cartSnapshot(storedCart(database,owner),input.network)
      const quote: Quote = { id: crypto.randomUUID(), items: snapshot.items, totals: snapshot.totals, coupon: snapshot.coupon, wallet: structuredClone(storedWallets(database,owner).items.find(item => item.id === input.walletId)!), network: input.network, expiresAt: Date.now()+120_000 }
      database.quotes[quote.id] = { owner, quote, fingerprint: fingerprint(database,owner,input.walletId,input.network) }
      writeCommerce(database)
      return HttpResponse.json(quote,{status:201})
    })
  }),
  http.post('*/api/orders', async ({request}) => {
    const body = await requestBody<OrderInput>(request)
    return commerceResponse(request,true,async ({owner,userId,database}) => {
      if (!body || typeof body.quoteId !== 'string' || !body.collector || typeof body.collector !== 'object') return problem('VALIDATION','Dados do pedido inválidos.',422)
      const fields = validateCollector(body.collector)
      if (Object.keys(fields).length) return problem('VALIDATION','Revise os dados do colecionador.',422,fields)
      const input = normalizeInput(body), key = request.headers.get('Idempotency-Key') ?? ''
      if (!/^[a-zA-Z0-9-]{8,128}$/.test(key)) return problem('INVALID_KEY','Chave idempotente obrigatória.',400)
      const previous = database.keys[`${owner}:${key}`]
      if (previous) {
        const record = database.orders[previous]!
        if (JSON.stringify(record.request.input) !== JSON.stringify(input)) return problem('IDEMPOTENCY_CONFLICT','Esta chave já foi usada para outro conteúdo.',409)
        settleOrder(record,database)
        return HttpResponse.json(record.order)
      }
      const stored = database.quotes[input.quoteId]
      if (!stored || stored.owner !== owner) return problem('NOT_FOUND','Cotação não encontrada.',404)
      const quote = stored.quote
      const failure = quoteProblem(database,owner,quote.wallet.id,quote.network)
      if (failure) return failure
      if (quote.expiresAt <= Date.now() || stored.fingerprint !== fingerprint(database,owner,quote.wallet.id,quote.network)) return problem('QUOTE_CHANGED','Preço, estoque, carteira ou cotação mudou. Revise novamente antes de confirmar.',409)
      if (!changeInventory(quote.items,-1)) return problem('STOCK_CONFLICT','Estoque indisponível. Revise a compra.',409)
      const order: Order = { id:crypto.randomUUID(), userId:userId!, status:'pending', version:1, createdAt:Date.now(), transaction:null, reason:null, quote:structuredClone(quote), collector:input.collector }
      database.orders[order.id] = { order, outcome:paymentMode === 'declined' ? 'declined' : 'confirmed', readyAt:paymentMode === 'pending' ? Number.MAX_SAFE_INTEGER : Date.now()+1500, request:{key,input} }
      database.keys[`${owner}:${key}`] = order.id
      writeCommerce(database)
      // The order is persisted before the client times out; retry resolves the same key.
      if (paymentMode === 'timeout') await delay(11_000)
      return HttpResponse.json(order,{status:201})
    })
  }),
  http.get('*/api/orders/:id', ({request,params}) => commerceResponse(request,true,({userId,database}) => {
    const record = database.orders[String(params.id)]
    if (!record?.order || record.order.userId !== userId) return problem('NOT_FOUND','Pedido não encontrado.',404)
    settleOrder(record,database)
    return HttpResponse.json(record.order)
  })),
  http.post('*/api/demo/commerce', async ({request}) => {
    const input = await requestBody<{action:string}>(request)
    if (!input) return problem('INVALID_INPUT','Cenário inválido.',400)
    const database = readCommerce()
    if (input.action === 'reset') { resetCommerce(); resetMocks() }
    else if (['confirmed','declined','timeout','pending'].includes(input.action)) paymentMode = input.action as PaymentMode
    else if (input.action === 'reject-connection') setConnectionRejection(true)
    else if (input.action === 'disconnect') { for (const wallets of Object.values(database.wallets)) wallets.connection = null; writeCommerce(database) }
    else if (input.action === 'expire-quotes') { for (const quote of Object.values(database.quotes)) quote.quote.expiresAt = 0; writeCommerce(database) }
    else if (input.action === 'expire-coupon') { for (const cart of Object.values(database.carts)) cart.couponExpiresAt = 0; writeCommerce(database) }
    else if (input.action === 'settle') { for (const record of Object.values(database.orders)) record.readyAt = 0; writeCommerce(database) }
    else return problem('INVALID_SCENARIO','Cenário inválido.',400)
    return HttpResponse.json({ok:true})
  }),
]
