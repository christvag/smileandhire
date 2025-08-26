'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import { AuthProvider } from '../contexts/AuthContext'
import { NextAuthProvider } from '../contexts/NextAuthContext'
import SessionProvider from '../components/providers/SessionProvider'
// import { Toaster } from 'sonner'

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            retry: (failureCount, error: any) => {
              if (error?.status === 404) return false
              return failureCount < 2
            },
          },
        },
      })
  )

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        {children}
        {/* <Toaster position="top-right" richColors /> */}
      </QueryClientProvider>
    </AuthProvider>
  )
}