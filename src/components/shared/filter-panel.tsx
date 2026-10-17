import { useId } from 'react'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

export function FilterPanel({ network, onChange }: { network: string; onChange: (network: string) => void }) {
  const id = useId()
  return <aside aria-label="Filtros de coleção" className="space-y-6 rounded-lg bg-card p-6">
    <h2 className="font-semibold">Coleções</h2>
    <p className="text-sm text-muted-foreground">Arte digital</p>
    <div className="field"><Label htmlFor={id}>Rede</Label><select id={id} className="native-select" value={network} onChange={event => onChange(event.target.value)}><option value="all">Todas as redes</option><option>Ethereum</option><option>Polygon</option><option>Solana</option></select></div>
    <Button variant="outline" onClick={() => onChange('all')}>Limpar filtros</Button>
  </aside>
}
