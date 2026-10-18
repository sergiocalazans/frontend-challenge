import { expect,it,vi } from 'vitest'
import { fixtureSession,expireDetailSessions } from '@/mocks/session-store'
import { orderListeners,publishOrder,interruptSockets } from '@/mocks/realtime-state'
import type { OrderUpdated } from '@/features/catalog/contracts'

const event:OrderUpdated = {eventId:'order:2',orderId:'order-ana',userId:'ana',version:2,status:'pending'}
async function subscriber(userId = 'ana',token:string = fixtureSession(userId)!.token) {
  const {createMarketSocket,subscribeToOrder} = await import('@/lib/realtime')
  const socket = createMarketSocket(),refresh = vi.fn(),expired = vi.fn(),connection = vi.fn()
  let active = true
  const dispose = subscribeToOrder(socket,{token,userId,orderId:'order-ana',isCurrent:() => active,refresh,expired,connection})
  await vi.waitFor(() => expect(socket.connected).toBe(true))
  await vi.waitFor(() => expect(refresh).toHaveBeenCalledTimes(1))
  return {socket,refresh,expired,connection,dispose,deactivate:() => {active = false}}
}

it('filters duplicate, old and unrelated packets and never regresses a terminal order',async () => {
  const sub = await subscriber()
  try {
    await vi.waitFor(() => expect(orderListeners.size).toBe(1))
    publishOrder(event)
    await vi.waitFor(() => expect(sub.refresh).toHaveBeenCalledTimes(2))
    publishOrder(event)
    publishOrder({...event,eventId:'old',version:1})
    publishOrder({...event,eventId:'other-order',orderId:'another',version:9})
    publishOrder({...event,eventId:'foreign',userId:'bruno',version:9})
    publishOrder({...event,eventId:'order:3',version:3})
    await vi.waitFor(() => expect(sub.refresh).toHaveBeenCalledTimes(3))
    publishOrder({...event,eventId:'order:4',version:4,status:'confirmed'})
    await vi.waitFor(() => expect(sub.refresh).toHaveBeenCalledTimes(4))
    publishOrder({...event,eventId:'order:5',version:5,status:'pending'})
    // Reconnect is an observable barrier after the queued old packets; REST still refreshes.
    interruptSockets(1500)
    await vi.waitFor(() => expect(sub.connection).toHaveBeenLastCalledWith(false))
    await vi.waitFor(() => expect(sub.refresh).toHaveBeenCalledTimes(5),{timeout:4000})
  } finally {sub.dispose()}
  expect(sub.socket.listeners('order.updated')).toHaveLength(0)
  await vi.waitFor(() => expect(orderListeners.size).toBe(0))
})

it('authenticates private subscriptions and revokes them when the session expires',async () => {
  const ana = await subscriber(),bruno = await subscriber('bruno')
  try {
    await vi.waitFor(() => expect(orderListeners.size).toBe(2))
    publishOrder(event)
    await vi.waitFor(() => expect(ana.refresh).toHaveBeenCalledTimes(2))
    expireDetailSessions()
    publishOrder({...event,eventId:'order:3',version:3})
    await vi.waitFor(() => expect(ana.expired).toHaveBeenCalledTimes(1))
    await vi.waitFor(() => expect(bruno.expired).toHaveBeenCalledTimes(1))
    expect(bruno.refresh).toHaveBeenCalledTimes(1)
    expect(orderListeners.size).toBe(0)
  } finally {ana.dispose();bruno.dispose()}
})

it('ignores packets from a previous client identity and cleans up the socket',async () => {
  const sub = await subscriber()
  try {
    await vi.waitFor(() => expect(orderListeners.size).toBe(1))
    sub.deactivate()
    publishOrder(event)
    expireDetailSessions()
    publishOrder({...event,eventId:'order:3',version:3})
    await vi.waitFor(() => expect(orderListeners.size).toBe(0))
    expect(sub.refresh).toHaveBeenCalledTimes(1)
    expect(sub.expired).not.toHaveBeenCalled()
  } finally {sub.dispose()}
  expect(sub.socket.connected).toBe(false)
})

it('rejects an invalid private token without subscribing to another user',async () => {
  const sub = await subscriber('ana','invalid-token')
  try {
    await vi.waitFor(() => expect(sub.expired).toHaveBeenCalledTimes(1))
    expect(orderListeners.size).toBe(0)
  } finally {sub.dispose()}
})
