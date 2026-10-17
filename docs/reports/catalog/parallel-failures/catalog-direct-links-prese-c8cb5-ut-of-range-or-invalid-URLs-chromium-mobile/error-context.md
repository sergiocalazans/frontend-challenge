# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: catalog.spec.ts >> direct links preserve ETH precision and recover out-of-range or invalid URLs
- Location: tests\e2e\catalog.spec.ts:79:1

# Error details

```
Error: expect(locator).toHaveCount(expected) failed

Locator:  getByTestId('catalog-results').locator('article')
Expected: 2
Received: 0
Timeout:  5000ms

Call log:
  - Expect "toHaveCount" getByTestId('catalog-results').locator('article') with timeout 5000ms
  - waiting for getByTestId('catalog-results').locator('article')
    10 × locator resolved to 0 elements
       - unexpected value "0"

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
  22  |   await expect(results.locator('article')).toHaveCount(9)
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
> 81  |   await expect(page.getByTestId('catalog-results').locator('article')).toHaveCount(2)
      |                                                                        ^ Error: expect(locator).toHaveCount(expected) failed
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
  123 |   const cancelled = page.waitForEvent('requestfailed', { predicate: request => new URL(request.url()).searchParams.get('q') === 'Emerald' })
  124 |   await search(page, 'Golden')
  125 |   await cancelled
  126 |   await expect(page.getByTestId('nft-golden-beat')).toBeVisible()
  127 |   await expect(page.getByTestId('nft-emerald-ape')).toHaveCount(0)
  128 |   await expect(page).toHaveURL(/q=Golden/)
  129 | })
  130 |
  131 | test('Socket.IO reconciles prices against active filters and NFT links navigate', async ({ page }) => {
  132 |   await page.goto('/?q=Emerald&maxPrice=1.20')
  133 |   await expect(page.getByTestId('nft-emerald-ape')).toContainText('1.19 ETH')
  134 |   const response = await page.evaluate(async () => (await fetch('/api/demo/nfts/emerald-ape/update', { method: 'POST' })).status)
  135 |   expect(response).toBe(200)
  136 |   await expect(page.getByRole('heading', { name: 'Nenhum NFT encontrado' })).toBeVisible()
  137 |   await page.getByRole('button', { name: 'Limpar busca e filtros' }).first().click()
  138 |   await expect(page.getByTestId('nft-emerald-ape')).toContainText('1.29 ETH')
  139 |   await page.getByRole('link', { name: 'Ver Emerald Ape #042' }).click()
  140 |   await expect(page).toHaveURL('/nfts/emerald-ape')
  141 |   await expect(page.getByRole('heading', { name: 'Detalhes do NFT' })).toBeVisible()
  142 | })
  143 |
```