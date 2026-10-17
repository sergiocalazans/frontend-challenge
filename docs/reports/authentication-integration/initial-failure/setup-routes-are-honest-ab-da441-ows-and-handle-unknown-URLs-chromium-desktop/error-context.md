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
- dialog "Entre na sua conta":
  - heading "Entre na sua conta" [level=2]
  - paragraph: Gerencie sua coleção e seu perfil de colecionador.
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
  - button "Fechar":
    - img
    - text: Fechar
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test'
  2  |
  3  | test('catalog loads through MSW and restores search after refresh', async ({ page }) => {
  4  |   await page.goto('/')
  5  |   await expect(page.getByTestId('nft-emerald-ape')).toContainText('1.19 ETH')
  6  |   await page.getByRole('textbox', { name: 'Buscar NFTs' }).fill('Golden')
  7  |   await page.getByRole('button', { name: 'Buscar', exact: true }).click()
  8  |   await expect(page).toHaveURL(/q=Golden/)
  9  |   await expect(page.getByTestId('nft-golden-beat')).toBeVisible()
  10 |   await expect(page.getByTestId('nft-emerald-ape')).toHaveCount(0)
  11 |   await page.reload()
  12 |   await expect(page.getByRole('textbox', { name: 'Buscar NFTs' })).toHaveValue('Golden')
  13 |   await expect(page.getByTestId('nft-golden-beat')).toBeVisible()
  14 | })
  15 |
  16 | test('dialog traps focus, closes with Escape, and restores focus', async ({ page }) => {
  17 |   await page.goto('/design-system')
  18 |   const trigger = page.getByRole('button', { name: 'Abrir modal', exact: true })
  19 |   await trigger.click()
  20 |   const dialog = page.getByRole('dialog', { name: 'Detalhes da demonstração' })
  21 |   await expect(dialog).toBeVisible()
  22 |   await expect(page.getByLabel('Nome de exibição')).toBeFocused()
  23 |   await page.keyboard.press('Shift+Tab')
  24 |   await expect(dialog.getByRole('button', { name: 'Fechar', exact: true })).toBeFocused()
  25 |   await page.keyboard.press('Tab')
  26 |   await expect(page.getByLabel('Nome de exibição')).toBeFocused()
  27 |   await page.keyboard.press('Escape')
  28 |   await expect(dialog).toHaveCount(0)
  29 |   await expect(trigger).toBeFocused()
  30 | })
  31 |
  32 | test('validates fields, quantity limits and filter drawer', async ({ page }) => {
  33 |   await page.goto('/design-system')
  34 |   await page.getByRole('button', { name: 'Validar campo' }).click()
  35 |   await expect(page.getByLabel('E-mail')).toHaveAttribute('aria-invalid', 'true')
  36 |   await expect(page.getByText('Informe um e-mail válido.')).toBeVisible()
  37 |   await expect(page.getByRole('button', { name: 'Diminuir quantidade' })).toBeDisabled()
  38 |   for (let i = 0; i < 4; i++) await page.getByRole('button', { name: 'Aumentar quantidade' }).click()
  39 |   await expect(page.getByRole('button', { name: 'Aumentar quantidade' })).toBeDisabled()
  40 |   await page.getByRole('button', { name: 'Abrir filtros' }).click()
  41 |   await page.getByRole('dialog').getByLabel('Rede').selectOption('Polygon')
  42 |   await page.keyboard.press('Escape')
  43 |   await expect(page.getByTestId('nft-sage-nomad')).toBeVisible()
  44 |   await expect(page.getByTestId('nft-emerald-ape')).toHaveCount(0)
  45 | })
  46 |
  47 | test('renders slow, empty and error network scenarios, then recovers', async ({ page }) => {
  48 |   await page.goto('/design-system')
  49 |   await expect(page.getByTestId('nft-emerald-ape')).toBeVisible()
  50 |   const scenario = page.getByLabel('Cenário MSW')
  51 |   await scenario.selectOption('slow')
  52 |   await expect(page.getByRole('status', { name: 'Carregando NFTs' })).toBeVisible()
  53 |   await expect(page.getByTestId('nft-emerald-ape')).toBeVisible()
  54 |   await expect(scenario).toBeEnabled()
  55 |   await scenario.selectOption('empty')
  56 |   await expect(page.getByText('Nenhum NFT encontrado', { exact: true })).toBeVisible()
  57 |   await expect(scenario).toBeEnabled()
  58 |   await scenario.selectOption('error')
  59 |   await expect(page.getByRole('alert')).toContainText('temporariamente indisponível')
  60 |   await expect(scenario).toBeEnabled()
  61 |   await scenario.selectOption('default')
  62 |   await expect(page.getByTestId('nft-emerald-ape')).toBeVisible()
  63 | })
  64 |
  65 | test('real Socket.IO event reconciles updated REST data', async ({ page }) => {
  66 |   await page.goto('/design-system')
  67 |   const card = page.getByTestId('nft-emerald-ape')
  68 |   await expect(card).toContainText('1.19 ETH')
  69 |   await page.getByRole('button', { name: 'Simular alteração de preço' }).click()
  70 |   await expect(card).toContainText('1.29 ETH')
  71 | })
  72 |
  73 | test('routes are honest about pending flows and handle unknown URLs', async ({ page }) => {
  74 |   await page.goto('/checkout')
> 75 |   await expect(page.getByRole('heading', { name: 'Pagamento' })).toBeVisible()
     |                                                                  ^ Error: expect(locator).toBeVisible() failed
  76 |   await expect(page.getByText('Em desenvolvimento', { exact: true })).toBeVisible()
  77 |   await page.goto('/does-not-exist')
  78 |   await expect(page.getByRole('heading', { name: 'Página não encontrada' })).toBeVisible()
  79 | })
  80 |
  81 | test('@visual responsive shell and component library', async ({ page }) => {
  82 |   await page.goto('/')
  83 |   await expect(page.getByTestId('nft-emerald-ape')).toBeVisible()
  84 |   await page.evaluate(() => document.fonts.ready)
  85 |   await expect(page).toHaveScreenshot('catalog-shell.png', { fullPage: true, animations: 'disabled' })
  86 |   expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
  87 |   await page.goto('/design-system')
  88 |   await expect(page.getByTestId('nft-emerald-ape')).toBeVisible()
  89 |   await expect(page).toHaveScreenshot('design-system.png', { fullPage: true, animations: 'disabled' })
  90 |   expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
  91 | })
  92 |
```