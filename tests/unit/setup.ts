import { setupServer } from 'msw/node'
import { beforeAll, afterAll, afterEach } from 'vitest'
import { handlers } from '@/mocks/handlers'
import { socketHandlers } from '@/mocks/socket'
import { listeners, resetMocks } from '@/mocks/state'
import { resetDetails } from '@/mocks/details'
import { resetAuth } from '@/mocks/auth'
import { saveToken } from '@/features/auth/token'

export const server = setupServer(...handlers, ...socketHandlers)
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => { server.resetHandlers(); resetMocks(); resetAuth(); resetDetails(); saveToken(null); listeners.clear() })
afterAll(() => server.close())
