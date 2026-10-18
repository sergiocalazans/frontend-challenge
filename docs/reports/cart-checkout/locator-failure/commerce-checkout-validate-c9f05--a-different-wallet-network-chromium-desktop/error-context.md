# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: commerce.spec.ts >> checkout validates collector fields and prevents review on a different wallet network
- Location: tests\e2e\commerce.spec.ts:137:1

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.fill: Test timeout of 30000ms exceeded.
Call log:
  - waiting for getByLabel('E-mail', { exact: true })

```

# Page snapshot

```yaml
- generic [ref=f1e2]:
  - link "Pular para conteúdo" [ref=f1e3] [cursor=pointer]:
    - /url: "#main-content"
  - banner [ref=f1e4]:
    - link "Kurio — início" [ref=f1e5] [cursor=pointer]:
      - /url: /
      - text: KURIO
    - navigation "Navegação principal" [ref=f1e6]:
      - link "Início" [ref=f1e7] [cursor=pointer]:
        - /url: /
      - link "Componentes" [ref=f1e8] [cursor=pointer]:
        - /url: /design-system
    - generic [ref=f1e9]:
      - link "Abrir carrinho" [ref=f1e10] [cursor=pointer]:
        - /url: /cart
      - link "Ana Colecionadora" [ref=f1e11] [cursor=pointer]:
        - /url: /account/profile
      - button "Sair" [ref=f1e12] [cursor=pointer]
  - main [ref=f1e13]:
    - navigation [ref=f1e14]:
      - link "← Voltar ao carrinho" [ref=f1e15] [cursor=pointer]:
        - /url: /cart
    - heading "Pagamento" [level=1] [ref=f1e16]
    - generic [ref=f1e17]:
      - generic [ref=f1e19]:
        - heading "Perfil do colecionador" [level=2] [ref=f1e20]
        - generic [ref=f1e21]:
          - generic [ref=f1e22]:
            - generic [ref=f1e23]:
              - text: Nome de exibição
              - generic [aria-hidden] [ref=f1e24]: "*"
            - textbox "Nome de exibição" [ref=f1e25]: Ana Colecionadora
          - generic [ref=f1e26]:
            - generic [ref=f1e27]:
              - text: Nome de usuário
              - generic [aria-hidden] [ref=f1e28]: "*"
            - textbox "Nome de usuário" [ref=f1e29]: Principal
          - generic [ref=f1e30]:
            - generic [ref=f1e31]:
              - text: Nome do perfil
              - generic [aria-hidden] [ref=f1e32]: "*"
            - textbox "Nome do perfil" [ref=f1e33]: Colecionadora
          - generic [ref=f1e34]:
            - generic [ref=f1e35]:
              - text: E-mail
              - generic [aria-hidden] [ref=f1e36]: "*"
            - textbox "E-mail" [ref=f1e37]: ana@example.com
          - generic [ref=f1e38]:
            - generic [ref=f1e39]:
              - text: Código de indicação
              - generic [aria-hidden] [ref=f1e40]: "*"
            - textbox "Código de indicação" [ref=f1e41]: DEMO
          - generic [ref=f1e42]:
            - generic [ref=f1e43]: Nome ENS (opcional)
            - textbox "Nome ENS (opcional)" [ref=f1e44]: ana.eth
        - generic [ref=f1e45]:
          - text: Observação do colecionador (opcional)
          - textbox "Observação do colecionador (opcional)" [ref=f1e46]
        - paragraph [ref=f1e47]: O endereço, o provedor e a rede vêm da carteira cadastrada. Para usar outra carteira, cadastre ou edite em Carteiras.
        - button "Revisar compra" [ref=f1e48] [cursor=pointer]
      - complementary "Resumo da compra" [ref=f1e49]:
        - generic [ref=f1e50]:
          - heading "Resumo da compra" [level=2] [ref=f1e51]
          - generic [ref=f1e52]:
            - generic [ref=f1e53]:
              - term [ref=f1e54]: Subtotal
              - definition [ref=f1e55]: 1.19 ETH
            - generic [ref=f1e56]:
              - term [ref=f1e57]: Desconto do lançamento
              - definition [ref=f1e58]: − 0 ETH
            - generic [ref=f1e59]:
              - term [ref=f1e60]: Taxa de rede
              - definition [ref=f1e61]: 0.0016 ETH
            - generic [ref=f1e62]:
              - term [ref=f1e63]: Total
              - definition [ref=f1e64]: 1.1916 ETH
          - heading "Seus NFTs" [level=2] [ref=f1e65]
          - list [ref=f1e66]:
            - listitem [ref=f1e67]:
              - generic [ref=f1e68]: "Emerald Ape #0421/50 × 1"
              - generic [ref=f1e69]: 1.19 ETH
          - heading "Carteira e rede" [level=2] [ref=f1e70]
          - group "Carteiras cadastradas" [ref=f1e71]:
            - generic [ref=f1e73] [cursor=pointer]:
              - radio "Principal 0x1111111111111111111111111111111111111111 MetaMask · Ethereum" [checked] [ref=f1e74]
              - generic [ref=f1e75]:
                - strong [ref=f1e76]: Principal
                - generic [ref=f1e77]: "0x1111111111111111111111111111111111111111"
                - generic [ref=f1e78]: MetaMask · Ethereum
          - generic [ref=f1e79]:
            - text: Rede de pagamento
            - combobox "Rede de pagamento" [ref=f1e80] [cursor=pointer]:
              - option "Ethereum" [selected]
              - option "Polygon"
              - option "Solana"
          - button "Desconectar carteira" [ref=f1e81] [cursor=pointer]
          - status [ref=f1e82]: Carteira conectada na simulação.
          - link "Gerenciar carteiras" [ref=f1e83] [cursor=pointer]:
            - /url: /account/wallets
  - contentinfo [ref=f1e84]:
    - generic [ref=f1e85]:
      - generic [ref=f1e86]:
        - paragraph [ref=f1e87]: KURIO
        - paragraph [ref=f1e88]: Feito para colecionadores,criadores e cultura.
      - navigation "Links do rodapé" [ref=f1e89]:
        - link "Explorar coleções" [ref=f1e90] [cursor=pointer]:
          - /url: /
        - link "Meu perfil" [ref=f1e91] [cursor=pointer]:
          - /url: /account/profile
        - link "Carteiras" [ref=f1e92] [cursor=pointer]:
          - /url: /account/wallets
      - generic [ref=f1e93]:
        - paragraph [ref=f1e94]: Uma nova forma de colecionar.
        - paragraph [ref=f1e95]: Ambiente de demonstração. Operações e transações são simuladas.
    - paragraph [ref=f1e96]: © 2026 Kurio · Jungle Gaming NFT Marketplace
```

# Test source

```ts
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
  77  |   await reviewCheckout(page);await page.getByRole('button',{name:'Confirmar compra',exact:true}).click();await expect(page.getByRole('dialog',{name:'Compra confirmada na simulação'}).getByTestId('purchase-total')).toHaveText('1.2916 ETH')
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
  96  |   await page.evaluate(async () => {await fetch('/api/demo/auth',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'expire'})})})
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
  111 | test('favorite loading preserves purchase button position',async ({page}) => {
  112 |   await loginViaApi(page);await page.reload();await expect(page.getByRole('button',{name:'Sair',exact:true})).toBeVisible()
  113 |   await page.evaluate(async () => {await fetch('/api/demo/favorites/read-delay',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({milliseconds:1800})})})
  114 |   await page.getByTestId('nft-emerald-ape').getByRole('link').click()
  115 |   await expect(page.getByText('Carregando favoritos…',{exact:true})).toBeVisible()
  116 |   const buy = page.getByRole('button',{name:'Comprar NFT',exact:true}),before = await buy.boundingBox()
  117 |   await expect(page.getByText('Carregando favoritos…',{exact:true})).toHaveCount(0)
  118 |   const after = await buy.boundingBox()
  119 |   expect(after?.y).toBe(before?.y)
  120 |   await buy.click();await expect(page).toHaveURL('/cart');await expect(page.getByTestId('cart-item-emerald-ape-fifty')).toBeVisible()
  121 | })
  122 |
  123 | test('stock change blocks reviewed checkout until cart quantities are corrected',async ({page}) => {
  124 |   await prepareCheckout(page,3);await reviewCheckout(page)
  125 |   await page.evaluate(async () => {await fetch('/api/demo/nfts/emerald-ape/update',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({available:6})})})
  126 |   await expect(page.getByRole('button',{name:'Revisar compra',exact:true})).toBeDisabled()
  127 |   await expect(page.getByRole('button',{name:'Confirmar compra',exact:true})).toHaveCount(0)
  128 |   await page.getByRole('link',{name:'← Voltar ao carrinho',exact:true}).click()
  129 |   const item = page.getByTestId('cart-item-emerald-ape-fifty')
  130 |   await expect(item.getByRole('alert')).toContainText('2 disponíveis')
  131 |   await item.getByRole('button',{name:'Diminuir quantidade',exact:true}).click()
  132 |   await expect(item.getByRole('group',{name:'Quantidade',exact:true})).toContainText('2')
  133 |   await expect(page.getByTestId('purchase-total')).toHaveText('2.3816 ETH')
  134 |   await expect(page.getByRole('link',{name:'Conectar e finalizar',exact:true})).toHaveAttribute('aria-disabled','false')
  135 | })
  136 |
  137 | test('checkout validates collector fields and prevents review on a different wallet network',async ({page}) => {
  138 |   await prepareCheckout(page)
> 139 |   await page.getByLabel('E-mail',{exact:true}).fill('invalid')
      |                                                ^ Error: locator.fill: Test timeout of 30000ms exceeded.
  140 |   await page.getByRole('button',{name:'Revisar compra',exact:true}).click()
  141 |   await expect(page.getByLabel('E-mail',{exact:true})).toHaveAttribute('aria-invalid','true')
  142 |   await expect(page.getByRole('region',{name:'Revisão da compra',exact:true})).toHaveCount(0)
  143 |   await page.getByLabel('E-mail',{exact:true}).fill('ana@example.com')
  144 |   await page.getByLabel('Rede de pagamento',{exact:true}).selectOption('Polygon')
  145 |   await expect(page.getByRole('button',{name:'Revisar compra',exact:true})).toBeDisabled()
  146 |   await expect(page.getByText('Carteira desconectada ou rede diferente.',{exact:true})).toBeVisible()
  147 |   await page.getByLabel('Rede de pagamento',{exact:true}).selectOption('Ethereum')
  148 |   await reviewCheckout(page)
  149 | })
  150 |
```