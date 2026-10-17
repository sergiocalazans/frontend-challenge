import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from '@tanstack/react-router'
import { createQueryClient } from './query-client'
import { router } from './router'

export function mountApp() {
  const root = document.getElementById('root')
  if (!root) throw new Error('Missing root element')
  createRoot(root).render(<StrictMode><QueryClientProvider client={createQueryClient()}><RouterProvider router={router} /></QueryClientProvider></StrictMode>)
}
