import { useEffect,useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useSession } from '@/features/auth/api'
import { createMarketSocket, subscribeToCatalog, subscribeToOrder } from '@/lib/realtime'
import { readToken } from '@/features/auth/token'
import { cartKey, orderKey, identity, type CommerceIdentity } from './api'
export function useCommerceIdentity() { const session = useSession(),context = identity(session.data?.user?.id ?? null); return {session,context,ready:session.isSuccess && (session.data.user ? Boolean(context.token) : context.token === null)} }
/** Public NFT stream refreshes the active REST cart. */
export function useCartRealtime(context: CommerceIdentity) {
  const client = useQueryClient(),[updated,setUpdated] = useState(false)
  const owner = context.userId ?? context.guestId
  useEffect(() => {
    const socket = createMarketSocket()
    const key = context.userId ? ['private',context.userId,'cart'] : ['guest',context.guestId,'cart']
    let initial = true
    return subscribeToCatalog(socket,() => { if(!initial) setUpdated(true);initial = false;void client.invalidateQueries({queryKey:key,exact:true});void client.invalidateQueries({queryKey:['catalog']}) })
  },[client,owner,context.userId,context.guestId])
  return updated
}
export function invalidateCart(client: ReturnType<typeof useQueryClient>,context: CommerceIdentity) { return client.invalidateQueries({queryKey:cartKey(context),exact:true}) }

export function useOrderRealtime(context:CommerceIdentity,orderId:string,enabled:boolean) {
  const client = useQueryClient(),[connected,setConnected] = useState(false)
  const {token,userId} = context
  useEffect(() => {
    if (!enabled || !token || !userId) return
    const socket = createMarketSocket()
    return subscribeToOrder(socket,{
      token,userId,orderId,isCurrent:() => readToken() === token,
      connection:setConnected,
      refresh:() => { void client.invalidateQueries({queryKey:orderKey(userId,orderId),exact:true}) },
      expired:() => window.dispatchEvent(new Event('kurio:unauthorized')),
    })
  },[client,token,userId,orderId,enabled])
  return connected
}
