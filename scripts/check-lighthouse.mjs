import { readFile } from 'node:fs/promises'

const path = process.argv[2] ?? 'reports/lighthouse/summary.json'
const limits = { performance:90, accessibility:95, 'best-practices':95, seo:90 }
try {
  const summary = JSON.parse(await readFile(path,'utf8'))
  const failures = []
  if (!Array.isArray(summary.results) || summary.results.length !== 12 || !Array.isArray(summary.medians) || summary.medians.length !== 4) throw new Error('Esperados 12 resultados e 4 medianas.')
  for (const page of ['home','detail']) for (const viewport of ['mobile','desktop']) {
    const name = `${page}/${viewport}`
    const runs = summary.results.filter(run => run.page === page && run.profile === viewport)
    const rows = summary.medians.filter(row => row.page === page && row.profile === viewport)
    if (runs.length !== 3 || new Set(runs.map(run => run.run)).size !== 3 || !runs.every(run => [1,2,3].includes(run.run)) || rows.length !== 1) throw new Error(`${name}: rodadas ou mediana incompletas.`)
    for (const [category,limit] of Object.entries(limits)) {
      const values = runs.map(run => run.scores?.[category])
      if (!values.every(value => Number.isFinite(value) && value >= 0 && value <= 100)) throw new Error(`${name}: score inválido em ${category}.`)
      const actual = values.sort((a,b) => a-b)[1]
      if (rows[0].scores?.[category] !== actual) throw new Error(`${name}: mediana inconsistente em ${category}.`)
      if (actual < limit) failures.push(`${name} ${category}: ${actual} < ${limit}`)
    }
    for (const metric of ['largest-contentful-paint','cumulative-layout-shift','total-blocking-time']) {
      if (!runs.every(run => Number.isFinite(run.metrics?.[metric]) && run.metrics[metric] >= 0)) throw new Error(`${name}: métrica inválida em ${metric}.`)
      const actual = runs.map(run => run.metrics[metric]).sort((a,b) => a-b)[1]
      if (!Number.isFinite(rows[0].metrics?.[metric]) || Math.abs(rows[0].metrics[metric] - actual) > 0.000001) throw new Error(`${name}: mediana inconsistente em ${metric}.`)
    }
  }
  if (failures.length) { console.error(`Metas não atingidas:\n${failures.join('\n')}`); process.exitCode = 1 }
  else console.log('Lighthouse: 12 medições completas, medianas consistentes e todas as metas atingidas.')
} catch (error) {
  console.error(`Auditoria inválida: ${error instanceof Error ? error.message : String(error)}`)
  process.exitCode = 1
}
