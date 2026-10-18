import { parseUrlSearch, stringifyUrlSearch, validateCatalogSearch } from '@/features/catalog/search'
import { createRootRoute, createRoute, createRouter, lazyRouteComponent, Link } from '@tanstack/react-router'
import { AccountLayout } from '@/components/layout/page-layouts'
import { AppShell } from '@/components/layout/app-shell'
import { CatalogPage } from '@/features/catalog/catalog-page'
import { Button } from '@/components/ui/button'
import { ErrorState } from '@/components/shared/async-state'
import { RequireSession } from '@/features/auth/session'
import { validateDetailSearch, type DetailSearch } from '@/features/nft-details/contracts'
import { safeReturnTo } from '@/features/auth/contracts'

function NotFoundPage() {
  return <section className="py-16 text-center"><p className="text-primary">404</p><h1 className="my-4 text-3xl font-semibold">Página não encontrada</h1><Button asChild><Link to="/">Voltar ao início</Link></Button></section>
}
function PlannedPage({ title }: { title: string }) {
  return <section className="mx-auto max-w-xl py-16"><p className="text-xs uppercase tracking-widest text-primary">Em desenvolvimento</p><h1 className="my-4 text-3xl font-semibold">{title}</h1><p className="mb-8 text-muted-foreground">Este fluxo será disponibilizado em uma próxima etapa. Nenhuma compra ou alteração de conta pode ser realizada aqui.</p><Button asChild><Link to="/">Explorar coleção</Link></Button></section>
}

const rootRoute = createRootRoute({ component: AppShell, notFoundComponent: NotFoundPage, errorComponent: ({ reset }) => <ErrorState message="Não foi possível abrir esta página." onRetry={reset} /> })
const home = createRoute({ getParentRoute: () => rootRoute, path: '/', validateSearch: validateCatalogSearch, component: CatalogPage })
const designSystem = createRoute({ getParentRoute: () => rootRoute, path: '/design-system', component: lazyRouteComponent(() => import('@/features/design-system/design-system-page'), 'DesignSystemPage') })
const cartSearch = (raw: Record<string, unknown>): DetailSearch & { nftId?: string } => ({ ...validateDetailSearch(raw), nftId: typeof raw.nftId === 'string' && /^[a-z0-9-]{1,80}$/.test(raw.nftId) ? raw.nftId : undefined })
const cart = createRoute({ getParentRoute: () => rootRoute, path: '/cart', validateSearch: cartSearch, component: lazyRouteComponent(() => import('@/features/commerce/cart-page'), 'CartPage') })
const authSearch = (search: Record<string, unknown>): { returnTo?: string } => search.returnTo === undefined ? {} : { returnTo: safeReturnTo(search.returnTo) }
const login = createRoute({ getParentRoute: () => rootRoute, path: '/login', validateSearch: authSearch, component: lazyRouteComponent(() => import('@/features/auth/auth-page'), 'AuthPage') })
const register = createRoute({ getParentRoute: () => rootRoute, path: '/register', validateSearch: authSearch, component: lazyRouteComponent(() => import('@/features/auth/register-page'), 'RegisterPage') })
const profile = createRoute({ getParentRoute: () => rootRoute, path: '/account/profile', component: () => <RequireSession><AccountLayout><PlannedPage title="Perfil do colecionador" /></AccountLayout></RequireSession> })
const WalletsPage = lazyRouteComponent(() => import('@/features/commerce/wallets-page'), 'WalletsPage')
const CheckoutPage = lazyRouteComponent(() => import('@/features/commerce/checkout-page'), 'CheckoutPage')
const OrderPage = lazyRouteComponent(() => import('@/features/commerce/order-page'), 'OrderPage')
const wallets = createRoute({ getParentRoute: () => rootRoute, path: '/account/wallets', component: () => <RequireSession><WalletsPage /></RequireSession> })
const nft = createRoute({ getParentRoute: () => rootRoute, path: '/nfts/$nftId', validateSearch: validateDetailSearch, component: lazyRouteComponent(() => import('@/features/nft-details/detail-page'), 'NftDetailPage') })
const checkout = createRoute({ getParentRoute: () => rootRoute, path: '/checkout', component: () => <RequireSession><CheckoutPage /></RequireSession> })
const order = createRoute({ getParentRoute: () => rootRoute, path: '/orders/$orderId', component: () => <RequireSession><OrderPage /></RequireSession> })

export const router = createRouter({ routeTree: rootRoute.addChildren([home, designSystem, cart, login, register, profile, wallets, nft, checkout, order]), parseSearch: parseUrlSearch, stringifySearch: stringifyUrlSearch, defaultPreload: 'intent', scrollRestoration: true })
declare module '@tanstack/react-router' { interface Register { router: typeof router } }
