import { expect,test } from '@playwright/test'
import { loginViaApi } from './auth-helpers'
import { addFromDetail,commercePost,prepareCheckout,reviewCheckout,walletFixture } from './commerce-helpers'

test('guest cart validates coupons and quantities, survives refresh and merges on real login',async ({page}) => {
  await addFromDetail(page,2)
  const item = page.getByTestId('cart-item-emerald-ape-fifty')
  await item.getByRole('button',{name:'Aumentar quantidade'}).click()
  await expect(item.getByRole('group',{name:'Quantidade',exact:true})).toContainText('3')
  await item.getByRole('button',{name:'Diminuir quantidade'}).click()
  await expect(item.getByRole('group',{name:'Quantidade',exact:true})).toContainText('2')
  for(const [code,message] of [['WRONG','Cupom inválido.'],['EXPIRED','Este cupom expirou.']]) {await page.getByLabel('Código promocional').fill(code!);await page.getByRole('button',{name:'Aplicar cupom',exact:true}).click();await expect(page.getByRole('alert')).toContainText(message!)}
  await page.getByLabel('Código promocional').fill('KURIO10');await page.getByRole('button',{name:'Aplicar cupom',exact:true}).click()
  await expect(page.getByTestId('purchase-total')).toHaveText('2.1436 ETH')
  await page.reload();await expect(page.getByTestId('purchase-total')).toHaveText('2.1436 ETH')
  await page.getByRole('link',{name:'Conectar e finalizar',exact:true}).click()
  await expect(page).toHaveURL(/login.*returnTo/)
  await page.getByRole('textbox',{name:'E-mail',exact:true}).fill('ana@example.com');await page.getByLabel(/^Senha/).fill('Collector123!');await page.getByRole('button',{name:'Entrar',exact:true}).last().click()
  await expect(page).toHaveURL('/checkout')
  await page.goto('/cart');await expect(page.getByTestId('purchase-total')).toHaveText('2.1436 ETH')
  await page.getByRole('button',{name:'Remover cupom',exact:true}).click();await expect(page.getByTestId('purchase-total')).toHaveText('2.3816 ETH')
  await loginViaApi(page,'bruno@example.com');await page.goto('/cart');await expect(page.getByRole('heading',{name:'Seu carrinho está vazio'})).toBeVisible()
  await loginViaApi(page);await page.goto('/cart');await expect(item).toBeVisible();await item.getByRole('button',{name:/Remover Emerald/}).click();await expect(page.getByRole('heading',{name:'Seu carrinho está vazio'})).toBeVisible()
})

test('wallet forms validate, persist, reject duplicates and edit both slots',async ({page}) => {
  await loginViaApi(page);await page.goto('/account/wallets')
  const primary = page.getByRole('form',{name:'Carteira principal',exact:true})
  await primary.getByRole('button',{name:'Salvar carteira',exact:true}).click();await expect(primary.getByLabel('Nome de exibição')).toHaveAttribute('aria-invalid','true')
  async function fill(form:ReturnType<typeof page.getByRole>,address:string,nickname:string) {for(const [label,value] of [['Nome de exibição','Ana Colecionadora'],['Apelido da carteira',nickname],['Nome do perfil','Colecionadora'],['E-mail','ana@example.com'],['Código de indicação','DEMO'],['Nome ENS (opcional)','ana.eth'],['Endereço da carteira',address]]) await form.getByLabel(label!).fill(value!)}
  await fill(primary,'invalid','Principal');await primary.getByRole('button',{name:'Salvar carteira',exact:true}).click();await expect(primary.getByLabel('Endereço da carteira')).toHaveAttribute('aria-invalid','true')
  await primary.getByLabel('Endereço da carteira').fill(walletFixture.address);await primary.getByRole('button',{name:'Salvar carteira',exact:true}).click();await expect(primary.getByText('Carteira salva.',{exact:true})).toBeVisible()
  await page.reload();await expect(primary.getByLabel('Endereço da carteira')).toHaveValue(walletFixture.address)
  await page.getByRole('button',{name:'Adicionar carteira secundária'}).click()
  const secondary = page.getByRole('form',{name:'Carteira secundária',exact:true})
  await fill(secondary,walletFixture.address,'Reserva');await secondary.getByRole('button',{name:'Salvar carteira',exact:true}).click();await expect(secondary.getByText('Este endereço já está cadastrado.',{exact:true})).toBeVisible()
  await secondary.getByLabel('Endereço da carteira').fill(`0x${'2'.repeat(40)}`);await secondary.getByRole('button',{name:'Salvar carteira',exact:true}).click();await expect(secondary.getByText('Carteira salva.',{exact:true})).toBeVisible()
  await primary.getByLabel('Apelido da carteira').fill('Editada');await primary.getByRole('button',{name:'Salvar carteira',exact:true}).click();await expect(primary.getByText('Carteira salva.',{exact:true})).toBeVisible()
  await page.reload();await expect(primary.getByLabel('Apelido da carteira')).toHaveValue('Editada');await expect(secondary.getByLabel('Apelido da carteira')).toHaveValue('Reserva')
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await test.info().attach('carteiras-cadastradas',{body:await page.screenshot({fullPage:true}),contentType:'image/png'})
})

test('purchase confirms only through API, survives pending refresh and keeps an immutable receipt',async ({page}) => {
  await prepareCheckout(page);await commercePost(page,'pending');await reviewCheckout(page)
  const creations:string[] = [];page.on('request',request => {if(request.method() === 'POST' && new URL(request.url()).pathname === '/api/orders') creations.push(request.headers()['idempotency-key']!)})
  await page.getByRole('button',{name:'Confirmar compra',exact:true}).dblclick();await expect(page).toHaveURL(/\/orders\//)
  const url = page.url();await expect(page.getByRole('heading',{name:'Pedido em processamento'})).toBeVisible();await page.reload();await expect(page.getByRole('heading',{name:'Pedido em processamento'})).toBeVisible();expect(creations).toHaveLength(1)
  await commercePost(page,'settle');await page.reload()
  const receipt = page.getByRole('dialog',{name:'Compra confirmada na simulação'})
  await expect(receipt).toBeVisible();await expect(receipt.getByTestId('purchase-total')).toHaveText('1.1916 ETH')
  await test.info().attach('recibo-confirmado',{body:await page.screenshot({fullPage:true}),contentType:'image/png'})
  await receipt.getByTestId('purchase-total').scrollIntoViewIfNeeded();await expect(receipt.getByTestId('purchase-total')).toBeVisible()
  await test.info().attach('recibo-totais',{body:await page.screenshot({fullPage:true}),contentType:'image/png'})
  await page.keyboard.press('Escape');await expect(page.getByRole('button',{name:'Ver recibo',exact:true})).toBeFocused()
  await page.evaluate(async () => {await fetch('/api/demo/nfts/emerald-ape/update',{method:'POST'})});await page.reload();await expect(receipt.getByTestId('purchase-total')).toHaveText('1.1916 ETH')
  await page.goto('/cart');await expect(page.getByRole('heading',{name:'Seu carrinho está vazio'})).toBeVisible()
  await loginViaApi(page,'bruno@example.com');await page.goto(url);await expect(page.getByRole('heading',{name:'Pedido não encontrado'})).toBeVisible()
})

test('payment refusal preserves items and a refused wallet connection can recover',async ({page}) => {
  await prepareCheckout(page);await page.getByRole('button',{name:'Desconectar carteira',exact:true}).click();await commercePost(page,'reject-connection');await page.getByRole('button',{name:'Conectar carteira',exact:true}).click();await expect(page.getByRole('alert')).toContainText('Conexão recusada')
  await page.getByRole('button',{name:'Conectar carteira',exact:true}).click();await expect(page.getByText('Carteira conectada na simulação.',{exact:true})).toBeVisible()
  await commercePost(page,'declined');await reviewCheckout(page);await page.getByRole('button',{name:'Confirmar compra',exact:true}).click();await expect(page.getByRole('heading',{name:'Pagamento recusado'})).toBeVisible();await expect(page.getByRole('dialog')).toHaveCount(0)
  await page.getByRole('link',{name:'Revisar carrinho',exact:true}).click();await expect(page.getByTestId('cart-item-emerald-ape-fifty')).toBeVisible();await expect(page.getByTestId('purchase-total')).toHaveText('1.1916 ETH')
})

test('timeout after order creation recovers the same attempt after refresh',async ({page}) => {
  test.setTimeout(45_000)
  await prepareCheckout(page);await reviewCheckout(page);await commercePost(page,'timeout')
  const keys:string[] = [];page.on('request',request => {if(request.method() === 'POST' && new URL(request.url()).pathname === '/api/orders') keys.push(request.headers()['idempotency-key']!)})
  await page.getByRole('button',{name:'Confirmar compra',exact:true}).click();await expect(page.getByRole('alert')).toContainText('demorou demais',{timeout:15_000})
  await page.reload();await page.getByRole('button',{name:'Recuperar pedido',exact:true}).click();await expect(page).toHaveURL(/\/orders\//);await expect(page.getByRole('dialog',{name:'Compra confirmada na simulação'})).toBeVisible();expect(keys).toHaveLength(2);expect(new Set(keys).size).toBe(1)
})

test('price update reaches checkout through Socket.IO and requires another review',async ({page}) => {
  await prepareCheckout(page);await reviewCheckout(page)
  await page.evaluate(async () => {await fetch('/api/demo/nfts/emerald-ape/update',{method:'POST'})})
  await expect(page.getByTestId('purchase-total')).toHaveText('1.2916 ETH');await expect(page.getByRole('alert')).toContainText('Revise novamente');await expect(page.getByRole('button',{name:'Confirmar compra',exact:true})).toHaveCount(0)
  await reviewCheckout(page);await page.getByRole('button',{name:'Confirmar compra',exact:true}).click();await expect(page.getByRole('dialog',{name:'Compra confirmada na simulação'}).getByTestId('purchase-total')).toHaveText('1.2916 ETH')
})

test('expired coupon during review blocks order creation and preserves the cart',async ({page}) => {
  await prepareCheckout(page);await page.goto('/cart');await page.getByLabel('Código promocional').fill('KURIO10');await page.getByRole('button',{name:'Aplicar cupom',exact:true}).click();await expect(page.getByTestId('purchase-total')).toHaveText('1.0726 ETH');await page.getByRole('link',{name:'Conectar e finalizar',exact:true}).click();await reviewCheckout(page)
  await commercePost(page,'expire-coupon');await page.getByRole('button',{name:'Confirmar compra',exact:true}).click();await expect(page.getByRole('alert').filter({hasText:'O cupom expirou.'})).toBeVisible();await expect(page).toHaveURL('/checkout')
  await page.goto('/cart');await expect(page.getByTestId('cart-item-emerald-ape-fifty')).toBeVisible();await page.getByRole('button',{name:'Remover cupom',exact:true}).click();await expect(page.getByRole('link',{name:'Conectar e finalizar',exact:true})).toHaveAttribute('aria-disabled','false')
})

test('@visual cart and checkout use responsive functional layouts',async ({page}) => {
  await prepareCheckout(page);await page.goto('/cart');await expect(page.getByTestId('cart-item-emerald-ape-fifty')).toBeVisible();await expect(page.getByTestId('nft-emerald-ape')).toBeVisible();await expect(page.getByText('Atualizando preço e disponibilidade…',{exact:true})).toHaveCount(0);await page.evaluate(() => document.fonts.ready);await expect(page).toHaveScreenshot('cart.png',{fullPage:true,animations:'disabled'})
  await page.getByRole('link',{name:'Conectar e finalizar',exact:true}).click();await expect(page.getByText('Carteira conectada na simulação.',{exact:true})).toBeVisible();await page.evaluate(() => document.fonts.ready);await expect(page).toHaveScreenshot('checkout.png',{fullPage:true,animations:'disabled'})
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
})

test('session expiry at checkout preserves collector draft and returns after login',async ({page}) => {
  await prepareCheckout(page)
  await page.getByLabel('Nome de exibição').fill('Ana Retomada')
  await page.getByLabel('Observação do colecionador (opcional)').fill('Manter este contexto após expirar.')
  await page.evaluate(async () => {await fetch('/api/demo/auth',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'expire'})})})
  await page.reload();await expect(page).toHaveURL(/login.*returnTo=/)
  expect(new URL(page.url()).searchParams.get('returnTo')).toBe('/checkout')
  await page.getByRole('textbox',{name:'E-mail',exact:true}).fill('ana@example.com');await page.getByLabel(/^Senha/).fill('Collector123!');await page.getByRole('button',{name:'Entrar',exact:true}).last().click()
  await expect(page).toHaveURL('/checkout');await expect(page.getByLabel('Nome de exibição')).toHaveValue('Ana Retomada');await expect(page.getByLabel('Observação do colecionador (opcional)')).toHaveValue('Manter este contexto após expirar.')
})

test('cart shows slow skeleton, empty result, HTTP error and retry recovery through MSW',async ({page}) => {
  await page.goto('/');await expect(page.getByTestId('nft-emerald-ape')).toBeVisible()
  async function scenario(value:string) {await page.evaluate(async scenario => {await fetch('/api/demo/scenario',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({scenario})})},value)}
  await scenario('slow');await page.getByRole('link',{name:'Abrir carrinho',exact:true}).click();await expect(page.getByRole('status',{name:'Carregando resumo da compra'})).toBeVisible();await expect(page.getByRole('heading',{name:'Seu carrinho está vazio'})).toBeVisible()
  await scenario('default');await page.getByRole('link',{name:'Explorar coleção',exact:true}).first().click();await expect(page.getByTestId('nft-emerald-ape')).toBeVisible();await scenario('error');await page.getByRole('link',{name:'Abrir carrinho',exact:true}).click();await expect(page.getByRole('alert')).toContainText('temporariamente indisponível')
  await scenario('default');await page.getByRole('button',{name:'Tentar novamente',exact:true}).click();await expect(page.getByRole('heading',{name:'Seu carrinho está vazio'})).toBeVisible()
})

test('favorite loading preserves purchase button position',async ({page}) => {
  await loginViaApi(page);await page.reload();await expect(page.getByRole('button',{name:'Sair',exact:true})).toBeVisible()
  await page.evaluate(async () => {await fetch('/api/demo/favorites/read-delay',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({milliseconds:1800})})})
  await page.getByTestId('nft-emerald-ape').getByRole('link').click()
  await expect(page.getByText('Carregando favoritos…',{exact:true})).toBeVisible()
  const buy = page.getByRole('button',{name:'Comprar NFT',exact:true}),before = await buy.boundingBox()
  await expect(page.getByText('Carregando favoritos…',{exact:true})).toHaveCount(0)
  const after = await buy.boundingBox()
  expect(after?.y).toBe(before?.y)
  await buy.click();await expect(page).toHaveURL('/cart');await expect(page.getByTestId('cart-item-emerald-ape-fifty')).toBeVisible()
})

test('stock change blocks reviewed checkout until cart quantities are corrected',async ({page}) => {
  await prepareCheckout(page,3);await reviewCheckout(page)
  await page.evaluate(async () => {await fetch('/api/demo/nfts/emerald-ape/update',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({available:6})})})
  await expect(page.getByRole('button',{name:'Revisar compra',exact:true})).toBeDisabled()
  await expect(page.getByRole('button',{name:'Confirmar compra',exact:true})).toHaveCount(0)
  await page.getByRole('link',{name:'← Voltar ao carrinho',exact:true}).click()
  const item = page.getByTestId('cart-item-emerald-ape-fifty')
  await expect(item.getByRole('alert')).toContainText('2 disponíveis')
  await item.getByRole('button',{name:'Diminuir quantidade',exact:true}).click()
  await expect(item.getByRole('group',{name:'Quantidade',exact:true})).toContainText('2')
  await expect(page.getByTestId('purchase-total')).toHaveText('2.3816 ETH')
  await expect(page.getByRole('link',{name:'Conectar e finalizar',exact:true})).toHaveAttribute('aria-disabled','false')
})

test('checkout validates collector fields and prevents review on a different wallet network',async ({page}) => {
  await prepareCheckout(page)
  await page.getByRole('textbox',{name:'E-mail',exact:true}).fill('invalid')
  await page.getByRole('button',{name:'Revisar compra',exact:true}).click()
  await expect(page.getByRole('textbox',{name:'E-mail',exact:true})).toHaveAttribute('aria-invalid','true')
  await expect(page.getByRole('region',{name:'Revisão da compra',exact:true})).toHaveCount(0)
  await page.getByRole('textbox',{name:'E-mail',exact:true}).fill('ana@example.com')
  await page.getByRole('combobox',{name:'Rede de pagamento',exact:true}).selectOption('Polygon')
  await expect(page.getByRole('button',{name:'Revisar compra',exact:true})).toBeDisabled()
  await expect(page.getByText('Carteira desconectada ou rede diferente.',{exact:true})).toBeVisible()
  await page.getByRole('combobox',{name:'Rede de pagamento',exact:true}).selectOption('Ethereum')
  await reviewCheckout(page)
})
