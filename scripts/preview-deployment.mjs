// Local static routing rehearsal. This is not the Vercel platform or an API mock.
import { createServer } from 'node:http'
import { readFile,stat } from 'node:fs/promises'
import { resolve,sep,extname } from 'node:path'
const config=JSON.parse(await readFile('vercel.json','utf8'))
const root=resolve('dist'),index=await readFile(resolve(root,'index.html'))
const types={'.html':'text/html; charset=utf-8','.js':'application/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.webp':'image/webp','.png':'image/png','.svg':'image/svg+xml','.woff':'font/woff','.woff2':'font/woff2'}
const matches=(pattern,path) => new RegExp(`^${pattern}$`).test(path)
const server=createServer(async (request,response) => {
  try {
    if(!['GET','HEAD'].includes(request.method)) {response.writeHead(405);response.end();return}
    const path=decodeURIComponent(new URL(request.url,'http://localhost').pathname)
    let file=resolve(root,`.${path}`)
    if(file!==root && !file.startsWith(root+sep)) {response.writeHead(400);response.end();return}
    let exists=false
    try {exists=(await stat(file)).isFile()} catch { /* A route may need the SPA fallback. */ }
    if(!exists) {
      const rewrite=config.rewrites.find(rule => matches(rule.source,path))
      if(!rewrite) {response.writeHead(404,{'Content-Type':'text/plain; charset=utf-8'});response.end('Not found');return}
      file=resolve(root,`.${rewrite.destination}`)
    }
    const headers={'Content-Type':types[extname(file)]??'application/octet-stream'}
    for(const rule of config.headers??[]) if(matches(rule.source,path)) for(const header of rule.headers) headers[header.key]=header.value
    response.writeHead(200,headers)
    response.end(request.method==='HEAD' ? undefined : file===resolve(root,'index.html') ? index : await readFile(file))
  } catch {response.writeHead(400);response.end('Bad request')}
})
server.listen(4177,'127.0.0.1',() => console.log('Local routing rehearsal: http://127.0.0.1:4177 (not a published deployment)'))
for(const signal of ['SIGINT','SIGTERM']) process.on(signal,() => server.close(() => process.exit(0)))
