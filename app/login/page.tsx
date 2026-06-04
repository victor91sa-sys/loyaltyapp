'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'

export default function Login() {
  const router = useRouter()
  const [correo, setCorreo] = useState('')
  const [password, setPassword] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState('')
  const [verPassword, setVerPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setEnviando(true)
    setError('')

    const { error: authError } = await supabase.auth.signInWithPassword({
      email: correo,
      password: password
    })

    if (authError) {
      setError('Correo o contrasena incorrectos')
      setEnviando(false)
      return
    }

    const { data: negocio } = await supabase
      .from('negocios')
      .select('id, nombre')
      .eq('correo', correo)
      .single()

    if (negocio) {
      router.push('/dashboard?id=' + negocio.id + '&nombre=' + encodeURIComponent(negocio.nombre))
    } else {
      setError('No encontramos tu negocio')
      setEnviando(false)
    }
  }

  return (
    <main className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-white mb-2">
          Bienvenido de vuelta
        </h1>
        <p className="text-gray-400 mb-8">
          Inicia sesion para ver tu programa de lealtad
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-gray-300 text-sm mb-1 block">Correo</label>
            <input
              type="email"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              placeholder="tucorreo@email.com"
              className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="text-gray-300 text-sm mb-1 block">Contrasena</label>
            <div className="relative">
              <input
                type={verPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Tu contrasena"
                className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 pr-12"
              />
              <button
                type="button"
                onClick={() => setVerPassword(!verPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition"
              >
                {verPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>
          {error && (
            <p className="text-red-400 text-sm">{error}</p>
          )}
          <button
            type="submit"
            disabled={enviando}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-xl transition disabled:opacity-50"
          >
            {enviando ? 'Entrando...' : 'Iniciar sesion'}
          </button>
        </form>
        <div className="flex justify-between mt-6">
          <a href="/recuperar" className="text-gray-500 text-sm hover:text-indigo-400">
            Olvide mi contrasena
          </a>
          <a href="/registro" className="text-indigo-400 text-sm hover:text-indigo-300">
            Registra tu negocio
          </a>
        </div>
      </div>
    </main>
  )
}