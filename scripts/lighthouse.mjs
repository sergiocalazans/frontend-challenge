import { mkdir, writeFile } from 'node:fs/promises'
import lighthouse from 'lighthouse'
import desktop from 'lighthouse/core/config/desktop-config.js'
import { chromium } from '@playwright/test'
import { preview } from 'vite'

// Audit the actual catalog and detail with images, fonts and MSW enabled.
const server = await preview({ preview: { host: '127.0.0.1', port: 4175, strictPort: true } })
const directory = 'reports/lighthouse'
await mkdir(directory, { recursive: true })
const results = []
try {
  for (const [page, path] of [['home', '/'], ['detail', '/nfts/emerald-ape']]) {
  for (const profile of ['mobile', 'desktop']) {
    for (let run = 1; run <= 3; run++) {
      // Use the same headless Chromium distribution already exercised by E2E.
      const chrome = await chromium.launch({ headless: true, args: ['--remote-debugging-port=9223'] })
      try {
        const result = await lighthouse(`http://127.0.0.1:4175${path}`, { port: 9223, output: ['html', 'json'], logLevel: 'error' }, profile === 'desktop' ? desktop : undefined)
        if (!result || result.lhr.runtimeError) throw new Error(result?.lhr.runtimeError?.message ?? 'No Lighthouse result')
        await writeFile(`${directory}/${page}-${profile}-${run}.html`, result.report[0])
        await writeFile(`${directory}/${page}-${profile}-${run}.json`, result.report[1])
        results.push({ page, path, profile, run, version: result.lhr.lighthouseVersion, scores: Object.fromEntries(Object.entries(result.lhr.categories).map(([key, value]) => [key, Math.round((value.score ?? 0) * 100)])), metrics: Object.fromEntries(['largest-contentful-paint', 'cumulative-layout-shift', 'total-blocking-time'].map(key => [key, result.lhr.audits[key].numericValue])) })
      } finally { await chrome.close() }
    }
  }
  }
  const median = values => [...values].sort((a,b) => a-b)[1]
  const medians = ['home', 'detail'].flatMap(page => ['mobile', 'desktop'].map(profile => {
    const runs = results.filter(result => result.page === page && result.profile === profile)
    return { page, profile, scores: Object.fromEntries(Object.keys(runs[0].scores).map(key => [key, median(runs.map(run => run.scores[key]))])), metrics: Object.fromEntries(Object.keys(runs[0].metrics).map(key => [key, median(runs.map(run => run.metrics[key]))])) }
  }))
  await writeFile(`${directory}/summary.json`, JSON.stringify({ date: new Date().toISOString(), node: process.version, platform: process.platform, scope: 'Catalog and NFT detail; default mocks, images and fonts enabled', results, medians }, null, 2))
  console.log(JSON.stringify(medians, null, 2))
} finally { await new Promise((resolve, reject) => server.httpServer.close(error => error ? reject(error) : resolve())) }
