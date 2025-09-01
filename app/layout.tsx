import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: `${process.env.NEXT_PUBLIC_STATION_NAME || 'New Fire Radio'} - Online Radio Player`,
  description: `Listen to ${process.env.NEXT_PUBLIC_STATION_NAME || 'New Fire Radio'} live streaming. Beautiful, fast-loading online radio player.`,
  keywords: `${process.env.NEXT_PUBLIC_STATION_NAME || 'New Fire Radio'}, online radio, streaming, music, ${process.env.NEXT_PUBLIC_STATION_LOCATION || 'Ghana'}`,
  authors: [{ name: process.env.NEXT_PUBLIC_STATION_NAME || 'New Fire Radio' }],
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#FF6B35',
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}
