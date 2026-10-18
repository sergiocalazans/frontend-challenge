import { http, HttpResponse } from 'msw'
import { ethToWei, weiToEth } from '@/lib/eth'
import type { Cart, CartInput, Network, Totals } from '@/features/commerce/contracts'
import { nftDetail } from './details'
import { storedCart, validCartInput, writeCommerce, type StoredCart } from './commerce-store'
import { commerceProblem as problem, commerceResponse, requestBody } from './commerce-http'
export const networkFee = (network: Network) => network === 'Polygon' ? '0.0001' : network === 'Solana' ? '0.00005' : '0.0016'
export function cartSnapshot(cart: StoredCart, network: Network = 'Ethereum'): Cart {
  const items = cart.items.flatMap(line => {
    const nft = nftDetail(line.nftId), edition = nft?.editions.find(item => item.id === line.edition)
    return nft && edition ? [{ ...line, name: nft.name, image: nft.image, network: nft.network, editionLabel: edition.label, unitPriceEth: nft.priceEth, totalEth: weiToEth(ethToWei(nft.priceEth) * BigInt(line.quantity)), available: edition.available, version: nft.version }] : []
  })
  const subtotal = items.reduce((value,line) => value + ethToWei(line.totalEth), 0n)
  const validCoupon = cart.coupon && cart.couponExpiresAt > Date.now()
  const discount = validCoupon ? subtotal / 10n : 0n
  const fee = items.length ? ethToWei(networkFee(network)) : 0n
  const totals: Totals = { subtotalEth: weiToEth(subtotal), discountEth: weiToEth(discount), feeEth: weiToEth(fee), totalEth: weiToEth(subtotal - discount + fee) }
  return { items, coupon: cart.coupon, revision: cart.revision, totals, purchasable: items.length > 0 && items.length === cart.items.length && items.every(line => line.quantity <= line.available) && (!cart.coupon || Boolean(validCoupon)) }
}
export const cartHandlers = [
  http.get('*/api/cart', ({ request }) => commerceResponse(request, false, ({ owner,database }) => HttpResponse.json(cartSnapshot(storedCart(database,owner))))),
  http.post('*/api/cart/merge', ({ request }) => commerceResponse(request, true, ({ owner,database }) => {
    const guestId = request.headers.get('X-Cart-Id') ?? ''
    if (!/^[a-f0-9-]{36}$/.test(guestId)) return problem('INVALID_CART', 'Identificação do carrinho ausente.', 400)
    const guest = storedCart(database, `guest:${guestId}`), target = storedCart(database,owner)
    if (guest.items.length) {
      for (const line of guest.items) { const current = target.items.find(item => item.nftId === line.nftId && item.edition === line.edition); if (current) current.quantity += line.quantity; else target.items.push({ ...line }) }
      if (!target.coupon) { target.coupon = guest.coupon; target.couponExpiresAt = guest.couponExpiresAt }
      target.revision++; guest.items = []; guest.coupon = null; guest.revision++
      writeCommerce(database)
    }
    return HttpResponse.json(cartSnapshot(target))
  })),
  http.post('*/api/cart/items', async ({ request }) => {
    const input = await requestBody<CartInput>(request)
    return commerceResponse(request,false,({owner,database}) => {
      if (!input || !validCartInput(input)) return problem('INVALID_INPUT','Seleção inválida.',422)
      const key = request.headers.get('Idempotency-Key')
      if (!key || !/^[a-zA-Z0-9-]{8,128}$/.test(key)) return problem('INVALID_KEY','Chave da operação ausente.',400)
      const cart = storedCart(database,owner)
      if (cart.operations.includes(key)) return HttpResponse.json(cartSnapshot(cart))
      const nft = nftDetail(input.nftId), edition = nft?.editions.find(item => item.id === input.edition)
      if (!nft) return problem('NOT_FOUND','NFT não encontrado.',404)
      const line = cart.items.find(item => item.nftId === input.nftId && item.edition === input.edition)
      if (!edition || (line?.quantity ?? 0) + input.quantity > edition.available) return problem('STOCK_CONFLICT','Quantidade indisponível. Confira o estoque.',409)
      if (line) line.quantity += input.quantity
      else cart.items.push({ ...input,id: crypto.randomUUID() })
      cart.revision++; cart.operations.push(key); writeCommerce(database)
      return HttpResponse.json(cartSnapshot(cart),{status:201})
    })
  }),
  http.patch('*/api/cart/items/:id', async ({ request,params }) => {
    const input = await requestBody<{quantity:number}>(request)
    return commerceResponse(request,false,({owner,database}) => {
      const cart = storedCart(database,owner), line = cart.items.find(line => line.id === params.id)
      if (!line) return problem('NOT_FOUND','Item não encontrado.',404)
      const edition = nftDetail(line.nftId)?.editions.find(edition => edition.id === line.edition)
      if (!input || !Number.isInteger(input.quantity) || input.quantity < 1) return problem('VALIDATION','Quantidade inválida.',422)
      if (!edition || input.quantity > edition.available) return problem('STOCK_CONFLICT','Quantidade indisponível. Ajuste ou remova o item.',409)
      line.quantity = input.quantity; cart.revision++; writeCommerce(database)
      return HttpResponse.json(cartSnapshot(cart))
    })
  }),
  http.delete('*/api/cart/items/:id', ({request,params}) => commerceResponse(request,false,({owner,database}) => { const cart = storedCart(database,owner); cart.items = cart.items.filter(line => line.id !== params.id); cart.revision++; writeCommerce(database); return HttpResponse.json(cartSnapshot(cart)) })),
  http.put('*/api/cart/coupon', async ({request}) => {
    const input = await requestBody<{code:string}>(request)
    return commerceResponse(request,false,({owner,database}) => {
      const code = typeof input?.code === 'string' ? input.code.trim().toUpperCase() : ''
      if (code === 'EXPIRED') return problem('COUPON_EXPIRED','Este cupom expirou.',410)
      if (code !== 'KURIO10') return problem('INVALID_COUPON','Cupom inválido.',422)
      const cart = storedCart(database,owner)
      cart.coupon = code; cart.couponExpiresAt = Date.now() + 10*60_000; cart.revision++; writeCommerce(database)
      return HttpResponse.json(cartSnapshot(cart))
    })
  }),
  http.delete('*/api/cart/coupon', ({request}) => commerceResponse(request,false,({owner,database}) => { const cart = storedCart(database,owner); cart.coupon = null; cart.couponExpiresAt = 0; cart.revision++; writeCommerce(database); return HttpResponse.json(cartSnapshot(cart)) })),
]
