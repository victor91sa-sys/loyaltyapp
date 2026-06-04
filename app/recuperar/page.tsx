'use client'

import { useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function Recuperar() {
  const [correo, setCorreo] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [enviado, setEnviado] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setEnviando(true)
    setError('')

    const { error } = await supabase.auth.resetPasswordForEmail(correo, {
      redirectTo: 'https://loyaltyapp-4knq.vercel.app/nueva-password'
    })

    setEnviando(false)

    if (error) {
      setError('No encontramos ese correo. Verifica e intenta de nuevo.')
    } else {
      setEnviado(true)
    }
  }

  if (enviado) {
    return (
      <main className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-8">
        <div className="text-center max-w-md">
          <h1 className="text-3xl font-bold text-white mb-4">Revisa tu correo</h1>
          <p className="text-gray-400">Te mandamos un enlace para restablecer tu contrasena. Puede tardar unos minutos.</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-white mb-2">
          Recupera tu cuenta
        </h1>
        <p className="text-gray-400 mb-8">
          Te mandamos un enlace a tu correo para restablecer tu contrasena
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-gray-300 text-sm mb-1 block">Correo de tu cuenta</label>
            <input
              type="email"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              placeholder="tucorreo@email.com"
              className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={enviando || !correo}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-xl transition disabled:opacity-50"
          >
            {enviando ? 'Enviando...' : 'Enviar enlace de recuperacion'}
          </button>
        </form>
        <p className="text-gray-500 text-sm text-center mt-6">
          <a href="/login" className="text-indigo-400 hover:text-indigo-300">
            Volver al inicio de sesion
          </a>
        </p>
      </div>
    </main>
  )
}