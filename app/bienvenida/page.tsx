'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'

export default function Bienvenida() {
  const router = useRouter()
  const [verificando, setVerificando] = useState(true)

  useEffect(() => {
    const verificar = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setVerificando(false)
      if (!session) {
        router.push('/login')
      }
    }
    verificar()
  }, [])

  if (verificando) {
    return (
      <main className="min-h-screen bg-gray-950 flex items-center justify-center">
        <p className="text-gray-400">Verificando tu cuenta...</p>
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
