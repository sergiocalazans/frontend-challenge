import { useEffect,useState } from 'react'
import { useQuery,useQueryClient } from '@tanstack/react-query'
import { Link,useParams } from '@tanstack/react-router'
import axios from 'axios'
import { CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog,DialogContent,DialogDescription,DialogTitle,DialogTrigger } from '@/components/ui/dialog'
import { EmptyState,ErrorState } from '@/components/shared/async-state'
import { SummarySkeleton } from '@/components/shared/content-skeletons'
import { saveCheckoutDraft } from './checkout-storage'
import { orderOptions } from './api'
import { useCommerceIdentity, useOrderRealtime } from './use-commerce'
import { PurchaseSummary } from './summary'
import { purchaseError } from './errors'
import type { Order } from './contracts'
export function OrderPage() {
  const {orderId} = useParams({from:'/orders/$orderId'}),{context,ready} = useCommerceIdentity()
  const query = useQuery({...orderOptions(context,orderId),enabled:ready && Boolean(context.userId)})
  const connected = useOrderRealtime(context,orderId,ready && Boolean(context.userId))
  const client = useQueryClient(),status = query.data?.status,userId = context.userId
  useEffect(() => {if(status && status !== 'pending' && userId) {if(status === 'confirmed') saveCheckoutDraft(userId,null);void client.invalidateQueries({queryKey:['private',userId,'cart'],exact:true})}},[client,status,userId])
  if(query.isPending) return <SummarySkeleton />
  if(axios.isAxiosError(query.error) && query.error.response?.status === 404) return <EmptyState title="Pedido não encontrado"><p>O pedido não existe ou não pertence à sua conta.</p><Button asChild className="mt-4"><Link to="/cart">Voltar ao carrinho</Link></Button></EmptyState>
  if(!query.data) return <ErrorState message={purchaseError(query.error)} onRetry={() => void query.refetch()} />
  const order = query.data
  return <><h1 className="mb-6 text-2xl font-semibold">Pedido</h1><p role="status" className="mb-5 text-xs text-muted-foreground">{connected ? 'Atualizações do pedido conectadas.' : 'Reconectando atualizações. O pedido continua sendo consultado com segurança.'}</p>{query.isError && <ErrorState message="Não foi possível atualizar o pedido." onRetry={() => void query.refetch()} />}
    {order.status === 'pending' ? <section className="mx-auto max-w-xl space-y-5 rounded-xl border bg-card p-6"><h2 className="text-xl font-semibold">Pedido em processamento</h2><p role="status">Aguardando resultado da simulação. Esta página consulta o pedido existente; recarregar não cria outra compra.</p><p className="break-all text-xs">ID: {order.id}</p><SummarySkeleton /></section> : order.status === 'declined' ? <section className="mx-auto max-w-xl space-y-5 rounded-xl border p-6"><h2 className="text-xl font-semibold">Pagamento recusado</h2><p role="alert">{order.reason}</p><Button asChild><Link to="/cart">Revisar carrinho</Link></Button></section> : <Receipt key={order.id} order={order} />}
  </>
}
function Receipt({order}:{order:Order}) {
  const [open,setOpen] = useState(true)
  return <><p role="status" className="mb-5">Pedido confirmado pela API de demonstração.</p><Dialog open={open} onOpenChange={setOpen}><DialogTrigger asChild><Button>Ver recibo</Button></DialogTrigger><DialogContent aria-labelledby="receipt-title" onOpenAutoFocus={event => {event.preventDefault();document.getElementById('receipt-title')?.focus()}} className="max-h-[85dvh] overflow-y-auto rounded-none border-b-8 border-b-primary bg-card sm:max-w-[640px]">
    <CheckCircle2 aria-hidden className="mx-auto mb-4 size-12 text-primary" /><DialogTitle id="receipt-title" tabIndex={-1} className="text-center text-xl">Compra confirmada na simulação</DialogTitle><DialogDescription className="text-center">Seus NFTs constam no recibo abaixo. Não houve transferência blockchain real.</DialogDescription>
    <dl className="my-5 grid gap-3 border-y py-4 text-xs sm:grid-cols-2"><div><dt>ID da transação simulada</dt><dd className="break-all text-primary">{order.transaction}</dd></div><div><dt>Data</dt><dd>{new Date(order.createdAt).toLocaleString('pt-BR')}</dd></div><div><dt>Carteira</dt><dd className="break-all">{order.quote.wallet.nickname} · {order.quote.wallet.provider}</dd></div><div><dt>Rede</dt><dd>{order.quote.network}</dd></div></dl>
    <h2 className="font-semibold">Detalhes da transação</h2><ul className="my-4 space-y-4">{order.quote.items.map(line => <li key={line.id} className="flex items-center gap-3"><img src={line.image} alt="" className="size-14 rounded object-cover" /><span className="min-w-0 flex-1 text-sm">{line.name}<span className="block text-xs text-muted-foreground">Edição {line.editionLabel} × {line.quantity}</span></span><span className="text-primary">{line.totalEth} ETH</span></li>)}</ul>
    <PurchaseSummary totals={order.quote.totals} title="Total do pedido" /><p className="mt-4 text-xs text-muted-foreground">Este recibo preserva o snapshot confirmado. O identificador acima é simulado e não possui link para explorador real.</p>
    <Button asChild className="mt-5 w-full"><Link to="/">Continuar explorando</Link></Button>
  </DialogContent></Dialog></>
}
