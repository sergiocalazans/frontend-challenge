import { Link } from '@tanstack/react-router'
import type { Nft } from '@/features/catalog/contracts'

export function NftCard({ nft }: { nft: Nft }) {
  return <article className="min-w-0" data-testid={`nft-${nft.id}`}>
    <Link to="/nfts/$nftId" params={{ nftId: nft.id }} className="group block rounded-xl" aria-label={`Ver ${nft.name}`}>
      <div className="overflow-hidden rounded-xl bg-card p-2"><img src={nft.image} alt={nft.imageAlt} width={640} height={640} loading="lazy" className="aspect-square w-full rounded-xl object-cover transition-transform group-hover:scale-[1.02]" /></div>
      <h3 className="mt-3 text-sm font-medium">{nft.name}</h3>
    </Link>
    <p className="font-semibold text-price" aria-label={`Preço: ${nft.priceEth} ETH`}>{nft.priceEth} ETH</p>
    <p className="mt-1 text-xs text-muted-foreground">{nft.network}</p>
  </article>
}
