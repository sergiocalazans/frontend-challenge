import { Link, Outlet, useRouterState } from '@tanstack/react-router'
import { Home, LayoutGrid, ShoppingCart, UserRound } from 'lucide-react'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

const links = [{ to: '/', label: 'Início', icon: Home }, { to: '/design-system', label: 'Componentes', icon: LayoutGrid }, { to: '/cart', label: 'Carrinho', icon: ShoppingCart }, { to: '/login', label: 'Entrar', icon: UserRound }] as const

export function AppShell() {
  const pathname = useRouterState({ select: state => state.location.pathname })
  useEffect(() => { document.getElementById('main-content')?.focus({ preventScroll: true }) }, [pathname])
  return <>
    <a href="#main-content" className="fixed left-4 top-2 z-50 -translate-y-20 rounded bg-primary p-3 text-primary-foreground focus:translate-y-0">Pular para conteúdo</a>
    <header className="page-container flex min-h-20 items-center justify-between gap-4 border-b">
      <Link to="/" className="text-lg font-semibold tracking-[.15em]" aria-label="Kurio — início">KURIO</Link>
      <nav aria-label="Navegação principal" className="hidden items-center gap-8 md:flex">
        {links.slice(0, 2).map(({ to, label }) => <Link key={to} to={to} activeOptions={{ exact: true }} activeProps={{ className: 'text-primary underline underline-offset-8' }}>{label}</Link>)}
      </nav>
      <div className="flex items-center gap-3"><Button variant="ghost" size="icon" asChild><Link to="/cart" aria-label="Abrir carrinho"><ShoppingCart aria-hidden="true" /></Link></Button><Button asChild><Link to="/login">Entrar</Link></Button></div>
    </header>
    <main id="main-content" tabIndex={-1} className="page-container min-h-[60vh] py-8 outline-none md:py-12"><Outlet /></main>
    <footer className="page-container mb-24 mt-12 md:mb-6">
      <div className="grid gap-8 rounded-lg bg-card p-6 md:grid-cols-3 md:p-10"><div><p className="font-semibold tracking-widest">KURIO</p><p className="mt-3 text-muted-foreground">Feito para colecionadores,<br />criadores e cultura.</p></div><nav aria-label="Links do rodapé" className="flex flex-col gap-3"><Link to="/">Explorar coleções</Link><Link to="/account/profile">Meu perfil</Link><Link to="/account/wallets">Carteiras</Link></nav><div><p className="font-semibold">Uma nova forma de colecionar.</p><p className="mt-3 text-xs text-muted-foreground">Demonstração em desenvolvimento. Compras e contas ainda não estão disponíveis.</p></div></div>
      <p className="mt-5 text-center text-xs text-muted-foreground">© 2026 Kurio · Jungle Gaming NFT Marketplace</p>
    </footer>
    <nav aria-label="Navegação mobile" className="fixed inset-x-0 bottom-0 z-30 flex justify-around border-t bg-card px-2 pb-[max(12px,env(safe-area-inset-bottom))] pt-3 md:hidden">
      {links.map(({ to, label, icon: Icon }) => <Link key={to} to={to} activeOptions={{ exact: true }} activeProps={{ className: 'text-primary' }} className="flex min-h-11 min-w-14 flex-col items-center gap-1 text-[10px] text-muted-foreground"><Icon size={20} aria-hidden="true" />{label}</Link>)}
    </nav>
  </>
}
