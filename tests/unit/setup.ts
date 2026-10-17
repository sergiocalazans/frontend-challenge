import { setupServer } from 'msw/node'
import { beforeAll, afterAll, afterEach } from 'vitest'
import { handlers } from '@/mocks/handlers'
import { socketHandlers } from '@/mocks/socket'
import { listeners, resetMocks } from '@/mocks/state'

export const server = setupServer(...handlers, ...socketHandlers)
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => { server.resetHandlers(); resetMocks(); listeners.clear() })
afterAll(() => server.close())
