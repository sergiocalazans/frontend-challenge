# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth.spec.ts >> @visual login and registration layouts
- Location: tests\e2e\auth.spec.ts:72:1

# Error details

```
Error: expect(page).toHaveScreenshot(expected) failed

Timeout: 5000ms
  Failed to take two consecutive stable screenshots.

  Snapshot: login.png

Call log:
  - Expect "toHaveScreenshot(login.png)" with timeout 5000ms
    - verifying given screenshot expectation
  - taking page screenshot
    - disabled all CSS animations
  - waiting for fonts to load...
  - fonts loaded
  - 202 pixels (ratio 0.01 of all image pixels) are different.
  - waiting 100ms before taking screenshot
  - taking page screenshot
    - disabled all CSS animations
  - waiting for fonts to load...
  - fonts loaded
  - 202 pixels (ratio 0.01 of all image pixels) are different.
  - waiting 250ms before taking screenshot
  - Timeout 5000ms exceeded.

```

# Page snapshot

```yaml
- generic:
  - generic [aria-hidden]:
    - link:
      - /url: "#main-content"
      - text: Pular para conteúdo
    - banner:
      - link:
        - /url: /
        - text: KURIO
      - navigation:
        - link:
          - /url: /
          - text: Início
        - link:
          - /url: /design-system
          - text: Componentes
      - generic:
        - link:
          - /url: /cart
        - link:
          - /url: /login
          - text: Entrar
    - main:
      - generic [aria-hidden]:
        - region:
          - generic:
            - paragraph: Bem-vindo à Kurio
            - heading [level=1]: SEJA DONO DO FUTURO DA ARTE DIGITAL
            - paragraph: Descubra NFTs selecionados de criadores emergentes e consagrados.
            - link:
              - /url: "#catalogo"
              - text: Explorar coleções
        - region:
          - generic:
            - generic:
              - paragraph: Arte para colecionar
              - heading [level=2]: Todos os NFTs
            - generic:
              - search:
                - generic: Buscar NFTs
                - textbox:
                  - /placeholder: Explorar coleções
                - button
          - generic:
            - generic:
              - complementary:
                - heading [level=2]: Coleções
                - group:
                  - generic: Categoria
                  - generic:
                    - radio [checked]
                    - text: Todas as coleções
                  - generic:
                    - radio
                    - text: Arte digital
                  - generic:
                    - radio
                    - text: Fotografia
                  - generic:
                    - radio
                    - text: Música
                  - generic:
                    - radio
                    - text: Arte 3D
                  - generic:
                    - radio
                    - text: Colecionáveis
                  - generic:
                    - radio
                    - text: Generativa
                  - generic:
                    - radio
                    - text: Jogos
                  - generic:
                    - radio
                    - text: Assinaturas
                  - generic:
                    - radio
                    - text: Utilidade
                - generic:
                  - heading [level=3]: Faixa de preço
                  - generic:
                    - generic: Preço mínimo (ETH)
                    - textbox:
                      - /placeholder: 0,00
                  - generic:
                    - generic: Preço máximo (ETH)
                    - textbox:
                      - /placeholder: Sem limite
                  - button: Aplicar preço
                - generic:
                  - generic: Rede
                  - combobox
                - button: Limpar filtros
            - generic:
              - generic:
                - status: 24 NFTs encontrados
                - generic:
                  - generic: Ordenar por
                  - combobox
              - status
              - generic:
                - article:
                  - link:
                    - /url: /nfts/emerald-ape
                    - heading [level=3]: "Emerald Ape #042"
                  - paragraph: 1.19 ETH
                  - paragraph: Ethereum
                  - paragraph: 8 disponíveis
                - article:
                  - link:
                    - /url: /nfts/sage-nomad
                    - heading [level=3]: "Sage Nomad #009"
                  - paragraph: 1.69 ETH
                  - paragraph: Polygon
                  - paragraph: 12 disponíveis
                - article:
                  - link:
                    - /url: /nfts/neon-vessel
                    - heading [level=3]: "Neon Vessel #552"
                  - paragraph: 1.99 ETH
                  - paragraph: Ethereum
                  - paragraph: 5 disponíveis
                - article:
                  - link:
                    - /url: /nfts/golden-beat
                    - heading [level=3]: "Golden Beat #207"
                  - paragraph: 0.99 ETH
                  - paragraph: Solana
                  - paragraph: 20 disponíveis
                - article:
                  - link:
                    - /url: /nfts/cosmic-bloom
                    - heading [level=3]: "Cosmic Bloom #100"
                  - paragraph: 1.29 ETH
                  - paragraph: Ethereum
                  - paragraph: Esgotado
                - article:
                  - link:
                    - /url: /nfts/violet-nomad
                    - heading [level=3]: "Violet Nomad #101"
                  - paragraph: 1.39 ETH
                  - paragraph: Polygon
                  - paragraph: 2 disponíveis
                - article:
                  - link:
                    - /url: /nfts/ivory-baron
                    - heading [level=3]: "Ivory Baron #102"
                  - paragraph: 1.79 ETH
                  - paragraph: Solana
                  - paragraph: 3 disponíveis
                - article:
                  - link:
                    - /url: /nfts/amber-signal
                    - heading [level=3]: "Amber Signal #103"
                  - paragraph: 0.39 ETH
                  - paragraph: Ethereum
                  - paragraph: 4 disponíveis
                - article:
                  - link:
                    - /url: /nfts/jade-echo
                    - heading [level=3]: "Jade Echo #104"
                  - paragraph: 0.02 ETH
                  - paragraph: Polygon
                  - paragraph: 5 disponíveis
              - paragraph: Página 1 de 3
              - navigation:
                - button [disabled]: Anterior
                - generic:
                  - link:
                    - /url: /#catalogo
                    - text: "1"
                - generic:
                  - link:
                    - /url: /?page=2#catalogo
                    - text: "2"
                - generic:
                  - link:
                    - /url: /?page=3#catalogo
                    - text: "3"
                - link:
                  - /url: /?page=2#catalogo
                  - text: Próxima
    - contentinfo:
      - generic:
        - generic:
          - paragraph: KURIO
          - paragraph: Feito para colecionadores, criadores e cultura.
        - navigation:
          - link:
            - /url: /
            - text: Explorar coleções
          - link:
            - /url: /account/profile
            - text: Meu perfil
          - link:
            - /url: /account/wallets
            - text: Carteiras
        - generic:
          - paragraph: Uma nova forma de colecionar.
          - paragraph: Ambiente de demonstração. Operações e transações são simuladas.
      - paragraph: © 2026 Kurio · Jungle Gaming NFT Marketplace
  - dialog [ref=e2]:
    - heading "Entre na sua conta" [level=2] [ref=e3]
    - paragraph [ref=e4]: Gerencie sua coleção e seu perfil de colecionador.
    - navigation "Acesso à conta" [ref=e5]:
      - link "Entrar" [ref=e6] [cursor=pointer]:
        - /url: /login?returnTo=%2F
      - link "Criar conta" [ref=e7] [cursor=pointer]:
        - /url: /register?returnTo=%2F
    - generic [ref=e8]:
      - generic [ref=e9]:
        - generic [ref=e10]:
          - text: E-mail
          - generic [aria-hidden] [ref=e11]: "*"
        - textbox "E-mail" [active] [ref=e12]
      - generic [ref=e13]:
        - generic [ref=e14]:
          - generic [ref=e15]:
            - text: Senha
            - generic [aria-hidden] [ref=e16]: "*"
          - textbox "Senha" [ref=e17]
        - button "Mostrar senha" [ref=e18] [cursor=pointer]
      - button "Entrar" [ref=e19] [cursor=pointer]
      - status [ref=e20]: Ambiente de demonstração. Use apenas dados fictícios.
    - paragraph [ref=e21]: Login social e recuperação de senha não estão disponíveis nesta demonstração.
    - button "Fechar" [ref=e22] [cursor=pointer]
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
  11  |   await expect(page).toHaveURL(/login.*returnTo/)
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
  76  |     await page.evaluate(() => document.fonts.ready)
> 77  |     await expect(page).toHaveScreenshot(`${route}.png`, { fullPage: true, animations: 'disabled' })
      |                        ^ Error: expect(page).toHaveScreenshot(expected) failed
  78  |     expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  79  |   }
  80  | })
  81  | test('stale logout cannot clear the newer session created in another tab', async ({ page, context }) => {
  82  |   await loginViaApi(page)
  83  |   await page.goto('/account/profile')
  84  |   await expect(page.getByRole('heading', { name: 'Perfil do colecionador' })).toBeVisible()
  85  |   const scenario = (action: string) => page.evaluate(async action => { await fetch('/api/demo/auth', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action }) }) }, action)
  86  |   await scenario('hold-logout')
  87  |   const sent = page.waitForRequest(request => request.url().endsWith('/api/session') && request.method() === 'DELETE')
  88  |   await page.getByRole('button', { name: 'Sair', exact: true }).click()
  89  |   await sent
  90  |   const other = await context.newPage()
  91  |   await loginViaApi(other, 'bruno@example.com')
  92  |   const newerToken = await other.evaluate(() => localStorage.getItem('kurio.session-token'))
  93  |   await scenario('release-logout')
  94  |   await expect(page.getByRole('button', { name: 'Sair', exact: true })).toBeEnabled()
  95  |   await expect(page).toHaveURL('/account/profile')
  96  |   expect(await page.evaluate(() => localStorage.getItem('kurio.session-token'))).toBe(newerToken)
  97  |   await page.reload()
  98  |   await expect(page.getByRole('heading', { name: 'Perfil do colecionador' })).toBeVisible()
  99  |   const userId = await page.evaluate(async () => (await (await fetch('/api/session', { headers: { Authorization: `Bearer ${localStorage.getItem('kurio.session-token')}` } })).json()).user.id)
  100 |   expect(userId).toBe('bruno')
  101 | })
  102 |
```