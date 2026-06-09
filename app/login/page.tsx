'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'
import Link from 'next/link'

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
      setError('Correo o contraseña incorrectos')
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
    <main className="min-h-screen bg-gray-50 flex">

      <div className="hidden lg:flex flex-col justify-between bg-indigo-600 w-96 p-10 flex-shrink-0">
        <div>
          <Link href="/" className="text-white font-bold text-xl">HuellaClub</Link>
        </div>
        <div>
          <h2 className="text-white font-bold text-3xl mb-4 leading-tight">
            Bienvenido de vuelta
          </h2>
          <p className="text-indigo-200 text-sm mb-8">
            Tus clientes te están esperando. Entra a tu panel y ve cómo va tu programa de lealtad.
          </p>
          <div className="bg-indigo-700 rounded-2xl p-5">
            <p className="text-indigo-200 text-xs mb-3">Lo que te espera adentro</p>
            <ul className="flex flex-col gap-2">
              {[
                '📊 Métricas de tus clientes',
                '📲 Tu código QR listo',
                '🎨 Editor de cartel',
                '💬 Notificaciones por WhatsApp',
              ].map((item) => (
                <li key={item} className="text-white text-sm">{item}</li>
              ))}
            </ul>
          </div>
        </div>
        <p className="text-indigo-300 text-xs">
          ¿Aún no tienes cuenta?{' '}
          <Link href="/registro" className="text-white underline">Regístrate gratis</Link>
        </p>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-md">

          <Link href="/" className="text-indigo-600 font-bold text-xl mb-8 block lg:hidden">
            HuellaClub
          </Link>

          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            Inicia sesión
          </h1>
          <p className="text-gray-500 mb-8 text-sm">
            Entra a tu panel de control
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="text-gray-700 text-sm font-medium mb-1 block">Correo electrónico</label>
              <input
                type="email"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                placeholder="tucorreo@email.com"
                required
                className="w-full bg-white border border-gray-200 text-gray-900 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm"
              />
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <label className="text-gray-700 text-sm font-medium">Contraseña</label>
                <Link href="/recuperar" className="text-indigo-600 hover:text-indigo-700 text-xs">
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={verPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Tu contraseña"
                  required
                  className="w-full bg-white border border-gray-200 text-gray-900 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm pr-12"
                />
                <button
                  type="button"
                  onClick={() => setVerPassword(!verPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                >
                  {verPassword ? '🙈' : '👁️'}
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
              disabled={enviando || !correo || !password}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-xl transition disabled:opacity-50 mt-2"
            >
              {enviando ? 'Entrando...' : 'Iniciar sesión'}
            </button>
          </form>

          <p className="text-gray-500 text-sm text-center mt-6">
            ¿Aún no tienes cuenta?{' '}
            <Link href="/registro" className="text-indigo-600 hover:text-indigo-700 font-medium">
              Regístrate gratis
            </Link>
          </p>

        </div>
      </div>

    </main>
  )
}