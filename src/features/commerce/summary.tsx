import type { ReactNode } from 'react'
import type { Totals } from './contracts'
export function PurchaseSummary({totals,children,title='Resumo da compra'}:{totals:Totals;children?:ReactNode;title?:string}) {
  return <section className="rounded-xl bg-card p-5 md:p-6"><h2 className="mb-5 border-b pb-3 text-lg font-semibold">{title}</h2><dl className="space-y-3 text-sm"><div className="flex justify-between gap-3"><dt>Subtotal</dt><dd data-testid="purchase-subtotal">{totals.subtotalEth} ETH</dd></div><div className="flex justify-between gap-3"><dt>Desconto do lançamento</dt><dd data-testid="purchase-discount">− {totals.discountEth} ETH</dd></div><div className="flex justify-between gap-3"><dt>Taxa de rede</dt><dd>{totals.feeEth} ETH</dd></div><div className="flex justify-between gap-3 border-t pt-4 text-lg font-semibold"><dt>Total</dt><dd className="text-primary" data-testid="purchase-total">{totals.totalEth} ETH</dd></div></dl>{children}</section>
}
