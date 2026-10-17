import { Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import type { CatalogSearch } from './search'

export function CatalogPagination({ page, totalPages, search }: { page: number; totalPages: number; search: CatalogSearch }) {
  if (totalPages < 2) return null
  const pages = [...new Set([1, page - 1, page, page + 1, totalPages])].filter(value => value >= 1 && value <= totalPages).sort((a, b) => a - b)
  return <nav aria-label="Paginação do catálogo" className="mt-8 flex flex-wrap items-center justify-end gap-2">
    {page > 1 ? <Button asChild variant="outline"><Link to="/" activeOptions={{ exact: true, explicitUndefined: true }} search={{ ...search, page: page === 2 ? undefined : page - 1 }} hash="catalogo">Anterior</Link></Button> : <Button variant="outline" disabled>Anterior</Button>}
    {pages.map((value, index) => <span key={value} className="flex items-center gap-2">
      {index > 0 && value - (pages[index - 1] ?? value) > 1 && <span aria-hidden="true">…</span>}
      <Button asChild size="icon" variant={page === value ? 'default' : 'outline'}><Link to="/" activeOptions={{ exact: true, explicitUndefined: true }} search={{ ...search, page: value === 1 ? undefined : value }} hash="catalogo" aria-label={`Página ${value}`} aria-current={page === value ? 'page' : undefined}>{value}</Link></Button>
    </span>)}
    {page < totalPages ? <Button asChild variant="outline"><Link to="/" activeOptions={{ exact: true, explicitUndefined: true }} search={{ ...search, page: page + 1 }} hash="catalogo">Próxima</Link></Button> : <Button variant="outline" disabled>Próxima</Button>}
  </nav>
}
