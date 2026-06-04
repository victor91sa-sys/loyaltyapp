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
    <main className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-8">
      <div className="text-center max-w-md">
        <h1 className="text-4xl font-bold text-white mb-4">
          HuellaClub
        </h1>
        <p className="text-gray-400 text-lg mb-8">
          Programa de lealtad digital para negocios locales
        </p>
        <div className="flex flex-col gap-4">
          <Link
            href="/registro"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-xl transition text-center block"
          >
            Registrar mi negocio
          </Link>
          <Link
            href="/login"
            className="w-full border border-gray-600 hover:border-gray-400 text-gray-300 font-semibold py-3 px-6 rounded-xl transition text-center block"
          >
            Iniciar sesion
          </Link>
        </div>
        <p className="text-gray-600 text-sm mt-8">
          Tu enlace expiro?{' '}
          <Link href="/recuperar" className="text-indigo-400 hover:text-indigo-300">
            Solicita uno nuevo
          </Link>
        </p>
      </div>
    </main>
  )
}