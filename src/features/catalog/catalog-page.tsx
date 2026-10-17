import { useQuery } from '@tanstack/react-query'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { SlidersHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { FilterDrawer } from '@/components/shared/filter-drawer'
import { NftCard } from '@/components/shared/nft-card'
import { EmptyState, ErrorState, LoadingCards } from '@/components/shared/async-state'
import { errorMessage } from '@/lib/http'
import { catalogOptions } from './api'
import { useCatalogRealtime } from './use-catalog-realtime'
import { CatalogFilters } from './catalog-filters'
import { CatalogPagination } from './catalog-pagination'
import { CatalogSearchForm } from './catalog-search'
import { sorts, type CatalogSearch, type CatalogSort } from './search'

const gridClass = 'grid-cols-2 gap-x-5 gap-y-8 md:grid-cols-3 lg:gap-x-[34px]'

export function CatalogPage() {
  const search = useSearch({ from: '/' })
  const navigate = useNavigate()
  const query = useQuery(catalogOptions(search))
  useCatalogRealtime()
  function changeSearch(patch: Partial<CatalogSearch>) {
    void navigate({ to: '/', search: previous => ({ ...previous, ...patch, page: undefined }), resetScroll: false })
  }
  const filterKey = JSON.stringify([search.category, search.network, search.minPrice, search.maxPrice])
  const activeCount = [search.q, search.network, search.category, search.minPrice || search.maxPrice].filter(Boolean).length
  const data = query.data
  const outOfRange = data && data.total > 0 && data.page > data.totalPages
  const clear = () => void navigate({ to: '/', search: {}, resetScroll: false })
  const drawer = <FilterDrawer title="Filtros do catálogo" description="Combine categoria, faixa de preço e rede. Os filtros são aplicados ao catálogo e salvos na URL." trigger={<Button variant="outline" size="icon" aria-label="Abrir filtros do catálogo"><SlidersHorizontal aria-hidden="true" /></Button>}>
    <CatalogFilters key={filterKey} search={search} onChange={changeSearch} />
  </FilterDrawer>
  return <>
    <div className="mb-4 flex gap-3 lg:hidden"><CatalogSearchForm q={search.q} onSubmit={q => changeSearch({ q: q || undefined })} />{drawer}</div>
    <section aria-labelledby="hero-title" className="catalog-hero mb-10 grid grid-cols-[1.15fr_1fr] items-center gap-3 overflow-hidden rounded-[30px] bg-card p-4 lg:mb-20 lg:grid-cols-2 lg:gap-12 lg:rounded-none lg:bg-background lg:p-10">
      <div><p className="mb-2 text-xs text-muted-foreground lg:mb-4">Bem-vindo à Kurio</p><h1 id="hero-title" className="text-base font-semibold leading-snug md:text-2xl lg:text-4xl">SEJA DONO DO FUTURO DA ARTE DIGITAL</h1><p className="my-3 text-xs text-muted-foreground lg:my-6 lg:text-sm">Descubra NFTs selecionados de criadores emergentes e consagrados.</p><Button asChild className="px-2 text-xs lg:px-4"><a href="#catalogo">Explorar coleções</a></Button></div>
      <img src="/images/emerald-ape.webp" alt="Macaco com óculos e jaqueta verde, destaque da coleção Kurio" width={640} height={640} fetchPriority="high" className="mx-auto aspect-square w-full max-w-[450px] rounded-xl object-cover" />
    </section>
    <section id="catalogo" aria-labelledby="catalog-title" className="scroll-mt-6">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-5"><div><p className="mb-2 text-xs uppercase tracking-widest text-primary">Arte para colecionar</p><h2 id="catalog-title" className="section-title">Todos os NFTs</h2></div>
        <div className="hidden w-full max-w-sm lg:flex"><CatalogSearchForm q={search.q} onSubmit={q => changeSearch({ q: q || undefined })} /></div>
      </div>
      <div className="grid items-start gap-8 lg:grid-cols-[310px_minmax(0,1fr)] lg:gap-12">
        <div className="hidden lg:block"><CatalogFilters key={filterKey} search={search} onChange={changeSearch} /></div>
        <div className="min-w-0">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <p role="status" className="text-sm text-muted-foreground">{query.isPending ? 'Consultando coleção…' : data ? `${data.total} NFTs encontrados` : 'Consulta indisponível'}</p>
            <div className="flex min-w-0 items-center gap-2"><Label htmlFor="catalog-sort">Ordenar por</Label><select id="catalog-sort" className="native-select max-w-48" value={search.sort ?? 'featured'} onChange={event => changeSearch({ sort: event.target.value === 'featured' ? undefined : event.target.value as CatalogSort })}>{sorts.map(sort => <option key={sort.value} value={sort.value}>{sort.label}</option>)}</select></div>
          </div>
          {activeCount > 0 && <div className="mb-5 flex flex-wrap items-center gap-3 text-sm"><span className="min-w-0 break-all">{activeCount} filtros ativos{search.q ? ` · “${search.q}”` : ''}</span><Button variant="outline" onClick={clear}>Limpar busca e filtros</Button></div>}
          <p role="status" className="mb-3 min-h-6 text-xs text-muted-foreground">{query.isFetching && !query.isPending ? 'Atualizando coleção…' : ''}</p>
          {query.isError && <ErrorState message={errorMessage(query.error)} onRetry={() => void query.refetch()} />}
          {query.isPending ? <LoadingCards count={9} catalog className={gridClass} /> : data && (
            outOfRange ? <EmptyState title="Página fora do intervalo"><p>Esta coleção possui {data.totalPages} páginas.</p><Button className="mt-4" onClick={() => changeSearch({})}>Voltar à primeira página</Button></EmptyState> : data.total === 0 ? <EmptyState><p>Nenhum item corresponde à combinação atual.</p><Button variant="outline" className="mt-4" onClick={clear}>Limpar busca e filtros</Button></EmptyState> : <>
              <div data-testid="catalog-results" className={`grid ${gridClass}`}>{data.items.map(nft => <NftCard key={nft.id} nft={nft} catalog />)}</div>
              <p className="mt-6 text-sm text-muted-foreground">Página {data.page} de {data.totalPages}</p>
              <CatalogPagination page={data.page} totalPages={data.totalPages} search={search} />
            </>
          )}
        </div>
      </div>
    </section>
  </>
}
