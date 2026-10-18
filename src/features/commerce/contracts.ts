import type { Nft } from '@/features/catalog/contracts'
export type Network = Nft['network']
export type EditionId = 'unique' | 'ten' | 'fifty' | 'open'
export interface CartInput { nftId: string; edition: EditionId; quantity: number }
export interface StoredLine extends CartInput { id: string }
export interface CartLine extends StoredLine { name: string; image: string; network: Network; editionLabel: string; unitPriceEth: string; totalEth: string; available: number; version: number }
export interface Totals { subtotalEth: string; discountEth: string; feeEth: string; totalEth: string }
export interface Cart { items: CartLine[]; coupon: string | null; revision: number; totals: Totals; purchasable: boolean }
export const networks: Network[] = ['Ethereum', 'Polygon', 'Solana']
export const providers = ['MetaMask', 'WalletConnect', 'Coinbase Wallet'] as const
export interface WalletInput { slot: 'primary' | 'secondary'; displayName: string; nickname: string; profileName: string; network: Network; address: string; provider: typeof providers[number]; email: string; referral: string; ens: string }
export interface Wallet extends WalletInput { id: string; version: number }
export interface Wallets { items: Wallet[]; connection: { walletId: string; network: Network } | null }
export interface Collector { displayName: string; username: string; profileName: string; email: string; referral: string; ens: string; notes: string }
export interface Quote { id: string; items: CartLine[]; totals: Totals; coupon: string | null; wallet: Wallet; network: Network; expiresAt: number }
export interface OrderInput { quoteId: string; collector: Collector }
export interface CheckoutAttempt { key: string; input: OrderInput }
export interface Order { id: string; userId: string; status: 'pending' | 'confirmed' | 'declined'; version: number; createdAt: number; transaction: string | null; reason: string | null; quote: Quote; collector: Collector }
