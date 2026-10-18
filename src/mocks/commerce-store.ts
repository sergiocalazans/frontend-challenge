import type { CartInput, CheckoutAttempt, Order, Quote, StoredLine, Wallets } from '@/features/commerce/contracts'
export interface StoredCart { items: StoredLine[]; coupon: string | null; couponExpiresAt: number; revision: number; operations: string[] }
export interface StoredQuote { owner: string; fingerprint: string; quote: Quote }
export interface StoredOrder { order: Order; readyAt: number; outcome: 'confirmed' | 'declined'; request: CheckoutAttempt }
export interface CommerceStore { carts: Record<string, StoredCart>; wallets: Record<string, Wallets>; quotes: Record<string, StoredQuote>; orders: Record<string, StoredOrder>; keys: Record<string, string> }
let memory: CommerceStore = empty()
function empty(): CommerceStore { return { carts: {}, wallets: {}, quotes: {}, orders: {}, keys: {} } }
export function readCommerce(): CommerceStore { try { return JSON.parse(localStorage.getItem('kurio.mock-commerce.v1') ?? 'null') as CommerceStore ?? memory } catch { return memory } }
export function writeCommerce(value: CommerceStore) { memory = value; try { localStorage.setItem('kurio.mock-commerce.v1', JSON.stringify(value)) } catch { /* Node uses memory. */ } }
export function resetCommerceStore() { writeCommerce(empty()) }
export function storedCart(database: CommerceStore, owner: string): StoredCart { return database.carts[owner] ??= { items: [], coupon: null, couponExpiresAt: 0, revision: 1, operations: [] } }
export function validCartInput(input: CartInput) { return input && typeof input.nftId === 'string' && ['unique','ten','fifty','open'].includes(input.edition) && Number.isInteger(input.quantity) && input.quantity > 0 && input.quantity <= 10000 }
