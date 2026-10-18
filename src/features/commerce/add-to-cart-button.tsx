import { useRef } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { readToken } from '@/features/auth/token'
import { purchaseError } from './errors'
import { addCartItem,cartKey,type CommerceIdentity } from './api'
import { useCommerceIdentity } from './use-commerce'
import type { CartInput } from './contracts'
export function AddToCartButton({input,disabled=false,label='Comprar NFT'}:{input:CartInput;disabled?:boolean;label?:string}) {
  const {context,ready,session} = useCommerceIdentity(),client = useQueryClient(),navigate = useNavigate()
  const operation = useRef<{signature:string;key:string} | null>(null)
  const mutation = useMutation({onMutate:async ({context}:{context:CommerceIdentity;input:CartInput;key:string}) => {await client.cancelQueries({queryKey:cartKey(context),exact:true})},mutationFn:async ({context,input,key}:{context:CommerceIdentity;input:CartInput;key:string}) => ({cart:await addCartItem(context,input,key),context}),onSuccess:async ({cart,context}) => {
    if(context.token !== readToken()) return
    client.setQueryData(cartKey(context),cart)
    await navigate({to:'/cart',search:{}})
  }})
  function add() {
    const signature = JSON.stringify({input,userId:context.userId,guestId:context.guestId})
    if(operation.current?.signature !== signature) operation.current = {signature,key:crypto.randomUUID()}
    mutation.mutate({context,input,key:operation.current.key})
  }
  return <div><Button disabled={disabled || !ready || mutation.isPending} onClick={add}>{mutation.isPending ? 'Adicionando…' : label}</Button>{session.isError && <p role="alert">Não foi possível verificar a sessão. Recarregue para tentar novamente.</p>}{mutation.isError && <p role="alert" className="mt-3 text-destructive">{purchaseError(mutation.error)}</p>}</div>
}
