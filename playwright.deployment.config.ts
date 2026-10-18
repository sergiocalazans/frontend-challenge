import { defineConfig } from '@playwright/test'
const target=process.env.DEPLOYMENT_URL
if(!target) throw new Error('Defina DEPLOYMENT_URL. Nenhum deploy será criado por este comando.')
const url=new URL(target)
if(url.protocol!=='https:' && !['localhost','127.0.0.1'].includes(url.hostname)) throw new Error('A URL pública deve usar HTTPS.')
export default defineConfig({
  testDir:'./tests/deployment',workers:1,retries:0,
  reporter:[['list'],['html',{outputFolder:'reports/deployment',open:'never'}],['json',{outputFile:'reports/deployment/results.json'}]],
  use:{baseURL:url.origin,trace:'retain-on-failure',screenshot:'only-on-failure',locale:'pt-BR',reducedMotion:'reduce'},
  projects:[
    {name:'deployment-desktop',use:{browserName:'chromium',viewport:{width:1440,height:1000}}},
    {name:'deployment-tablet',use:{browserName:'chromium',viewport:{width:768,height:1024}}},
    {name:'deployment-mobile',use:{browserName:'chromium',viewport:{width:390,height:844},isMobile:true,hasTouch:true}},
  ],
})
