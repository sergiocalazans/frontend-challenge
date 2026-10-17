import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { SlidersHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { EmptyState, ErrorState, LoadingCards } from '@/components/shared/async-state'
import { QuantityInput } from '@/components/shared/quantity-input'
import { NftCard } from '@/components/shared/nft-card'
import { FilterPanel } from '@/components/shared/filter-panel'
import { AccountSidebar } from '@/components/shared/account-sidebar'
import { catalogKeys, catalogOptions } from '@/features/catalog/api'
import { useCatalogRealtime } from '@/features/catalog/use-catalog-realtime'
import { env } from '@/lib/env'
import { errorMessage } from '@/lib/http'
import { selectScenario, updateDemoNft, type DemoScenario } from './demo-api'

export function DesignSystemPage() {
  const [quantity, setQuantity] = useState(1)
  const [network, setNetwork] = useState('all')
  const [scenario, setScenario] = useState<DemoScenario>('default')
  const [feedback, setFeedback] = useState('')
  const [busy, setBusy] = useState(false)
  const [emailError, setEmailError] = useState('')
  const queryClient = useQueryClient()
  const query = useQuery(catalogOptions())
  useCatalogRealtime()
  async function changeScenario(next: DemoScenario) {
    setBusy(true)
    try {
      await selectScenario(next)
      setScenario(next)
      await queryClient.resetQueries({ queryKey: catalogKeys.all })
      setFeedback('Cenário alterado. Os dados de demonstração foram reiniciados.')
    } catch (error) { setFeedback(errorMessage(error)) } finally { setBusy(false) }
  }
  async function changePrice() {
    setBusy(true)
    try { await updateDemoNft(); setFeedback('Evento enviado pela simulação. O cliente Socket.IO atualizará a coleção.') }
    catch (error) { setFeedback(errorMessage(error)) } finally { setBusy(false) }
  }
  return <div className="space-y-12">
    <header><Badge variant="outline">Biblioteca de componentes</Badge><h1 className="my-4 text-3xl font-semibold">Design system Kurio</h1><p className="max-w-2xl text-muted-foreground">Referência interativa da base visual. Os exemplos abaixo demonstram componentes e estados; não realizam compras ou alterações de conta.</p></header>
    <section aria-labelledby="palette-title"><h2 id="palette-title" className="section-title mb-5">Cores da identidade</h2><div className="grid grid-cols-2 gap-4 md:grid-cols-4">{[
      ['Fundo', '#140D0A'], ['Superfície', '#241612'], ['Primária', '#D28A4C'], ['Texto', '#F5F1EB'],
    ].map(([name, color]) => <div key={name} className="overflow-hidden rounded-lg border"><div className="h-20" style={{ backgroundColor: color }} /><p className="p-3 text-xs">{name} <span className="text-muted-foreground">{color}</span></p></div>)}</div></section>
    <section aria-labelledby="controls-title"><h2 id="controls-title" className="section-title mb-5">Botões e controles</h2><div className="flex flex-wrap items-center gap-4"><Button onClick={() => setFeedback('Botão primário acionado na demonstração.')}>Primário</Button><Button variant="outline" onClick={() => setFeedback('Botão secundário acionado na demonstração.')}>Secundário</Button><Button disabled>Indisponível</Button><QuantityInput value={quantity} max={5} onChange={setQuantity} /><Badge>Raro</Badge></div></section>
    <div className="grid gap-8 md:grid-cols-2">
      <Card><CardHeader><CardTitle>Campo com validação</CardTitle></CardHeader><CardContent><form noValidate className="space-y-4" onSubmit={event => { event.preventDefault(); const email = String(new FormData(event.currentTarget).get('email') ?? ''); setEmailError(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? '' : 'Informe um e-mail válido.'); if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) setFeedback('Formato válido. Nenhum dado foi enviado ou salvo.') }}><div className="field"><Label htmlFor="example-email">E-mail <span aria-hidden="true" className="text-destructive">*</span></Label><Input id="example-email" name="email" type="email" required autoComplete="email" placeholder="voce@exemplo.com" aria-invalid={Boolean(emailError)} aria-describedby="example-email-help" /><p id="example-email-help" className={emailError ? 'text-sm text-destructive' : 'text-sm text-muted-foreground'}>{emailError || 'Exemplo local, sem cadastro.'}</p></div><Button type="submit">Validar campo</Button></form></CardContent></Card>
      <Card><CardHeader><CardTitle>Modal e painel lateral</CardTitle></CardHeader><CardContent className="flex flex-wrap gap-4">
        <Dialog><DialogTrigger asChild><Button variant="outline">Abrir modal</Button></DialogTrigger><DialogContent><DialogHeader><DialogTitle>Detalhes da demonstração</DialogTitle><DialogDescription>O foco permanece dentro do modal e retorna ao botão ao fechar. Use Escape para sair.</DialogDescription></DialogHeader><div className="field"><Label htmlFor="dialog-name">Nome de exibição</Label><Input id="dialog-name" placeholder="Seu nome" /></div><DialogFooter><DialogClose asChild><Button>Fechar demonstração</Button></DialogClose></DialogFooter></DialogContent></Dialog>
        <Dialog><DialogTrigger asChild><Button variant="outline"><SlidersHorizontal aria-hidden="true" />Abrir filtros</Button></DialogTrigger><DialogContent className="inset-y-0 right-0 left-auto h-dvh w-[min(100%,390px)] max-w-none translate-x-0 translate-y-0 rounded-none"><DialogHeader><DialogTitle>Filtros da demonstração</DialogTitle><DialogDescription>Selecione a rede para filtrar os cards desta página.</DialogDescription></DialogHeader><FilterPanel network={network} onChange={setNetwork} /></DialogContent></Dialog>
      </CardContent></Card>
    </div>
    <Separator />
    <section aria-labelledby="layout-title"><h2 id="layout-title" className="section-title mb-5">Navegação e estados</h2><div className="grid gap-8 lg:grid-cols-[310px_1fr]"><AccountSidebar /><Tabs defaultValue="empty"><TabsList><TabsTrigger value="empty">Vazio</TabsTrigger><TabsTrigger value="loading">Carregando</TabsTrigger><TabsTrigger value="error">Erro</TabsTrigger></TabsList><TabsContent value="empty"><EmptyState title="Sua coleção começa aqui">Exemplo de estado vazio.</EmptyState></TabsContent><TabsContent value="loading"><LoadingCards /></TabsContent><TabsContent value="error"><ErrorState message="Exemplo de falha recuperável." onRetry={() => setFeedback('Nova tentativa solicitada no exemplo de estado.')} /></TabsContent></Tabs></div></section>
    <section aria-labelledby="integration-title" className="space-y-6"><h2 id="integration-title" className="section-title">Cards e integração de demonstração</h2>
      {env.mocks && <div className="flex flex-wrap items-end gap-4 rounded-lg border p-5"><div className="field"><Label htmlFor="scenario">Cenário MSW</Label><select id="scenario" value={scenario} disabled={busy} className="native-select" onChange={event => void changeScenario(event.target.value as DemoScenario)}><option value="default">Sucesso</option><option value="empty">Vazio</option><option value="error">Falha HTTP 503</option><option value="slow">Rede lenta</option></select></div><Button variant="outline" disabled={busy || scenario !== 'default'} onClick={() => void changePrice()}>Simular alteração de preço</Button></div>}
      {query.isPending ? <LoadingCards /> : query.isError ? <ErrorState message={errorMessage(query.error)} onRetry={() => void query.refetch()} /> : query.data.items.length === 0 ? <EmptyState /> : <div className="grid grid-cols-2 gap-6 md:grid-cols-4">{query.data.items.filter(nft => network === 'all' || nft.network === network).map(nft => <NftCard key={nft.id} nft={nft} />)}</div>}
    </section>
    <p role="status" aria-live="polite" className="min-h-8 rounded-lg bg-secondary p-4 text-sm text-muted-foreground">{feedback || 'Pronto para explorar os componentes.'}</p>
  </div>
}
