import { delay,http,HttpResponse } from 'msw'
import { avatarLimit,validatePassword,validateProfile,type PasswordInput,type Profile,type ProfileInput } from '@/features/profile/contracts'
import { mockState } from './state'
import { readSessionStore,resolveDetailSession,writeSessionStore,type SessionStore } from './session-store'
import { hashPassword } from './password'
import { readCommerce,writeCommerce } from './commerce-store'

type User = SessionStore['users'][number]
const problem = (code:string,message:string,status:number,fields?:Record<string,string>) => HttpResponse.json({code,message,fields},{status})
function snapshot(user:User):Profile {
  return {id:user.id,name:user.name,email:user.email,username:user.profile?.username ?? user.email.split('@')[0]!.replace(/[^a-zA-Z0-9_.-]/g,'').slice(0,30).padEnd(3,'_'),ens:user.profile?.ens ?? '',walletNickname:readCommerce().wallets[`user:${user.id}`]?.items.find(wallet => wallet.slot==='primary')?.nickname ?? user.profile?.walletNickname ?? 'Principal',avatar:user.profile?.avatar ?? null}
}
async function context(request:Request) {
  await delay(mockState.scenario === 'slow' ? 1800 : 120)
  if(mockState.scenario === 'offline') return HttpResponse.error()
  if(mockState.scenario === 'error') return problem('UNAVAILABLE','Serviço temporariamente indisponível.',503)
  const session = resolveDetailSession(request),database = readSessionStore()
  const user = session && database.users.find(user => user.id === session.id)
  return user ? {database,user} : problem('SESSION_EXPIRED','Sua sessão expirou. Entre novamente.',401)
}
async function body(request:Request):Promise<Record<string,unknown>|null> {try {const value:unknown=await request.json();return value && typeof value==='object' && !Array.isArray(value) ? value as Record<string,unknown> : null} catch {return null}}
function validAvatar(value:string|null) {
  if(value === null) return true
  if(value.length > Math.ceil(avatarLimit/3)*4+40) return false
  const match = /^data:image\/(png|jpeg|webp);base64,([a-zA-Z0-9+/]+={0,2})$/.exec(value)
  if(!match) return false
  try {
    const bytes=atob(match[2]!)
    if(bytes.length > avatarLimit) return false
    return match[1] === 'png' ? bytes.startsWith('\x89PNG\r\n\x1a\n') : match[1] === 'jpeg' ? bytes.startsWith('\xff\xd8\xff') : bytes.startsWith('RIFF') && bytes.slice(8,12) === 'WEBP'
  } catch {return false}
}
export const profileHandlers = [
  http.get('*/api/profile',async ({request}) => {const result=await context(request);return result instanceof Response ? result : HttpResponse.json(snapshot(result.user))}),
  http.patch('*/api/profile',async ({request}) => {
    const raw=await body(request),result=await context(request)
    if(result instanceof Response) return result
    if(!raw || !['name','username','email','ens','walletNickname'].every(key => typeof raw[key] === 'string') || !(raw.avatar === null || typeof raw.avatar === 'string')) return problem('INVALID_INPUT','Dados inválidos.',400)
    const input:ProfileInput={name:(raw.name as string).trim(),username:(raw.username as string).trim(),email:(raw.email as string).trim().toLowerCase(),ens:(raw.ens as string).trim(),walletNickname:(raw.walletNickname as string).trim(),avatar:raw.avatar as string|null}
    const fields=validateProfile(input)
    if(!validAvatar(input.avatar)) fields.avatar='Use PNG, JPEG ou WebP válido de até 256 KiB.'
    if(Object.keys(fields).length) return problem('VALIDATION','Revise os campos.',422,fields)
    if(result.database.users.some(user => user.id !== result.user.id && user.email === input.email)) return problem('EMAIL_CONFLICT','Este e-mail já está cadastrado.',409,{email:'Este e-mail já está cadastrado.'})
    if(result.database.users.some(user => user.id !== result.user.id && snapshot(user).username.toLowerCase() === input.username.toLowerCase())) return problem('USERNAME_CONFLICT','Este nome de usuário já está em uso.',409,{username:'Este nome de usuário já está em uso.'})
    result.user.name=input.name;result.user.email=input.email
    result.user.profile={username:input.username,ens:input.ens,walletNickname:input.walletNickname,avatar:input.avatar}
    const commerce=readCommerce(),primary=commerce.wallets[`user:${result.user.id}`]?.items.find(wallet => wallet.slot==='primary')
    if(primary && primary.nickname !== input.walletNickname) {primary.nickname=input.walletNickname;primary.version++;writeCommerce(commerce)}
    writeSessionStore(result.database)
    return HttpResponse.json(snapshot(result.user))
  }),
  http.post('*/api/profile/password',async ({request}) => {
    const raw=await body(request),result=await context(request)
    if(result instanceof Response) return result
    if(!raw || !['currentPassword','newPassword','confirmPassword'].every(key => typeof raw[key] === 'string')) return problem('INVALID_INPUT','Dados inválidos.',400)
    const input=raw as unknown as PasswordInput,fields=validatePassword(input)
    if(Object.keys(fields).length) return problem('VALIDATION','Revise os campos.',422,fields)
    const previousHash=result.user.passwordHash,previousSalt=result.user.salt
    if(await hashPassword(input.currentPassword,previousSalt) !== previousHash) return problem('INVALID_PASSWORD','Senha atual incorreta.',422,{currentPassword:'Senha atual incorreta.'})
    const salt=crypto.randomUUID(),passwordHash=await hashPassword(input.newPassword,salt)
    // Hashing is asynchronous: recheck identity and credential version before committing.
    const session=resolveDetailSession(request),database=readSessionStore(),user=database.users.find(user => user.id === result.user.id)
    if(!session || session.id !== result.user.id) return problem('SESSION_EXPIRED','Sua sessão expirou. Entre novamente.',401)
    if(!user || user.passwordHash !== previousHash) return problem('PASSWORD_CHANGED','A senha foi alterada em outra operação. Tente novamente.',409)
    user.salt=salt;user.passwordHash=passwordHash
    const token=request.headers.get('Authorization')?.replace(/^Bearer /,'')
    for(const [key,session] of Object.entries(database.sessions)) if(session.userId === user.id && key !== token) delete database.sessions[key]
    writeSessionStore(database)
    return new HttpResponse(null,{status:204})
  }),
]
