# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: audits.spec.ts >> keyboard review, confirmation and receipt restore focus without a pointer
- Location: tests\e2e\audits.spec.ts:5:1

# Error details

```
Error: expect(locator).toBeFocused() failed

Locator:  getByRole('region', { name: 'Revisão da compra', exact: true })
Expected: focused
Received: inactive
Timeout:  5000ms

Call log:
  - Expect "toBeFocused" getByRole('region', { name: 'Revisão da compra', exact: true }) with timeout 5000ms
  - waiting for getByRole('region', { name: 'Revisão da compra', exact: true })
    12 × locator resolved to <section tabindex="-1" id="purchase-review" class="mt-5 border-t pt-5" aria-label="Revisão da compra">…</section>
       - unexpected value "inactive"

```

```yaml
- region "Revisão da compra":
  - heading "Revise sua compra" [level=3]
  - paragraph: "Colecionador: Ana Colecionadora · ana@example.com"
  - paragraph: Cotação válida por até 2 minutos. Estoque, preço, cupom e conexão serão revalidados na confirmação.
  - button "Confirmar compra"
```

# Test source

```ts
  1  | import { expect,test } from '@playwright/test'
  2  | import { loginViaApi } from './auth-helpers'
  3  | import { addFromDetail,prepareCheckout,seedWallet } from './commerce-helpers'
  4  |
  5  | test('keyboard review, confirmation and receipt restore focus without a pointer',async ({page}) => {
  6  |   await prepareCheckout(page)
  7  |   await page.getByRole('button',{name:'Revisar compra',exact:true}).focus()
  8  |   await page.keyboard.press('Enter')
  9  |   const review = page.getByRole('region',{name:'Revisão da compra',exact:true})
> 10 |   await expect(review).toBeFocused()
     |                        ^ Error: expect(locator).toBeFocused() failed
  11 |   await page.keyboard.press('Tab')
  12 |   await expect(page.getByRole('button',{name:'Confirmar compra',exact:true})).toBeFocused()
  13 |   await page.keyboard.press('Enter')
  14 |   const receipt = page.getByRole('dialog',{name:'Compra confirmada na simulação'})
  15 |   await expect(receipt.getByRole('heading',{name:'Compra confirmada na simulação',exact:true})).toBeFocused()
  16 |   await page.keyboard.press('Tab')
  17 |   await expect(receipt.getByRole('link',{name:'Continuar explorando',exact:true})).toBeFocused()
  18 |   await expect(receipt.getByRole('link',{name:'Continuar explorando',exact:true})).toBeVisible()
  19 |   await page.keyboard.press('Escape')
  20 |   await expect(page.getByRole('button',{name:'Ver recibo',exact:true})).toBeFocused()
  21 | })
  22 |
  23 | test('@visual saved wallet layout and narrow reflow preserve the complete form',async ({page}) => {
  24 |   await loginViaApi(page);await seedWallet(page);await page.goto('/account/wallets')
  25 |   const primary = page.getByRole('form',{name:'Carteira principal',exact:true})
  26 |   await expect(primary.getByLabel('Apelido da carteira')).toHaveValue('Principal')
  27 |   await expect(page.getByRole('button',{name:'Adicionar carteira secundária',exact:true})).toBeVisible()
  28 |   await page.evaluate(() => document.fonts.ready)
  29 |   await page.getByRole('main').focus()
  30 |   await expect(page).toHaveScreenshot('wallets.png',{fullPage:true,animations:'disabled'})
  31 |   await page.setViewportSize({width:320,height:640})
  32 |   expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  33 |   await primary.getByRole('button',{name:'Salvar carteira',exact:true}).scrollIntoViewIfNeeded()
  34 |   await expect(primary.getByRole('button',{name:'Salvar carteira',exact:true})).toBeVisible()
  35 | })
  36 |
  37 | test('MSW connection failure preserves the cart and retry restores checkout access',async ({page}) => {
  38 |   await addFromDetail(page)
  39 |   await page.getByRole('link',{name:/Continuar explorando/}).click()
  40 |   await page.evaluate(async () => {await fetch('/api/demo/scenario',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({scenario:'offline'})})})
  41 |   await page.getByRole('link',{name:'Abrir carrinho',exact:true}).click()
  42 |   await expect(page.getByRole('alert')).toContainText('Não foi possível carregar os dados')
  43 |   await expect(page.getByTestId('cart-item-emerald-ape-fifty')).toBeVisible()
  44 |   await expect(page.getByRole('link',{name:'Conectar e finalizar',exact:true})).toHaveAttribute('aria-disabled','true')
  45 |   await page.evaluate(async () => {await fetch('/api/demo/scenario',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({scenario:'default'})})})
  46 |   await page.getByRole('button',{name:'Tentar novamente',exact:true}).click()
  47 |   await expect(page.getByTestId('purchase-total')).toHaveText('1.1916 ETH')
  48 |   await expect(page.getByRole('link',{name:'Conectar e finalizar',exact:true})).toHaveAttribute('aria-disabled','false')
  49 | })
  50 |
```