import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'HuellaClub - Programa de lealtad digital para negocios locales',
  description: 'Crea tu programa de lealtad digital en minutos. Tus clientes acumulan visitas y ganan recompensas. Prueba gratis 30 dias.',
  keywords: 'programa de lealtad, lealtad digital, recompensas, negocios locales, Puebla, QR, clientes frecuentes',
  openGraph: {
    title: 'HuellaClub - Programa de lealtad digital',
    description: 'Crea tu programa de lealtad digital en minutos. Prueba gratis 30 dias.',
    url: 'https://huellaclub.app',
    siteName: 'HuellaClub',
    locale: 'es_MX',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HuellaClub - Programa de lealtad digital',
    description: 'Crea tu programa de lealtad digital en minutos. Prueba gratis 30 dias.',
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: 'https://huellaclub.app',
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}