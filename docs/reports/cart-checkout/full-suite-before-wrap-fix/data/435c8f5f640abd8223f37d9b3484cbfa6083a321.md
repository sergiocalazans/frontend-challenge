# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: commerce.spec.ts >> favorite loading preserves purchase button position
- Location: tests\e2e\commerce.spec.ts:112:1

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: 1075.734375
Received: 1007.734375
```

# Page snapshot

```yaml
- generic [ref=f1e2]:
  - link "Pular para conteúdo" [ref=f1e3] [cursor=pointer]:
    - /url: "#main-content"
  - main [active] [ref=f1e4]:
    - navigation "Caminho da página" [ref=f1e5]:
      - link "Voltar à coleção" [ref=f1e6] [cursor=pointer]:
        - /url: /
        - text: ← Voltar à coleção
    - generic [ref=f1e7]:
      - generic [ref=f1e8]:
        - group "Vistas da obra" [ref=f1e9]:
          - button "Obra completa" [pressed] [ref=f1e10] [cursor=pointer]
          - button "Detalhe superior" [ref=f1e11] [cursor=pointer]
          - button "Detalhe central" [ref=f1e12] [cursor=pointer]
        - generic [ref=f1e13]:
          - img "Macaco com óculos redondos e jaqueta verde — Obra completa" [ref=f1e15]
          - button "Ampliar obra" [ref=f1e16] [cursor=pointer]
      - region [ref=f1e17]:
        - 'heading "Emerald Ape #042" [level=1] [ref=f1e18]'
        - paragraph [ref=f1e19]: 1.19 ETH
        - heading "Sobre este NFT" [level=2] [ref=f1e20]
        - paragraph [ref=f1e21]: Um colecionável digital da coleção Kurio Editions na rede Ethereum, com arte para colecionadores.
        - group "Edição" [ref=f1e22]:
          - generic [ref=f1e24]:
            - generic [ref=f1e25] [cursor=pointer]:
              - radio "1/1" [ref=f1e26]
              - generic [ref=f1e27]: 1/1
            - generic [ref=f1e28] [cursor=pointer]:
              - radio "1/10" [ref=f1e29]
              - generic [ref=f1e30]: 1/10
            - generic [ref=f1e31] [cursor=pointer]:
              - radio "1/50" [checked] [ref=f1e32]
              - generic [ref=f1e33]: 1/50
            - generic [ref=f1e34] [cursor=pointer]:
              - radio "ABERTA · Esgotada" [ref=f1e35]
              - generic [ref=f1e36]: ABERTA · Esgotada
        - status [ref=f1e37]: 4 unidades disponíveis nesta edição.
        - generic [ref=f1e38]:
          - group "Quantidade" [ref=f1e39]:
            - button "Diminuir quantidade" [disabled]
            - status [ref=f1e40]: "1"
            - button "Aumentar quantidade" [ref=f1e41] [cursor=pointer]
          - button "Favoritar" [ref=f1e43] [cursor=pointer]
        - button "Comprar NFT" [ref=f1e45] [cursor=pointer]
        - generic [ref=f1e46]:
          - generic [ref=f1e47]:
            - term [ref=f1e48]: "ID do token:"
            - definition [ref=f1e49]: emerald-ape
          - generic [ref=f1e50]:
            - term [ref=f1e51]: "Coleção:"
            - definition [ref=f1e52]: Kurio Apes
          - generic [ref=f1e53]:
            - term [ref=f1e54]: "Atributos:"
            - definition [ref=f1e55]: Arte digital, Ethereum, Kurio Editions
          - generic [ref=f1e56]:
            - term [ref=f1e57]: "Rede:"
            - definition [ref=f1e58]: Ethereum
    - status [ref=f1e59]
    - status [ref=f1e60]: Atualizações em tempo real conectadas.
    - generic [ref=f1e61]:
      - tablist [ref=f1e62]:
        - tab "Detalhes do NFT" [selected] [ref=f1e63] [cursor=pointer]
        - tab "Rede e propriedade" [ref=f1e64] [cursor=pointer]
      - tabpanel "Detalhes do NFT" [ref=f1e65]:
        - paragraph [ref=f1e66]: Um colecionável digital da coleção Kurio Editions na rede Ethereum, com arte para colecionadores.
        - paragraph [ref=f1e67]: Obra da coleção Kurio Apes. Os atributos e a disponibilidade são consultados na API de demonstração.
    - region [ref=f1e68]:
      - heading "Mais desta coleção" [level=2] [ref=f1e69]
      - generic [ref=f1e70]:
        - article [ref=f1e71]:
          - 'link "Ver Sage Nomad #009" [ref=f1e72] [cursor=pointer]':
            - /url: /nfts/sage-nomad
            - img "Macaco cinza com chapéu verde e moletom roxo" [ref=f1e74]
            - 'heading "Sage Nomad #009" [level=3] [ref=f1e75]'
          - paragraph [ref=f1e76]: 1.69 ETH
          - paragraph [ref=f1e77]: Polygon
        - article [ref=f1e78]:
          - 'link "Ver Neon Vessel #552" [ref=f1e79] [cursor=pointer]':
            - /url: /nfts/neon-vessel
            - img "Macaco de pelo escuro com casaco claro" [ref=f1e81]
            - 'heading "Neon Vessel #552" [level=3] [ref=f1e82]'
          - paragraph [ref=f1e83]: 1.99 ETH
          - paragraph [ref=f1e84]: Ethereum
        - article [ref=f1e85]:
          - 'link "Ver Golden Beat #207" [ref=f1e86] [cursor=pointer]':
            - /url: /nfts/golden-beat
            - img "Macaco dourado com fones verdes" [ref=f1e88]
            - 'heading "Golden Beat #207" [level=3] [ref=f1e89]'
          - paragraph [ref=f1e90]: 0.99 ETH
          - paragraph [ref=f1e91]: Solana
        - article [ref=f1e92]:
          - 'link "Ver Cosmic Bloom #100" [ref=f1e93] [cursor=pointer]':
            - /url: /nfts/cosmic-bloom
            - img "Macaco com óculos redondos e jaqueta verde" [ref=f1e95]
            - 'heading "Cosmic Bloom #100" [level=3] [ref=f1e96]'
          - paragraph [ref=f1e97]: 1.29 ETH
          - paragraph [ref=f1e98]: Ethereum
  - contentinfo [ref=f1e99]:
    - generic [ref=f1e100]:
      - generic [ref=f1e101]:
        - paragraph [ref=f1e102]: KURIO
        - paragraph [ref=f1e103]: Feito para colecionadores,criadores e cultura.
      - navigation "Links do rodapé" [ref=f1e104]:
        - link "Explorar coleções" [ref=f1e105] [cursor=pointer]:
          - /url: /
        - link "Meu perfil" [ref=f1e106] [cursor=pointer]:
          - /url: /account/profile
        - link "Carteiras" [ref=f1e107] [cursor=pointer]:
          - /url: /account/wallets
      - generic [ref=f1e108]:
        - paragraph [ref=f1e109]: Uma nova forma de colecionar.
        - paragraph [ref=f1e110]: Ambiente de demonstração. Operações e transações são simuladas.
    - paragraph [ref=f1e111]: © 2026 Kurio · Jungle Gaming NFT Marketplace
```

# Test source

```ts
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
  41  |   await test.info().attach('carteiras-cadastradas',{body:await page.screenshot({fullPage:true}),contentType:'image/png'})
  42  | })
  43  |
  44  | test('purchase confirms only through API, survives pending refresh and keeps an immutable receipt',async ({page}) => {
  45  |   await prepareCheckout(page);await commercePost(page,'pending');await reviewCheckout(page)
  46  |   const creations:string[] = [];page.on('request',request => {if(request.method() === 'POST' && new URL(request.url()).pathname === '/api/orders') creations.push(request.headers()['idempotency-key']!)})
  47  |   await page.getByRole('button',{name:'Confirmar compra',exact:true}).dblclick();await expect(page).toHaveURL(/\/orders\//)
  48  |   const url = page.url();await expect(page.getByRole('heading',{name:'Pedido em processamento'})).toBeVisible();await page.reload();await expect(page.getByRole('heading',{name:'Pedido em processamento'})).toBeVisible();expect(creations).toHaveLength(1)
  49  |   await commercePost(page,'settle');await page.reload()
  50  |   const receipt = page.getByRole('dialog',{name:'Compra confirmada na simulação'})
  51  |   await expect(receipt).toBeVisible();await expect(receipt.getByTestId('purchase-total')).toHaveText('1.1916 ETH')
  52  |   await test.info().attach('recibo-confirmado',{body:await page.screenshot({fullPage:true}),contentType:'image/png'})
  53  |   await page.keyboard.press('Escape');await expect(page.getByRole('button',{name:'Ver recibo',exact:true})).toBeFocused()
  54  |   await page.evaluate(async () => {await fetch('/api/demo/nfts/emerald-ape/update',{method:'POST'})});await page.reload();await expect(receipt.getByTestId('purchase-total')).toHaveText('1.1916 ETH')
  55  |   await page.goto('/cart');await expect(page.getByRole('heading',{name:'Seu carrinho está vazio'})).toBeVisible()
  56  |   await loginViaApi(page,'bruno@example.com');await page.goto(url);await expect(page.getByRole('heading',{name:'Pedido não encontrado'})).toBeVisible()
  57  | })
  58  |
  59  | test('payment refusal preserves items and a refused wallet connection can recover',async ({page}) => {
  60  |   await prepareCheckout(page);await page.getByRole('button',{name:'Desconectar carteira',exact:true}).click();await commercePost(page,'reject-connection');await page.getByRole('button',{name:'Conectar carteira',exact:true}).click();await expect(page.getByRole('alert')).toContainText('Conexão recusada')
  61  |   await page.getByRole('button',{name:'Conectar carteira',exact:true}).click();await expect(page.getByText('Carteira conectada na simulação.',{exact:true})).toBeVisible()
  62  |   await commercePost(page,'declined');await reviewCheckout(page);await page.getByRole('button',{name:'Confirmar compra',exact:true}).click();await expect(page.getByRole('heading',{name:'Pagamento recusado'})).toBeVisible();await expect(page.getByRole('dialog')).toHaveCount(0)
  63  |   await page.getByRole('link',{name:'Revisar carrinho',exact:true}).click();await expect(page.getByTestId('cart-item-emerald-ape-fifty')).toBeVisible();await expect(page.getByTestId('purchase-total')).toHaveText('1.1916 ETH')
  64  | })
  65  |
  66  | test('timeout after order creation recovers the same attempt after refresh',async ({page}) => {
  67  |   test.setTimeout(45_000)
  68  |   await prepareCheckout(page);await reviewCheckout(page);await commercePost(page,'timeout')
  69  |   const keys:string[] = [];page.on('request',request => {if(request.method() === 'POST' && new URL(request.url()).pathname === '/api/orders') keys.push(request.headers()['idempotency-key']!)})
  70  |   await page.getByRole('button',{name:'Confirmar compra',exact:true}).click();await expect(page.getByRole('alert')).toContainText('demorou demais',{timeout:15_000})
  71  |   await page.reload();await page.getByRole('button',{name:'Recuperar pedido',exact:true}).click();await expect(page).toHaveURL(/\/orders\//);await expect(page.getByRole('dialog',{name:'Compra confirmada na simulação'})).toBeVisible();expect(keys).toHaveLength(2);expect(new Set(keys).size).toBe(1)
  72  | })
  73  |
  74  | test('price update reaches checkout through Socket.IO and requires another review',async ({page}) => {
  75  |   await prepareCheckout(page);await reviewCheckout(page)
  76  |   await page.evaluate(async () => {await fetch('/api/demo/nfts/emerald-ape/update',{method:'POST'})})
  77  |   await expect(page.getByTestId('purchase-total')).toHaveText('1.2916 ETH');await expect(page.getByRole('alert')).toContainText('Revise novamente');await expect(page.getByRole('button',{name:'Confirmar compra',exact:true})).toHaveCount(0)
  78  |   await reviewCheckout(page);await page.getByRole('button',{name:'Confirmar compra',exact:true}).click();await expect(page.getByRole('dialog',{name:'Compra confirmada na simulação'}).getByTestId('purchase-total')).toHaveText('1.2916 ETH')
  79  | })
  80  |
  81  | test('expired coupon during review blocks order creation and preserves the cart',async ({page}) => {
  82  |   await prepareCheckout(page);await page.goto('/cart');await page.getByLabel('Código promocional').fill('KURIO10');await page.getByRole('button',{name:'Aplicar cupom',exact:true}).click();await expect(page.getByTestId('purchase-total')).toHaveText('1.0726 ETH');await page.getByRole('link',{name:'Conectar e finalizar',exact:true}).click();await reviewCheckout(page)
  83  |   await commercePost(page,'expire-coupon');await page.getByRole('button',{name:'Confirmar compra',exact:true}).click();await expect(page.getByRole('alert').filter({hasText:'O cupom expirou.'})).toBeVisible();await expect(page).toHaveURL('/checkout')
  84  |   await page.goto('/cart');await expect(page.getByTestId('cart-item-emerald-ape-fifty')).toBeVisible();await page.getByRole('button',{name:'Remover cupom',exact:true}).click();await expect(page.getByRole('link',{name:'Conectar e finalizar',exact:true})).toHaveAttribute('aria-disabled','false')
  85  | })
  86  |
  87  | test('@visual cart and checkout use responsive functional layouts',async ({page}) => {
  88  |   await prepareCheckout(page);await page.goto('/cart');await expect(page.getByTestId('cart-item-emerald-ape-fifty')).toBeVisible();await expect(page.getByTestId('nft-emerald-ape')).toBeVisible();await expect(page.getByText('Atualizando preço e disponibilidade…',{exact:true})).toHaveCount(0);await page.evaluate(() => document.fonts.ready);await expect(page).toHaveScreenshot('cart.png',{fullPage:true,animations:'disabled'})
  89  |   await page.getByRole('link',{name:'Conectar e finalizar',exact:true}).click();await expect(page.getByText('Carteira conectada na simulação.',{exact:true})).toBeVisible();await page.evaluate(() => document.fonts.ready);await expect(page).toHaveScreenshot('checkout.png',{fullPage:true,animations:'disabled'})
  90  |   expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  91  | })
  92  |
  93  | test('session expiry at checkout preserves collector draft and returns after login',async ({page}) => {
  94  |   await prepareCheckout(page)
  95  |   await page.getByLabel('Nome de exibição').fill('Ana Retomada')
  96  |   await page.getByLabel('Observação do colecionador (opcional)').fill('Manter este contexto após expirar.')
  97  |   await page.evaluate(async () => {await fetch('/api/demo/auth',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'expire'})})})
  98  |   await page.reload();await expect(page).toHaveURL(/login.*returnTo=/)
  99  |   expect(new URL(page.url()).searchParams.get('returnTo')).toBe('/checkout')
  100 |   await page.getByRole('textbox',{name:'E-mail',exact:true}).fill('ana@example.com');await page.getByLabel(/^Senha/).fill('Collector123!');await page.getByRole('button',{name:'Entrar',exact:true}).last().click()
  101 |   await expect(page).toHaveURL('/checkout');await expect(page.getByLabel('Nome de exibição')).toHaveValue('Ana Retomada');await expect(page.getByLabel('Observação do colecionador (opcional)')).toHaveValue('Manter este contexto após expirar.')
  102 | })
  103 |
  104 | test('cart shows slow skeleton, empty result, HTTP error and retry recovery through MSW',async ({page}) => {
  105 |   await page.goto('/');await expect(page.getByTestId('nft-emerald-ape')).toBeVisible()
  106 |   async function scenario(value:string) {await page.evaluate(async scenario => {await fetch('/api/demo/scenario',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({scenario})})},value)}
  107 |   await scenario('slow');await page.getByRole('link',{name:'Abrir carrinho',exact:true}).click();await expect(page.getByRole('status',{name:'Carregando resumo da compra'})).toBeVisible();await expect(page.getByRole('heading',{name:'Seu carrinho está vazio'})).toBeVisible()
  108 |   await scenario('default');await page.getByRole('link',{name:'Explorar coleção',exact:true}).first().click();await expect(page.getByTestId('nft-emerald-ape')).toBeVisible();await scenario('error');await page.getByRole('link',{name:'Abrir carrinho',exact:true}).click();await expect(page.getByRole('alert')).toContainText('temporariamente indisponível')
  109 |   await scenario('default');await page.getByRole('button',{name:'Tentar novamente',exact:true}).click();await expect(page.getByRole('heading',{name:'Seu carrinho está vazio'})).toBeVisible()
  110 | })
  111 |
  112 | test('favorite loading preserves purchase button position',async ({page}) => {
  113 |   await loginViaApi(page);await page.reload();await expect(page.getByRole('button',{name:'Sair',exact:true})).toBeVisible()
  114 |   await page.evaluate(async () => {await fetch('/api/demo/favorites/read-delay',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({milliseconds:1800})})})
  115 |   await page.getByTestId('nft-emerald-ape').getByRole('link').click()
  116 |   await expect(page.getByText('Carregando favoritos…',{exact:true})).toBeVisible()
  117 |   const buy = page.getByRole('button',{name:'Comprar NFT',exact:true}),before = await buy.boundingBox()
  118 |   await expect(page.getByText('Carregando favoritos…',{exact:true})).toHaveCount(0)
  119 |   const after = await buy.boundingBox()
> 120 |   expect(after?.y).toBe(before?.y)
      |                    ^ Error: expect(received).toBe(expected) // Object.is equality
  121 |   await buy.click();await expect(page).toHaveURL('/cart');await expect(page.getByTestId('cart-item-emerald-ape-fifty')).toBeVisible()
  122 | })
  123 |
  124 | test('stock change blocks reviewed checkout until cart quantities are corrected',async ({page}) => {
  125 |   await prepareCheckout(page,3);await reviewCheckout(page)
  126 |   await page.evaluate(async () => {await fetch('/api/demo/nfts/emerald-ape/update',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({available:6})})})
  127 |   await expect(page.getByRole('button',{name:'Revisar compra',exact:true})).toBeDisabled()
  128 |   await expect(page.getByRole('button',{name:'Confirmar compra',exact:true})).toHaveCount(0)
  129 |   await page.getByRole('link',{name:'← Voltar ao carrinho',exact:true}).click()
  130 |   const item = page.getByTestId('cart-item-emerald-ape-fifty')
  131 |   await expect(item.getByRole('alert')).toContainText('2 disponíveis')
  132 |   await item.getByRole('button',{name:'Diminuir quantidade',exact:true}).click()
  133 |   await expect(item.getByRole('group',{name:'Quantidade',exact:true})).toContainText('2')
  134 |   await expect(page.getByTestId('purchase-total')).toHaveText('2.3816 ETH')
  135 |   await expect(page.getByRole('link',{name:'Conectar e finalizar',exact:true})).toHaveAttribute('aria-disabled','false')
  136 | })
  137 |
  138 | test('checkout validates collector fields and prevents review on a different wallet network',async ({page}) => {
  139 |   await prepareCheckout(page)
  140 |   await page.getByRole('textbox',{name:'E-mail',exact:true}).fill('invalid')
  141 |   await page.getByRole('button',{name:'Revisar compra',exact:true}).click()
  142 |   await expect(page.getByRole('textbox',{name:'E-mail',exact:true})).toHaveAttribute('aria-invalid','true')
  143 |   await expect(page.getByRole('region',{name:'Revisão da compra',exact:true})).toHaveCount(0)
  144 |   await page.getByRole('textbox',{name:'E-mail',exact:true}).fill('ana@example.com')
  145 |   await page.getByRole('combobox',{name:'Rede de pagamento',exact:true}).selectOption('Polygon')
  146 |   await expect(page.getByRole('button',{name:'Revisar compra',exact:true})).toBeDisabled()
  147 |   await expect(page.getByText('Carteira desconectada ou rede diferente.',{exact:true})).toBeVisible()
  148 |   await page.getByRole('combobox',{name:'Rede de pagamento',exact:true}).selectOption('Ethereum')
  149 |   await reviewCheckout(page)
  150 | })
  151 |
```