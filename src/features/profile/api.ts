import { queryOptions } from '@tanstack/react-query'
import { http } from '@/lib/http'
import type { PasswordInput,Profile,ProfileInput } from './contracts'
export interface ProfileIdentity {userId:string;token:string}
export const profileKey = (userId:string) => ['private',userId,'profile'] as const
const headers = (identity:ProfileIdentity) => ({Authorization:`Bearer ${identity.token}`})
export const profileOptions = (identity:ProfileIdentity) => queryOptions({queryKey:profileKey(identity.userId),queryFn:async ({signal}) => (await http.get<Profile>('/profile',{headers:headers(identity),signal})).data,staleTime:0})
export async function saveProfile(identity:ProfileIdentity,input:ProfileInput) {return (await http.patch<Profile>('/profile',input,{headers:headers(identity)})).data}
export async function changePassword(identity:ProfileIdentity,input:PasswordInput) {await http.post('/profile/password',input,{headers:headers(identity)})}
