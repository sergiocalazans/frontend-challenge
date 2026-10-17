import type { ReactNode } from 'react'
import { AccountSidebar } from '@/components/shared/account-sidebar'

/** Shared composition only: callers own queries, permissions and business actions. */
export function AccountLayout({ children }: { children: ReactNode }) {
  return <div className="account-layout"><AccountSidebar /><div className="min-w-0">{children}</div></div>
}

export function PurchaseLayout({ children, summary }: { children: ReactNode; summary: ReactNode }) {
  return <div className="purchase-layout"><div className="min-w-0">{children}</div><aside aria-label="Resumo da compra" className="min-w-0">{summary}</aside></div>
}
