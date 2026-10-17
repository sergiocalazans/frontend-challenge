import type { Nft } from '@/features/catalog/contracts'
export interface Edition { id: string; label: string; available: number }
export interface NftDetail extends Nft { description: string; collection: string; attributes: string[]; editions: Edition[]; related: Nft[] }
export interface SessionIdentity { id: string; name: string; email: string }
export interface DetailSession { user: SessionIdentity | null }
export interface Favorites { ids: string[] }
export interface DetailSearch { edition?: string; quantity?: number }
export function validateDetailSearch(raw: Record<string, unknown>): DetailSearch {
  const quantity = Number(raw.quantity)
  return { edition: typeof raw.edition === 'string' && ['unique', 'ten', 'fifty', 'open'].includes(raw.edition) ? raw.edition : undefined, quantity: Number.isSafeInteger(quantity) && quantity > 0 && quantity <= 10000 ? quantity : undefined }
}
