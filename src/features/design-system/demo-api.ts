import { http } from '@/lib/http'

export type DemoScenario = 'default' | 'empty' | 'error' | 'slow' | 'race' | 'offline' | 'flaky'
export async function selectScenario(scenario: DemoScenario) { await http.post('/demo/scenario', { scenario }) }
export async function updateDemoNft() { await http.post('/demo/nfts/emerald-ape/update') }
