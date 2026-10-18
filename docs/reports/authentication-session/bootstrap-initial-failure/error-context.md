# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth.spec.ts >> login restores protected context, refresh, logout and another user
- Location: tests\e2e\auth.spec.ts:9:1

# Error details

```
Error: expect(page).toHaveURL(expected) failed

Expected pattern: /login.*returnTo/
Received string:  "http://127.0.0.1:4173/account/profile?tab=details"
Timeout: 5000ms

Call log:
  - Expect "toHaveURL" with timeout 5000ms
    - locator resolved to <html lang="pt-BR">…</html>
    - unexpected value "http://127.0.0.1:4173/account/profile?tab=details"

```

# Test source

```ts
  1   | import { expect, test } from '@playwright/test'
  2   | import { loginViaApi } from './auth-helpers'
  3   |
  4   | async function credentials(page: import('@playwright/test').Page, email = 'ana@example.com', password = 'Collector123!') {
  5   |   await page.getByRole('textbox', { name: 'E-mail', exact: true }).fill(email)
  6   |   await page.getByLabel(/^Senha/).fill(password)
  7   |   await page.getByRole('button', { name: 'Entrar', exact: true }).last().click()
  8   | }
  9   | test('login restores protected context, refresh, logout and another user', async ({ page }) => {
  10  |   await page.goto('/account/profile?tab=details')
> 11  |   await expect(page).toHaveURL(/login.*returnTo/)
      |                      ^ Error: expect(page).toHaveURL(expected) failed
  12  |   await credentials(page, 'ana@example.com', 'incorrect')
  13  |   await expect(page.getByRole('alert')).toContainText('E-mail ou senha incorretos')
  14  |   await credentials(page)
  15  |   await expect(page).toHaveURL('/account/profile?tab=details')
  16  |   await expect(page.getByRole('button', { name: 'Sair', exact: true })).toBeVisible()
  17  |   await page.reload()
  18  |   await expect(page.getByRole('heading', { name: 'Perfil do colecionador' })).toBeVisible()
  19  |   await page.getByRole('button', { name: 'Sair', exact: true }).click()
  20  |   await expect(page).toHaveURL(/login/)
  21  |   await credentials(page, 'bruno@example.com')
  22  |   await expect(page).toHaveURL('/account/profile?tab=details')
  23  |   const user = await page.evaluate(async () => (await (await fetch('/api/session', { headers: { Authorization: `Bearer ${localStorage.getItem('kurio.session-token')}` } })).json()).user)
  24  |   expect(user.id).toBe('bruno')
  25  | })
  26  | test('registration validates, persists and reports API conflict', async ({ page }) => {
  27  |   await page.goto('/register?returnTo=%2Faccount%2Fwallets')
  28  |   await page.getByRole('button', { name: 'Criar perfil', exact: true }).click()
  29  |   await expect(page.getByLabel('Nome de usuário')).toHaveAttribute('aria-invalid', 'true')
  30  |   await page.getByLabel('Nome de usuário').fill('Nova Colecionadora')
  31  |   await page.getByRole('textbox', { name: 'E-mail', exact: true }).fill('ana@example.com')
  32  |   await page.getByLabel(/^Senha/).fill('Example123!')
  33  |   await page.getByLabel('Confirmar senha').fill('different')
  34  |   await page.getByRole('button', { name: 'Criar perfil', exact: true }).click()
  35  |   await expect(page.getByLabel('Confirmar senha')).toHaveAttribute('aria-invalid', 'true')
  36  |   await page.getByLabel('Confirmar senha').fill('Example123!')
  37  |   await page.getByRole('button', { name: 'Criar perfil', exact: true }).click()
  38  |   await expect(page.getByRole('textbox', { name: 'E-mail', exact: true })).toHaveAttribute('aria-invalid', 'true')
  39  |   await page.getByRole('textbox', { name: 'E-mail', exact: true }).fill('nova@example.com')
  40  |   await page.getByRole('button', { name: 'Criar perfil', exact: true }).click()
  41  |   await expect(page).toHaveURL('/account/wallets')
  42  |   await page.reload()
  43  |   await expect(page.getByRole('heading', { name: 'Carteiras', exact: true })).toBeVisible()
  44  |   expect(await page.evaluate(() => localStorage.getItem('kurio.mock-auth.v1'))).not.toContain('Example123!')
  45  | })
  46  | test('expiry preserves protected context and recovery; safe return target', async ({ page }) => {
  47  |   await page.goto('/login?returnTo=%2Fcheckout%3Fstep%3Dreview')
  48  |   await credentials(page)
  49  |   await expect(page).toHaveURL('/checkout?step=review')
  50  |   await page.evaluate(async () => { await fetch('/api/demo/auth', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'expire' }) }) })
  51  |   await page.reload()
  52  |   await expect(page).toHaveURL(/login.*returnTo/)
  53  |   await credentials(page)
  54  |   await expect(page).toHaveURL('/checkout?step=review')
  55  |   await page.goto('/login?returnTo=%2F%2Fevil.example')
  56  |   await credentials(page)
  57  |   await expect(page).toHaveURL('/')
  58  | })
  59  | test('slow submission prevents duplicate operations and server error recovers', async ({ page }) => {
  60  |   await page.goto('/login')
  61  |   await page.getByRole('textbox', { name: 'E-mail', exact: true }).fill('ana@example.com')
  62  |   await page.getByLabel(/^Senha/).fill('Collector123!')
  63  |   const scenario = async (action: string) => page.evaluate(async action => { await fetch('/api/demo/auth', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action }) }) }, action)
  64  |   await scenario('error')
  65  |   await page.getByRole('button', { name: 'Entrar', exact: true }).last().click()
  66  |   await expect(page.getByRole('alert')).toContainText('Serviço indisponível')
  67  |   await scenario('slow')
  68  |   await page.getByRole('button', { name: 'Entrar', exact: true }).last().click()
  69  |   await expect(page.getByRole('button', { name: 'Aguarde…' })).toBeDisabled()
  70  |   await expect(page).toHaveURL('/')
  71  | })
  72  | test('@visual login and registration layouts', async ({ page }) => {
  73  |   for (const route of ['login', 'register']) {
  74  |     await page.goto(`/${route}`)
  75  |     await expect(page.getByRole('textbox', { name: 'E-mail', exact: true })).toBeVisible()
  76  |     if (await page.evaluate(() => matchMedia('(min-width: 768px)').matches)) {
  77  |       await expect(page.getByTestId('nft-emerald-ape')).toBeVisible()
  78  |       await expect(page.getByText('Atualizando coleção…', { exact: true })).toHaveCount(0)
  79  |       await expect(page.getByRole('dialog').getByRole('textbox').first()).toBeFocused()
  80  |     }
  81  |     await page.evaluate(() => document.fonts.ready)
  82  |     await expect(page).toHaveScreenshot(`${route}.png`, { fullPage: true, animations: 'disabled' })
  83  |     expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  84  |   }
  85  | })
  86  | test('stale logout cannot clear the newer session created in another tab', async ({ page, context }) => {
  87  |   await loginViaApi(page)
  88  |   await page.goto('/account/profile')
  89  |   await expect(page.getByRole('heading', { name: 'Perfil do colecionador' })).toBeVisible()
  90  |   const scenario = (action: string) => page.evaluate(async action => { await fetch('/api/demo/auth', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action }) }) }, action)
  91  |   await scenario('hold-logout')
  92  |   const sent = page.waitForRequest(request => request.url().endsWith('/api/session') && request.method() === 'DELETE')
  93  |   await page.getByRole('button', { name: 'Sair', exact: true }).click()
  94  |   await sent
  95  |   const other = await context.newPage()
  96  |   await loginViaApi(other, 'bruno@example.com')
  97  |   const newerToken = await other.evaluate(() => localStorage.getItem('kurio.session-token'))
  98  |   await scenario('release-logout')
  99  |   await expect(page.getByRole('button', { name: 'Sair', exact: true })).toBeEnabled()
  100 |   await expect(page).toHaveURL('/account/profile')
  101 |   expect(await page.evaluate(() => localStorage.getItem('kurio.session-token'))).toBe(newerToken)
  102 |   await page.reload()
  103 |   await expect(page.getByRole('heading', { name: 'Perfil do colecionador' })).toBeVisible()
  104 |   const userId = await page.evaluate(async () => (await (await fetch('/api/session', { headers: { Authorization: `Bearer ${localStorage.getItem('kurio.session-token')}` } })).json()).user.id)
  105 |   expect(userId).toBe('bruno')
  106 | })
  107 |
```