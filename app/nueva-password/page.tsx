'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'
import Link from 'next/link'

export default function NuevaPassword() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState('')
  const [verPassword, setVerPassword] = useState(false)
  const [verConfirm, setVerConfirm] = useState(false)
  const [listo, setListo] = useState(false)

  useEffect(() => {
    const verificarToken = async () => {
      const params = new URLSearchParams(window.location.search)
      const tokenHash = params.get('token_hash')
      const type = params.get('type')

      if (tokenHash && type === 'recovery') {
        const { error } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: 'recovery'
        })
        if (error) {
          setError('Este enlace expiró. Solicita uno nuevo.')
        } else {
          setListo(true)
        }
      } else {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
          if (event === 'PASSWORD_RECOVERY') {
            setListo(true)
          }
        })
        return () => subscription.unsubscribe()
      }
    }
    verificarToken()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden')
      return
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
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

  if (error && !listo) {
    return (
      <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-8">
        <div className="bg-white rounded-3xl border border-red-100 shadow-[0_8px_40px_rgba(239,68,68,0.10)] p-10 text-center max-w-md w-full">
          <div className="text-6xl mb-6">⏰</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Enlace expirado</h1>
          <p className="text-gray-500 mb-8">{error}</p>
          <Link
            href="/recuperar"
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-8 rounded-xl transition inline-block w-full text-center"
          >
            Solicitar nuevo enlace
          </Link>
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
          Nueva contraseña
        </h1>
        <p className="text-gray-500 text-sm mb-8">
          Elige una contraseña segura para tu cuenta.
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-gray-700 text-sm font-medium mb-1 block">Nueva contraseña</label>
            <div className="relative">
              <input
                type={verPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="w-full bg-white border border-gray-200 text-gray-900 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm pr-16"
              />
              <button
                type="button"
                onClick={() => setVerPassword(!verPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm transition"
              >
                {verPassword ? 'Ocultar' : 'Ver'}
              </button>
            </div>
          </div>
          <div>
            <label className="text-gray-700 text-sm font-medium mb-1 block">Confirmar contraseña</label>
            <div className="relative">
              <input
                type={verConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repite tu contraseña"
                className="w-full bg-white border border-gray-200 text-gray-900 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm pr-16"
              />
              <button
                type="button"
                onClick={() => setVerConfirm(!verConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm transition"
              >
                {verConfirm ? 'Ocultar' : 'Ver'}
              </button>
            </div>
          </div>
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}
          <button
            type="submit"
            disabled={enviando || !password || !confirmPassword || !listo}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-xl transition disabled:opacity-50 mt-2"
          >
            {enviando ? 'Guardando...' : 'Guardar nueva contraseña'}
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
