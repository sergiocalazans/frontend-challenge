import { useState } from 'react'
import { useMutation,useQuery,useQueryClient } from '@tanstack/react-query'
import { Link,useSearch } from '@tanstack/react-router'
import { Trash2 } from 'lucide-react'
import { PurchaseLayout } from '@/components/layout/page-layouts'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { EmptyState,ErrorState } from '@/components/shared/async-state'
import { SummarySkeleton } from '@/components/shared/content-skeletons'
import { QuantityInput } from '@/components/shared/quantity-input'
import { NftCard } from '@/components/shared/nft-card'
import { catalogOptions } from '@/features/catalog/api'
import { readToken } from '@/features/auth/token'
import { validateDetailSearch } from '@/features/nft-details/contracts'
import { applyCoupon,cartKey,cartOptions,changeCartItem,removeCartItem,removeCoupon,type CommerceIdentity } from './api'
import { useCartRealtime,useCommerceIdentity } from './use-commerce'
import { PurchaseSummary } from './summary'
import { AddToCartButton } from './add-to-cart-button'
import { purchaseError } from './errors'
import type { Cart,EditionId } from './contracts'
type CartAction = {context:CommerceIdentity;run:()=>Promise<Cart>}
export function CartPage() {
  const {session,context,ready} = useCommerceIdentity(),client = useQueryClient()
  const query = useQuery({...cartOptions(context),enabled:ready})
  const updated = useCartRealtime(context)
  const recommendations = useQuery(catalogOptions({},4))
  const [coupon,setCoupon] = useState('')
  const mutation = useMutation({onError:(_error,variables:CartAction) => {if(variables.context.token === readToken()) void client.invalidateQueries({queryKey:cartKey(variables.context),exact:true})},onMutate:async ({context}:CartAction) => {await client.cancelQueries({queryKey:cartKey(context),exact:true})},mutationFn:async ({context,run}:CartAction) => ({cart:await run(),context}),onSuccess:({cart,context}) => { if(context.token === readToken()) client.setQueryData(cartKey(context),cart) }})
  const search = useSearch({from:'/cart'}),selection = validateDetailSearch(search)
  const intent = search.nftId && selection.edition && selection.quantity ? {nftId:search.nftId,edition:selection.edition as EditionId,quantity:selection.quantity} : null
  const act = (run:()=>Promise<Cart>) => mutation.mutate({context,run})
  if(session.isError) return <ErrorState message="Não foi possível verificar a sessão." onRetry={() => void session.refetch()} />
  if(query.isPending) return <SummarySkeleton />
  if(!query.data) return <ErrorState message={purchaseError(query.error)} onRetry={() => void query.refetch()} />
  const cart = query.data
  return <><nav className="mb-6 text-xs text-muted-foreground" aria-label="Caminho da página"><Link to="/">← Continuar explorando</Link> / Carrinho</nav><h1 className="mb-8 text-center text-2xl font-semibold md:text-left">Carrinho de NFTs</h1>
    {updated && <p role="status" className="mb-5 text-primary">Catálogo atualizado pela rede. Confira preço e disponibilidade antes de continuar.</p>}
    {intent && <section className="mb-6 rounded-lg border p-4"><p className="mb-3">Seleção recebida: {intent.nftId}, edição {intent.edition}, quantidade {intent.quantity}.</p><AddToCartButton input={intent} label="Adicionar seleção ao carrinho" /></section>}
    {query.isError && <ErrorState message={`Não foi possível atualizar o carrinho. ${purchaseError(query.error)} Confira os dados antes de continuar.`} onRetry={() => void query.refetch()} />}
    {mutation.isError && <p role="alert" className="mb-5 text-destructive">{purchaseError(mutation.error)}</p>}
    {mutation.isSuccess && <p role="status" className="mb-4 text-sm">Carrinho atualizado.</p>}
    {!cart.items.length ? <EmptyState title="Seu carrinho está vazio"><p>Explore as obras e escolha uma edição para começar.</p><Button asChild className="mt-5"><Link to="/">Explorar coleção</Link></Button></EmptyState> : <PurchaseLayout summary={<PurchaseSummary title="Resumo da carteira" totals={cart.totals} compactTitleOnMobile beforeTotals={<form className="mb-6" onSubmit={event => {event.preventDefault();act(() => applyCoupon(context,coupon))}}><label htmlFor="cart-coupon" className="sr-only">Código promocional</label><div className="flex"><Input id="cart-coupon" placeholder="Digite o código promocional…" className="rounded-r-none" value={coupon} maxLength={32} onChange={event => setCoupon(event.target.value)} /><Button type="submit" className="h-10 shrink-0 rounded-l-none px-3 max-sm:h-[50px]" disabled={mutation.isPending || !coupon.trim()}>Aplicar cupom</Button></div></form>}>

      {cart.coupon && <p className="mb-5 text-sm">Cupom: {cart.coupon} <Button variant="ghost" disabled={mutation.isPending} onClick={() => act(() => removeCoupon(context))}>Remover cupom</Button></p>}
      {!cart.purchasable && <p role="alert" className="my-4 text-destructive">Revise estoque e cupom antes de continuar.</p>}
      <Button asChild disabled={!cart.purchasable || mutation.isPending || query.isError} className="mt-5 w-full"><Link to="/checkout" aria-disabled={!cart.purchasable || mutation.isPending || query.isError} onClick={event => {if(!cart.purchasable || mutation.isPending || query.isError) event.preventDefault()}}>Conectar e finalizar</Link></Button><p className="mt-3 text-xs text-muted-foreground">Taxa estimada para Ethereum. A cotação final considera a carteira e rede selecionadas.</p>
    </PurchaseSummary>}>
      <div className="space-y-4"><div className="hidden grid-cols-[minmax(0,2fr)_200px_minmax(80px,1fr)] border-b pb-3 md:grid"><span>NFTs</span><span>Quantidade</span><span>Total</span></div>{cart.items.map(line => <article key={line.id} data-testid={`cart-item-${line.nftId}-${line.edition}`} aria-label={`${line.name} · ${line.editionLabel}`} className="grid min-w-0 grid-cols-[80px_minmax(0,1fr)] items-center gap-4 rounded-xl bg-card p-3 md:grid-cols-[minmax(0,2fr)_200px_minmax(80px,1fr)] md:rounded-none">
        <Link to="/nfts/$nftId" params={{nftId:line.nftId}} className="row-span-3 self-start md:hidden"><img src={line.image} alt={line.name} className="aspect-square rounded-lg object-cover" /></Link><div className="min-w-0 md:flex md:items-center md:gap-4"><img src={line.image} alt="" className="hidden size-20 rounded-lg object-cover md:block" /><div className="min-w-0"><Link to="/nfts/$nftId" params={{nftId:line.nftId}} className="font-semibold">{line.name}</Link><p className="text-xs text-muted-foreground">Edição: {line.editionLabel} · {line.network}</p><p className="hidden text-primary md:block">{line.unitPriceEth} ETH</p></div></div>
        <div className="col-start-2 flex flex-wrap items-center gap-3 md:col-auto"><QuantityInput value={line.quantity} max={line.available} disabled={mutation.isPending} onChange={quantity => act(() => changeCartItem(context,line.id,quantity))} /><Button variant="ghost" size="icon" disabled={mutation.isPending} aria-label={`Remover ${line.name}, edição ${line.editionLabel}`} onClick={() => act(() => removeCartItem(context,line.id))}><Trash2 aria-hidden /></Button></div><p className="col-start-2 text-right font-semibold text-primary md:col-auto">{line.totalEth} ETH</p>
        {line.quantity > line.available && <p role="alert" className="col-span-full text-destructive">Estoque alterado: {line.available} disponíveis. Ajuste a quantidade ou remova o item.</p>}
      </article>)}</div>
    </PurchaseLayout>}
    <section className="mt-16" aria-labelledby="recommended-title"><h2 id="recommended-title" className="section-title mb-6 border-b pb-3 text-primary">Colecionadores também viram</h2>{recommendations.data ? <div className="grid grid-cols-2 gap-5 md:grid-cols-4">{recommendations.data.items.map(nft => <NftCard key={nft.id} nft={nft} />)}</div> : recommendations.isError ? <p>Não foi possível carregar recomendações.</p> : <SummarySkeleton />}</section>
    <p role="status" className="mt-6 min-h-6 text-xs text-muted-foreground">{query.isFetching ? 'Atualizando preço e disponibilidade…' : ''}</p>
  </>
}
