import { useId, type ComponentProps } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type FormFieldProps = ComponentProps<typeof Input> & {
  label: string
  hint?: string
  error?: string
}

export function FormField({ id, label, hint, error, required, 'aria-describedby': describedBy, ...props }: FormFieldProps) {
  const generatedId = useId()
  const fieldId = id ?? generatedId
  const hintId = `${fieldId}-hint`
  const errorId = `${fieldId}-error`
  const description = [describedBy, hint && hintId, error && errorId].filter(Boolean).join(' ') || undefined
  return <div className="field">
    <Label htmlFor={fieldId}>{label}{required && <span aria-hidden="true" className="text-destructive"> *</span>}</Label>
    <Input {...props} id={fieldId} required={required} aria-invalid={error ? true : props['aria-invalid']} aria-describedby={description} />
    {hint && <p id={hintId} className="text-sm text-muted-foreground">{hint}</p>}
    {error && <p id={errorId} role="alert" className="text-sm text-destructive">{error}</p>}
  </div>
}
