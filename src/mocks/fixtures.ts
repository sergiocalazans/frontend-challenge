import type { Nft } from '@/features/catalog/contracts'

export const initialNfts: Nft[] = [
  { id: 'emerald-ape', name: 'Emerald Ape #042', image: '/images/emerald-ape.webp', imageAlt: 'Macaco com óculos redondos e jaqueta verde', priceEth: '1.19', network: 'Ethereum', available: 8, version: 1 },
  { id: 'sage-nomad', name: 'Sage Nomad #009', image: '/images/sage-nomad.webp', imageAlt: 'Macaco cinza com chapéu verde e moletom roxo', priceEth: '1.69', network: 'Polygon', available: 12, version: 1 },
  { id: 'neon-vessel', name: 'Neon Vessel #552', image: '/images/neon-vessel.webp', imageAlt: 'Macaco de pelo escuro com casaco claro', priceEth: '1.99', network: 'Ethereum', available: 5, version: 1 },
  { id: 'golden-beat', name: 'Golden Beat #207', image: '/images/golden-beat.webp', imageAlt: 'Macaco dourado com fones verdes', priceEth: '0.99', network: 'Solana', available: 20, version: 1 },
]
