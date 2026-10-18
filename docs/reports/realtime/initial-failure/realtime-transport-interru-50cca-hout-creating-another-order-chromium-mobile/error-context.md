# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: realtime.spec.ts >> transport interruption recovers a pending order through REST without creating another order
- Location: tests\e2e\realtime.spec.ts:34:1

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('Atualizações do pedido conectadas.', { exact: true })
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" getByText('Atualizações do pedido conectadas.', { exact: true }) with timeout 5000ms
  - waiting for getByText('Atualizações do pedido conectadas.', { exact: true })

```

```yaml
- link "Pular para conteúdo":
  - /url: "#main-content"
- main:
  - heading "Pedido" [level=1]
  - status: Reconectando atualizações. O pedido continua sendo consultado com segurança.
  - heading "Pedido em processamento" [level=2]
  - status: Aguardando resultado da simulação. Esta página consulta o pedido existente; recarregar não cria outra compra.
  - paragraph: "ID: b440e958-430f-4e53-b2cf-34aab67b01ef"
  - status "Carregando resumo da compra"
```

# Test source

```ts
  1  | import { expect,test } from '@playwright/test'
  2  | import { commercePost,prepareCheckout,reviewCheckout } from './commerce-helpers'
  3  |
  4  | async function realtime(page: Parameters<typeof prepareCheckout>[0],action:string,orderId?:string) {
  5  |   await page.evaluate(async input => {
  6  |     const response = await fetch('/api/demo/realtime',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(input)})
  7  |     if (!response.ok) throw new Error(`Realtime scenario failed: ${response.status}`)
  8  |   },{action,orderId})
  9  | }
  10 | async function pending(page: Parameters<typeof prepareCheckout>[0]) {
  11 |   await prepareCheckout(page);await commercePost(page,'pending');await reviewCheckout(page)
  12 |   await page.getByRole('button',{name:'Confirmar compra',exact:true}).click()
  13 |   await expect(page.getByRole('heading',{name:'Pedido em processamento'})).toBeVisible()
  14 |   await expect(page.getByText('Atualizações do pedido conectadas.',{exact:true})).toBeVisible()
  15 |   return new URL(page.url()).pathname.split('/').pop()!
  16 | }
  17 |
  18 | test('private Socket.IO event reconciles REST before showing a confirmed receipt',async ({page}) => {
  19 |   const orderId = await pending(page)
  20 |   let reads = 0,creations = 0
  21 |   page.on('request',request => {const path = new URL(request.url()).pathname;if(path === `/api/orders/${orderId}` && request.method() === 'GET') reads++;if(path === '/api/orders' && request.method() === 'POST') creations++})
  22 |   await commercePost(page,'settle')
  23 |   // Default assertion deadline is below the 15s fallback polling interval.
  24 |   const receipt = page.getByRole('dialog',{name:'Compra confirmada na simulação'})
  25 |   await expect(receipt).toBeVisible()
  26 |   expect(reads).toBeGreaterThan(0);expect(creations).toBe(0)
  27 |   await realtime(page,'duplicate',orderId);await realtime(page,'stale',orderId)
  28 |   await receipt.getByTestId('purchase-total').scrollIntoViewIfNeeded()
  29 |   await expect(receipt.getByTestId('purchase-total')).toHaveText('1.1916 ETH')
  30 |   await test.info().attach('realtime-confirmado',{body:await page.screenshot({fullPage:true}),contentType:'image/png'})
  31 |   await page.reload();await expect(receipt).toBeVisible();expect(creations).toBe(0)
  32 | })
  33 |
  34 | test('transport interruption recovers a pending order through REST without creating another order',async ({page}) => {
  35 |   const orderId = await pending(page),url = page.url()
  36 |   let creations = 0
  37 |   page.on('request',request => {if(request.method() === 'POST' && new URL(request.url()).pathname === '/api/orders') creations++})
  38 |   await realtime(page,'disconnect')
  39 |   await expect(page.getByText('Reconectando atualizações. O pedido continua sendo consultado com segurança.',{exact:true})).toBeVisible()
  40 |   await commercePost(page,'settle')
> 41 |   await expect(page.getByText('Atualizações do pedido conectadas.',{exact:true})).toBeVisible()
     |                                                                                   ^ Error: expect(locator).toBeVisible() failed
  42 |   await expect(page.getByRole('dialog',{name:'Compra confirmada na simulação'})).toBeVisible()
  43 |   await realtime(page,'stale',orderId)
  44 |   expect(page.url()).toBe(url);expect(creations).toBe(0)
  45 |   await page.reload();await expect(page.getByRole('dialog',{name:'Compra confirmada na simulação'})).toBeVisible()
  46 | })
  47 |
  48 | test('private stream expiration returns to login and preserves the pending order context',async ({page}) => {
  49 |   await pending(page)
  50 |   const path = new URL(page.url()).pathname
  51 |   await page.evaluate(async () => {await fetch('/api/demo/auth',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'expire'})})})
  52 |   await expect(page).toHaveURL(/\/login\?returnTo=/)
  53 |   expect(new URL(page.url()).searchParams.get('returnTo')).toBe(path)
  54 |   await page.getByRole('textbox',{name:'E-mail',exact:true}).fill('ana@example.com')
  55 |   await page.getByLabel(/^Senha/).fill('Collector123!')
  56 |   await page.getByRole('button',{name:'Entrar',exact:true}).last().click()
  57 |   await expect(page).toHaveURL(path)
  58 |   await expect(page.getByRole('heading',{name:'Pedido em processamento'})).toBeVisible()
  59 |   await commercePost(page,'settle')
  60 |   await expect(page.getByRole('dialog',{name:'Compra confirmada na simulação'})).toBeVisible()
  61 | })
  62 |
```