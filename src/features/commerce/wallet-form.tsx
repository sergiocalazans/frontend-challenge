import { useState,type FormEvent } from 'react'
import { useMutation,useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { Button } from '@/components/ui/button'
import { FormField } from '@/components/shared/form-field'
import { readToken } from '@/features/auth/token'
import { saveWallet,walletsKey,type CommerceIdentity } from './api'
import { networks,providers,type Wallet,type WalletInput } from './contracts'
import { validateWallet } from './validation'
import { purchaseError } from './errors'
export function WalletForm({context,slot,wallet}:{context:CommerceIdentity;slot:WalletInput['slot'];wallet?:Wallet}) {
  const client = useQueryClient()
  const [input,setInput] = useState<WalletInput>(wallet ?? {slot,displayName:'',nickname:'',profileName:'',network:'Ethereum',address:'',provider:'MetaMask',email:'',referral:'',ens:''})
  const [fields,setFields] = useState<Record<string,string>>({})
  const mutation = useMutation({onMutate:async ({context}:{context:CommerceIdentity;input:WalletInput}) => {await client.cancelQueries({queryKey:walletsKey(context.userId!),exact:true})},mutationFn:({context,input}:{context:CommerceIdentity;input:WalletInput}) => saveWallet(context,input),onSuccess:(data,variables) => {if(variables.context.token === readToken()) client.setQueryData(walletsKey(variables.context.userId!),data)},onError:error => {if(axios.isAxiosError<{fields?:Record<string,string>}>(error)) setFields(error.response?.data.fields ?? {})}})
  function submit(event:FormEvent) {event.preventDefault();const errors = validateWallet(input);setFields(errors);if(!Object.keys(errors).length) mutation.mutate({context,input})}
  const update = (key:keyof WalletInput,value:string) => setInput(previous => ({...previous,[key]:value}))
  return <form noValidate onSubmit={submit} aria-label={`Carteira ${slot === 'primary' ? 'principal' : 'secundária'}`} className="grid gap-5 md:grid-cols-2">
    {([['displayName','Nome de exibição'],['nickname','Apelido da carteira'],['profileName','Nome do perfil'],['email','E-mail']] as const).map(([key,label]) => <FormField key={key} label={label} type={key === 'email' ? 'email' : 'text'} required value={input[key]} maxLength={key === 'email' ? 254 : 80} onChange={event => update(key,event.target.value)} error={fields[key]} />)}
    <label className="field">Rede<select className="native-select" value={input.network} onChange={event => update('network',event.target.value)} aria-invalid={Boolean(fields.network)}>{networks.map(network => <option key={network}>{network}</option>)}</select>{fields.network && <span role="alert">{fields.network}</span>}</label>
    <label className="field">Tipo de carteira<select className="native-select" value={input.provider} onChange={event => update('provider',event.target.value)} aria-invalid={Boolean(fields.provider)}>{providers.map(provider => <option key={provider}>{provider}</option>)}</select>{fields.provider && <span role="alert">{fields.provider}</span>}</label>
    <div className="md:col-span-2"><FormField label="Endereço da carteira" required value={input.address} maxLength={80} onChange={event => update('address',event.target.value.trim())} error={fields.address} hint="Use somente um endereço fictício válido para a rede selecionada." /></div>
    <FormField label="Código de indicação" required value={input.referral} maxLength={80} onChange={event => update('referral',event.target.value)} error={fields.referral} />
    <FormField label="Nome ENS (opcional)" value={input.ens} maxLength={80} onChange={event => update('ens',event.target.value)} error={fields.ens} />
    <div className="md:col-span-2"><Button type="submit" disabled={mutation.isPending}>{mutation.isPending ? 'Salvando…' : 'Salvar carteira'}</Button>{mutation.isError && <p role="alert" className="mt-4 text-destructive">{purchaseError(mutation.error)}</p>}{mutation.isSuccess && <p role="status" className="mt-3">Carteira salva.</p>}</div>
  </form>
}
