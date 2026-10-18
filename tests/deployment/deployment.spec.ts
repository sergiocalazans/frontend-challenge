import { createHash } from 'node:crypto'
import { expect,test } from '@playwright/test'
import { loginViaApi } from '../e2e/auth-helpers'
import { addFromDetail,commercePost,prepareCheckout,reviewCheckout,seedWallet } from '../e2e/commerce-helpers'

test('deployment serves the actual worker and build metadata without rewriting reserved paths',async ({request},info) => {
  const metadataResponse=await request.get('/build-info.json');expect(metadataResponse.status()).toBe(200)
  const metadata=await metadataResponse.json() as {commit:string;mocksEnabled:boolean;workerSha256:string}
  expect(metadata.mocksEnabled).toBe(true);expect(metadata.commit).toMatch(/^[a-f0-9]{40}$/)
  if(process.env.DEPLOYMENT_EXPECTED_SHA) expect(metadata.commit).toBe(process.env.DEPLOYMENT_EXPECTED_SHA)
  const worker=await request.get('/mockServiceWorker.js');expect(worker.status()).toBe(200)
  expect(worker.headers()['content-type']).toMatch(/javascript/)
  expect(worker.headers()['cache-control']).toContain('no-cache')
  expect(createHash('sha256').update(await worker.body()).digest('hex')).toBe(metadata.workerSha256)
  const home=await request.get('/');const html=await home.text();expect(html).toContain('<div id="root">')
  for(const path of ['/api/deployment-probe','/assets/missing-deployment.js']) {const response=await request.get(path);expect(response.status()).toBe(404);expect(await response.text()).not.toContain('<div id="root">')}
  await info.attach('build-publico',{body:JSON.stringify(metadata,null,2),contentType:'application/json'})
})

test('deep links, profile, wallets, authenticated session and cart survive refresh',async ({page}) => {
  await loginViaApi(page);await page.goto('/account/profile')
  await expect(page.getByRole('heading',{name:'Perfil do colecionador',exact:true})).toBeVisible()
  const profile=page.getByRole('form',{name:'Dados do perfil'})
  await expect(profile.getByLabel('Nome de exibição')).toHaveValue('Ana Colecionadora')
  await profile.getByLabel('Nome de exibição').fill('Ana Demonstração');await profile.getByRole('button',{name:'Salvar perfil',exact:true}).click();await expect(profile.getByRole('status')).toHaveText('Perfil salvo.')
  await page.reload();await expect(profile.getByLabel('Nome de exibição')).toHaveValue('Ana Demonstração')
  await seedWallet(page)
  await addFromDetail(page);await page.reload();await expect(page.getByTestId('cart-item-emerald-ape-fifty')).toBeVisible()
  await page.goto('/account/wallets');const form=page.getByRole('form',{name:'Carteira principal'})
  await expect(form.getByLabel('Apelido da carteira')).toHaveValue('Principal')
  await form.getByLabel('Apelido da carteira').fill('Principal demo');await form.getByRole('button',{name:'Salvar carteira',exact:true}).click();await expect(form.getByRole('status')).toHaveText('Carteira salva.')
  await page.reload();await expect(form.getByLabel('Apelido da carteira')).toHaveValue('Principal demo')
})

test('real Socket.IO revalidates price and recovers an interrupted pending order without another purchase',async ({page}) => {
  await prepareCheckout(page);await reviewCheckout(page)
  await page.evaluate(async () => {const response=await fetch('/api/demo/nfts/emerald-ape/update',{method:'POST'});if(!response.ok) throw new Error('Scenario failed')})
  await expect(page.getByTestId('purchase-total')).toHaveText('1.2916 ETH');await expect(page.getByRole('button',{name:'Confirmar compra',exact:true})).toHaveCount(0)
  await reviewCheckout(page);await commercePost(page,'pending')
  let creations=0;page.on('request',request => {if(request.method()==='POST' && new URL(request.url()).pathname==='/api/orders') creations++})
  await page.getByRole('button',{name:'Confirmar compra',exact:true}).click()
  await expect(page.getByText('Atualizações do pedido conectadas.',{exact:true})).toBeVisible();const orderUrl=page.url()
  await page.evaluate(async () => {const response=await fetch('/api/demo/realtime',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'disconnect'})});if(!response.ok) throw new Error('Scenario failed')})
  await expect(page.getByText('Reconectando atualizações. O pedido continua sendo consultado com segurança.',{exact:true})).toBeVisible()
  await commercePost(page,'settle');await expect(page.getByRole('dialog',{name:'Compra confirmada na simulação'})).toBeVisible()
  expect(creations).toBe(1);expect(page.url()).toBe(orderUrl)
  await page.reload();await expect(page.getByRole('dialog').getByTestId('purchase-total')).toHaveText('1.2916 ETH');expect(creations).toBe(1)
})

test('deterministic MSW scenarios expose loading, empty, error and reset recovery',async ({page}) => {
  await page.goto('/design-system');await expect(page.getByTestId('nft-emerald-ape')).toBeVisible()
  const scenario=page.getByLabel('Cenário MSW')
  await scenario.selectOption('slow');await expect(page.getByRole('status',{name:'Carregando NFTs'})).toBeVisible();await expect(page.getByTestId('nft-emerald-ape')).toBeVisible();await expect(scenario).toBeEnabled()
  await scenario.selectOption('empty');await expect(page.getByText('Nenhum NFT encontrado',{exact:true})).toBeVisible();await expect(scenario).toBeEnabled()
  await scenario.selectOption('error');await expect(page.getByRole('alert')).toContainText('temporariamente indisponível');await expect(scenario).toBeEnabled()
  await scenario.selectOption('default');await expect(page.getByTestId('nft-emerald-ape')).toBeVisible()
  await page.reload();await expect(page.getByTestId('nft-emerald-ape')).toBeVisible()
})
