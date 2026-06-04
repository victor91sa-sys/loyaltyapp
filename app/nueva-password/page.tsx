'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'

export default function NuevaPassword() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Las contrasenas no coinciden')
      return
    }

    if (password.length < 6) {
      setError('La contrasena debe tener al menos 6 caracteres')
      return
    }

    setEnviando(true)

    const { error } = await supabase.auth.updateUser({ password })

    setEnviando(false)

    if (error) {
      setError('Hubo un error. Intenta de nuevo.')
    } else {
      router.push('/login')
    }
  }

  return (
    <main className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-white mb-2">
          Nueva contrasena
        </h1>
        <p className="text-gray-400 mb-8">
          Elige una contrasena segura para tu cuenta
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-gray-300 text-sm mb-1 block">Nueva contrasena</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimo 6 caracteres"
              className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="text-gray-300 text-sm mb-1 block">Confirmar contrasena</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repite tu contrasena"
              className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={enviando || !password || !confirmPassword}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-xl transition disabled:opacity-50"
          >
            {enviando ? 'Guardando...' : 'Guardar nueva contrasena'}
          </button>
        </form>
      </div>
    </main>
  )
}