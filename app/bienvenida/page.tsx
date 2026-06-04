'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'

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
      <main className="min-h-screen bg-gray-950 flex items-center justify-center">
        <p className="text-gray-400">Confirmando tu cuenta...</p>
      </main>
    )
  }

  if (estado === 'error') {
    return (
      <main className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-8">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-6">⚠️</div>
          <h1 className="text-3xl font-bold text-white mb-4">Enlace expirado</h1>
          <p className="text-gray-400 mb-8">El enlace de confirmacion ya no es valido. Intenta registrarte de nuevo.</p>
          <button
            onClick={() => router.push('/registro')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-8 rounded-xl transition"
          >
            Volver al registro
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-8">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-6">🎉</div>
        <h1 className="text-4xl font-bold text-white mb-4">
          Correo confirmado
        </h1>
        <p className="text-gray-400 text-lg mb-8">
          Tu cuenta esta lista. Inicia sesion para ver tu programa de lealtad.
        </p>
        <button
          onClick={() => router.push('/login')}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-8 rounded-xl transition"
        >
          Iniciar sesion
        </button>
      </div>
    </main>
  )
}