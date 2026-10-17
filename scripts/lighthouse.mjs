import { mkdir, writeFile } from 'node:fs/promises'
import lighthouse from 'lighthouse'
import desktop from 'lighthouse/core/config/desktop-config.js'
import { launch } from 'chrome-launcher'
import { chromium } from '@playwright/test'
import { preview } from 'vite'

// Initial shell only. Add the real detail route after that feature is implemented.
const server = await preview({ preview: { host: '127.0.0.1', port: 4175, strictPort: true } })
const directory = 'reports/lighthouse'
await mkdir(directory, { recursive: true })
const results = []
try {
  for (const profile of ['mobile', 'desktop']) {
    for (let run = 1; run <= 3; run++) {
      const chrome = await launch({ chromePath: chromium.executablePath(), chromeFlags: ['--headless', '--disable-gpu'] })
      try {
        const result = await lighthouse('http://127.0.0.1:4175/', { port: chrome.port, output: ['html', 'json'], logLevel: 'error' }, profile === 'desktop' ? desktop : undefined)
        if (!result || result.lhr.runtimeError) throw new Error(result?.lhr.runtimeError?.message ?? 'No Lighthouse result')
        await writeFile(`${directory}/${profile}-${run}.html`, result.report[0])
        await writeFile(`${directory}/${profile}-${run}.json`, result.report[1])
        results.push({ profile, run, version: result.lhr.lighthouseVersion, scores: Object.fromEntries(Object.entries(result.lhr.categories).map(([key, value]) => [key, Math.round((value.score ?? 0) * 100)])), metrics: Object.fromEntries(['largest-contentful-paint', 'cumulative-layout-shift', 'total-blocking-time'].map(key => [key, result.lhr.audits[key].numericValue])) })
      } finally { await chrome.kill() }
    }
  }
  const median = values => [...values].sort((a,b) => a-b)[1]
  const medians = ['mobile', 'desktop'].map(profile => {
    const runs = results.filter(result => result.profile === profile)
    return { profile, scores: Object.fromEntries(Object.keys(runs[0].scores).map(key => [key, median(runs.map(run => run.scores[key]))])), metrics: Object.fromEntries(Object.keys(runs[0].metrics).map(key => [key, median(runs.map(run => run.metrics[key]))])) }
  })
  await writeFile(`${directory}/summary.json`, JSON.stringify({ date: new Date().toISOString(), node: process.version, platform: process.platform, url: '/', scope: 'Initial shell, not the full challenge audit', results, medians }, null, 2))
  console.log(JSON.stringify(medians, null, 2))
} finally { await new Promise((resolve, reject) => server.httpServer.close(error => error ? reject(error) : resolve())) }
