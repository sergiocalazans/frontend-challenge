import { expect,test } from '@playwright/test'
import { commercePost,prepareCheckout,reviewCheckout } from './commerce-helpers'

async function realtime(page: Parameters<typeof prepareCheckout>[0],action:string,orderId?:string) {
  await page.evaluate(async input => {
    const response = await fetch('/api/demo/realtime',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(input)})
    if (!response.ok) throw new Error(`Realtime scenario failed: ${response.status}`)
  },{action,orderId})
}
async function pending(page: Parameters<typeof prepareCheckout>[0]) {
  await prepareCheckout(page);await commercePost(page,'pending');await reviewCheckout(page)
  await page.getByRole('button',{name:'Confirmar compra',exact:true}).click()
  await expect(page.getByRole('heading',{name:'Pedido em processamento'})).toBeVisible()
  await expect(page.getByText('Atualizações do pedido conectadas.',{exact:true})).toBeVisible()
  return new URL(page.url()).pathname.split('/').pop()!
}

test('private Socket.IO event reconciles REST before showing a confirmed receipt',async ({page}) => {
  const orderId = await pending(page)
  let reads = 0,creations = 0
  page.on('request',request => {const path = new URL(request.url()).pathname;if(path === `/api/orders/${orderId}` && request.method() === 'GET') reads++;if(path === '/api/orders' && request.method() === 'POST') creations++})
  await commercePost(page,'settle')
  // Default assertion deadline is below the 15s fallback polling interval.
  const receipt = page.getByRole('dialog',{name:'Compra confirmada na simulação'})
  await expect(receipt).toBeVisible()
  expect(reads).toBeGreaterThan(0);expect(creations).toBe(0)
  await realtime(page,'duplicate',orderId);await realtime(page,'stale',orderId)
  await receipt.getByTestId('purchase-total').scrollIntoViewIfNeeded()
  await expect(receipt.getByTestId('purchase-total')).toHaveText('1.1916 ETH')
  await test.info().attach('realtime-confirmado',{body:await page.screenshot({fullPage:true}),contentType:'image/png'})
  await page.reload();await expect(receipt).toBeVisible();expect(creations).toBe(0)
})

test('transport interruption recovers a pending order through REST without creating another order',async ({page}) => {
  const orderId = await pending(page),url = page.url()
  let creations = 0
  page.on('request',request => {if(request.method() === 'POST' && new URL(request.url()).pathname === '/api/orders') creations++})
  await realtime(page,'disconnect')
  await expect(page.getByText('Reconectando atualizações. O pedido continua sendo consultado com segurança.',{exact:true})).toBeVisible()
  await commercePost(page,'settle')
  await expect(page.getByText('Atualizações do pedido conectadas.',{exact:true})).toBeVisible()
  await expect(page.getByRole('dialog',{name:'Compra confirmada na simulação'})).toBeVisible()
  await realtime(page,'stale',orderId)
  expect(page.url()).toBe(url);expect(creations).toBe(0)
  await page.reload();await expect(page.getByRole('dialog',{name:'Compra confirmada na simulação'})).toBeVisible()
})

test('private stream expiration returns to login and preserves the pending order context',async ({page}) => {
  await pending(page)
  const path = new URL(page.url()).pathname
  await page.evaluate(async () => {await fetch('/api/demo/auth',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'expire'})})})
  await expect(page).toHaveURL(/\/login\?returnTo=/)
  expect(new URL(page.url()).searchParams.get('returnTo')).toBe(path)
  await page.getByRole('textbox',{name:'E-mail',exact:true}).fill('ana@example.com')
  await page.getByLabel(/^Senha/).fill('Collector123!')
  await page.getByRole('button',{name:'Entrar',exact:true}).last().click()
  await expect(page).toHaveURL(path)
  await expect(page.getByRole('heading',{name:'Pedido em processamento'})).toBeVisible()
  await commercePost(page,'settle')
  await expect(page.getByRole('dialog',{name:'Compra confirmada na simulação'})).toBeVisible()
})
