import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Token Usage Dashboard',
  description: 'OpenCode token usage dashboard',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
