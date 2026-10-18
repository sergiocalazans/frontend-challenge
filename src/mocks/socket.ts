import { ws, http, HttpResponse } from 'msw'
import { toSocketIo } from '@mswjs/socket.io-binding'
import type { NftUpdated, OrderUpdated } from '@/features/catalog/contracts'
import { listeners } from './state'
import { env } from '@/lib/env'
import { resolveDetailSession } from './session-store'
import { settleUserOrders } from './orders'
import { readCommerce } from './commerce-store'
import { orderListeners, socketClosers, reconnectAfter, interruptSockets, publishOrder } from './realtime-state'

const market = ws.link(env.socketUrl.replace(/^http/, 'ws'))
export const socketHandlers = [market.addEventListener('connection', connection => {
  if (Date.now() < reconnectAfter) {
    // Open Engine.IO, then close before the Socket.IO namespace acknowledges.
    // A bare close during opening otherwise waits for Manager's handshake timeout.
    connection.client.send('0'+JSON.stringify({sid:'retrying',upgrades:[],pingInterval:25000,pingTimeout:5000}))
    setTimeout(() => connection.client.close(1012,'Simulated reconnect'),0)
    return
  }
  const { client } = toSocketIo(connection)
  let token = '', userId = ''
  const session = () => token ? resolveDetailSession(new Request('http://localhost/api/session',{headers:{Authorization:`Bearer ${token}`}})) : null
  const expire = () => { userId = ''; token = ''; orderListeners.delete(order); client.emit('session.expired') }
  const emit = (event:NftUpdated) => client.emit('nft.updated',event)
  const order = (event:OrderUpdated) => {
    const user = session()
    if (!user || user.id !== userId) { expire(); return }
    if (event.userId === userId) client.emit('order.updated',event)
  }
  const close = () => connection.client.close(1012,'Simulated reconnect')
  socketClosers.add(close)
  const heartbeat = setInterval(() => connection.client.send('2'),20_000)
  const settlement = setInterval(() => {
    if (!userId) return
    const user = session()
    if (!user || user.id !== userId) { expire(); return }
    settleUserOrders(userId)
  },250)
  client.on('catalog.subscribe',() => listeners.add(emit))
  // Binding 0.2 supports event payloads, not an authenticated handshake/namespace.
  client.on('orders.subscribe',(_event,input:unknown) => {
    token = input && typeof input === 'object' && 'token' in input && typeof input.token === 'string' ? input.token : ''
    const user = session()
    if (!user) { expire(); return }
    userId = user.id
    orderListeners.add(order)
  })
  connection.client.addEventListener('close',() => {
    clearInterval(heartbeat); clearInterval(settlement)
    listeners.delete(emit); orderListeners.delete(order); socketClosers.delete(close)
  })
})]

export const realtimeHandlers = [http.post('*/api/demo/realtime',async ({request}) => {
  let body: {action?:string;orderId?:string}
  try { body = await request.json() as typeof body } catch { return HttpResponse.json({code:'INVALID_INPUT'},{status:400}) }
  if (!body || typeof body !== 'object') return HttpResponse.json({code:'INVALID_INPUT'},{status:400})
  if (body.action === 'disconnect') { interruptSockets(); return HttpResponse.json({disconnected:true}) }
  const record = typeof body.orderId === 'string' ? readCommerce().orders[body.orderId] : undefined
  if (!record?.order) return HttpResponse.json({code:'NOT_FOUND'},{status:404})
  const order = record.order
  const event:OrderUpdated = {eventId:`${order.id}:${order.version}`,orderId:order.id,userId:order.userId,version:order.version,status:order.status}
  if (body.action === 'duplicate') { publishOrder(event); publishOrder(event) }
  else if (body.action === 'stale') publishOrder({...event,eventId:`old:${order.id}`,version:1,status:'pending'})
  else return HttpResponse.json({code:'INVALID_SCENARIO'},{status:400})
  return HttpResponse.json({sent:true})
})]
