import { readFileSync } from 'node:fs'
import { expect,test } from 'vitest'
import axios from 'axios'
import { readSessionStore } from '@/mocks/session-store'
import type { Profile } from '@/features/profile/contracts'
const http=axios.create({baseURL:'http://localhost/api'})

async function login(email='ana@example.com',password='Collector123!') {return (await http.post('/session',{email,password})).data as {token:string;user:{id:string}}}
const config = (token:string) => ({headers:{Authorization:`Bearer ${token}`}})
const get = async (token:string) => (await http.get<Profile>('/profile',config(token))).data

test('profile requires a session and persists canonical account data without crossing owners',async () => {
  await expect(http.get('/profile')).rejects.toMatchObject({response:{status:401}})
  const ana=await login(),bruno=await login('bruno@example.com'),profile=await get(ana.token)
  const avatar=`data:image/webp;base64,${readFileSync('public/images/emerald-ape.webp').toString('base64')}`
  const saved=(await http.patch<Profile>('/profile',{...profile,id:'bruno',name:'Ana Editada',email:'ana.editada@example.com',username:'ana_editada',avatar},config(ana.token))).data
  expect(saved).toMatchObject({id:'ana',name:'Ana Editada',email:'ana.editada@example.com',avatar})
  expect(await get(ana.token)).toEqual(saved)
  expect((await http.get('/session',config(ana.token))).data.user.name).toBe('Ana Editada')
  expect(await get(bruno.token)).toMatchObject({id:'bruno',name:'Bruno Colecionador',avatar:null})
  expect((await login('ana.editada@example.com')).user.id).toBe('ana')
  await http.patch('/profile',{...saved,avatar:null},config(ana.token));expect((await get(ana.token)).avatar).toBeNull()
  const wallet={slot:'primary',displayName:'Ana',nickname:'Carteira principal',profileName:'Colecionadora',network:'Ethereum',address:'0x1111111111111111111111111111111111111111',provider:'MetaMask',email:'ana.editada@example.com',referral:'DEMO',ens:''}
  await http.put('/wallets/primary',wallet,config(ana.token));expect((await get(ana.token)).walletNickname).toBe('Carteira principal')
  await http.patch('/profile',{...saved,avatar:null,walletNickname:'Renomeada no perfil'},config(ana.token))
  expect((await http.get('/wallets',config(ana.token))).data.items[0].nickname).toBe('Renomeada no perfil')
})

test('profile reports validation, account conflicts and invalid avatar content without changing data',async () => {
  const {token}=await login(),profile=await get(token)
  await expect(http.patch('/profile',{...profile,name:'',email:'invalid'},config(token))).rejects.toMatchObject({response:{status:422,data:{fields:{name:expect.any(String),email:expect.any(String)}}}})
  await expect(http.patch('/profile',{...profile,email:'bruno@example.com'},config(token))).rejects.toMatchObject({response:{status:409,data:{code:'EMAIL_CONFLICT'}}})
  await expect(http.patch('/profile',{...profile,username:'BRUNO'},config(token))).rejects.toMatchObject({response:{status:409,data:{code:'USERNAME_CONFLICT'}}})
  await expect(http.patch('/profile',{...profile,avatar:'data:image/webp;base64,SGVsbG8='},config(token))).rejects.toMatchObject({response:{status:422,data:{fields:{avatar:expect.any(String)}}}})
  expect(await get(token)).toEqual(profile)
})

test('password verifies current credentials, stores a new hash and revokes other sessions only',async () => {
  const one=await login(),two=await login(),input={currentPassword:'wrong',newPassword:'NewCollector456!',confirmPassword:'NewCollector456!'}
  await expect(http.post('/profile/password',input,config(one.token))).rejects.toMatchObject({response:{status:422,data:{fields:{currentPassword:'Senha atual incorreta.'}}}})
  await expect(http.post('/profile/password',{...input,currentPassword:'Collector123!',confirmPassword:'different'},config(one.token))).rejects.toMatchObject({response:{status:422}})
  const before=readSessionStore().users.find(user => user.id==='ana')!.passwordHash
  await http.post('/profile/password',{...input,currentPassword:'Collector123!'},config(one.token))
  expect((await get(one.token)).id).toBe('ana')
  await expect(get(two.token)).rejects.toMatchObject({response:{status:401}})
  await expect(login()).rejects.toMatchObject({response:{status:401}})
  expect((await login('ana@example.com',input.newPassword)).user.id).toBe('ana')
  const database=readSessionStore()
  expect(database.users.find(user => user.id==='ana')!.passwordHash).not.toBe(before)
  expect(JSON.stringify(database)).not.toContain(input.newPassword)
})

test('expired sessions cannot commit a delayed profile mutation',async () => {
  const {token}=await login(),profile=await get(token)
  await http.post('/demo/scenario',{scenario:'slow'})
  const write=http.patch('/profile',{...profile,name:'Late write'},config(token))
  const rejected=expect(write).rejects.toMatchObject({response:{status:401}})
  await http.post('/demo/auth',{action:'expire'})
  await rejected
  expect(readSessionStore().users.find(user => user.id==='ana')!.name).toBe('Ana Colecionadora')
})
