import { categories, networks } from '@/features/catalog/search'
import type { Nft } from '@/features/catalog/contracts'

const featuredNfts: Nft[] = [
  { id: 'emerald-ape', name: 'Emerald Ape #042', image: '/images/emerald-ape.webp', imageAlt: 'Macaco com óculos redondos e jaqueta verde', priceEth: '1.19', network: 'Ethereum', available: 8, version: 1, category: 'art', listedAt: '2026-09-01T12:00:00Z' },
  { id: 'sage-nomad', name: 'Sage Nomad #009', image: '/images/sage-nomad.webp', imageAlt: 'Macaco cinza com chapéu verde e moletom roxo', priceEth: '1.69', network: 'Polygon', available: 12, version: 1, category: 'art', listedAt: '2026-09-01T12:00:00Z' },
  { id: 'neon-vessel', name: 'Neon Vessel #552', image: '/images/neon-vessel.webp', imageAlt: 'Macaco de pelo escuro com casaco claro', priceEth: '1.99', network: 'Ethereum', available: 5, version: 1, category: 'art', listedAt: '2026-09-01T12:00:00Z' },
  { id: 'golden-beat', name: 'Golden Beat #207', image: '/images/golden-beat.webp', imageAlt: 'Macaco dourado com fones verdes', priceEth: '0.99', network: 'Solana', available: 20, version: 1, category: 'art', listedAt: '2026-09-01T12:00:00Z' },
]

// Additional deterministic editions reuse the four exported artworks.
const names = ['Cosmic Bloom', 'Violet Nomad', 'Ivory Baron', 'Amber Signal', 'Jade Echo', 'Copper Wave', 'Moon Atlas', 'Pixel Grove', 'Velvet Dawn', 'Orbit Sage', 'Terra Pulse', 'Solar Drift', 'Crystal Loop', 'Indigo Quest', 'Coral Frame', 'Mint Studio', 'Silver Muse', 'Prism Field', 'Ruby Horizon', 'Azure Token']
export const initialNfts: Nft[] = [...featuredNfts, ...names.map((name, index): Nft => ({
  ...featuredNfts[index % featuredNfts.length]!,
  id: name.toLowerCase().replaceAll(' ', '-'),
  name: name + ' #' + String(100 + index),
  priceEth: ['1.29', '1.39', '1.79', '0.39', '0.02', '12.30', '2.10', '0.50', '3.00', '1.19'][index % 10]!,
  network: networks[index % networks.length]!,
  category: categories[index % categories.length]!.value,
  listedAt: '2026-09-' + String(index + 2).padStart(2, '0') + 'T12:00:00Z',
  available: index % 7 === 0 ? 0 : index + 1,
}))]
