import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { createMarketSocket, subscribeToCatalog } from '@/lib/realtime'
import { catalogKeys } from './api'

export function useCatalogRealtime() {
  const queryClient = useQueryClient()
  useEffect(() => subscribeToCatalog(createMarketSocket(), () => {
    void queryClient.invalidateQueries({ queryKey: catalogKeys.all })
  }), [queryClient])
}
