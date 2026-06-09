'use client'

import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import Link from 'next/link'

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
      redirectTo: 'https://huellaclub.app/nueva-password'
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
      <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-8">
        <div className="bg-white rounded-3xl border border-indigo-100 shadow-[0_8px_40px_rgba(99,102,241,0.12)] p-10 text-center max-w-md w-full">
          <div className="text-6xl mb-6">📧</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Revisa tu correo</h1>
          <p className="text-gray-500 mb-2">
            Te mandamos un enlace a:
          </p>
          <p className="text-indigo-600 font-semibold mb-6">{correo}</p>
          <p className="text-gray-400 text-sm mb-8">
            Haz click en el enlace para crear una nueva contraseña. Puede tardar unos minutos.
          </p>
          <p className="text-gray-400 text-xs">Revisa también tu carpeta de spam.</p>
          <div className="mt-6">
            <Link href="/login" className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">
              Volver al inicio de sesión
            </Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-8">
      <div className="bg-white rounded-3xl border border-indigo-100 shadow-[0_8px_40px_rgba(99,102,241,0.12)] p-10 w-full max-w-md">
        <Link href="/" className="text-indigo-600 font-bold text-xl block mb-8">
          HuellaClub
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Recupera tu cuenta
        </h1>
        <p className="text-gray-500 text-sm mb-8">
          Te mandamos un enlace a tu correo para restablecer tu contraseña.
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-gray-700 text-sm font-medium mb-1 block">Correo de tu cuenta</label>
            <input
              type="email"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              placeholder="tucorreo@email.com"
              required
              className="w-full bg-white border border-gray-200 text-gray-900 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm"
            />
          </div>
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}
          <button
            type="submit"
            disabled={enviando || !correo}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-xl transition disabled:opacity-50"
          >
            {enviando ? 'Enviando...' : 'Enviar enlace de recuperación'}
          </button>
        </form>
        <p className="text-gray-500 text-sm text-center mt-6">
          <Link href="/login" className="text-indigo-600 hover:text-indigo-700 font-medium">
            Volver al inicio de sesión
          </Link>
        </p>
      </div>
    </main>
  )
}
