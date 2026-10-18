# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: profile.spec.ts >> profile loading and MSW errors expose retry without losing saved account data
- Location: tests\e2e\profile.spec.ts:42:1

# Error details

```
Error: expect(locator).toHaveValue(expected) failed

Locator: getByLabel('Nome de exibição', { exact: true })
Expected: "Ana Colecionadora"
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toHaveValue" getByLabel('Nome de exibição', { exact: true }) with timeout 5000ms
  - waiting for getByLabel('Nome de exibição', { exact: true })

```

```yaml
- link "Pular para conteúdo":
  - /url: "#main-content"
- banner:
  - link "Kurio — início":
    - /url: /
    - text: KURIO
  - navigation "Navegação principal":
    - link "Início":
      - /url: /
    - link "Componentes":
      - /url: /design-system
  - link "Abrir carrinho":
    - /url: /cart
  - link "Ana Colecionadora":
    - /url: /account/profile
  - button "Sair"
- main:
  - navigation "Navegação da conta":
    - heading "Meu perfil" [level=2]
    - link "Dados do perfil":
      - /url: /account/profile
    - link "Carteiras":
      - /url: /account/wallets
  - heading "Perfil do colecionador" [level=1]
  - form "Dados do perfil":
    - text: Nome de exibição
    - textbox "Nome de exibição": Ana Colecionadora
    - text: Nome de usuário
    - textbox "Nome de usuário": ana
    - text: E-mail
    - textbox "E-mail": ana@example.com
    - text: Nome ENS (opcional)
    - textbox "Nome ENS (opcional)"
    - text: Apelido da carteira
    - textbox "Apelido da carteira": Principal
    - button "Remover avatar" [disabled]
    - text: Selecionar avatar
    - button "Selecionar avatar"
    - paragraph: PNG, JPEG ou WebP, até 256 KiB. Salve o perfil para confirmar.
    - button "Salvar perfil"
  - form "Alterar senha":
    - heading "Alterar senha" [level=2]
    - text: Senha atual
    - textbox "Senha atual"
    - text: Nova senha
    - textbox "Nova senha"
    - text: Confirmar nova senha
    - textbox "Confirmar nova senha"
    - paragraph: A nova senha deve ter de 8 a 128 caracteres. Outras sessões serão encerradas.
    - button "Alterar senha"
- contentinfo:
  - paragraph: KURIO
  - paragraph: Feito para colecionadores, criadores e cultura.
  - navigation "Links do rodapé":
    - link "Explorar coleções":
      - /url: /
    - link "Meu perfil":
      - /url: /account/profile
    - link "Carteiras":
      - /url: /account/wallets
  - paragraph: Uma nova forma de colecionar.
  - paragraph: Ambiente de demonstração. Operações e transações são simuladas.
  - paragraph: © 2026 Kurio · Jungle Gaming NFT Marketplace
```

# Test source

```ts
  1  | import { expect,test } from '@playwright/test'
  2  | import { loginViaApi } from './auth-helpers'
  3  |
  4  | test('profile validates, saves an avatar, survives refresh and isolates another collector',async ({page}) => {
  5  |   await loginViaApi(page);await page.goto('/account/profile')
  6  |   const form=page.getByRole('form',{name:'Dados do perfil',exact:true})
  7  |   await expect(form.getByLabel('Nome de exibição')).toHaveValue('Ana Colecionadora')
  8  |   await form.getByLabel('Nome de exibição').fill('');await form.getByRole('button',{name:'Salvar perfil',exact:true}).click()
  9  |   await expect(form.getByLabel('Nome de exibição')).toHaveAttribute('aria-invalid','true')
  10 |   await form.getByLabel('Nome de exibição').fill('Ana Editada');await form.getByLabel('E-mail',{exact:true}).fill('bruno@example.com')
  11 |   await form.getByRole('button',{name:'Salvar perfil',exact:true}).click();await expect(form.getByLabel('E-mail',{exact:true})).toHaveAccessibleDescription('Este e-mail já está cadastrado.')
  12 |   await form.getByLabel('E-mail',{exact:true}).fill('ana@example.com');await form.getByLabel('Nome de usuário').fill('ana_editada')
  13 |   await form.getByLabel('Selecionar avatar').setInputFiles({name:'invalid.svg',mimeType:'image/svg+xml',buffer:Buffer.from('<svg/>')})
  14 |   await expect(form.getByLabel('Selecionar avatar')).toHaveAttribute('aria-invalid','true')
  15 |   await form.getByLabel('Selecionar avatar').setInputFiles('public/images/emerald-ape.webp')
  16 |   await expect(form.getByRole('img',{name:'Avatar do colecionador'})).toBeVisible()
  17 |   await form.getByRole('button',{name:'Salvar perfil',exact:true}).click();await expect(form.getByRole('status')).toHaveText('Perfil salvo.')
  18 |   await page.reload();await expect(form.getByLabel('Nome de exibição')).toHaveValue('Ana Editada');await expect(form.getByRole('img')).toBeVisible()
  19 |   await form.getByRole('button',{name:'Remover avatar',exact:true}).click();await form.getByRole('button',{name:'Salvar perfil',exact:true}).click();await expect(form.getByRole('status')).toHaveText('Perfil salvo.')
  20 |   await page.reload();await expect(form.getByLabel('Nome de usuário')).toHaveValue('ana_editada');await expect(form.getByRole('img')).toHaveCount(0)
  21 |   expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  22 |   await loginViaApi(page,'bruno@example.com');await page.goto('/account/profile')
  23 |   await expect(form.getByLabel('Nome de exibição')).toHaveValue('Bruno Colecionador');await expect(form.getByLabel('Nome de usuário')).toHaveValue('bruno')
  24 | })
  25 |
  26 | test('password validates API errors and new credentials remain valid after refresh and logout',async ({page}) => {
  27 |   await loginViaApi(page);await page.goto('/account/profile')
  28 |   const form=page.getByRole('form',{name:'Alterar senha',exact:true})
  29 |   await form.getByLabel('Senha atual',{exact:true}).fill('wrong');await form.getByLabel('Nova senha',{exact:true}).fill('NewCollector456!');await form.getByLabel('Confirmar nova senha',{exact:true}).fill('different')
  30 |   await form.getByRole('button',{name:'Alterar senha',exact:true}).click();await expect(form.getByLabel('Confirmar nova senha',{exact:true})).toHaveAttribute('aria-invalid','true')
  31 |   await form.getByLabel('Confirmar nova senha',{exact:true}).fill('NewCollector456!');await form.getByRole('button',{name:'Alterar senha',exact:true}).click()
  32 |   await expect(form.getByLabel('Senha atual',{exact:true})).toHaveAccessibleDescription('Senha atual incorreta.')
  33 |   await form.getByLabel('Senha atual',{exact:true}).fill('Collector123!');await form.getByRole('button',{name:'Alterar senha',exact:true}).click()
  34 |   await expect(form.getByRole('status')).toContainText('Senha alterada.');await expect(form.getByLabel('Nova senha',{exact:true})).toHaveValue('')
  35 |   await page.reload();await page.getByRole('button',{name:'Sair',exact:true}).click();await page.goto('/login?returnTo=%2Faccount%2Fprofile')
  36 |   await page.getByRole('textbox',{name:'E-mail',exact:true}).fill('ana@example.com');await page.getByLabel(/^Senha/).fill('Collector123!');await page.getByRole('button',{name:'Entrar',exact:true}).last().click()
  37 |   await expect(page.getByText('E-mail ou senha incorretos.',{exact:true})).toBeVisible()
  38 |   await page.getByLabel(/^Senha/).fill('NewCollector456!');await page.getByRole('button',{name:'Entrar',exact:true}).last().click()
  39 |   await expect(page).toHaveURL('/account/profile');await expect(page.getByRole('form',{name:'Dados do perfil'}).getByLabel('Nome de exibição')).toHaveValue('Ana Colecionadora')
  40 | })
  41 |
  42 | test('profile loading and MSW errors expose retry without losing saved account data',async ({page}) => {
  43 |   await loginViaApi(page);await page.goto('/account/wallets')
  44 |   await expect(page.getByRole('heading',{name:'Carteiras',exact:true})).toBeVisible()
  45 |   const scenario=async (scenario:string) => page.evaluate(async scenario => {await fetch('/api/demo/scenario',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({scenario})})},scenario)
  46 |   await scenario('slow');await page.getByRole('navigation',{name:'Navegação da conta'}).getByRole('link',{name:'Dados do perfil'}).click()
> 47 |   await expect(page.getByRole('status',{name:'Carregando perfil'})).toBeVisible();await expect(page.getByLabel('Nome de exibição',{exact:true})).toHaveValue('Ana Colecionadora')
     |                                                                                                                                                  ^ Error: expect(locator).toHaveValue(expected) failed
  48 |   await scenario('error');await page.getByRole('navigation',{name:'Navegação da conta'}).getByRole('link',{name:'Carteiras',exact:true}).click();await page.getByRole('navigation',{name:'Navegação da conta'}).getByRole('link',{name:'Dados do perfil'}).click()
  49 |   await expect(page.getByRole('alert')).toContainText('Não foi possível carregar o perfil.')
  50 |   await scenario('default');await page.getByRole('button',{name:'Tentar novamente',exact:true}).click();await expect(page.getByLabel('Nome de exibição',{exact:true})).toHaveValue('Ana Colecionadora')
  51 | })
  52 |
```