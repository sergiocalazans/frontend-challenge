/** ETH travels as decimal text. Never use floating-point arithmetic for totals. */
export interface Nft {
  id: string
  name: string
  image: string
  imageAlt: string
  priceEth: string
  network: 'Ethereum' | 'Polygon' | 'Solana'
  available: number
  version: number
}
export interface NftList { items: Nft[] }
export interface NftUpdated { eventId: string; nftId: string; version: number }
export interface OrderUpdated { eventId: string; orderId: string; userId: string; version: number; status: 'pending' | 'confirmed' | 'declined' }
