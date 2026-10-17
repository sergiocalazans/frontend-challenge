import { Link } from '@tanstack/react-router'
import { UserRound, Wallet } from 'lucide-react'

export function AccountSidebar() {
  return <nav aria-label="Navegação da conta" className="rounded-lg bg-card p-4"><h2 className="mb-4 px-3 font-semibold">Meu perfil</h2>{[{ to: '/account/profile', label: 'Dados do perfil', icon: UserRound }, { to: '/account/wallets', label: 'Carteiras', icon: Wallet }].map(({ to, label, icon: Icon }) => <Link key={to} to={to} activeProps={{ className: 'border-l-primary bg-secondary' }} className="flex items-center gap-3 border-l-2 border-transparent p-3 text-primary"><Icon size={16} aria-hidden="true" />{label}</Link>)}</nav>
}
