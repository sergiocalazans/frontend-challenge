import type { NftUpdated } from '@/features/catalog/contracts'
import { initialNfts } from './fixtures'

export type Scenario = 'default' | 'empty' | 'error' | 'slow'
export const scenarios: Scenario[] = ['default', 'empty', 'error', 'slow']
export const mockState = { items: structuredClone(initialNfts), scenario: 'default' as Scenario }
export const listeners = new Set<(event: NftUpdated) => void>()
export function resetMocks(scenario: Scenario = 'default') {
  mockState.items = structuredClone(initialNfts)
  mockState.scenario = scenario
}
