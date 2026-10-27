import './globals.css'

import type { Metadata } from 'next'
import type { ReactNode } from 'react'

import { Providers } from './providers'

export const metadata: Metadata = {
  title: 'Funcionários',
  description: 'Cadastro e gestão de funcionários',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-muted/30">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
