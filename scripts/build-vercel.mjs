import { spawnSync,execFileSync } from 'node:child_process'
import { readFile,writeFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'

// Invoke npm through Node so the same command works on Windows and Vercel Linux.
const npmCli=process.env.npm_execpath
if(!npmCli) throw new Error('Execute with npm run build:vercel.')
const result=spawnSync(process.execPath,[npmCli,'run','build'],{stdio:'inherit',windowsHide:true,env:{...process.env,VITE_ENABLE_MOCKS:'true'}})
if(result.error) throw result.error
if(result.status!==0) process.exit(result.status??1)
const worker=await readFile('dist/mockServiceWorker.js')
if(!worker.toString().includes('Mock Service Worker')) throw new Error('MSW worker missing from the demo build.')
const commit=process.env.VERCEL_GIT_COMMIT_SHA || execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8',windowsHide:true}).trim()
let gitDirty=null
try {gitDirty=Boolean(execFileSync('git',['status','--porcelain'],{encoding:'utf8',windowsHide:true}).trim())} catch { /* Vercel can provide the commit without Git metadata. */ }
await writeFile('dist/build-info.json',JSON.stringify({commit,gitDirty,mocksEnabled:true,workerSha256:createHash('sha256').update(worker).digest('hex')},null,2))
