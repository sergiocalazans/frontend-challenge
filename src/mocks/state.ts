import type { NftUpdated } from '@/features/catalog/contracts'
import { initialNfts } from './fixtures'

export type Scenario = 'default' | 'empty' | 'error' | 'slow' | 'race' | 'offline' | 'flaky'
export const scenarios: Scenario[] = ['default', 'empty', 'error', 'slow', 'race', 'offline', 'flaky']
export const mockState = { items: structuredClone(initialNfts), scenario: 'default' as Scenario, failuresLeft: 0 }
export const listeners = new Set<(event: NftUpdated) => void>()
export function resetMocks(scenario: Scenario = 'default') {
  mockState.items = structuredClone(initialNfts)
  mockState.scenario = scenario
  mockState.failuresLeft = scenario === 'flaky' ? 2 : 0
}
