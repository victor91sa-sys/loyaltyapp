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
          Ya tengo cuenta
        </Link>
      </nav>

      <section className="flex flex-col items-center justify-center text-center px-8 py-20 flex-1">
        <h1 className="text-5xl font-bold text-white mb-6 max-w-2xl leading-tight">
          Un sistema para que tus clientes tengan razones para regresar a comprarte mas
        </h1>
        <p className="text-gray-400 text-lg mb-4 max-w-lg">
          Solo pones un codigo QR en tu negocio. Tus clientes lo escanean, acumulan visitas y ganan premios. Sin apps, sin aparatos, sin complicaciones.
        </p>
        <p className="text-gray-500 text-sm mb-10 max-w-md">
          Funciona para abarrotes, tortillerias, taquerias, tianguis y cualquier negocio local.
        </p>
        <Link
          href="/registro"
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-10 rounded-xl transition text-lg mb-3"
        >
          Pruebalo gratis 30 dias
        </Link>
        <p className="text-gray-600 text-sm">Sin tarjeta. Sin letra chica.</p>
      </section>

      <section className="px-8 py-16 bg-gray-900">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-white font-bold text-2xl text-center mb-2">Como funciona</h2>
          <p className="text-gray-500 text-center text-sm mb-12">En menos de 10 minutos tienes todo listo</p>
          <div className="grid grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl">1</div>
              <h3 className="text-white font-semibold mb-2">Te registras</h3>
              <p className="text-gray-400 text-sm">Pones el nombre de tu negocio y cuantas visitas vale el premio</p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl">2</div>
              <h3 className="text-white font-semibold mb-2">Pones el QR</h3>
              <p className="text-gray-400 text-sm">Lo imprimes y lo pegas en tu mostrador o caja</p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl">3</div>
              <h3 className="text-white font-semibold mb-2">Tus clientes regresan</h3>
              <p className="text-gray-400 text-sm">Cada vez que vienen escanean y acumulan. Al llegar a su meta, ganan su premio</p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-8 py-16">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-white font-bold text-2xl text-center mb-2">Para cualquier negocio</h2>
          <p className="text-gray-500 text-center text-sm mb-12">Si tienes clientes que regresan, HuellaClub es para ti</p>
          <div className="grid grid-cols-3 gap-4">
            {[
              'Abarrotes',
              'Tortillerias',
              'Taquerias',
              'Tianguis',
              'Barberias',
              'Lavanderias',
              'Salones de belleza',
              'Farmacias',
              'Cafeterias'
            ].map((negocio) => (
              <div key={negocio} className="bg-gray-900 border border-gray-800 rounded-2xl p-4 text-center">
                <p className="text-gray-300 text-sm">{negocio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-8 py-16 bg-gray-900">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-white font-bold text-2xl text-center mb-12">Lo que dicen los numeros</h2>
          <div className="grid grid-cols-3 gap-8 text-center">
            <div>
              <p className="text-4xl font-bold text-indigo-400 mb-2">5x</p>
              <p className="text-gray-400 text-sm">mas barato retener un cliente que conseguir uno nuevo</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-indigo-400 mb-2">68%</p>
              <p className="text-gray-400 text-sm">de los clientes regresan mas seguido cuando tienen un programa de recompensas</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-indigo-400 mb-2">30</p>
              <p className="text-gray-400 text-sm">dias gratis para que lo pruebes sin gastar nada</p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-8 py-20 bg-indigo-600">
        <div className="max-w-lg mx-auto text-center">
          <h2 className="text-white font-bold text-3xl mb-4">
            Empieza hoy. Es gratis.
          </h2>
          <p className="text-indigo-200 mb-8">
            En 10 minutos tienes tu programa listo y tu QR impreso en el negocio.
          </p>
          <Link
            href="/registro"
            className="bg-white text-indigo-600 font-bold py-4 px-10 rounded-xl transition hover:bg-indigo-50 inline-block text-lg"
          >
            Registrar mi negocio gratis
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