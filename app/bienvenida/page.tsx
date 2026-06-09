'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'
import Link from 'next/link'

export default function Bienvenida() {
  const router = useRouter()
  const [estado, setEstado] = useState<'verificando' | 'confirmado' | 'error'>('verificando')

  useEffect(() => {
    const verificar = async () => {
      const params = new URLSearchParams(window.location.search)
      const tokenHash = params.get('token_hash')
      const type = params.get('type')

      if (tokenHash && type) {
        const { error } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: type as any
        })

        if (error) {
          setEstado('error')
        } else {
          await supabase.auth.signOut()
          setEstado('confirmado')
        }
      } else {
        const { data: { session } } = await supabase.auth.getSession()
        if (session) {
          await supabase.auth.signOut()
          setEstado('confirmado')
        } else {
          setEstado('confirmado')
        }
      }
    }

    verificar()
  }, [])

  if (estado === 'verificando') {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 text-sm">Confirmando tu cuenta...</p>
        </div>
      </main>
    )
  }

  if (estado === 'error') {
    return (
      <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-8">
        <div className="bg-white rounded-3xl border border-red-100 shadow-[0_8px_40px_rgba(239,68,68,0.10)] p-10 text-center max-w-md w-full">
          <div className="text-6xl mb-6">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Enlace expirado</h1>
          <p className="text-gray-500 mb-8">El enlace de confirmación ya no es válido. Intenta registrarte de nuevo.</p>
          <button
            onClick={() => router.push('/registro')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-8 rounded-xl transition w-full"
          >
            Volver al registro
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-8">
      <div className="bg-white rounded-3xl border border-indigo-100 shadow-[0_8px_40px_rgba(99,102,241,0.12)] p-10 text-center max-w-md w-full">
        <div className="text-7xl mb-6">🎉</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          ¡Cuenta confirmada!
        </h1>
        <p className="text-gray-500 mb-2">
          Tu programa de lealtad está listo.
        </p>
        <p className="text-gray-400 text-sm mb-8">
          Inicia sesión para configurar tu QR y empezar a fidelizar clientes.
        </p>
        <button
          onClick={() => router.push('/login')}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-xl transition w-full text-lg mb-4"
        >
          Ir a mi panel
        </button>
        <ul className="text-left flex flex-col gap-2 mt-4">
          {[
            '✅ 30 días gratis activados',
            '📲 Tu QR listo para imprimir',
            '📊 Panel con métricas en tiempo real',
          ].map((item) => (
            <li key={item} className="text-gray-500 text-sm">{item}</li>
          ))}
        </ul>
      </div>
    </main>
  )
}
