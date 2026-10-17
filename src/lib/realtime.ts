import { io, type Socket } from 'socket.io-client'
import type { NftUpdated, OrderUpdated } from '@/features/catalog/contracts'
import { env } from './env'

interface ServerEvents { 'nft.updated': (event: NftUpdated) => void; 'order.updated': (event: OrderUpdated) => void }
interface ClientEvents { 'catalog.subscribe': () => void }
export type MarketSocket = Socket<ServerEvents, ClientEvents>

export function createMarketSocket(): MarketSocket {
  return io(env.socketUrl, { autoConnect: false, transports: ['websocket'], reconnection: true, reconnectionAttempts: 5 })
}

/** Attach to one consumer lifecycle. No global socket or private session data. */
export function subscribeToCatalog(socket: MarketSocket, refresh: () => void) {
  const versions = new Map<string, number>()
  const onConnect = () => { socket.emit('catalog.subscribe'); refresh() }
  const onUpdate = (event: NftUpdated) => {
    if (!event.nftId || !Number.isInteger(event.version) || event.version <= (versions.get(event.nftId) ?? 0)) return
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
