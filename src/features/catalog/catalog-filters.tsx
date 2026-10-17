import { useId, useState, type FormEvent } from 'react'
import { FilterPanel } from '@/components/shared/filter-panel'
import { FormField } from '@/components/shared/form-field'
import { Button } from '@/components/ui/button'
import { ethToWei, isEthDecimal } from '@/lib/eth'
import { categories, type CatalogSearch, type Network } from './search'

export function CatalogFilters({ search, onChange }: { search: CatalogSearch; onChange: (patch: Partial<CatalogSearch>) => void }) {
  const id = useId()
  const [error, setError] = useState('')
  function applyPrice(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const minPrice = String(data.get('minPrice') ?? '').trim().replace(',', '.')
    const maxPrice = String(data.get('maxPrice') ?? '').trim().replace(',', '.')
    if ((minPrice && !isEthDecimal(minPrice)) || (maxPrice && !isEthDecimal(maxPrice))) {
      setError('Use valores não negativos em ETH, com até 18 casas decimais.')
      return
    }
    if (minPrice && maxPrice && ethToWei(minPrice) > ethToWei(maxPrice)) {
      setError('O preço máximo deve ser maior ou igual ao mínimo.')
      return
    }
    setError('')
    onChange({ minPrice: minPrice || undefined, maxPrice: maxPrice || undefined })
  }
  return <FilterPanel network={search.network ?? 'all'} onChange={network => onChange({ network: network === 'all' ? undefined : network as Network })} onReset={() => onChange({ network: undefined, category: undefined, minPrice: undefined, maxPrice: undefined })}>
    <fieldset className="space-y-1"><legend className="sr-only">Categoria</legend>
      {[{ value: '', label: 'Todas as coleções' } as const, ...categories].map(category => <label key={category.value} className="flex min-h-10 cursor-pointer items-center gap-3 text-sm text-muted-foreground">
        <input className="size-4 shrink-0 accent-primary" type="radio" name={`${id}-category`} value={category.value} checked={(search.category ?? '') === category.value} onChange={() => onChange({ category: category.value || undefined })} />{category.label}
      </label>)}
    </fieldset>
    <form onSubmit={applyPrice} noValidate className="space-y-3">
      <h3 className="font-semibold">Faixa de preço</h3>
      <FormField name="minPrice" label="Preço mínimo (ETH)" inputMode="decimal" defaultValue={search.minPrice} placeholder="0,00" aria-describedby={error ? `${id}-price-error` : undefined} aria-invalid={Boolean(error)} />
      <FormField name="maxPrice" label="Preço máximo (ETH)" inputMode="decimal" defaultValue={search.maxPrice} placeholder="Sem limite" aria-describedby={error ? `${id}-price-error` : undefined} aria-invalid={Boolean(error)} />
      {error && <p id={`${id}-price-error`} role="alert" className="text-sm text-destructive">{error}</p>}
      <Button type="submit">Aplicar preço</Button>
    </form>
  </FilterPanel>
}
