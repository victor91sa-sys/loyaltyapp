'use client'

import Link from 'next/link'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabase'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    const hash = window.location.hash
    if (hash.includes('access_token') || hash.includes('type=')) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'PASSWORD_RECOVERY') {
          router.push('/nueva-password')
        } else if (event === 'SIGNED_IN' && hash.includes('type=signup')) {
          router.push('/bienvenida')
        }
      })
      return () => subscription.unsubscribe()
    }
  }, [])

  return (
    <main className="min-h-screen bg-gray-950 flex flex-col">

      <nav className="flex items-center justify-between px-8 py-6">
        <span className="text-white font-bold text-xl">HuellaClub</span>
        <Link href="/login" className="text-gray-400 hover:text-white text-sm transition">
          Iniciar sesion
        </Link>
      </nav>

      <section className="flex flex-col items-center justify-center text-center px-8 py-20 flex-1">
        <div className="inline-block bg-indigo-900 text-indigo-300 text-xs font-semibold px-4 py-2 rounded-full mb-6">
          30 dias gratis sin tarjeta
        </div>
        <h1 className="text-5xl font-bold text-white mb-6 max-w-2xl leading-tight">
          Tu negocio merece clientes que regresen
        </h1>
        <p className="text-gray-400 text-lg mb-10 max-w-md">
          Crea tu programa de lealtad digital en minutos. Tus clientes escanean un QR, acumulan visitas y ganan recompensas.
        </p>
        <Link
          href="/registro"
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-4 px-8 rounded-xl transition text-lg mb-4"
        >
          Empieza gratis ahora
        </Link>
        <p className="text-gray-600 text-sm">Sin tarjeta de credito. Sin instalaciones.</p>
      </section>

      <section className="px-8 py-16 bg-gray-900">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-white font-bold text-2xl text-center mb-12">Como funciona</h2>
          <div className="grid grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl">1</div>
              <h3 className="text-white font-semibold mb-2">Registra tu negocio</h3>
              <p className="text-gray-400 text-sm">Configura tu programa en menos de 5 minutos</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl">2</div>
              <h3 className="text-white font-semibold mb-2">Comparte tu QR</h3>
              <p className="text-gray-400 text-sm">Imprimelo y ponlo en tu caja. Tus clientes lo escanean</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl">3</div>
              <h3 className="text-white font-semibold mb-2">Clientes que regresan</h3>
              <p className="text-gray-400 text-sm">Cada visita acerca al cliente a su recompensa</p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-8 py-16">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-white font-bold text-2xl text-center mb-12">Para cualquier negocio local</h2>
          <div className="grid grid-cols-3 gap-4">
            {['Cafeterias', 'Restaurantes', 'Barberias', 'Salones', 'Lavanderias', 'Farmacias'].map((negocio) => (
              <div key={negocio} className="bg-gray-900 rounded-2xl p-4 text-center">
                <p className="text-gray-300 text-sm">{negocio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-8 py-16 bg-indigo-600">
        <div className="max-w-lg mx-auto text-center">
          <h2 className="text-white font-bold text-3xl mb-4">Empieza hoy mismo</h2>
          <p className="text-indigo-200 mb-8">30 dias gratis. Sin tarjeta. Sin complicaciones.</p>
          <Link
            href="/registro"
            className="bg-white text-indigo-600 font-bold py-4 px-8 rounded-xl transition hover:bg-indigo-50 inline-block"
          >
            Crear mi programa de lealtad
          </Link>
        </div>
      </section>

      <footer className="px-8 py-8 border-t border-gray-900">
        <div className="max-w-3xl mx-auto flex justify-between items-center">
          <span className="text-gray-600 text-sm">HuellaClub 2026</span>
          <div className="flex gap-6">
            <Link href="/terminos" className="text-gray-600 hover:text-gray-400 text-sm transition">Terminos</Link>
            <Link href="/login" className="text-gray-600 hover:text-gray-400 text-sm transition">Iniciar sesion</Link>
          </div>
        </div>
      </footer>

    </main>
  )
}