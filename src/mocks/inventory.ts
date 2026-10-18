import type { Nft } from '@/features/catalog/contracts'
import type { EditionId, StoredLine } from '@/features/commerce/contracts'
import { listeners, mockState } from './state'
interface Inventory { counts: Record<EditionId, number>; priceEth: string; version: number }
let memory: Record<string, Inventory> = {}
function read() { try { return JSON.parse(localStorage.getItem('kurio.mock-inventory.v1') ?? 'null') as typeof memory ?? memory } catch { return memory } }
function write(value: typeof memory) { memory = value; try { localStorage.setItem('kurio.mock-inventory.v1', JSON.stringify(value)) } catch { /* Shared memory for Node. */ } }
function allocate(nft: Nft): Inventory {
  const unique = Math.min(nft.available, 1), ten = Math.min(Math.max(nft.available - unique, 0), 3)
  return { counts: { unique, ten, fifty: nft.available - unique - ten, open: 0 }, priceEth: nft.priceEth, version: nft.version }
}
export function hydrateInventory() {
  const records = read()
  for (const nft of mockState.items) {
    const record = records[nft.id]
    if (record) { nft.available = Object.values(record.counts).reduce((a,b) => a+b, 0); nft.priceEth = record.priceEth; nft.version = Math.max(nft.version,record.version) }
  }
}
export function editionStock(nft: Nft) { hydrateInventory(); return read()[nft.id]?.counts ?? allocate(nft).counts }
export function rememberInventory(nft: Nft, reset = false) { const records = read(); const previous = records[nft.id]; records[nft.id] = !reset && previous ? { ...previous, priceEth: nft.priceEth, version: nft.version } : allocate(nft); write(records) }
export function changeInventory(lines: StoredLine[], direction: -1 | 1) {
  hydrateInventory()
  const records = read()
  // Validate the whole reservation before applying any line.
  if (direction === -1 && lines.some(line => { const nft = mockState.items.find(item => item.id === line.nftId); return !nft || (records[nft.id] ?? allocate(nft)).counts[line.edition] < line.quantity })) return false
  for (const line of lines) {
    const nft = mockState.items.find(item => item.id === line.nftId)!
    const record = records[nft.id] ?? allocate(nft)
    record.counts[line.edition] += direction * line.quantity
    record.version = nft.version + 1
    record.priceEth = nft.priceEth
    records[nft.id] = record
    nft.available = Object.values(record.counts).reduce((a,b) => a+b, 0)
    nft.version = record.version
    listeners.forEach(emit => emit({ eventId: `${nft.id}:${nft.version}`, nftId: nft.id, version: nft.version }))
  }
  write(records)
  return true
}
export function resetInventory() { write({}) }
