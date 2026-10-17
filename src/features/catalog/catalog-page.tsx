import { useQuery } from '@tanstack/react-query'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { NftCard } from '@/components/shared/nft-card'
import { EmptyState, ErrorState, LoadingCards } from '@/components/shared/async-state'
import { errorMessage } from '@/lib/http'
import { catalogOptions } from './api'
import { useCatalogRealtime } from './use-catalog-realtime'

export function CatalogPage() {
  const { q } = useSearch({ from: '/' })
  const navigate = useNavigate()
  const query = useQuery(catalogOptions(q))
  useCatalogRealtime()
  return <>
    <section aria-labelledby="hero-title" className="mb-14 grid items-center gap-8 rounded-xl bg-card p-6 md:grid-cols-2 md:gap-12 md:p-10">
      <div><p className="mb-4 text-xs text-muted-foreground">Bem-vindo à Kurio</p><h1 id="hero-title" className="text-3xl font-semibold leading-tight md:text-4xl">SEJA DONO DO FUTURO<br />DA ARTE DIGITAL</h1><p className="my-6 max-w-md text-muted-foreground">Descubra NFTs selecionados de criadores emergentes e consagrados. Colecione arte digital, rara e autêntica.</p><Button asChild><a href="#catalogo">Explorar coleções</a></Button></div>
      <img src="/images/emerald-ape.webp" alt="Macaco com óculos e jaqueta verde, destaque da coleção Kurio" width={640} height={640} fetchPriority="high" className="mx-auto aspect-square w-full max-w-[420px] rounded-xl object-cover" />
    </section>
    <section id="catalogo" aria-labelledby="catalog-title">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-6"><div><p className="mb-2 text-xs uppercase tracking-widest text-primary">Arte para colecionar</p><h2 id="catalog-title" className="section-title">Explore a coleção</h2></div>
        <form role="search" className="flex w-full gap-2 sm:w-auto" onSubmit={event => { event.preventDefault(); const value = new FormData(event.currentTarget).get('q'); void navigate({ to: '/', search: { q: typeof value === 'string' ? value.trim() : '' } }) }}>
          <label htmlFor="catalog-search" className="sr-only">Buscar NFTs</label><Input key={q} id="catalog-search" name="q" defaultValue={q} placeholder="Buscar por nome" className="min-w-0" /><Button type="submit" size="icon" aria-label="Buscar"><Search aria-hidden="true" /></Button>
        </form>
      </div>
      {query.isPending ? <LoadingCards className="grid-cols-2 gap-x-5 gap-y-8 md:grid-cols-4 md:gap-8" /> : query.isError ? <ErrorState message={errorMessage(query.error)} onRetry={() => void query.refetch()} /> : query.data.items.length === 0 ? <EmptyState /> : <div className="grid grid-cols-2 gap-x-5 gap-y-8 md:grid-cols-4 md:gap-8">{query.data.items.map(nft => <NftCard key={nft.id} nft={nft} />)}</div>}
      <p role="status" className="mt-5 min-h-6 text-xs text-muted-foreground">{query.isFetching && !query.isPending ? 'Atualizando coleção…' : ''}</p>
    </section>
  </>
}
