import { Skeleton } from '@/components/ui/skeleton'

export function DetailSkeleton() {
  return <div role="status" aria-label="Carregando detalhes do NFT" className="grid gap-6 md:grid-cols-2">
    <span className="sr-only">Carregando detalhes do NFT</span>
    <Skeleton aria-hidden="true" className="shimmer aspect-square w-full rounded-xl" />
    <div aria-hidden="true" className="space-y-5"><Skeleton className="shimmer h-8 w-3/4" /><Skeleton className="shimmer h-6 w-1/2" /><Skeleton className="shimmer h-24 w-full" /><Skeleton className="shimmer h-11 w-full" /><Skeleton className="shimmer h-11 w-1/2" /></div>
  </div>
}

export function SummarySkeleton() {
  return <div role="status" aria-label="Carregando resumo da compra" className="space-y-6 rounded-lg border bg-card p-6">
    <span className="sr-only">Carregando resumo da compra</span>
    <div aria-hidden="true" className="space-y-6"><Skeleton className="shimmer h-6 w-3/4" />{Array.from({ length: 3 }, (_, index) => <div key={index} className="flex justify-between gap-4"><Skeleton className="shimmer h-5 w-1/2" /><Skeleton className="shimmer h-5 w-1/4" /></div>)}<Skeleton className="shimmer h-11 w-full" /></div>
  </div>
}
