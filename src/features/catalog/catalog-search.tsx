import { useId } from 'react'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export function CatalogSearchForm({ q, onSubmit }: { q?: string; onSubmit: (q: string) => void }) {
  const id = useId()
  return <form role="search" className="flex min-w-0 flex-1 gap-2" onSubmit={event => {
    event.preventDefault()
    onSubmit(String(new FormData(event.currentTarget).get('q') ?? '').trim())
  }}>
    <label htmlFor={id} className="sr-only">Buscar NFTs</label>
    <Input key={q ?? ''} id={id} name="q" maxLength={120} defaultValue={q} placeholder="Explorar coleções" />
    <Button type="submit" size="icon" aria-label="Buscar"><Search aria-hidden="true" /></Button>
  </form>
}
