import { setupWorker } from 'msw/browser'
import { handlers } from './handlers'
import { socketHandlers } from './socket'
import { resetMocks, scenarios, type Scenario } from './state'

const configured = import.meta.env.VITE_MOCK_SCENARIO as Scenario
resetMocks(scenarios.includes(configured) ? configured : 'default')
export const worker = setupWorker(...handlers, ...socketHandlers)
