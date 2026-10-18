import { expect, test } from '@playwright/test'
import { loginViaApi } from './auth-helpers'

test('field associates help and errors, then accepts a valid value', async ({ page }) => {
  await page.goto('/design-system')
  const email = page.getByRole('textbox', { name: 'E-mail' })
  await page.getByRole('button', { name: 'Validar campo' }).click()
  await expect(email).toHaveAccessibleDescription('Exemplo local, sem cadastro. Informe um e-mail válido.')
  await expect(email).toHaveAttribute('aria-invalid', 'true')
  await email.fill('collector@example.com')
  await page.getByRole('button', { name: 'Validar campo' }).click()
  await expect(email).not.toHaveAttribute('aria-invalid', 'true')
  await expect(email).toHaveAccessibleDescription('Exemplo local, sem cadastro.')
  await expect(page.getByRole('status').filter({ hasText: 'Formato válido.' })).toContainText('Nenhum dado foi enviado ou salvo.')
})

test('drawer fits short screens, traps keyboard focus and restores trigger', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 500 })
  await page.goto('/design-system')
  const trigger = page.getByRole('button', { name: 'Abrir filtros' })
  await trigger.click()
  const drawer = page.getByRole('dialog', { name: 'Filtros da demonstração' })
  const bounds = await drawer.boundingBox()
  expect(bounds).toMatchObject({ x: 0, y: 0, width: 390, height: 500 })
  await expect(drawer.getByLabel('Rede')).toBeFocused()
  await page.keyboard.press('Shift+Tab')
  await expect(drawer.getByRole('button', { name: 'Fechar', exact: true })).toBeFocused()
  await page.keyboard.press('Escape')
  await expect(trigger).toBeFocused()
})

test('loading structures respect reduced motion and expose one label each', async ({ page }) => {
  await page.goto('/design-system')
  for (const name of ['Carregando detalhes do NFT', 'Carregando resumo da compra']) {
    const state = page.getByRole('status', { name })
    await expect(state).toBeVisible()
    const skeleton = state.locator('[data-slot="skeleton"]').first()
    expect(await skeleton.evaluate(element => getComputedStyle(element, '::after').animationName)).toBe('none')
    await page.emulateMedia({ reducedMotion: 'no-preference' })
    expect(await skeleton.evaluate(element => getComputedStyle(element, '::after').animationName)).toBe('shimmer')
    await page.emulateMedia({ reducedMotion: 'reduce' })
  }
})

test('account layout supports direct routes, navigation and narrow content', async ({ page }) => {
  await loginViaApi(page)
  await page.goto('/account/profile')
  const nav = page.getByRole('navigation', { name: 'Navegação da conta' })
  await expect(nav.getByRole('link', { name: 'Dados do perfil' })).toHaveAttribute('aria-current', 'page')
  await nav.getByRole('link', { name: 'Carteiras' }).click()
  await expect(page).toHaveURL('/account/wallets')
  await expect(nav.getByRole('link', { name: 'Carteiras' })).toHaveAttribute('aria-current', 'page')
  await expect(page.getByRole('main')).toBeFocused()
  await expect(page.getByRole('heading', { name: 'Carteiras', exact: true })).toBeVisible()
  await expect(page.getByRole('form', { name: 'Carteira principal', exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Salvar carteira', exact: true })).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await page.setViewportSize({ width: 320, height: 640 })
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
})

test('@visual account composition', async ({ page }) => {
  await loginViaApi(page)
  await page.goto('/account/profile')
  await page.evaluate(() => document.fonts.ready)
  await expect(page).toHaveScreenshot('account-layout.png', { fullPage: true, animations: 'disabled' })
})
