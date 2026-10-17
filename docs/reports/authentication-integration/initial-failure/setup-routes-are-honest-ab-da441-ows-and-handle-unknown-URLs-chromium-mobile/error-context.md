# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: setup.spec.ts >> routes are honest about pending flows and handle unknown URLs
- Location: tests\e2e\setup.spec.ts:73:1

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('heading', { name: 'Pagamento' })
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" getByRole('heading', { name: 'Pagamento' }) with timeout 5000ms
  - waiting for getByRole('heading', { name: 'Pagamento' })

```

```yaml
- link "Pular para conteúdo":
  - /url: "#main-content"
- main:
  - paragraph: KURIO
  - heading "Entre na sua conta" [level=1]
  - navigation "Acesso à conta":
    - link "Entrar":
      - /url: /login?returnTo=%2Fcheckout
    - link "Criar conta":
      - /url: /register?returnTo=%2Fcheckout
  - text: E-mail
  - textbox "E-mail"
  - text: Senha
  - textbox "Senha"
  - button "Mostrar senha"
  - button "Entrar"
  - status: Ambiente de demonstração. Use apenas dados fictícios.
  - paragraph: Login social e recuperação de senha não estão disponíveis nesta demonstração.
  - link "Voltar à coleção":
    - /url: /
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test'
  2  | import { loginViaApi } from './auth-helpers'
  3  |
  4  | test('catalog loads through MSW and restores search after refresh', async ({ page }) => {
  5  |   await page.goto('/')
  6  |   await expect(page.getByTestId('nft-emerald-ape')).toContainText('1.19 ETH')
  7  |   await page.getByRole('textbox', { name: 'Buscar NFTs' }).fill('Golden')
  8  |   await page.getByRole('button', { name: 'Buscar', exact: true }).click()
  9  |   await expect(page).toHaveURL(/q=Golden/)
  10 |   await expect(page.getByTestId('nft-golden-beat')).toBeVisible()
  11 |   await expect(page.getByTestId('nft-emerald-ape')).toHaveCount(0)
  12 |   await page.reload()
  13 |   await expect(page.getByRole('textbox', { name: 'Buscar NFTs' })).toHaveValue('Golden')
  14 |   await expect(page.getByTestId('nft-golden-beat')).toBeVisible()
  15 | })
  16 |
  17 | test('dialog traps focus, closes with Escape, and restores focus', async ({ page }) => {
  18 |   await page.goto('/design-system')
  19 |   const trigger = page.getByRole('button', { name: 'Abrir modal', exact: true })
  20 |   await trigger.click()
  21 |   const dialog = page.getByRole('dialog', { name: 'Detalhes da demonstração' })
  22 |   await expect(dialog).toBeVisible()
  23 |   await expect(page.getByLabel('Nome de exibição')).toBeFocused()
  24 |   await page.keyboard.press('Shift+Tab')
  25 |   await expect(dialog.getByRole('button', { name: 'Fechar', exact: true })).toBeFocused()
  26 |   await page.keyboard.press('Tab')
  27 |   await expect(page.getByLabel('Nome de exibição')).toBeFocused()
  28 |   await page.keyboard.press('Escape')
  29 |   await expect(dialog).toHaveCount(0)
  30 |   await expect(trigger).toBeFocused()
  31 | })
  32 |
  33 | test('validates fields, quantity limits and filter drawer', async ({ page }) => {
  34 |   await page.goto('/design-system')
  35 |   await page.getByRole('button', { name: 'Validar campo' }).click()
  36 |   await expect(page.getByLabel('E-mail')).toHaveAttribute('aria-invalid', 'true')
  37 |   await expect(page.getByText('Informe um e-mail válido.')).toBeVisible()
  38 |   await expect(page.getByRole('button', { name: 'Diminuir quantidade' })).toBeDisabled()
  39 |   for (let i = 0; i < 4; i++) await page.getByRole('button', { name: 'Aumentar quantidade' }).click()
  40 |   await expect(page.getByRole('button', { name: 'Aumentar quantidade' })).toBeDisabled()
  41 |   await page.getByRole('button', { name: 'Abrir filtros' }).click()
  42 |   await page.getByRole('dialog').getByLabel('Rede').selectOption('Polygon')
  43 |   await page.keyboard.press('Escape')
  44 |   await expect(page.getByTestId('nft-sage-nomad')).toBeVisible()
  45 |   await expect(page.getByTestId('nft-emerald-ape')).toHaveCount(0)
  46 | })
  47 |
  48 | test('renders slow, empty and error network scenarios, then recovers', async ({ page }) => {
  49 |   await page.goto('/design-system')
  50 |   await expect(page.getByTestId('nft-emerald-ape')).toBeVisible()
  51 |   const scenario = page.getByLabel('Cenário MSW')
  52 |   await scenario.selectOption('slow')
  53 |   await expect(page.getByRole('status', { name: 'Carregando NFTs' })).toBeVisible()
  54 |   await expect(page.getByTestId('nft-emerald-ape')).toBeVisible()
  55 |   await expect(scenario).toBeEnabled()
  56 |   await scenario.selectOption('empty')
  57 |   await expect(page.getByText('Nenhum NFT encontrado', { exact: true })).toBeVisible()
  58 |   await expect(scenario).toBeEnabled()
  59 |   await scenario.selectOption('error')
  60 |   await expect(page.getByRole('alert')).toContainText('temporariamente indisponível')
  61 |   await expect(scenario).toBeEnabled()
  62 |   await scenario.selectOption('default')
  63 |   await expect(page.getByTestId('nft-emerald-ape')).toBeVisible()
  64 | })
  65 |
  66 | test('real Socket.IO event reconciles updated REST data', async ({ page }) => {
  67 |   await page.goto('/design-system')
  68 |   const card = page.getByTestId('nft-emerald-ape')
  69 |   await expect(card).toContainText('1.19 ETH')
  70 |   await page.getByRole('button', { name: 'Simular alteração de preço' }).click()
  71 |   await expect(card).toContainText('1.29 ETH')
  72 | })
  73 |
  74 | test('routes are honest about pending flows and handle unknown URLs', async ({ page }) => {
> 75 |   await loginViaApi(page)
     |                                                                  ^ Error: expect(locator).toBeVisible() failed
  76 |   await page.goto('/checkout')
  77 |   await expect(page.getByRole('heading', { name: 'Pagamento' })).toBeVisible()
  78 |   await expect(page.getByText('Em desenvolvimento', { exact: true })).toBeVisible()
  79 |   await page.goto('/does-not-exist')
  80 |   await expect(page.getByRole('heading', { name: 'Página não encontrada' })).toBeVisible()
  81 | })
  82 |
  83 | test('@visual responsive shell and component library', async ({ page }) => {
  84 |   await page.goto('/')
  85 |   await expect(page.getByTestId('nft-emerald-ape')).toBeVisible()
  86 |   await page.evaluate(() => document.fonts.ready)
  87 |   await expect(page).toHaveScreenshot('catalog-shell.png', { fullPage: true, animations: 'disabled' })
  88 |   expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
  89 |   await page.goto('/design-system')
  90 |   await expect(page.getByTestId('nft-emerald-ape')).toBeVisible()
  91 |   await expect(page).toHaveScreenshot('design-system.png', { fullPage: true, animations: 'disabled' })
  92 |   expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
  93 | })
  94 |
```