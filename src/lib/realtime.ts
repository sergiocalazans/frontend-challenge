import { io, type Socket } from 'socket.io-client'
import type { NftUpdated, OrderUpdated } from '@/features/catalog/contracts'
import { env } from './env'

interface ServerEvents { 'nft.updated': (event: NftUpdated) => void; 'order.updated': (event: OrderUpdated) => void; 'session.expired': () => void }
interface ClientEvents { 'catalog.subscribe': () => void; 'orders.subscribe': (input: {token:string}) => void }
export type MarketSocket = Socket<ServerEvents, ClientEvents>

export function createMarketSocket(): MarketSocket {
  return io(env.socketUrl, { autoConnect: false, transports: ['websocket'], reconnection: true, reconnectionAttempts: 5, reconnectionDelay:500, reconnectionDelayMax:2000, randomizationFactor:0 })
}

/** Attach to one consumer lifecycle. No global socket or private session data. */
export function subscribeToCatalog(socket: MarketSocket, refresh: () => void) {
  const versions = new Map<string, number>()
  const onConnect = () => { socket.emit('catalog.subscribe'); refresh() }
  const onUpdate = (event: NftUpdated) => {
    if (!event || !event.eventId || !event.nftId || !Number.isInteger(event.version) || event.version <= (versions.get(event.nftId) ?? 0)) return
    versions.set(event.nftId, event.version)
    refresh()
  }
  socket.on('connect', onConnect)
  socket.on('nft.updated', onUpdate)
  socket.connect()
  return () => {
    socket.off('connect', onConnect)
    socket.off('nft.updated', onUpdate)
    socket.disconnect()
    versions.clear()
  }
}

/** Events are invalidation hints. Only an authenticated REST response supplies a receipt. */
export function subscribeToOrder(socket: MarketSocket, input: {
  token:string; userId:string; orderId:string
  isCurrent:() => boolean; refresh:() => void
  connection:(connected:boolean) => void; expired:() => void
}) {
  let version = 0, terminal = false, disposed = false
  const ids = new Set<string>()
  const current = () => !disposed && input.isCurrent()
  const connect = () => {
    if (!current()) return
    socket.emit('orders.subscribe',{token:input.token})
    input.connection(true)
    input.refresh()
  }
  const disconnect = () => { if (current()) input.connection(false) }
  const expired = () => { if (current()) input.expired() }
  const update = (event:OrderUpdated) => {
    if (!current() || !event || terminal || event.userId !== input.userId || event.orderId !== input.orderId || typeof event.eventId !== 'string' || !event.eventId || !Number.isInteger(event.version) || event.version <= version || ids.has(event.eventId) || !['pending','confirmed','declined'].includes(event.status)) return
    version = event.version
    ids.add(event.eventId)
    if (ids.size > 512) ids.delete(ids.values().next().value!)
    terminal = event.status !== 'pending'
    input.refresh()
  }
  socket.on('connect',connect)
  socket.on('disconnect',disconnect)
  socket.on('connect_error',disconnect)
  socket.on('session.expired',expired)
  socket.on('order.updated',update)
  socket.connect()
  return () => {
    disposed = true
    socket.off('connect',connect)
    socket.off('disconnect',disconnect)
    socket.off('connect_error',disconnect)
    socket.off('session.expired',expired)
    socket.off('order.updated',update)
    socket.disconnect()
    ids.clear()
  }
}
