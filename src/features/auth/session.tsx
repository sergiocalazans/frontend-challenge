import { useEffect, useState, type ReactNode } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Navigate, useRouterState } from '@tanstack/react-router'
import { sessionKey, useSession } from './api'
import { saveToken } from './token'
import { ErrorState } from '@/components/shared/async-state'
import { Skeleton } from '@/components/ui/skeleton'

export function SessionLifecycle() {
  const client = useQueryClient()
  useEffect(() => {
    const clear = () => {
      saveToken(null)
      void client.cancelQueries({ predicate: query => query.queryKey[0] === 'private' })
      client.removeQueries({ predicate: query => query.queryKey[0] === 'private' })
      client.setQueryData(sessionKey, { user: null })
    }
    const changed = (event: StorageEvent) => {
      if (event.key === 'kurio.session-token') {
        void client.cancelQueries({ predicate: query => query.queryKey[0] === 'private' })
        client.removeQueries({ predicate: query => query.queryKey[0] === 'private' })
        // Pending verification keeps guards on the skeleton until the new identity is known.
        void client.resetQueries({ queryKey: sessionKey, exact: true })
      }
    }
    window.addEventListener('kurio:unauthorized', clear)
    window.addEventListener('storage', changed)
    return () => { window.removeEventListener('kurio:unauthorized', clear); window.removeEventListener('storage', changed) }
  }, [client])
  return null
}

export function RequireSession({ children }: { children: ReactNode }) {
  const query = useSession()
  const href = useRouterState({ select: state => state.location.href })
  const [returnTo] = useState(href)
  if (query.isPending) return <div role="status" aria-label="Recuperando sessão"><Skeleton className="shimmer h-48 w-full" /></div>
  if (query.data?.user === null) return <Navigate to="/login" search={{ returnTo }} replace />
  if (query.isError) return <ErrorState message="Não foi possível verificar sua sessão." onRetry={() => void query.refetch()} />
  return children
}
