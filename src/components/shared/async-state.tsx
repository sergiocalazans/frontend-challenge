import { SearchX, TriangleAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

export function LoadingCards({ className = 'grid-cols-2 gap-6 md:grid-cols-4', count = 4, catalog = false }: { className?: string; count?: number; catalog?: boolean }) {
  return <div role="status" aria-label="Carregando NFTs" className={`grid ${className}`}>
    <span className="sr-only">Carregando NFTs</span>
    {Array.from({ length: count }, (_, index) => <div key={index} aria-hidden="true" className="space-y-3"><Skeleton className={`shimmer aspect-square w-full rounded-xl ${catalog ? 'lg:aspect-auto lg:h-[300px]' : ''}`} /><Skeleton className="shimmer h-5 w-3/4" /><Skeleton className="shimmer h-5 w-1/2" />{catalog && <Skeleton className="shimmer h-8 w-1/2" />}</div>)}
  </div>
}

export function EmptyState({ title = 'Nenhum NFT encontrado', children }: { title?: string; children?: React.ReactNode }) {
  return <div role="status" className="rounded-lg border border-dashed px-6 py-16 text-center"><SearchX className="mx-auto mb-4 text-primary" aria-hidden="true" /><h2 className="section-title">{title}</h2><div className="mt-3 text-muted-foreground">{children ?? 'Tente buscar por outro nome.'}</div></div>
}

export function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return <div role="alert" className="rounded-lg border p-8 text-center"><TriangleAlert className="mx-auto mb-4 text-destructive" aria-hidden="true" /><h2 className="section-title">Algo deu errado</h2><p className="my-4 text-muted-foreground">{message}</p><Button variant="outline" onClick={onRetry}>Tentar novamente</Button></div>
}
