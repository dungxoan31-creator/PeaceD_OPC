import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { RootProvider } from 'fumadocs-ui/provider/next'
import './globals.css'

const siteUrl = 'https://github.com/dungxoan31-creator/PeaceD_OPC'

export const metadata: Metadata = {
  title: 'PeaceD OPC Docs',
  description: 'Product documentation for PeaceD OPC — the AI Agent Multi-Stream Orchestration & Governance Platform.',
  metadataBase: new URL(siteUrl),
  applicationName: 'PeaceD OPC Docs',
  icons: {
    icon: '/docs/favicon.ico',
    shortcut: '/docs/favicon.ico'
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: `${siteUrl}/docs`,
    siteName: 'PeaceD OPC',
    title: 'PeaceD OPC Docs',
    description: 'Product documentation for PeaceD OPC — the AI Agent Multi-Stream Orchestration & Governance Platform.'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PeaceD OPC Docs',
    description: 'Product documentation for PeaceD OPC — the AI Agent Multi-Stream Orchestration & Governance Platform.'
  },
  robots: {
    index: true,
    follow: true
  },
  alternates: {
    canonical: `${siteUrl}/docs`
  }
}

export default function RootLayout({
  children
}: Readonly<{
  children: ReactNode
}>) {
  return (
    <html lang="en" className="bg-background text-foreground" suppressHydrationWarning>
      <body className="font-sans antialiased" suppressHydrationWarning>
        <RootProvider search={{ enabled: false }} theme={{ defaultTheme: 'dark' }}>
          {children}
        </RootProvider>
      </body>
    </html>
  )
}
