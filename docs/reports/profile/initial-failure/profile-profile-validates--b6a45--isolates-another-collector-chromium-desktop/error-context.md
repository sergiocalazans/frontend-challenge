# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: profile.spec.ts >> profile validates, saves an avatar, survives refresh and isolates another collector
- Location: tests\e2e\profile.spec.ts:4:1

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.fill: Test timeout of 30000ms exceeded.
Call log:
  - waiting for getByRole('form', { name: 'Dados do perfil', exact: true }).getByLabel('E-mail', { exact: true })

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
    - generic [ref=f1e14]:
      - navigation "Navegação da conta" [ref=f1e15]:
        - heading "Meu perfil" [level=2] [ref=f1e16]
        - link "Dados do perfil" [ref=f1e17] [cursor=pointer]:
          - /url: /account/profile
        - link "Carteiras" [ref=f1e21] [cursor=pointer]:
          - /url: /account/wallets
      - generic [ref=f1e25]:
        - heading "Perfil do colecionador" [level=1] [ref=f1e26]
        - form "Dados do perfil" [ref=f1e27]:
          - generic [ref=f1e28]:
            - generic [ref=f1e29]:
              - text: Nome de exibição
              - generic [aria-hidden] [ref=f1e30]: "*"
            - textbox "Nome de exibição" [active] [invalid] [ref=f1e31]: Ana Editada
            - alert [ref=f1e32]: Informe um nome de 2 a 80 caracteres.
          - generic [ref=f1e33]:
            - generic [ref=f1e34]:
              - text: Nome de usuário
              - generic [aria-hidden] [ref=f1e35]: "*"
            - textbox "Nome de usuário" [ref=f1e36]: ana
          - generic [ref=f1e37]:
            - generic [ref=f1e38]:
              - text: E-mail
              - generic [aria-hidden] [ref=f1e39]: "*"
            - textbox "E-mail" [ref=f1e40]: ana@example.com
          - generic [ref=f1e41]:
            - generic [ref=f1e42]: Nome ENS (opcional)
            - textbox "Nome ENS (opcional)" [ref=f1e43]
          - generic [ref=f1e44]:
            - generic [ref=f1e45]:
              - text: Apelido da carteira
              - generic [aria-hidden] [ref=f1e46]: "*"
            - textbox "Apelido da carteira" [ref=f1e47]: Principal
          - generic [ref=f1e48]:
            - generic [ref=f1e49]:
              - generic "Sem avatar" [ref=f1e50]
              - button "Remover avatar" [disabled]
            - generic [ref=f1e54]:
              - generic [ref=f1e55]: Selecionar avatar
              - button "Selecionar avatar" [ref=f1e56]
              - paragraph [ref=f1e57]: PNG, JPEG ou WebP, até 256 KiB. Salve o perfil para confirmar.
          - button "Salvar perfil" [ref=f1e59] [cursor=pointer]
        - form "Alterar senha" [ref=f1e60]:
          - heading "Alterar senha" [level=2] [ref=f1e61]
          - generic [ref=f1e62]:
            - generic [ref=f1e63]:
              - text: Senha atual
              - generic [aria-hidden] [ref=f1e64]: "*"
            - textbox "Senha atual" [ref=f1e65]
          - generic [ref=f1e66]:
            - generic [ref=f1e67]:
              - text: Nova senha
              - generic [aria-hidden] [ref=f1e68]: "*"
            - textbox "Nova senha" [ref=f1e69]
          - generic [ref=f1e70]:
            - generic [ref=f1e71]:
              - text: Confirmar nova senha
              - generic [aria-hidden] [ref=f1e72]: "*"
            - textbox "Confirmar nova senha" [ref=f1e73]
          - paragraph [ref=f1e74]: A nova senha deve ter de 8 a 128 caracteres. Outras sessões serão encerradas.
          - button "Alterar senha" [ref=f1e75] [cursor=pointer]
  - contentinfo [ref=f1e76]:
    - generic [ref=f1e77]:
      - generic [ref=f1e78]:
        - paragraph [ref=f1e79]: KURIO
        - paragraph [ref=f1e80]: Feito para colecionadores,criadores e cultura.
      - navigation "Links do rodapé" [ref=f1e81]:
        - link "Explorar coleções" [ref=f1e82] [cursor=pointer]:
          - /url: /
        - link "Meu perfil" [ref=f1e83] [cursor=pointer]:
          - /url: /account/profile
        - link "Carteiras" [ref=f1e84] [cursor=pointer]:
          - /url: /account/wallets
      - generic [ref=f1e85]:
        - paragraph [ref=f1e86]: Uma nova forma de colecionar.
        - paragraph [ref=f1e87]: Ambiente de demonstração. Operações e transações são simuladas.
    - paragraph [ref=f1e88]: © 2026 Kurio · Jungle Gaming NFT Marketplace
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
> 10 |   await form.getByLabel('Nome de exibição').fill('Ana Editada');await form.getByLabel('E-mail',{exact:true}).fill('bruno@example.com')
     |                                                                                                              ^ Error: locator.fill: Test timeout of 30000ms exceeded.
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
  47 |   await expect(page.getByRole('status',{name:'Carregando perfil'})).toBeVisible();await expect(page.getByLabel('Nome de exibição',{exact:true})).toHaveValue('Ana Colecionadora')
  48 |   await scenario('error');await page.getByRole('navigation',{name:'Navegação da conta'}).getByRole('link',{name:'Carteiras',exact:true}).click();await page.getByRole('navigation',{name:'Navegação da conta'}).getByRole('link',{name:'Dados do perfil'}).click()
  49 |   await expect(page.getByRole('alert')).toContainText('Não foi possível carregar o perfil.')
  50 |   await scenario('default');await page.getByRole('button',{name:'Tentar novamente',exact:true}).click();await expect(page.getByLabel('Nome de exibição',{exact:true})).toHaveValue('Ana Colecionadora')
  51 | })
  52 |
```