import { useEffect } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { applyFont, useFontStore } from '@/shared/hooks/useFontStore'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
})

function FontHydrate() {
  const fontId = useFontStore(s => s.fontId)
  useEffect(() => { applyFont(fontId) }, [fontId])
  return null
}

export function Providers({ children }: { children: React.ReactNode }) {
  const fontId = useFontStore(s => s.fontId)
  const stack = fontId === 'jakarta' ? '"Plus Jakarta Sans", system-ui, sans-serif'
    : fontId === 'roboto' ? '"Roboto", system-ui, sans-serif'
    : fontId === 'opensans' ? '"Open Sans", system-ui, sans-serif'
    : '"Inter", system-ui, sans-serif'
  return (
    <QueryClientProvider client={queryClient}>
      <FontHydrate />
      {children}
      <Toaster
        position="top-right"
        richColors
        closeButton
        toastOptions={{
          style: { fontFamily: stack },
        }}
      />
    </QueryClientProvider>
  )
}
