# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: catalog.spec.ts >> pagination restores URL, results and history, and filters reset the page
- Location: tests\e2e\catalog.spec.ts:19:1

# Error details

```
Error: expect(locator).toHaveCount(expected) failed

Locator:  getByTestId('catalog-results').locator('article')
Expected: 9
Received: 0
Timeout:  5000ms

Call log:
  - Expect "toHaveCount" getByTestId('catalog-results').locator('article') with timeout 5000ms
  - waiting for getByTestId('catalog-results').locator('article')
    6 × locator resolved to 0 elements
      - unexpected value "0"

```

# Page snapshot

```yaml
- generic [ref=e2]:
  - link "Pular para conteúdo" [ref=e3] [cursor=pointer]:
    - /url: "#main-content"
  - banner [ref=e4]:
    - link "Kurio — início" [ref=e5] [cursor=pointer]:
      - /url: /
      - text: KURIO
    - generic [ref=e6]:
      - link "Abrir carrinho" [ref=e7] [cursor=pointer]:
        - /url: /cart
      - link "Entrar" [ref=e8] [cursor=pointer]:
        - /url: /login
  - main [active] [ref=e9]:
    - generic [ref=e10]:
      - search [ref=e11]:
        - generic [ref=e12]: Buscar NFTs
        - textbox "Buscar NFTs" [ref=e13]:
          - /placeholder: Explorar coleções
        - button "Buscar" [ref=e14] [cursor=pointer]
      - button "Abrir filtros do catálogo" [ref=e15] [cursor=pointer]
    - region [ref=e16]:
      - generic [ref=e17]:
        - paragraph [ref=e18]: Bem-vindo à Kurio
        - heading "SEJA DONO DO FUTURO DA ARTE DIGITAL" [level=1] [ref=e19]
        - paragraph [ref=e20]: Descubra NFTs selecionados de criadores emergentes e consagrados.
        - link "Explorar coleções" [ref=e21] [cursor=pointer]:
          - /url: "#catalogo"
      - img "Macaco com óculos e jaqueta verde, destaque da coleção Kurio" [ref=e22]
    - region [ref=e23]:
      - generic [ref=e25]:
        - paragraph [ref=e26]: Arte para colecionar
        - heading "Todos os NFTs" [level=2] [ref=e27]
      - generic [ref=e29]:
        - generic [ref=e30]:
          - status [ref=e31]: 24 NFTs encontrados
          - generic [ref=e32]:
            - generic [ref=e33]: Ordenar por
            - combobox "Ordenar por" [ref=e34] [cursor=pointer]:
              - option "Destaques" [selected]
              - option "Listados recentemente"
              - option "Menor preço"
              - option "Maior preço"
        - status [ref=e35]
        - generic [ref=e36]:
          - article [ref=e37]:
            - 'link "Ver Emerald Ape #042" [ref=e38] [cursor=pointer]':
              - /url: /nfts/emerald-ape
              - img "Macaco com óculos redondos e jaqueta verde" [ref=e40]
              - 'heading "Emerald Ape #042" [level=3] [ref=e41]'
            - paragraph [ref=e42]: 1.19 ETH
            - paragraph [ref=e43]: Ethereum
            - paragraph [ref=e44]: 8 disponíveis
          - article [ref=e45]:
            - 'link "Ver Sage Nomad #009" [ref=e46] [cursor=pointer]':
              - /url: /nfts/sage-nomad
              - img "Macaco cinza com chapéu verde e moletom roxo" [ref=e48]
              - 'heading "Sage Nomad #009" [level=3] [ref=e49]'
            - paragraph [ref=e50]: 1.69 ETH
            - paragraph [ref=e51]: Polygon
            - paragraph [ref=e52]: 12 disponíveis
          - article [ref=e53]:
            - 'link "Ver Neon Vessel #552" [ref=e54] [cursor=pointer]':
              - /url: /nfts/neon-vessel
              - img "Macaco de pelo escuro com casaco claro" [ref=e56]
              - 'heading "Neon Vessel #552" [level=3] [ref=e57]'
            - paragraph [ref=e58]: 1.99 ETH
            - paragraph [ref=e59]: Ethereum
            - paragraph [ref=e60]: 5 disponíveis
          - article [ref=e61]:
            - 'link "Ver Golden Beat #207" [ref=e62] [cursor=pointer]':
              - /url: /nfts/golden-beat
              - img "Macaco dourado com fones verdes" [ref=e64]
              - 'heading "Golden Beat #207" [level=3] [ref=e65]'
            - paragraph [ref=e66]: 0.99 ETH
            - paragraph [ref=e67]: Solana
            - paragraph [ref=e68]: 20 disponíveis
          - article [ref=e69]:
            - 'link "Ver Cosmic Bloom #100" [ref=e70] [cursor=pointer]':
              - /url: /nfts/cosmic-bloom
              - img "Macaco com óculos redondos e jaqueta verde" [ref=e72]
              - 'heading "Cosmic Bloom #100" [level=3] [ref=e73]'
            - paragraph [ref=e74]: 1.29 ETH
            - paragraph [ref=e75]: Ethereum
            - paragraph [ref=e76]: Esgotado
          - article [ref=e77]:
            - 'link "Ver Violet Nomad #101" [ref=e78] [cursor=pointer]':
              - /url: /nfts/violet-nomad
              - img "Macaco cinza com chapéu verde e moletom roxo" [ref=e80]
              - 'heading "Violet Nomad #101" [level=3] [ref=e81]'
            - paragraph [ref=e82]: 1.39 ETH
            - paragraph [ref=e83]: Polygon
            - paragraph [ref=e84]: 2 disponíveis
          - article [ref=e85]:
            - 'link "Ver Ivory Baron #102" [ref=e86] [cursor=pointer]':
              - /url: /nfts/ivory-baron
              - img "Macaco de pelo escuro com casaco claro" [ref=e88]
              - 'heading "Ivory Baron #102" [level=3] [ref=e89]'
            - paragraph [ref=e90]: 1.79 ETH
            - paragraph [ref=e91]: Solana
            - paragraph [ref=e92]: 3 disponíveis
          - article [ref=e93]:
            - 'link "Ver Amber Signal #103" [ref=e94] [cursor=pointer]':
              - /url: /nfts/amber-signal
              - img "Macaco dourado com fones verdes" [ref=e96]
              - 'heading "Amber Signal #103" [level=3] [ref=e97]'
            - paragraph [ref=e98]: 0.39 ETH
            - paragraph [ref=e99]: Ethereum
            - paragraph [ref=e100]: 4 disponíveis
          - article [ref=e101]:
            - 'link "Ver Jade Echo #104" [ref=e102] [cursor=pointer]':
              - /url: /nfts/jade-echo
              - img "Macaco com óculos redondos e jaqueta verde" [ref=e104]
              - 'heading "Jade Echo #104" [level=3] [ref=e105]'
            - paragraph [ref=e106]: 0.02 ETH
            - paragraph [ref=e107]: Polygon
            - paragraph [ref=e108]: 5 disponíveis
        - paragraph [ref=e109]: Página 1 de 3
        - navigation "Paginação do catálogo" [ref=e110]:
          - button "Anterior" [disabled]
          - link "Página 1" [ref=e112] [cursor=pointer]:
            - /url: /#catalogo
            - text: "1"
          - link "Página 2" [ref=e114] [cursor=pointer]:
            - /url: /?page=2#catalogo
            - text: "2"
          - link "Página 3" [ref=e116] [cursor=pointer]:
            - /url: /?page=3#catalogo
            - text: "3"
          - link "Próxima" [ref=e117] [cursor=pointer]:
            - /url: /?page=2#catalogo
  - contentinfo [ref=e118]:
    - generic [ref=e119]:
      - generic [ref=e120]:
        - paragraph [ref=e121]: KURIO
        - paragraph [ref=e122]: Feito para colecionadores,criadores e cultura.
      - navigation "Links do rodapé" [ref=e123]:
        - link "Explorar coleções" [ref=e124] [cursor=pointer]:
          - /url: /
        - link "Meu perfil" [ref=e125] [cursor=pointer]:
          - /url: /account/profile
        - link "Carteiras" [ref=e126] [cursor=pointer]:
          - /url: /account/wallets
      - generic [ref=e127]:
        - paragraph [ref=e128]: Uma nova forma de colecionar.
        - paragraph [ref=e129]: Demonstração em desenvolvimento. Compras e contas ainda não estão disponíveis.
    - paragraph [ref=e130]: © 2026 Kurio · Jungle Gaming NFT Marketplace
  - navigation "Navegação mobile" [ref=e131]:
    - link "Início" [ref=e132] [cursor=pointer]:
      - /url: /
    - link "Componentes" [ref=e136] [cursor=pointer]:
      - /url: /design-system
    - link "Carrinho" [ref=e142] [cursor=pointer]:
      - /url: /cart
    - link "Entrar" [ref=e147] [cursor=pointer]:
      - /url: /login
```

# Test source

```ts
  1   | import { expect, test, type Page } from '@playwright/test'
  2   |
  3   | async function search(page: Page, value: string) {
  4   |   await page.getByRole('textbox', { name: 'Buscar NFTs' }).fill(value)
  5   |   await page.getByRole('button', { name: 'Buscar', exact: true }).click()
  6   | }
  7   | async function filters(page: Page) {
  8   |   if ((page.viewportSize()?.width ?? 1440) < 1024) await page.getByRole('button', { name: 'Abrir filtros do catálogo' }).click()
  9   |   return page.getByRole('complementary', { name: 'Filtros de coleção' })
  10  | }
  11  | async function closeFilters(page: Page) {
  12  |   if (await page.getByRole('dialog').count()) await page.keyboard.press('Escape')
  13  | }
  14  | async function scenario(page: Page, name: string) {
  15  |   const status = await page.evaluate(async scenarioName => (await fetch('/api/demo/scenario', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ scenario: scenarioName }) })).status, name)
  16  |   expect(status).toBe(200)
  17  | }
  18  |
  19  | test('pagination restores URL, results and history, and filters reset the page', async ({ page }) => {
  20  |   await page.goto('/')
  21  |   const results = page.getByTestId('catalog-results')
> 22  |   await expect(results.locator('article')).toHaveCount(9)
      |                                            ^ Error: expect(locator).toHaveCount(expected) failed
  23  |   const pagination = page.getByRole('navigation', { name: 'Paginação do catálogo' })
  24  |   await expect(pagination.locator('[aria-current="page"]')).toHaveCount(1)
  25  |   await expect(pagination.getByRole('link', { name: 'Página 1', exact: true })).toHaveAttribute('aria-current', 'page')
  26  |   const first = await results.locator('article').first().getAttribute('data-testid')
  27  |   await page.getByRole('link', { name: 'Página 2', exact: true }).click()
  28  |   await expect(page).toHaveURL(/page=2/)
  29  |   await expect(pagination.locator('[aria-current="page"]')).toHaveCount(1)
  30  |   await expect(pagination.getByRole('link', { name: 'Página 2', exact: true })).toHaveAttribute('aria-current', 'page')
  31  |   await expect(results.locator('article').first()).not.toHaveAttribute('data-testid', first!)
  32  |   const second = await results.locator('article').first().getAttribute('data-testid')
  33  |   await page.reload()
  34  |   await expect(results.locator('article').first()).toHaveAttribute('data-testid', second!)
  35  |   await page.goBack()
  36  |   await expect(results.locator('article').first()).toHaveAttribute('data-testid', first!)
  37  |   await page.goForward()
  38  |   await expect(results.locator('article').first()).toHaveAttribute('data-testid', second!)
  39  |   const panel = await filters(page)
  40  |   await panel.getByLabel('Rede', { exact: true }).selectOption('Polygon')
  41  |   await closeFilters(page)
  42  |   await expect(page).not.toHaveURL(/page=2/)
  43  |   await expect(results.locator('article')).toHaveCount(8)
  44  |   await expect(page.getByText('Página 1 de 1', { exact: true })).toBeVisible()
  45  | })
  46  |
  47  | test('combined filters reach REST, validate price and sort exact results', async ({ page }) => {
  48  |   await page.goto('/')
  49  |   const panel = await filters(page)
  50  |   await panel.getByRole('radio', { name: 'Arte digital', exact: true }).check()
  51  |   await panel.getByLabel('Rede', { exact: true }).selectOption('Ethereum')
  52  |   await panel.getByLabel('Preço mínimo (ETH)').fill('2')
  53  |   await panel.getByLabel('Preço máximo (ETH)').fill('1')
  54  |   await panel.getByRole('button', { name: 'Aplicar preço' }).click()
  55  |   await expect(panel.getByRole('alert')).toContainText('maior ou igual')
  56  |   await panel.getByLabel('Preço mínimo (ETH)').fill('1,20')
  57  |   await panel.getByLabel('Preço máximo (ETH)').fill('2,00')
  58  |   const request = page.waitForRequest(request => {
  59  |     const url = new URL(request.url())
  60  |     return url.pathname === '/api/nfts' && url.searchParams.get('minPrice') === '1.20' && url.searchParams.get('network') === 'Ethereum' && url.searchParams.get('category') === 'art'
  61  |   })
  62  |   await panel.getByRole('button', { name: 'Aplicar preço' }).click()
  63  |   await request
  64  |   await closeFilters(page)
  65  |   await page.getByLabel('Ordenar por').selectOption('price-desc')
  66  |   await expect(page.getByTestId('catalog-results').locator('article')).toHaveCount(2)
  67  |   await expect(page.getByTestId('catalog-results').locator('article').first()).toHaveAttribute('data-testid', 'nft-neon-vessel')
  68  |   await page.reload()
  69  |   await expect(page.getByLabel('Ordenar por')).toHaveValue('price-desc')
  70  |   await expect(page.getByTestId('catalog-results').locator('article').first()).toHaveAttribute('data-testid', 'nft-neon-vessel')
  71  |   await search(page, 'Cosmic')
  72  |   await expect(page.getByTestId('catalog-results').locator('article')).toHaveCount(1)
  73  |   await expect(page.getByTestId('nft-cosmic-bloom')).toBeVisible()
  74  |   await page.goBack()
  75  |   await expect(page.getByRole('textbox', { name: 'Buscar NFTs' })).toHaveValue('')
  76  |   await expect(page.getByTestId('catalog-results').locator('article')).toHaveCount(2)
  77  | })
  78  |
  79  | test('direct links preserve ETH precision and recover out-of-range or invalid URLs', async ({ page }) => {
  80  |   await page.goto('/?minPrice=1.190000000000000001&maxPrice=1.29')
  81  |   await expect(page.getByTestId('catalog-results').locator('article')).toHaveCount(2)
  82  |   await expect(page.getByTestId('nft-emerald-ape')).toHaveCount(0)
  83  |   await page.goto('/?page=999')
  84  |   await expect(page.getByRole('heading', { name: 'Página fora do intervalo' })).toBeVisible()
  85  |   await page.getByRole('button', { name: 'Voltar à primeira página' }).click()
  86  |   await expect(page.getByTestId('catalog-results').locator('article')).toHaveCount(9)
  87  |   await page.goto('/?page=-2&network=invalid&sort=invalid&minPrice=bad')
  88  |   await expect(page.getByTestId('catalog-results').locator('article')).toHaveCount(9)
  89  |   await expect(page.getByLabel('Ordenar por')).toHaveValue('featured')
  90  | })
  91  |
  92  | test('slow and failed MSW requests display skeletons, empty results and retry recovery', async ({ page }) => {
  93  |   await page.goto('/')
  94  |   await expect(page.getByTestId('nft-emerald-ape')).toBeVisible()
  95  |   await scenario(page, 'slow')
  96  |   await search(page, 'Cosmic')
  97  |   await expect(page.getByRole('status', { name: 'Carregando NFTs' })).toBeVisible()
  98  |   await expect(page.getByTestId('nft-cosmic-bloom')).toBeVisible()
  99  |   await scenario(page, 'flaky')
  100 |   await search(page, 'Violet')
  101 |   await expect(page.getByRole('alert')).toContainText('temporariamente indisponível')
  102 |   await page.getByRole('button', { name: 'Tentar novamente' }).click()
  103 |   await expect(page.getByTestId('nft-violet-nomad')).toBeVisible()
  104 |   await scenario(page, 'offline')
  105 |   await search(page, 'Golden')
  106 |   await expect(page.getByRole('alert')).toContainText('Não foi possível carregar os dados')
  107 |   await scenario(page, 'default')
  108 |   await page.getByRole('button', { name: 'Tentar novamente' }).click()
  109 |   await expect(page.getByTestId('nft-golden-beat')).toBeVisible()
  110 |   await search(page, 'nenhum-item-com-este-nome')
  111 |   await expect(page.getByRole('heading', { name: 'Nenhum NFT encontrado' })).toBeVisible()
  112 |   await page.getByRole('button', { name: 'Limpar busca e filtros' }).first().click()
  113 |   await expect(page.getByTestId('catalog-results').locator('article')).toHaveCount(9)
  114 | })
  115 |
  116 | test('a newer search cancels the older slow request without stale cards', async ({ page }) => {
  117 |   await page.goto('/')
  118 |   await expect(page.getByTestId('nft-emerald-ape')).toBeVisible()
  119 |   await scenario(page, 'race')
  120 |   const pending = page.waitForRequest(request => new URL(request.url()).searchParams.get('q') === 'Emerald')
  121 |   await search(page, 'Emerald')
  122 |   await pending
```