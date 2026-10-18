# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: commerce.spec.ts >> price update reaches checkout through Socket.IO and requires another review
- Location: tests\e2e\commerce.spec.ts:73:1

# Error details

```
Error: expect(locator).toHaveText(expected) failed

Locator: getByRole('dialog', { name: 'Compra confirmada na simulação' }).getByTestId('purchase-total')
Expected: "1.2916 ETH"
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toHaveText" getByRole('dialog', { name: 'Compra confirmada na simulação' }).getByTestId('purchase-total') with timeout 5000ms
  - waiting for getByRole('dialog', { name: 'Compra confirmada na simulação' }).getByTestId('purchase-total')

```

```yaml
- dialog:
  - heading "Compra confirmada na simulação" [level=2]
  - paragraph: Seus NFTs constam no recibo abaixo. Não houve transferência blockchain real.
  - term: ID da transação simulada
  - definition: sim-08326659-9038-4326-9a9b-f0f40c6920c0
  - term: Data
  - definition: 17/10/2026, 19:56:52
  - term: Carteira
  - definition: Principal · MetaMask
  - term: Rede
  - definition: Ethereum
  - heading "Detalhes da transação" [level=2]
  - list:
    - listitem: "Emerald Ape #042 Edição 1/50 × 1 1.29 ETH"
  - heading "Total do pedido" [level=2]
  - term: Subtotal
  - definition: 1.29 ETH
  - term: Desconto do lançamento
  - definition: − 0 ETH
  - term: Taxa de rede
  - definition: 0.0016 ETH
  - term: Total
  - definition: 1.2916 ETH
  - paragraph: Este recibo preserva o snapshot confirmado. O identificador acima é simulado e não possui link para explorador real.
  - link "Continuar explorando":
    - /url: /
  - button "Fechar":
    - img
    - text: Fechar
```

# Test source

```ts
  1   | import { expect,test } from '@playwright/test'
  2   | import { loginViaApi } from './auth-helpers'
  3   | import { addFromDetail,commercePost,prepareCheckout,reviewCheckout,walletFixture } from './commerce-helpers'
  4   |
  5   | test('guest cart validates coupons and quantities, survives refresh and merges on real login',async ({page}) => {
  6   |   await addFromDetail(page,2)
  7   |   const item = page.getByTestId('cart-item-emerald-ape-fifty')
  8   |   await item.getByRole('button',{name:'Aumentar quantidade'}).click()
  9   |   await expect(item.getByRole('group',{name:'Quantidade',exact:true})).toContainText('3')
  10  |   await item.getByRole('button',{name:'Diminuir quantidade'}).click()
  11  |   await expect(item.getByRole('group',{name:'Quantidade',exact:true})).toContainText('2')
  12  |   for(const [code,message] of [['WRONG','Cupom inválido.'],['EXPIRED','Este cupom expirou.']]) {await page.getByLabel('Código promocional').fill(code!);await page.getByRole('button',{name:'Aplicar cupom',exact:true}).click();await expect(page.getByRole('alert')).toContainText(message!)}
  13  |   await page.getByLabel('Código promocional').fill('KURIO10');await page.getByRole('button',{name:'Aplicar cupom',exact:true}).click()
  14  |   await expect(page.getByTestId('purchase-total')).toHaveText('2.1436 ETH')
  15  |   await page.reload();await expect(page.getByTestId('purchase-total')).toHaveText('2.1436 ETH')
  16  |   await page.getByRole('link',{name:'Conectar e finalizar',exact:true}).click()
  17  |   await expect(page).toHaveURL(/login.*returnTo/)
  18  |   await page.getByRole('textbox',{name:'E-mail',exact:true}).fill('ana@example.com');await page.getByLabel(/^Senha/).fill('Collector123!');await page.getByRole('button',{name:'Entrar',exact:true}).last().click()
  19  |   await expect(page).toHaveURL('/checkout')
  20  |   await page.goto('/cart');await expect(page.getByTestId('purchase-total')).toHaveText('2.1436 ETH')
  21  |   await page.getByRole('button',{name:'Remover cupom',exact:true}).click();await expect(page.getByTestId('purchase-total')).toHaveText('2.3816 ETH')
  22  |   await loginViaApi(page,'bruno@example.com');await page.goto('/cart');await expect(page.getByRole('heading',{name:'Seu carrinho está vazio'})).toBeVisible()
  23  |   await loginViaApi(page);await page.goto('/cart');await expect(item).toBeVisible();await item.getByRole('button',{name:/Remover Emerald/}).click();await expect(page.getByRole('heading',{name:'Seu carrinho está vazio'})).toBeVisible()
  24  | })
  25  |
  26  | test('wallet forms validate, persist, reject duplicates and edit both slots',async ({page}) => {
  27  |   await loginViaApi(page);await page.goto('/account/wallets')
  28  |   const primary = page.getByRole('form',{name:'Carteira principal',exact:true})
  29  |   await primary.getByRole('button',{name:'Salvar carteira',exact:true}).click();await expect(primary.getByLabel('Nome de exibição')).toHaveAttribute('aria-invalid','true')
  30  |   async function fill(form:ReturnType<typeof page.getByRole>,address:string,nickname:string) {for(const [label,value] of [['Nome de exibição','Ana Colecionadora'],['Apelido da carteira',nickname],['Nome do perfil','Colecionadora'],['E-mail','ana@example.com'],['Código de indicação','DEMO'],['Nome ENS (opcional)','ana.eth'],['Endereço da carteira',address]]) await form.getByLabel(label!).fill(value!)}
  31  |   await fill(primary,'invalid','Principal');await primary.getByRole('button',{name:'Salvar carteira',exact:true}).click();await expect(primary.getByLabel('Endereço da carteira')).toHaveAttribute('aria-invalid','true')
  32  |   await primary.getByLabel('Endereço da carteira').fill(walletFixture.address);await primary.getByRole('button',{name:'Salvar carteira',exact:true}).click();await expect(primary.getByText('Carteira salva.',{exact:true})).toBeVisible()
  33  |   await page.reload();await expect(primary.getByLabel('Endereço da carteira')).toHaveValue(walletFixture.address)
  34  |   await page.getByRole('button',{name:'Adicionar carteira secundária'}).click()
  35  |   const secondary = page.getByRole('form',{name:'Carteira secundária',exact:true})
  36  |   await fill(secondary,walletFixture.address,'Reserva');await secondary.getByRole('button',{name:'Salvar carteira',exact:true}).click();await expect(secondary.getByText('Este endereço já está cadastrado.',{exact:true})).toBeVisible()
  37  |   await secondary.getByLabel('Endereço da carteira').fill(`0x${'2'.repeat(40)}`);await secondary.getByRole('button',{name:'Salvar carteira',exact:true}).click();await expect(secondary.getByText('Carteira salva.',{exact:true})).toBeVisible()
  38  |   await primary.getByLabel('Apelido da carteira').fill('Editada');await primary.getByRole('button',{name:'Salvar carteira',exact:true}).click();await expect(primary.getByText('Carteira salva.',{exact:true})).toBeVisible()
  39  |   await page.reload();await expect(primary.getByLabel('Apelido da carteira')).toHaveValue('Editada');await expect(secondary.getByLabel('Apelido da carteira')).toHaveValue('Reserva')
  40  |   expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  41  | })
  42  |
  43  | test('purchase confirms only through API, survives pending refresh and keeps an immutable receipt',async ({page}) => {
  44  |   await prepareCheckout(page);await commercePost(page,'pending');await reviewCheckout(page)
  45  |   const creations:string[] = [];page.on('request',request => {if(request.method() === 'POST' && new URL(request.url()).pathname === '/api/orders') creations.push(request.headers()['idempotency-key']!)})
  46  |   await page.getByRole('button',{name:'Confirmar compra',exact:true}).dblclick();await expect(page).toHaveURL(/\/orders\//)
  47  |   const url = page.url();await expect(page.getByRole('heading',{name:'Pedido em processamento'})).toBeVisible();await page.reload();await expect(page.getByRole('heading',{name:'Pedido em processamento'})).toBeVisible();expect(creations).toHaveLength(1)
  48  |   await commercePost(page,'settle');await page.reload()
  49  |   const receipt = page.getByRole('dialog',{name:'Compra confirmada na simulação'})
  50  |   await expect(receipt).toBeVisible();await expect(receipt.getByTestId('purchase-total')).toHaveText('1.1916 ETH')
  51  |   await test.info().attach('recibo-confirmado',{body:await page.screenshot({fullPage:true}),contentType:'image/png'})
  52  |   await page.keyboard.press('Escape');await expect(page.getByRole('button',{name:'Ver recibo',exact:true})).toBeFocused()
  53  |   await page.evaluate(async () => {await fetch('/api/demo/nfts/emerald-ape/update',{method:'POST'})});await page.reload();await expect(receipt.getByTestId('purchase-total')).toHaveText('1.1916 ETH')
  54  |   await page.goto('/cart');await expect(page.getByRole('heading',{name:'Seu carrinho está vazio'})).toBeVisible()
  55  |   await loginViaApi(page,'bruno@example.com');await page.goto(url);await expect(page.getByRole('heading',{name:'Pedido não encontrado'})).toBeVisible()
  56  | })
  57  |
  58  | test('payment refusal preserves items and a refused wallet connection can recover',async ({page}) => {
  59  |   await prepareCheckout(page);await page.getByRole('button',{name:'Desconectar carteira',exact:true}).click();await commercePost(page,'reject-connection');await page.getByRole('button',{name:'Conectar carteira',exact:true}).click();await expect(page.getByRole('alert')).toContainText('Conexão recusada')
  60  |   await page.getByRole('button',{name:'Conectar carteira',exact:true}).click();await expect(page.getByText('Carteira conectada na simulação.',{exact:true})).toBeVisible()
  61  |   await commercePost(page,'declined');await reviewCheckout(page);await page.getByRole('button',{name:'Confirmar compra',exact:true}).click();await expect(page.getByRole('heading',{name:'Pagamento recusado'})).toBeVisible();await expect(page.getByRole('dialog')).toHaveCount(0)
  62  |   await page.getByRole('link',{name:'Revisar carrinho',exact:true}).click();await expect(page.getByTestId('cart-item-emerald-ape-fifty')).toBeVisible();await expect(page.getByTestId('purchase-total')).toHaveText('1.1916 ETH')
  63  | })
  64  |
  65  | test('timeout after order creation recovers the same attempt after refresh',async ({page}) => {
  66  |   test.setTimeout(45_000)
  67  |   await prepareCheckout(page);await reviewCheckout(page);await commercePost(page,'timeout')
  68  |   const keys:string[] = [];page.on('request',request => {if(request.method() === 'POST' && new URL(request.url()).pathname === '/api/orders') keys.push(request.headers()['idempotency-key']!)})
  69  |   await page.getByRole('button',{name:'Confirmar compra',exact:true}).click();await expect(page.getByRole('alert')).toContainText('demorou demais',{timeout:15_000})
  70  |   await page.reload();await page.getByRole('button',{name:'Recuperar pedido',exact:true}).click();await expect(page).toHaveURL(/\/orders\//);await expect(page.getByRole('dialog',{name:'Compra confirmada na simulação'})).toBeVisible();expect(keys).toHaveLength(2);expect(new Set(keys).size).toBe(1)
  71  | })
  72  |
  73  | test('price update reaches checkout through Socket.IO and requires another review',async ({page}) => {
  74  |   await prepareCheckout(page);await reviewCheckout(page)
  75  |   await page.evaluate(async () => {await fetch('/api/demo/nfts/emerald-ape/update',{method:'POST'})})
  76  |   await expect(page.getByTestId('purchase-total')).toHaveText('1.2916 ETH');await expect(page.getByRole('alert')).toContainText('Revise novamente');await expect(page.getByRole('button',{name:'Confirmar compra',exact:true})).toHaveCount(0)
> 77  |   await reviewCheckout(page);await page.getByRole('button',{name:'Confirmar compra',exact:true}).click();await expect(page.getByRole('dialog',{name:'Compra confirmada na simulação'}).getByTestId('purchase-total')).toHaveText('1.2916 ETH')
      |                                                                                                                                                                                                                       ^ Error: expect(locator).toHaveText(expected) failed
  78  | })
  79  |
  80  | test('expired coupon during review blocks order creation and preserves the cart',async ({page}) => {
  81  |   await prepareCheckout(page);await page.goto('/cart');await page.getByLabel('Código promocional').fill('KURIO10');await page.getByRole('button',{name:'Aplicar cupom',exact:true}).click();await expect(page.getByTestId('purchase-total')).toHaveText('1.0726 ETH');await page.getByRole('link',{name:'Conectar e finalizar',exact:true}).click();await reviewCheckout(page)
  82  |   await commercePost(page,'expire-coupon');await page.getByRole('button',{name:'Confirmar compra',exact:true}).click();await expect(page.getByRole('alert').filter({hasText:'O cupom expirou.'})).toBeVisible();await expect(page).toHaveURL('/checkout')
  83  |   await page.goto('/cart');await expect(page.getByTestId('cart-item-emerald-ape-fifty')).toBeVisible();await page.getByRole('button',{name:'Remover cupom',exact:true}).click();await expect(page.getByRole('link',{name:'Conectar e finalizar',exact:true})).toHaveAttribute('aria-disabled','false')
  84  | })
  85  |
  86  | test('@visual cart and checkout use responsive functional layouts',async ({page}) => {
  87  |   await prepareCheckout(page);await page.goto('/cart');await expect(page.getByTestId('cart-item-emerald-ape-fifty')).toBeVisible();await expect(page.getByText('Atualizando preço e disponibilidade…',{exact:true})).toHaveCount(0);await page.evaluate(() => document.fonts.ready);await expect(page).toHaveScreenshot('cart.png',{fullPage:true,animations:'disabled'})
  88  |   await page.getByRole('link',{name:'Conectar e finalizar',exact:true}).click();await expect(page.getByText('Carteira conectada na simulação.',{exact:true})).toBeVisible();await page.evaluate(() => document.fonts.ready);await expect(page).toHaveScreenshot('checkout.png',{fullPage:true,animations:'disabled'})
  89  |   expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  90  | })
  91  |
  92  | test('session expiry at checkout preserves collector draft and returns after login',async ({page}) => {
  93  |   await prepareCheckout(page)
  94  |   await page.getByLabel('Nome de exibição').fill('Ana Retomada')
  95  |   await page.getByLabel('Observação do colecionador (opcional)').fill('Manter este contexto após expirar.')
  96  |   await page.evaluate(async () => {await fetch('/api/demo/auth',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'expire'})})
  97  |   await page.reload();await expect(page).toHaveURL(/login.*returnTo=/)
  98  |   expect(new URL(page.url()).searchParams.get('returnTo')).toBe('/checkout')
  99  |   await page.getByRole('textbox',{name:'E-mail',exact:true}).fill('ana@example.com');await page.getByLabel(/^Senha/).fill('Collector123!');await page.getByRole('button',{name:'Entrar',exact:true}).last().click()
  100 |   await expect(page).toHaveURL('/checkout');await expect(page.getByLabel('Nome de exibição')).toHaveValue('Ana Retomada');await expect(page.getByLabel('Observação do colecionador (opcional)')).toHaveValue('Manter este contexto após expirar.')
  101 | })
  102 |
  103 | test('cart shows slow skeleton, empty result, HTTP error and retry recovery through MSW',async ({page}) => {
  104 |   await page.goto('/');await expect(page.getByTestId('nft-emerald-ape')).toBeVisible()
  105 |   async function scenario(value:string) {await page.evaluate(async scenario => {await fetch('/api/demo/scenario',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({scenario})})},value)}
  106 |   await scenario('slow');await page.getByRole('link',{name:'Abrir carrinho',exact:true}).click();await expect(page.getByRole('status',{name:'Carregando resumo da compra'})).toBeVisible();await expect(page.getByRole('heading',{name:'Seu carrinho está vazio'})).toBeVisible()
  107 |   await scenario('default');await page.getByRole('link',{name:'Explorar coleção',exact:true}).first().click();await expect(page.getByTestId('nft-emerald-ape')).toBeVisible();await scenario('error');await page.getByRole('link',{name:'Abrir carrinho',exact:true}).click();await expect(page.getByRole('alert')).toContainText('temporariamente indisponível')
  108 |   await scenario('default');await page.getByRole('button',{name:'Tentar novamente',exact:true}).click();await expect(page.getByRole('heading',{name:'Seu carrinho está vazio'})).toBeVisible()
  109 | })
  110 |
```