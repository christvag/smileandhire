import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { DebugOverlay } from '../components/debug/DebugOverlay'

const inter = Inter({ subsets: ['latin'] })

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export const metadata: Metadata = {
  title: 'Worky Happy - Job Board & HR Management Platform',
  description: 'Connect talented professionals with amazing opportunities. AI-powered job matching and comprehensive HR management.',
  keywords: ['jobs', 'careers', 'hiring', 'recruitment', 'HR', 'virtual assistant'],
  authors: [{ name: 'Worky Happy Team' }],
  robots: 'index, follow',
  openGraph: {
    title: 'Worky Happy - Job Board & HR Management Platform',
    description: 'Connect talented professionals with amazing opportunities.',
    type: 'website',
    locale: 'en_US',
    siteName: 'Worky Happy',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Worky Happy - Job Board & HR Management Platform',
    description: 'Connect talented professionals with amazing opportunities.',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <Providers>
          {children}
          <DebugOverlay />
        </Providers>
      </body>
    </html>
  )
}