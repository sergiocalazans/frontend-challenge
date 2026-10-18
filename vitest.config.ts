import { defineConfig } from 'vitest/config'
import { fileURLToPath, URL } from 'node:url'
export default defineConfig({
  // Exercise the real browser client; Node's default transport uses the ws package,
  // whereas MSW intercepts the standard global WebSocket used by the app.
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)), 'socket.io-client': 'socket.io-client/dist/socket.io.js' } },
  test: { include: ['tests/unit/**/*.test.ts'], environment: 'node', setupFiles: ['tests/unit/setup.ts'], testTimeout: 10_000 },
})
