import { Link, Outlet, useRouterState } from '@tanstack/react-router'
import { Home, LayoutGrid, ShoppingCart, UserRound } from 'lucide-react'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { logout, sessionKey, useSession } from '@/features/auth/api'
import { SessionLifecycle } from '@/features/auth/session'
import { readToken, saveToken } from '@/features/auth/token'

const links = [{ to: '/', label: 'Início', icon: Home }, { to: '/design-system', label: 'Componentes', icon: LayoutGrid }, { to: '/cart', label: 'Carrinho', icon: ShoppingCart }, { to: '/login', label: 'Entrar', icon: UserRound }] as const

export function AppShell() {
  const session = useSession()
  const client = useQueryClient()
  const exit = useMutation({ mutationFn: logout, onSuccess: async token => {
    if (token !== readToken()) return
    await client.cancelQueries({ predicate: query => query.queryKey[0] === 'private' || query.queryKey[0] === 'session' })
    if (token !== readToken()) return
    saveToken(null)
    client.removeQueries({ predicate: query => query.queryKey[0] === 'private' })
    client.setQueryData(sessionKey, { user: null })
  } })
  const pathname = useRouterState({ select: state => state.location.pathname })
  const detailRoute = pathname.startsWith('/nfts/')
  const purchaseRoute = pathname === '/cart' || pathname === '/checkout' || pathname.startsWith('/orders/')
  const authRoute = pathname === '/login' || pathname === '/register'
  const mobileLinks = links.map(link => link.to === '/login' && session.data?.user ? {...link,to:'/account/profile' as const,label:'Perfil'} : link)
  useEffect(() => { document.getElementById('main-content')?.focus({ preventScroll: true }) }, [pathname])
  return <>
    <SessionLifecycle />
    <a href="#main-content" className="fixed left-4 top-2 z-50 -translate-y-20 rounded bg-primary p-3 text-primary-foreground focus:translate-y-0">Pular para conteúdo</a>
    <header className={`page-container ${authRoute || detailRoute || purchaseRoute ? 'hidden md:flex' : 'flex'} min-h-20 items-center justify-between gap-4 border-b`}>
      <Link to="/" className="text-lg font-semibold tracking-[.15em]" aria-label="Kurio — início">KURIO</Link>
      <nav aria-label="Navegação principal" className="hidden items-center gap-8 md:flex">
        {links.slice(0, 2).map(({ to, label }) => <Link key={to} to={to} activeOptions={{ exact: true }} activeProps={{ className: 'text-primary underline underline-offset-8' }}>{label}</Link>)}
      </nav>
      <div className="flex items-center gap-3"><Button variant="ghost" size="icon" asChild><Link to="/cart" aria-label="Abrir carrinho"><ShoppingCart aria-hidden="true" /></Link></Button>{session.data?.user ? <><Link to="/account/profile" className="hidden text-xs md:inline">{session.data.user.name}</Link><Button variant="outline" onClick={() => exit.mutate()} disabled={exit.isPending}>{exit.isPending ? 'Saindo…' : 'Sair'}</Button></> : <Button asChild><Link to="/login">Entrar</Link></Button>}</div>
    </header>
    {exit.isError && <p role="alert" className="page-container text-destructive">Não foi possível sair. Tente novamente.</p>}
    <main id="main-content" tabIndex={-1} className="page-container min-h-[60vh] py-8 outline-none md:py-12"><Outlet /></main>
    <footer className={`page-container mb-24 mt-12 md:mb-6 ${authRoute || purchaseRoute ? 'hidden md:block' : ''}`}>
      <div className="grid gap-8 rounded-lg bg-card p-6 md:grid-cols-3 md:p-10"><div><p className="font-semibold tracking-widest">KURIO</p><p className="mt-3 text-muted-foreground">Feito para colecionadores,<br />criadores e cultura.</p></div><nav aria-label="Links do rodapé" className="flex flex-col gap-3"><Link to="/">Explorar coleções</Link><Link to="/account/profile">Meu perfil</Link><Link to="/account/wallets">Carteiras</Link></nav><div><p className="font-semibold">Uma nova forma de colecionar.</p><p className="mt-3 text-xs text-muted-foreground">Ambiente de demonstração. Operações e transações são simuladas.</p></div></div>
      <p className="mt-5 text-center text-xs text-muted-foreground">© 2026 Kurio · Jungle Gaming NFT Marketplace</p>
    </footer>
    <nav aria-label="Navegação mobile" className={`fixed inset-x-0 bottom-0 z-30 ${authRoute || detailRoute || purchaseRoute ? 'hidden' : 'flex'} justify-around border-t bg-card px-2 pb-[max(12px,env(safe-area-inset-bottom))] pt-3 md:hidden`}>
      {mobileLinks.map(({ to, label, icon: Icon }) => <Link key={to} to={to} activeOptions={{ exact: true }} activeProps={{ className: 'text-primary' }} className="flex min-h-11 min-w-14 flex-col items-center gap-1 text-[10px] text-muted-foreground"><Icon size={20} aria-hidden="true" />{label}</Link>)}
    </nav>
  </>
}
