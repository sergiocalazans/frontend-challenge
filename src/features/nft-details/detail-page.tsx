import { useEffect, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate, useParams, useSearch } from '@tanstack/react-router'
import axios from 'axios'
import { Button } from '@/components/ui/button'
import { DetailSkeleton } from '@/components/shared/content-skeletons'
import { EmptyState, ErrorState } from '@/components/shared/async-state'
import { QuantityInput } from '@/components/shared/quantity-input'
import { NftCard } from '@/components/shared/nft-card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { createMarketSocket, subscribeToCatalog } from '@/lib/realtime'
import { errorMessage } from '@/lib/http'
import { useSession } from '@/features/auth/api'
import { detailOptions } from './api'
import { validateDetailSearch } from './contracts'
import { NftGallery } from './gallery'
import { FavoriteButton } from './favorite-button'

export function NftDetailPage() {
  const { nftId } = useParams({ from: '/nfts/$nftId' })
  const search = validateDetailSearch(useSearch({ strict: false }))
  const navigate = useNavigate()
  const client = useQueryClient()
  const query = useQuery(detailOptions(nftId))
  const session = useSession()
  const identity = session.data?.user?.id
  const [connected, setConnected] = useState(false)
  useEffect(() => {
    const socket = createMarketSocket()
    const connect = () => setConnected(true)
    const disconnect = () => setConnected(false)
    socket.on('connect', connect)
    socket.on('disconnect', disconnect)
    const dispose = subscribeToCatalog(socket, () => { void client.invalidateQueries({ queryKey: ['nft-detail', nftId] }); void client.invalidateQueries({ queryKey: ['catalog'] }) })
    return () => { socket.off('connect', connect); socket.off('disconnect', disconnect); dispose() }
  }, [client, nftId])
  if (query.isPending) return <DetailSkeleton />
  if (axios.isAxiosError(query.error) && query.error.response?.status === 404) return <EmptyState title="NFT não encontrado"><p>Esta obra não está disponível no catálogo.</p><Button className="mt-4" asChild><Link to="/">Voltar à coleção</Link></Button></EmptyState>
  if (!query.data) return <ErrorState message={errorMessage(query.error)} onRetry={() => void query.refetch()} />
  const nft = query.data
  const edition = nft.editions.find(edition => edition.id === search.edition) ?? nft.editions.find(edition => edition.id === 'fifty' && edition.available > 0) ?? nft.editions.find(edition => edition.available > 0) ?? nft.editions[0]!
  const desired = search.quantity ?? 1
  const quantity = Math.min(desired, Math.max(edition.available, 1))
  const update = (patch: { edition?: string; quantity?: number }) => void navigate({ to: '/nfts/$nftId', params: { nftId }, search: previous => ({ ...previous, ...patch }), resetScroll: false, replace: true })
  return <>
    <nav aria-label="Caminho da página" className="mb-6 text-xs text-muted-foreground"><Link to="/" aria-label="Voltar à coleção"><span className="md:hidden">← Voltar à coleção</span><span className="hidden md:inline">Início / Mercado</span></Link><span className="hidden md:inline"> / {nft.name}</span></nav>
    {query.isError && <ErrorState message="Não foi possível atualizar a obra. Confira os dados antes de continuar." onRetry={() => void query.refetch()} />}
    <div className="grid items-start gap-8 lg:grid-cols-2"><NftGallery key={nft.id} nft={nft} /><section className="min-w-0 rounded-xl bg-card p-6 lg:bg-background lg:p-0" aria-labelledby="nft-title">
      <h1 id="nft-title" className="text-2xl font-semibold md:text-3xl">{nft.name}</h1><p className="my-4 text-xl font-semibold text-primary" data-testid="detail-price">{nft.priceEth} ETH</p>
      <h2 className="mb-2 border-t pt-4 font-semibold">Sobre este NFT</h2><p className="text-muted-foreground">{nft.description}</p>
      <fieldset className="my-6"><legend className="mb-3 font-semibold">Edição</legend><div className="flex flex-wrap gap-2">{nft.editions.map(item => <label key={item.id} className="flex cursor-pointer items-center gap-2 rounded-full border px-3 py-2 has-checked:border-primary has-checked:text-primary"><input type="radio" name="edition" value={item.id} checked={edition.id === item.id} onChange={() => update({ edition: item.id, quantity: 1 })} /><span>{item.label}{item.available === 0 ? ' · Esgotada' : ''}</span></label>)}</div></fieldset>
      <p role="status" className="mb-5 text-sm text-muted-foreground">{edition.available === 0 ? 'Edição indisponível. Selecione outra edição.' : `${edition.available} unidades disponíveis nesta edição.`}{desired > edition.available && edition.available > 0 ? ' Quantidade ajustada ao estoque atual.' : ''}</p>
      <div className="mb-6 flex flex-wrap items-start gap-6"><QuantityInput value={quantity} max={edition.available} onChange={quantity => update({ edition: edition.id, quantity })} />{session.isError ? <div role="alert"><p>Não foi possível verificar sua sessão.</p><Button variant="ghost" onClick={() => void session.refetch()}>Verificar sessão</Button></div> : session.isPending ? <p role="status">Verificando sessão…</p> : <FavoriteButton key={`${identity ?? 'guest'}:${nft.id}`} nftId={nft.id} userId={identity} />}</div>
      <Button disabled={edition.available === 0 || query.isError} asChild={edition.available > 0 && !query.isError}>{edition.available > 0 && !query.isError ? <Link to="/cart" search={{ nftId: nft.id, edition: edition.id, quantity }}>Comprar NFT</Link> : 'Edição indisponível'}</Button><p className="mt-3 text-xs text-muted-foreground">A seleção segue para o carrinho. Compra e inclusão de itens serão disponibilizadas no fluxo de carrinho.</p>
      <dl className="mt-6 space-y-2 text-muted-foreground"><div><dt className="inline">ID do token: </dt><dd className="inline">{nft.id}</dd></div><div><dt className="inline">Coleção: </dt><dd className="inline">{nft.collection}</dd></div><div><dt className="inline">Atributos: </dt><dd className="inline">{nft.attributes.join(', ')}</dd></div><div><dt className="inline">Rede: </dt><dd className="inline">{nft.network}</dd></div></dl>
    </section></div>
    <p role="status" className="my-6 min-h-6 text-xs text-muted-foreground">{query.isFetching ? 'Atualizando preço e disponibilidade…' : nft.version > 1 ? 'Preço ou disponibilidade atualizados pela rede.' : ''}</p>
    <p role="status" className="text-xs text-muted-foreground">{connected ? 'Atualizações em tempo real conectadas.' : 'Reconectando atualizações em tempo real…'}</p>
    <Tabs defaultValue="details" className="my-12"><TabsList variant="line"><TabsTrigger value="details">Detalhes do NFT</TabsTrigger><TabsTrigger value="network">Rede e propriedade</TabsTrigger></TabsList><TabsContent value="details" className="space-y-4 border-t pt-5 text-muted-foreground"><p>{nft.description}</p><p>Obra da coleção {nft.collection}. Os atributos e a disponibilidade são consultados na API de demonstração.</p></TabsContent><TabsContent value="network" className="border-t pt-5 text-muted-foreground"><p>Rede: {nft.network}. A propriedade e a transferência são simuladas; não há contrato ou transação blockchain real.</p></TabsContent></Tabs>
    <section aria-labelledby="related-title"><h2 id="related-title" className="section-title mb-6 border-b pb-3 text-primary">Mais desta coleção</h2>{nft.related.length ? <div className="grid grid-cols-2 gap-5 md:grid-cols-4">{nft.related.map(item => <NftCard key={item.id} nft={item} />)}</div> : <p>Nenhuma outra obra nesta coleção.</p>}</section>
  </>
}
