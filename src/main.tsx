import '@fontsource/ibm-plex-mono/latin-400.css'
import '@fontsource/ibm-plex-mono/latin-500.css'
import '@fontsource/ibm-plex-mono/latin-600.css'
import './styles/globals.css'
import { env } from './lib/env'

async function bootstrap() {
  if (env.mocks) {
    const { worker } = await import('./mocks/browser')
    await worker.start({
      serviceWorker: { url: '/mockServiceWorker.js', options: { scope: '/', updateViaCache: 'none' } },
      quiet: true,
      onUnhandledRequest(request, print) {
        if (new URL(request.url).pathname.startsWith('/api/')) print.error()
      },
    })
  }
  // Socket.IO must be imported after the WebSocket interceptor is active.
  const { mountApp } = await import('./app/mount')
  mountApp()
}

void bootstrap().catch(() => {
  const root = document.getElementById('root')
  if (root) {
    root.setAttribute('role', 'alert')
    root.textContent = 'Não foi possível iniciar a aplicação. Recarregue a página para tentar novamente.'
  }
})
