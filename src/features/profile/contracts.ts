export interface ProfileInput { name:string; username:string; email:string; ens:string; walletNickname:string; avatar:string|null }
export interface Profile extends ProfileInput { id:string }
export interface PasswordInput { currentPassword:string; newPassword:string; confirmPassword:string }
export const avatarLimit = 256 * 1024
export function validateProfile(input:ProfileInput) {
  const errors:Record<string,string> = {}
  if(input.name.trim().length < 2 || input.name.trim().length > 80) errors.name = 'Informe um nome de 2 a 80 caracteres.'
  if(!/^[a-zA-Z0-9_.-]{3,30}$/.test(input.username)) errors.username = 'Use de 3 a 30 letras, números, pontos, hífens ou sublinhados.'
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email) || input.email.length > 254) errors.email = 'Informe um e-mail válido.'
  if(input.walletNickname.trim().length < 2 || input.walletNickname.trim().length > 80) errors.walletNickname = 'Informe um apelido de 2 a 80 caracteres.'
  if(input.ens && (!/^[a-zA-Z0-9-]+\.eth$/.test(input.ens) || input.ens.length > 80)) errors.ens = 'Informe um nome .eth válido ou deixe vazio.'
  return errors
}
export function validatePassword(input:PasswordInput) {
  const errors:Record<string,string> = {}
  if(!input.currentPassword || input.currentPassword.length > 128) errors.currentPassword = 'Informe a senha atual.'
  if(input.newPassword.length < 8 || input.newPassword.length > 128) errors.newPassword = 'Use uma senha de 8 a 128 caracteres.'
  if(input.newPassword === input.currentPassword) errors.newPassword = 'A nova senha deve ser diferente da atual.'
  if(input.confirmPassword !== input.newPassword) errors.confirmPassword = 'As senhas devem ser iguais.'
  return errors
}
