import type { OrderUpdated } from '@/features/catalog/contracts'

export const orderListeners = new Set<(event: OrderUpdated) => void>()
export const socketClosers = new Set<() => void>()
export let reconnectAfter = 0
export function interruptSockets(milliseconds = 1500) {
  reconnectAfter = Date.now() + milliseconds
  for (const close of socketClosers) close()
}
export function publishOrder(event: OrderUpdated) {
  for (const emit of orderListeners) emit(event)
}
