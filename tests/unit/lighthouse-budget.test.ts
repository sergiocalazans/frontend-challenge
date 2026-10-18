import { spawnSync } from 'node:child_process'
import { mkdtempSync,writeFileSync,unlinkSync,rmdirSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join,resolve } from 'node:path'
import { expect,it } from 'vitest'

function validFixture() {
  const scores = {performance:95,accessibility:100,'best-practices':100,seo:92}
  const metrics = {'largest-contentful-paint':1000,'cumulative-layout-shift':0,'total-blocking-time':0}
  const medians = ['home','detail'].flatMap(page => ['mobile','desktop'].map(profile => ({page,profile,scores:{...scores},metrics:{...metrics}})))
  return {medians,results:medians.flatMap(row => [1,2,3].map(run => ({...structuredClone(row),run})))}
}
function check(summary:unknown) {
  const directory = mkdtempSync(join(tmpdir(),'kurio-audit-')),path = join(directory,'summary.json')
  try {
    writeFileSync(path,JSON.stringify(summary))
    return spawnSync(process.execPath,[resolve('scripts/check-lighthouse.mjs'),path],{encoding:'utf8',windowsHide:true})
  } finally {unlinkSync(path);rmdirSync(directory)}
}
it('accepts complete reports that satisfy the original challenge budgets',() => {
  // Synthetic input tests the validator; it is not a Lighthouse measurement.
  const result = check(validFixture())
  expect(result.status).toBe(0)
  expect(result.stdout).toContain('todas as metas atingidas')
})
it('fails below-budget scores instead of silently accepting them',() => {
  const fixture = validFixture()
  for (const row of [...fixture.results,...fixture.medians]) row.scores.performance = 89
  const result = check(fixture)
  expect(result.status).toBe(1)
  expect(result.stderr).toContain('89 < 90')
})
it('rejects missing runs, inconsistent medians and malformed metrics',() => {
  const missing = validFixture();missing.results.pop()
  const inconsistent = validFixture();inconsistent.medians[0]!.scores.performance = 100
  const invalid = validFixture();invalid.results[0]!.metrics['total-blocking-time'] = -1
  for (const fixture of [missing,inconsistent,invalid]) {
    const result = check(fixture)
    expect(result.status).toBe(1)
    expect(result.stderr).toContain('Auditoria inválida')
  }
})
