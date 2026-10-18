import { expect, type Page } from '@playwright/test'
export async function loginViaApi(page: Page, email = 'ana@example.com') {
  await page.goto('/')
  await expect(page.getByTestId('nft-emerald-ape')).toBeVisible()
  await page.evaluate(async email => {
    const response = await fetch('/api/session', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password: 'Collector123!' }) })
    if (!response.ok) throw new Error('Login setup failed')
    const data = await response.json() as { token: string }
    localStorage.setItem('kurio.session-token', data.token)
  }, email)
}
