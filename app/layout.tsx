import type { Metadata } from 'next'
import { Fredoka, Nunito } from 'next/font/google'
import './globals.css'

const fredoka = Fredoka({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-fredoka',
  display: 'swap',
})

const nunito = Nunito({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-nunito',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'HuellaClub - Programa de lealtad digital para negocios locales',
  description: 'Crea tu programa de lealtad digital en minutos. Tus clientes acumulan visitas y ganan recompensas. Prueba gratis 30 días.',
  keywords: 'programa de lealtad, lealtad digital, recompensas, negocios locales, Puebla, QR, clientes frecuentes',
  icons: {
    icon: '/favicon.png',
    apple: '/favicon.png',
  },
  openGraph: {
    title: 'HuellaClub - Programa de lealtad digital',
    description: 'Crea tu programa de lealtad digital en minutos. Prueba gratis 30 días.',
    url: 'https://huellaclub.app',
    siteName: 'HuellaClub',
    locale: 'es_MX',
    type: 'website',
    images: ['/favicon.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HuellaClub - Programa de lealtad digital',
    description: 'Crea tu programa de lealtad digital en minutos. Prueba gratis 30 días.',
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
    <html lang="es" className={`${fredoka.variable} ${nunito.variable}`}>
      <body className="font-sans">{children}</body>
    </html>
  )
}