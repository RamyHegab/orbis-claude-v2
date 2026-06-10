import type { Metadata } from 'next'
import './globals.css'
import Sidebar from '@/components/Sidebar'

export const metadata: Metadata = {
  title: 'Orbis — International Office CRM',
  description: 'International student recruitment CRM for universities',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Sidebar />
        <main className="main-content">
          {children}
        </main>
      </body>
    </html>
  )
}
