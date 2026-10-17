import { delay, http, HttpResponse } from 'msw'
import { listeners, mockState, resetMocks, scenarios, type Scenario } from './state'

export const handlers = [
  http.get('*/api/nfts', async ({ request }) => {
    const scenario = mockState.scenario
    await delay(scenario === 'slow' ? 1800 : 150)
    if (scenario === 'error') return HttpResponse.json({ code: 'UNAVAILABLE' }, { status: 503 })
    const q = new URL(request.url).searchParams.get('q')?.toLocaleLowerCase('pt-BR') ?? ''
    return HttpResponse.json({ items: scenario === 'empty' ? [] : mockState.items.filter(nft => nft.name.toLocaleLowerCase('pt-BR').includes(q)) })
  }),
  http.post('*/api/demo/scenario', async ({ request }) => {
    const body: unknown = await request.json()
    if (!body || typeof body !== 'object' || !('scenario' in body) || !scenarios.includes(body.scenario as Scenario)) {
      return HttpResponse.json({ code: 'INVALID_SCENARIO' }, { status: 400 })
    }
    const versions = new Map(mockState.items.map(nft => [nft.id, nft.version]))
    resetMocks(body.scenario as Scenario)
    // Keep versions monotonic while connected clients are still subscribed.
    for (const nft of mockState.items) nft.version = (versions.get(nft.id) ?? 0) + 1
    return HttpResponse.json({ scenario: mockState.scenario })
  }),
  http.post('*/api/demo/nfts/:id/update', ({ params }) => {
    const nft = mockState.items.find(item => item.id === params.id)
    if (!nft) return HttpResponse.json({ code: 'NOT_FOUND' }, { status: 404 })
    nft.priceEth = nft.priceEth === '1.19' ? '1.29' : '1.19'
    nft.version += 1
    const event = { eventId: `${nft.id}:${nft.version}`, nftId: nft.id, version: nft.version }
    listeners.forEach(emit => emit(event))
    return HttpResponse.json({ version: nft.version })
  }),
]
