import { useEffect,useRef,useState,type FormEvent } from 'react'
import { useMutation,useQuery,useQueryClient } from '@tanstack/react-query'
import { Link,useNavigate } from '@tanstack/react-router'
import axios from 'axios'
import { Button } from '@/components/ui/button'
import { FormField } from '@/components/shared/form-field'
import { EmptyState,ErrorState } from '@/components/shared/async-state'
import { SummarySkeleton } from '@/components/shared/content-skeletons'
import { PurchaseLayout } from '@/components/layout/page-layouts'
import { readToken } from '@/features/auth/token'
import { cartOptions,connectWallet,createOrder,createQuote,walletsKey,walletsOptions,type CommerceIdentity } from './api'
import { readAttempt,saveAttempt,readCheckoutDraft,saveCheckoutDraft } from './checkout-storage'
import { useCartRealtime,useCommerceIdentity } from './use-commerce'
import { PurchaseSummary } from './summary'
import { purchaseError } from './errors'
import { validateCollector } from './validation'
import { networks,type Cart,type CheckoutAttempt,type Collector,type Network,type Wallets } from './contracts'
export function CheckoutPage() {
  const {context,ready} = useCommerceIdentity()
  const cart = useQuery({...cartOptions(context),enabled:ready && Boolean(context.userId)})
  const wallets = useQuery({...walletsOptions(context),enabled:ready && Boolean(context.userId)})
  const updated = useCartRealtime(context)
  if(cart.isPending || wallets.isPending) return <SummarySkeleton />
  if(!cart.data || !wallets.data) return <ErrorState message={purchaseError(cart.error ?? wallets.error)} onRetry={() => {void cart.refetch();void wallets.refetch()}} />
  return <><nav className="mb-6 text-xs text-muted-foreground"><Link to="/cart">← Voltar ao carrinho</Link></nav><h1 className="mb-8 text-center text-2xl font-semibold md:text-left">Pagamento</h1>{updated && <p role="status" className="mb-5 text-primary">Catálogo atualizado pela rede. Revise os valores antes de confirmar.</p>}{cart.isError || wallets.isError ? <ErrorState message="Não foi possível atualizar os dados. Recarregue antes de comprar." onRetry={() => {void cart.refetch();void wallets.refetch()}} /> : <CheckoutForm key={context.userId} context={context} cart={cart.data} wallets={wallets.data} />}</>
}
function CheckoutForm({context,cart,wallets}:{context:CommerceIdentity;cart:Cart;wallets:Wallets}) {
  const client = useQueryClient(),navigate = useNavigate(),initial = wallets.items.find(wallet => wallet.slot === 'primary') ?? wallets.items[0]
  const [draft] = useState(() => readCheckoutDraft(context.userId!))
  const [walletId,setWalletId] = useState(draft?.walletId ?? initial?.id ?? '')
  const [network,setNetwork] = useState<Network>(draft?.network ?? initial?.network ?? 'Ethereum')
  const [collector,setCollector] = useState<Collector>(draft?.collector ?? {displayName:initial?.displayName ?? '',username:initial?.nickname ?? '',profileName:initial?.profileName ?? '',email:initial?.email ?? '',referral:initial?.referral ?? '',ens:initial?.ens ?? '',notes:''})
  const [fields,setFields] = useState<Record<string,string>>({})
  const [attempt,setAttempt] = useState<CheckoutAttempt | null>(() => readAttempt(context.userId!))
  const chosen = wallets.items.find(wallet => wallet.id === walletId)
  const connected = wallets.connection?.walletId === walletId && wallets.connection.network === network
  const connection = useMutation({mutationFn:({context,id,action}:{context:CommerceIdentity;id:string;action:'connect'|'disconnect'}) => connectWallet(context,id,action),onMutate:async () => {await client.cancelQueries({queryKey:walletsKey(context.userId!)})},onSuccess:(data,variables) => {if(variables.context.token === readToken()) client.setQueryData(walletsKey(variables.context.userId!),data)}})
  const review = useMutation({mutationFn:async ({context,walletId,network,collector}:{context:CommerceIdentity;walletId:string;network:Network;collector:Collector}) => ({quote:await createQuote(context,walletId,network),collector:JSON.stringify(collector)})})
  const reviewRef = useRef<HTMLElement>(null)
  // Mutation callbacks may run before React commits the conditional review section.
  useEffect(() => { if(review.data) reviewRef.current?.focus() },[review.data])
  const quote = review.data?.quote
  const reviewed = Boolean(quote && quote.wallet.id === walletId && quote.wallet.version === chosen?.version && quote.network === network && connected && JSON.stringify(quote.items) === JSON.stringify(cart.items) && quote.coupon === cart.coupon && review.data?.collector === JSON.stringify(collector))
  const submission = useMutation({mutationFn:({context,attempt}:{context:CommerceIdentity;attempt:CheckoutAttempt}) => createOrder(context,attempt),onSuccess:async (order,variables) => {
    if(variables.context.token !== readToken()) return
    saveAttempt(variables.context.userId!,null);setAttempt(null)
    await client.invalidateQueries({queryKey:['private',variables.context.userId!,'cart']})
    await navigate({to:'/orders/$orderId',params:{orderId:order.id}})
  },onError:error => {
    if(axios.isAxiosError<{code?:string}>(error) && error.response && [400,404,409,410,422].includes(error.response.status)) {saveAttempt(context.userId!,null);setAttempt(null);review.reset();void client.invalidateQueries({queryKey:['private',context.userId!]})}
  }})
  function updateCollector(key:keyof Collector,value:string) {const next = {...collector,[key]:value};setCollector(next);saveCheckoutDraft(context.userId!,{collector:next,walletId,network})}
  function selectWallet(id:string,nextNetwork:Network) {setWalletId(id);setNetwork(nextNetwork);saveCheckoutDraft(context.userId!,{collector,walletId:id,network:nextNetwork})}
  function selectNetwork(next:Network) {setNetwork(next);saveCheckoutDraft(context.userId!,{collector,walletId,network:next})}
  function reviewPurchase(event:FormEvent) {event.preventDefault();const errors = validateCollector(collector);setFields(errors);if(!Object.keys(errors).length) review.mutate({context,walletId,network,collector})}
  function confirm() {
    if(!quote || !reviewed || attempt || submission.isPending) return
    const next = {key:crypto.randomUUID(),input:{quoteId:quote.id,collector:{...collector}}}
    saveAttempt(context.userId!,next);setAttempt(next);submission.mutate({context,attempt:next})
  }
  if(attempt) return <section className="mx-auto max-w-xl space-y-5 rounded-xl border bg-card p-6"><h2 className="text-xl font-semibold">Recuperar tentativa de compra</h2><p>Há uma tentativa registrada. Consulte o resultado com a mesma chave para evitar uma compra duplicada. Os dados enviados permanecem preservados após refresh ou login.</p>{submission.isError && <p role="alert" className="text-destructive">{purchaseError(submission.error)}</p>}<Button onClick={() => submission.mutate({context,attempt})} disabled={submission.isPending}>{submission.isPending ? 'Consultando pedido…' : 'Recuperar pedido'}</Button><p role="status">{submission.isPending ? 'Aguardando resposta da API…' : 'A confirmação só será exibida se a simulação confirmar o pedido.'}</p></section>
  if(!cart.items.length) return <EmptyState title="Seu carrinho está vazio"><Button asChild className="mt-4"><Link to="/">Explorar coleção</Link></Button></EmptyState>
  return <PurchaseLayout summaryFirstOnMobile summary={<PurchaseSummary totals={quote && reviewed ? quote.totals : cart.totals}>
    <h2 className="my-5 font-semibold">Seus NFTs</h2><ul className="space-y-3">{cart.items.map(line => <li key={line.id} className="flex items-center gap-3 text-xs"><img src={line.image} alt="" className="size-12 rounded object-cover" /><span className="min-w-0 flex-1">{line.name}<br />{line.editionLabel} × {line.quantity}</span><span>{line.totalEth} ETH</span></li>)}</ul>
    <h2 className="mb-3 mt-8 font-semibold">Carteira e rede</h2>
    {!wallets.items.length ? <div><p className="mb-3">Você ainda não cadastrou uma carteira.</p><Button asChild variant="outline"><Link to="/account/wallets">Cadastrar carteira</Link></Button></div> : <>
      <fieldset className="space-y-3"><legend className="sr-only">Carteiras cadastradas</legend>{wallets.items.map(wallet => <label key={wallet.id} className="flex cursor-pointer items-start gap-3 rounded-xl border bg-background p-4 has-checked:border-primary"><input type="radio" name="wallet" value={wallet.id} checked={walletId === wallet.id} disabled={submission.isPending} onChange={() => selectWallet(wallet.id,wallet.network)} /><span className="min-w-0"><strong className="block">{wallet.nickname}</strong><span className="block break-all text-xs text-muted-foreground">{wallet.address}</span><span className="text-xs">{wallet.provider} · {wallet.network}</span></span></label>)}</fieldset>
      <label className="field mt-5">Rede de pagamento<select className="native-select" value={network} onChange={event => selectNetwork(event.target.value as Network)}>{networks.map(network => <option key={network}>{network}</option>)}</select></label>
      <Button variant="outline" className="mt-4 w-full" disabled={connection.isPending || !chosen} onClick={() => connection.mutate({context,id:walletId,action:connected ? 'disconnect' : 'connect'})}>{connection.isPending ? 'Aguarde…' : connected ? 'Desconectar carteira' : 'Conectar carteira'}</Button>
      <p role="status" className="mt-3 text-xs">{connected ? 'Carteira conectada na simulação.' : 'Carteira desconectada ou rede diferente.'}</p>
      <Link to="/account/wallets" className="mt-3 block text-xs text-primary underline">Gerenciar carteiras</Link>
    </>}
    {connection.isError && <p role="alert" className="mt-4 text-destructive">{purchaseError(connection.error)}</p>}
    {review.isError && <p role="alert" className="mt-4 text-destructive">{purchaseError(review.error)}</p>}
    {submission.isError && <p role="alert" className="mt-4 text-destructive">{purchaseError(submission.error)}</p>}
    {quote && !reviewed && <p role="alert" className="mt-4 text-destructive">Os dados ou valores mudaram. Revise novamente antes de confirmar.</p>}
    {reviewed && <section ref={reviewRef} id="purchase-review" tabIndex={-1} aria-label="Revisão da compra" className="mt-5 border-t pt-5"><h3 className="font-semibold">Revise sua compra</h3><p className="my-3 text-sm">Colecionador: {collector.displayName} · {collector.email}</p><p className="mb-4 text-xs">Cotação válida por até 2 minutos. Estoque, preço, cupom e conexão serão revalidados na confirmação.</p><Button className="w-full" disabled={!reviewed || submission.isPending} onClick={confirm}>Confirmar compra</Button></section>}
  </PurchaseSummary>}>
    <form id="collector-form" noValidate onSubmit={reviewPurchase} className="space-y-6"><h2 className="text-lg font-semibold">Perfil do colecionador</h2><div className="grid gap-5 md:grid-cols-2">{([['displayName','Nome de exibição'],['username','Nome de usuário'],['profileName','Nome do perfil'],['email','E-mail'],['referral','Código de indicação'],['ens','Nome ENS (opcional)']] as const).map(([key,label]) => <FormField key={key} label={label} type={key === 'email' ? 'email' : 'text'} required={key !== 'ens'} maxLength={key === 'email' ? 254 : 80} value={collector[key]} onChange={event => updateCollector(key,event.target.value)} error={fields[key]} />)}</div>
      <label className="field">Observação do colecionador (opcional)<textarea className="min-h-32 rounded-md border bg-background p-3" maxLength={500} value={collector.notes} onChange={event => updateCollector('notes',event.target.value)} aria-invalid={Boolean(fields.notes)} />{fields.notes && <span role="alert">{fields.notes}</span>}</label>
      <p className="text-xs text-muted-foreground">O endereço, o provedor e a rede vêm da carteira cadastrada. Para usar outra carteira, cadastre ou edite em Carteiras.</p>
      <Button type="submit" disabled={review.isPending || !connected || !cart.purchasable || connection.isPending}>{review.isPending ? 'Revalidando…' : 'Revisar compra'}</Button>
      {!cart.purchasable && <p role="alert" className="text-destructive">Volte ao carrinho para revisar quantidades ou cupom.</p>}
    </form>
  </PurchaseLayout>
}
