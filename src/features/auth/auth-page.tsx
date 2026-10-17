import { useState, useSyncExternalStore, type FormEvent } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate, useSearch } from '@tanstack/react-router'
import axios from 'axios'
import { Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FormField } from '@/components/shared/form-field'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { CatalogPage } from '@/features/catalog/catalog-page'
import { login, register, sessionKey } from './api'
import { safeReturnTo, validateCredentials, type ApiProblem, type Registration } from './contracts'
import { saveToken } from './token'

function AuthForm({ registration, returnTo }: { registration: boolean; returnTo: string }) {
  const client = useQueryClient()
  const navigate = useNavigate()
  const [visible, setVisible] = useState(false)
  const [fields, setFields] = useState<Record<string, string>>({})
  const [input, setInput] = useState<Registration>({ name: '', email: '', password: '', confirmPassword: '' })
  const mutation = useMutation({
    mutationFn: () => registration ? register(input) : login(input),
    onSuccess: async result => {
      // Stop private requests before changing identity. Their keys must start with 'private'.
      await client.cancelQueries({ predicate: query => query.queryKey[0] === 'private' })
      client.removeQueries({ predicate: query => query.queryKey[0] === 'private' })
      await client.cancelQueries({ queryKey: sessionKey })
      saveToken(result.token)
      client.setQueryData(sessionKey, { user: result.user })
      await navigate({ href: returnTo, replace: true })
    },
    onError: error => { if (axios.isAxiosError<ApiProblem>(error)) setFields(error.response?.data.fields ?? {}) },
  })
  function submit(event: FormEvent) {
    event.preventDefault()
    const errors = validateCredentials(input, registration ? input : undefined)
    setFields(errors)
    if (!Object.keys(errors).length && !mutation.isPending) mutation.mutate()
  }
  const problem = axios.isAxiosError<ApiProblem>(mutation.error) ? mutation.error.response?.data.message : undefined
  return <>
    <nav aria-label="Acesso à conta" className="mb-6 flex justify-center gap-5 text-base font-semibold">
      <Link to="/login" search={{ returnTo }} className={!registration ? 'text-primary' : ''}>Entrar</Link>
      <Link to="/register" search={{ returnTo }} className={registration ? 'text-primary' : ''}>Criar conta</Link>
    </nav>
    <form onSubmit={submit} noValidate className="space-y-5" aria-busy={mutation.isPending}>
      {registration && <FormField label="Nome de usuário" autoComplete="nickname" maxLength={80} value={input.name} onChange={event => setInput({ ...input, name: event.target.value })} error={fields.name} required />}
      <FormField label="E-mail" type="email" autoComplete="email" maxLength={254} value={input.email} onChange={event => setInput({ ...input, email: event.target.value.trim() })} error={fields.email} required />
      <div className="relative"><FormField label="Senha" type={visible ? 'text' : 'password'} autoComplete={registration ? 'new-password' : 'current-password'} maxLength={128} value={input.password} onChange={event => setInput({ ...input, password: event.target.value })} error={fields.password} className="pr-12" required /><Button type="button" variant="ghost" size="icon" className="absolute right-0 top-7" aria-label={visible ? 'Ocultar senha' : 'Mostrar senha'} aria-pressed={visible} onClick={() => setVisible(!visible)}>{visible ? <EyeOff aria-hidden /> : <Eye aria-hidden />}</Button></div>
      {registration && <FormField label="Confirmar senha" type={visible ? 'text' : 'password'} autoComplete="new-password" maxLength={128} value={input.confirmPassword} onChange={event => setInput({ ...input, confirmPassword: event.target.value })} error={fields.confirmPassword} required />}
      {mutation.isError && <p role="alert" className="text-sm text-destructive">{problem ?? 'Não foi possível conectar. Tente novamente.'}</p>}
      <Button className="h-12 w-full" type="submit" disabled={mutation.isPending}>{mutation.isPending ? 'Aguarde…' : registration ? 'Criar perfil' : 'Entrar'}</Button>
      <p role="status" className="text-xs text-muted-foreground">{mutation.isPending ? 'Enviando dados…' : 'Ambiente de demonstração. Use apenas dados fictícios.'}</p>
    </form>
    <p className="mt-6 text-center text-xs text-muted-foreground">Login social e recuperação de senha não estão disponíveis nesta demonstração.</p>
  </>
}

export function AuthPage({ registration = false }: { registration?: boolean }) {
  const desktop = useSyncExternalStore(subscribeViewport, desktopSnapshot)
  const search = useSearch({ strict: false }) as { returnTo?: string }
  const returnTo = safeReturnTo(search.returnTo)
  const navigate = useNavigate()
  const title = registration ? 'Criar perfil de colecionador' : 'Entre na sua conta'
  const form = <AuthForm key={registration ? 'register' : 'login'} registration={registration} returnTo={returnTo} />
  if (!desktop) return <div className="mx-auto max-w-sm pb-12 pt-20"><p className="mb-16 text-center text-3xl font-semibold tracking-widest">KURIO</p><h1 className="mb-8 text-center text-xl font-semibold">{title}</h1>{form}<Button variant="ghost" asChild className="mt-6 w-full"><Link to="/">Voltar à coleção</Link></Button></div>
  return <><div inert aria-hidden><CatalogPage /></div><DesktopAuth title={title} onClose={() => void navigate({ href: returnTo })}>{form}</DesktopAuth></>
}
function desktopSnapshot() { return window.matchMedia('(min-width: 768px)').matches }
function subscribeViewport(callback: () => void) { const media = window.matchMedia('(min-width: 768px)'); media.addEventListener('change', callback); return () => media.removeEventListener('change', callback) }
function DesktopAuth({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return <Dialog open onOpenChange={open => { if (!open) onClose() }}><DialogContent className="max-w-[500px] px-10 py-10"><DialogTitle className="text-center text-xl">{title}</DialogTitle><DialogDescription className="mb-3 text-center">Gerencie sua coleção e seu perfil de colecionador.</DialogDescription>{children}</DialogContent></Dialog>
}
