import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useRouterState } from '@tanstack/react-router'
import { Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { favoritesKey, favoritesOptions, sessionToken, setFavorite } from './api'
import type { Favorites } from './contracts'

export function FavoriteButton({ nftId, userId }: { nftId: string; userId?: string }) {
  const client = useQueryClient()
  const navigate = useNavigate()
  const href = useRouterState({ select: state => state.location.href })
  const query = useQuery({ ...favoritesOptions(userId ?? 'anonymous'), enabled: Boolean(userId) })
  const mutation = useMutation({
    mutationFn: (input: { saved: boolean; token: string | null }) => setFavorite(nftId, input.saved, input.token),
    onMutate: async input => {
      const key = favoritesKey(userId!)
      await client.cancelQueries({ queryKey: key })
      if (input.token !== sessionToken()) throw new Error('SESSION_CHANGED')
      const previous = client.getQueryData<Favorites>(key)
      client.setQueryData<Favorites>(key, { ids: input.saved ? [...new Set([...(previous?.ids ?? []), nftId])] : (previous?.ids ?? []).filter(id => id !== nftId) })
      return { previous, key, token: input.token }
    },
    onError: (_error, _input, context) => {
      if (context && context.token === sessionToken()) client.setQueryData(context.key, context.previous)
    },
    onSettled: (_data, _error, _input, context) => {
      // A completed mutation from the previous identity must not recreate its cache.
      if (context?.token === sessionToken()) void client.invalidateQueries({ queryKey: context.key })
    },
  })
  const saved = query.data?.ids.includes(nftId) ?? false
  function toggle() {
    if (!userId) { void navigate({ href: `/login?returnTo=${encodeURIComponent(href)}` }); return }
    mutation.mutate({ saved: !saved, token: sessionToken() })
  }
  return <div className="space-y-2"><Button variant="outline" onClick={toggle} disabled={mutation.isPending || Boolean(userId && (query.isPending || query.isError))} aria-pressed={saved}><Heart aria-hidden className={saved ? 'fill-primary' : ''} />{saved ? 'Remover dos favoritos' : 'Favoritar'}</Button>
    {userId && query.isPending && <p role="status" className="text-xs">Carregando favoritos…</p>}
    {query.isError && userId && <div role="alert"><p>Não foi possível consultar favoritos.</p><Button variant="ghost" onClick={() => void query.refetch()}>Recarregar favoritos</Button></div>}
    {mutation.isError && <p role="alert" className="text-sm text-destructive">Não foi possível alterar o favorito. Estado anterior restaurado. Tente novamente.</p>}
    {mutation.isSuccess && <p role="status" className="text-xs text-muted-foreground">Favoritos atualizados.</p>}
  </div>
}
