import { fileURLToPath, URL } from 'node:url'
import { defineConfig,type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const preloadApplication:Plugin = {
  name:'preload-application',
  apply:'build',
  transformIndexHtml:{
    order:'post',
    handler(_html,context) {
      const entry = Object.values(context.bundle ?? {}).find(chunk => chunk.type === 'chunk' && Object.keys(chunk.modules).some(id => id.replaceAll('\\','/').endsWith('/src/app/mount.tsx')))
      if (!entry) throw new Error('Application entry chunk missing from preload manifest.')
      return [{tag:'link',attrs:{rel:'modulepreload',href:`/${entry.fileName}`,crossorigin:''},injectTo:'head'}]
    },
  },
}

export default defineConfig({
  // Fetch/compile the application during MSW startup, without executing it early.
  plugins: [react(), tailwindcss(),preloadApplication],
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  server: { host: '127.0.0.1', port: 5173, strictPort: true },
  preview: { host: '127.0.0.1', port: 4173, strictPort: true },
})
