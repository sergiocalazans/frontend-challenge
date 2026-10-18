import { http, HttpResponse } from 'msw'
import type { WalletInput, Wallets } from '@/features/commerce/contracts'
import { validateWallet } from '@/features/commerce/validation'
import { writeCommerce, type CommerceStore } from './commerce-store'
import { commerceProblem as problem, commerceResponse, requestBody } from './commerce-http'
export function storedWallets(database: CommerceStore, owner: string): Wallets {
  return database.wallets[owner] ??= { items: [], connection: null }
}
export let rejectConnection = false
export function setConnectionRejection(value: boolean) { rejectConnection = value }
export function disconnectWallets(userId: string, database: CommerceStore) { const wallets = database.wallets[`user:${userId}`]; if(wallets) wallets.connection = null }
export const walletHandlers = [
  http.get('*/api/wallets', ({request}) => commerceResponse(request,true,({owner,database}) => HttpResponse.json(storedWallets(database,owner)))),
  http.put('*/api/wallets/:slot', async ({request,params}) => {
    const input = await requestBody<WalletInput>(request)
    return commerceResponse(request,true,({owner,database}) => {
      if (!input) return problem('INVALID_INPUT','Dados inválidos.',400)
      const fields = validateWallet(input)
      if (input.slot !== params.slot || Object.keys(fields).length) return problem('VALIDATION','Revise os campos da carteira.',422,fields)
      const wallets = storedWallets(database,owner)
      if (wallets.items.some(wallet => wallet.slot !== input.slot && wallet.network === input.network && wallet.address.toLowerCase() === input.address.toLowerCase())) return problem('WALLET_CONFLICT','Este endereço já está cadastrado.',409,{ address: 'Use um endereço diferente.' })
      const old = wallets.items.find(wallet => wallet.slot === input.slot)
      const wallet = { ...input, id: old?.id ?? crypto.randomUUID(), version: (old?.version ?? 0)+1 }
      wallets.items = [...wallets.items.filter(item => item.slot !== input.slot),wallet]
      if(wallets.connection?.walletId === wallet.id) wallets.connection = null
      writeCommerce(database)
      return HttpResponse.json(wallets)
    })
  }),
  http.post('*/api/wallets/:id/connection', async ({request,params}) => {
    const input = await requestBody<{action:string}>(request)
    return commerceResponse(request,true,({owner,database}) => {
      const wallets = storedWallets(database,owner), wallet = wallets.items.find(wallet => wallet.id === params.id)
      if (!wallet) return problem('NOT_FOUND','Carteira não encontrada.',404)
      if (input?.action === 'disconnect') wallets.connection = null
      else if (input?.action === 'connect') {
        if (rejectConnection) { rejectConnection = false; return problem('CONNECTION_REFUSED','Conexão recusada na simulação. Tente novamente.',409) }
        wallets.connection = {walletId:wallet.id,network:wallet.network}
      } else return problem('INVALID_INPUT','Ação inválida.',422)
      writeCommerce(database)
      return HttpResponse.json(wallets)
    })
  }),
]
