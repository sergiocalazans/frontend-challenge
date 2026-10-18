import { useState,type FormEvent } from 'react'
import { useMutation,useQuery,useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { UserRound } from 'lucide-react'
import { AccountLayout } from '@/components/layout/page-layouts'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { FormField } from '@/components/shared/form-field'
import { ErrorState } from '@/components/shared/async-state'
import { sessionKey,useSession } from '@/features/auth/api'
import type { ApiProblem,Session } from '@/features/auth/contracts'
import { readToken } from '@/features/auth/token'
import { changePassword,profileKey,profileOptions,saveProfile,type ProfileIdentity } from './api'
import { avatarLimit,validatePassword,validateProfile,type PasswordInput,type Profile,type ProfileInput } from './contracts'

const emptyPassword:PasswordInput={currentPassword:'',newPassword:'',confirmPassword:''}
const message = (error:unknown) => axios.isAxiosError<ApiProblem>(error) ? error.response?.data.message ?? 'Não foi possível salvar. Tente novamente.' : 'Não foi possível salvar. Tente novamente.'
const errorFields = (error:unknown) => axios.isAxiosError<ApiProblem>(error) ? error.response?.data.fields ?? {} : {}

function PasswordForm({identity}:{identity:ProfileIdentity}) {
  const [input,setInput]=useState<PasswordInput>(emptyPassword),[fields,setFields]=useState<Record<string,string>>({})
  const mutation=useMutation({mutationFn:({identity,input}:{identity:ProfileIdentity;input:PasswordInput}) => changePassword(identity,input),onSuccess:(_data,variables) => {if(variables.identity.token===readToken()){setInput(emptyPassword);setFields({})}},onError:(error,variables) => {if(variables.identity.token===readToken()) setFields(errorFields(error))}})
  function submit(event:FormEvent) {event.preventDefault();const fields=validatePassword(input);setFields(fields);if(!Object.keys(fields).length) mutation.mutate({identity,input})}
  return <form noValidate onSubmit={submit} aria-label="Alterar senha" className="mt-8 grid max-w-md gap-5">
    <h2 className="font-semibold">Alterar senha</h2>
    {([['currentPassword','Senha atual'],['newPassword','Nova senha'],['confirmPassword','Confirmar nova senha']] as const).map(([key,label]) => <FormField key={key} label={label} type="password" autoComplete={key==='currentPassword' ? 'current-password':'new-password'} required maxLength={128} value={input[key]} onChange={event => setInput(previous => ({...previous,[key]:event.target.value}))} error={fields[key]} />)}
    <p className="text-sm text-muted-foreground">A nova senha deve ter de 8 a 128 caracteres. Outras sessões serão encerradas.</p>
    <Button type="submit" className="justify-self-start" disabled={mutation.isPending}>{mutation.isPending ? 'Alterando…':'Alterar senha'}</Button>
    {mutation.isError && <p role="alert" className="text-destructive">{message(mutation.error)}</p>}
    {mutation.isSuccess && <p role="status">Senha alterada. Use a nova senha no próximo login.</p>}
  </form>
}

function ProfileForm({profile,identity}:{profile:Profile;identity:ProfileIdentity}) {
  const client=useQueryClient(),[input,setInput]=useState<ProfileInput>(profile),[fields,setFields]=useState<Record<string,string>>({}),[reading,setReading]=useState(false)
  const mutation=useMutation({mutationFn:({identity,input}:{identity:ProfileIdentity;input:ProfileInput}) => saveProfile(identity,input),onMutate:async variables => {await client.cancelQueries({queryKey:profileKey(variables.identity.userId),exact:true})},onSuccess:(data,variables) => {
    if(variables.identity.token !== readToken()) return
    client.setQueryData(profileKey(variables.identity.userId),data)
    client.setQueryData<Session>(sessionKey,{user:{id:data.id,name:data.name,email:data.email}})
    void client.invalidateQueries({queryKey:['private',variables.identity.userId,'wallets']})
    setInput(data);setFields({})
  },onError:(error,variables) => {if(variables.identity.token===readToken()) setFields(errorFields(error))}})
  function submit(event:FormEvent) {event.preventDefault();const errors=validateProfile(input);setFields(errors);if(!Object.keys(errors).length) mutation.mutate({identity,input})}
  async function avatar(file:File|undefined) {
    if(!file) return
    if(file.size > avatarLimit || !['image/png','image/jpeg','image/webp'].includes(file.type)) {setFields(previous => ({...previous,avatar:'Use PNG, JPEG ou WebP de até 256 KiB.'}));return}
    setReading(true)
    try {
      const value=await new Promise<string>((resolve,reject) => {const reader=new FileReader();reader.onload=() => resolve(String(reader.result));reader.onerror=() => reject(new Error('read'));reader.readAsDataURL(file)})
      const image=new Image();image.src=value;await image.decode()
      if(identity.token !== readToken()) return
      setInput(previous => ({...previous,avatar:value}));setFields(previous => ({...previous,avatar:''}))
    } catch {if(identity.token===readToken()) setFields(previous => ({...previous,avatar:'Não foi possível ler esta imagem.'}))} finally {setReading(false)}
  }
  return <>
    <h1 className="mb-6 text-xl font-semibold">Perfil do colecionador</h1>
    <form noValidate onSubmit={submit} aria-label="Dados do perfil" className="grid gap-5 md:grid-cols-2">
      {([['name','Nome de exibição'],['username','Nome de usuário'],['email','E-mail'],['ens','Nome ENS (opcional)'],['walletNickname','Apelido da carteira']] as const).map(([key,label]) => <FormField key={key} label={label} required={key!=='ens'} type={key==='email'?'email':'text'} autoComplete={key==='email'?'email':key==='name'?'name':key==='username'?'username':'off'} maxLength={key==='email'?254:key==='username'?30:80} value={input[key]} onChange={event => setInput(previous => ({...previous,[key]:event.target.value}))} error={fields[key]} />)}
      <div className="grid gap-3">
        <div className="flex items-center gap-4">{input.avatar ? <img src={input.avatar} alt="Avatar do colecionador" width={64} height={64} className="h-16 w-16 rounded-full object-cover" /> : <span className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary" aria-label="Sem avatar"><UserRound aria-hidden="true" /></span>}<Button type="button" variant="ghost" disabled={!input.avatar || reading} onClick={() => setInput(previous => ({...previous,avatar:null}))}>Remover avatar</Button></div>
        <FormField label="Selecionar avatar" type="file" accept="image/png,image/jpeg,image/webp" onChange={event => void avatar(event.target.files?.[0])} error={fields.avatar} hint="PNG, JPEG ou WebP, até 256 KiB. Salve o perfil para confirmar." />
        {reading && <p role="status">Lendo avatar…</p>}
      </div>
      <div className="md:col-span-2"><Button type="submit" disabled={mutation.isPending || reading}>{mutation.isPending?'Salvando…':'Salvar perfil'}</Button>{mutation.isError && <p role="alert" className="mt-4 text-destructive">{message(mutation.error)}</p>}{mutation.isSuccess && <p role="status" className="mt-4">Perfil salvo.</p>}</div>
    </form>
    <PasswordForm identity={identity} />
  </>
}

export function ProfilePage() {
  const session=useSession(),token=readToken(),userId=session.data?.user?.id
  const identity={userId:userId??'',token:token??''}
  const query=useQuery({...profileOptions(identity),enabled:Boolean(userId&&token)})
  return <AccountLayout>{query.isPending ? <div role="status" aria-label="Carregando perfil" className="grid gap-5 md:grid-cols-2">{Array.from({length:6},(_,index) => <Skeleton key={index} className="shimmer h-16 w-full" />)}</div> : query.isError ? <ErrorState message="Não foi possível carregar o perfil." onRetry={() => void query.refetch()} /> : <ProfileForm key={`${userId}:${token}`} profile={query.data} identity={identity} />}</AccountLayout>
}
