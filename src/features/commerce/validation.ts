import { networks, providers, type Collector, type WalletInput } from './contracts'
export function validateCollector(input: Collector): Record<string, string> {
  const errors: Record<string, string> = {}
  for (const [key, label] of [['displayName', 'nome de exibição'], ['username', 'nome de usuário'], ['profileName', 'nome do perfil'], ['referral', 'código de indicação']] as const) {
    if (typeof input[key] !== 'string' || input[key].trim().length < 2 || input[key].length > 80) errors[key] = `Informe ${label} entre 2 e 80 caracteres.`
  }
  if (typeof input.email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email) || input.email.length > 254) errors.email = 'Informe um e-mail válido.'
  if (typeof input.ens !== 'string' || input.ens.length > 80 || (input.ens && !/^[a-z0-9-]+\.eth$/i.test(input.ens))) errors.ens = 'Informe um ENS .eth válido ou deixe vazio.'
  if (typeof input.notes !== 'string' || input.notes.length > 500) errors.notes = 'Use até 500 caracteres.'
  return errors
}
export function validateWallet(input: WalletInput): Record<string, string> {
  const errors = validateCollector({ displayName: input.displayName, username: input.nickname, profileName: input.profileName, email: input.email, referral: input.referral, ens: input.ens, notes: '' })
  if (errors.username) { errors.nickname = 'Informe um apelido entre 2 e 80 caracteres.'; delete errors.username }
  if (!networks.includes(input.network)) errors.network = 'Selecione uma rede.'
  if (!providers.includes(input.provider)) errors.provider = 'Selecione um provedor.'
  const expression = input.network === 'Solana' ? /^[1-9A-HJ-NP-Za-km-z]{32,44}$/ : /^0x[a-fA-F0-9]{40}$/
  if (typeof input.address !== 'string' || !expression.test(input.address)) errors.address = 'Endereço inválido para esta rede.'
  if (input.slot !== 'primary' && input.slot !== 'secondary') errors.slot = 'Posição de carteira inválida.'
  return errors
}
