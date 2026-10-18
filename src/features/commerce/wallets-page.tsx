import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { AccountLayout } from '@/components/layout/page-layouts'
import { Button } from '@/components/ui/button'
import { ErrorState } from '@/components/shared/async-state'
import { SummarySkeleton } from '@/components/shared/content-skeletons'
import { useCommerceIdentity } from './use-commerce'
import { walletsOptions } from './api'
import { WalletForm } from './wallet-form'
import { purchaseError } from './errors'
export function WalletsPage() {
  const {context,ready} = useCommerceIdentity(),[secondary,setSecondary] = useState(false)
  const query = useQuery({...walletsOptions(context),enabled:ready && Boolean(context.userId)})
  if(query.isPending) return <SummarySkeleton />
  if(!query.data) return <ErrorState message={purchaseError(query.error)} onRetry={() => void query.refetch()} />
  return <AccountLayout><h1 className="mb-3 text-xl font-semibold">Carteiras</h1><p className="mb-8 text-muted-foreground">Estas carteiras ficam disponíveis no pagamento. Todos os dados e conexões são simulados.</p>{query.isError && <ErrorState message="Não foi possível atualizar carteiras." onRetry={() => void query.refetch()} />}
    <section><h2 className="mb-6 text-lg font-semibold">Carteira principal</h2><WalletForm key={`${context.userId}:primary`} context={context} slot="primary" wallet={query.data.items.find(item => item.slot === 'primary')} /></section>
    <section className="mt-12 border-t pt-6"><h2 className="mb-4 text-lg font-semibold">Carteira secundária</h2>{secondary || query.data.items.some(item => item.slot === 'secondary') ? <WalletForm key={`${context.userId}:secondary`} context={context} slot="secondary" wallet={query.data.items.find(item => item.slot === 'secondary')} /> : <><p className="mb-3 text-muted-foreground">Você ainda não adicionou uma carteira secundária.</p><Button variant="outline" onClick={() => setSecondary(true)}>Adicionar carteira secundária</Button></>}</section>
  </AccountLayout>
}
