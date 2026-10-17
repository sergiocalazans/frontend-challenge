import { ws } from 'msw'
import { toSocketIo } from '@mswjs/socket.io-binding'
import type { NftUpdated } from '@/features/catalog/contracts'
import { listeners, mockState } from './state'
import { env } from '@/lib/env'

// MSW normalizes Socket.IO's /socket.io/ transport path to the origin.
const market = ws.link(env.socketUrl.replace(/^http/, 'ws'))
export const socketHandlers = [market.addEventListener('connection', connection => {
  const { client } = toSocketIo(connection)
  const heartbeat = setInterval(() => connection.client.send('2'), 20_000)
  const emit = (event: NftUpdated) => client.emit('nft.updated', event)
  client.on('catalog.subscribe', () => {
    listeners.add(emit)
    for (const nft of mockState.items) emit({ eventId: `${nft.id}:${nft.version}`, nftId: nft.id, version: nft.version })
  })
  connection.client.addEventListener('close', () => { clearInterval(heartbeat); listeners.delete(emit) })
})]
