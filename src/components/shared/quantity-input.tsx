import { Minus, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function QuantityInput({ value, max, onChange, disabled = false }: { value: number; max: number; disabled?: boolean; onChange: (value: number) => void }) {
  return <div role="group" aria-label="Quantidade" className="inline-flex items-center gap-3">
    <Button variant="outline" size="icon" className="rounded-full" aria-label="Diminuir quantidade" disabled={disabled || value <= 1} onClick={() => onChange(Math.max(1, value - 1))}><Minus aria-hidden="true" /></Button>
    <output className="min-w-6 text-center" aria-live="polite">{value}</output>
    <Button variant="outline" size="icon" className="rounded-full" aria-label="Aumentar quantidade" disabled={disabled || value >= max} onClick={() => onChange(Math.min(max, value + 1))}><Plus aria-hidden="true" /></Button>
  </div>
}
