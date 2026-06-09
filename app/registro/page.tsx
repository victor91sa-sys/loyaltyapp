'use client'

import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import Link from 'next/link'

export default function Registro() {
  const [paso, setPaso] = useState(1)
  const [formulario, setFormulario] = useState({
    nombre: '',
    tipo: '',
    correo: '',
    password: '',
    visitas: '',
    recompensa: ''
  })
  const [enviando, setEnviando] = useState(false)
  const [reenviando, setReenviando] = useState(false)
  const [verPassword, setVerPassword] = useState(false)
  const [registrado, setRegistrado] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormulario({ ...formulario, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setEnviando(true)

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: formulario.correo,
      password: formulario.password,
      options: {
        emailRedirectTo: 'https://huellaclub.app/bienvenida'
      }
    })

    if (authError) {
      alert('Error al crear cuenta: ' + authError.message)
      setEnviando(false)
      return
    }

    const { error } = await supabase
      .from('negocios')
      .insert([{
        nombre: formulario.nombre,
        tipo: formulario.tipo,
        correo: formulario.correo,
        visitas: parseInt(formulario.visitas),
        recompensas: formulario.recompensa,
        user_id: authData.user?.id
      }])

    setEnviando(false)

    if (error) {
      alert('Hubo un error: ' + error.message)
    } else {
      setRegistrado(true)
    }
  }

  const reenviarCorreo = async () => {
    setReenviando(true)
    await supabase.auth.resend({
      type: 'signup',
      email: formulario.correo,
      options: {
        emailRedirectTo: 'https://huellaclub.app/bienvenida'
      }
    })
    setReenviando(false)
  }

  if (registrado) {
    return (
      <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-8">
        <div className="bg-white rounded-3xl shadow-[0_8px_40px_rgba(99,102,241,0.12)] border border-indigo-100 p-10 text-center max-w-md w-full">
          <div className="text-6xl mb-6">📧</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Revisa tu correo</h1>
          <p className="text-gray-500 mb-2">
            Te mandamos un enlace de confirmación a:
          </p>
          <p className="text-indigo-600 font-semibold mb-4 text-lg">
            {formulario.correo}
          </p>
          <p className="text-gray-400 text-sm mb-8">
            En cuanto lo confirmes, tu comunidad empieza a crecer.
          </p>
          <button
            onClick={reenviarCorreo}
            disabled={reenviando}
            className="w-full border border-indigo-200 hover:border-indigo-400 text-indigo-600 font-semibold py-3 rounded-xl transition disabled:opacity-50 mb-4"
          >
            {reenviando ? 'Reenviando...' : '¿No llegó? Reenviar correo'}
          </button>
          <p className="text-gray-400 text-xs mb-6">
            Revisa también tu carpeta de spam.
          </p>
          <Link href="/login" className="text-gray-500 hover:text-gray-700 text-sm transition">
            Volver al inicio de sesión
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 flex">

      <div className="hidden lg:flex flex-col justify-between bg-indigo-600 w-96 p-10 flex-shrink-0">
        <div>
          <Link href="/" className="block">
            <span className="text-white font-bold text-xl">HuellaClub</span>
            <p className="text-indigo-300 text-xs mt-0.5">Vuelven por ti.</p>
          </Link>
        </div>
        <div>
          <h2 className="text-white font-bold text-3xl mb-6 leading-tight">
            Empieza a construir algo que dura
          </h2>
          <ul className="flex flex-col gap-4">
            {[
              { emoji: '✅', texto: '30 días gratis sin tarjeta' },
              { emoji: '📲', texto: 'Tus clientes solo necesitan su celular' },
              { emoji: '🎨', texto: 'QR personalizado con tu marca' },
              { emoji: '📊', texto: 'Ve quién regresa en tiempo real' },
              { emoji: '💬', texto: 'Notificaciones por WhatsApp' },
              { emoji: '🛡️', texto: 'Protección anti-trampa incluida' }
            ].map((item) => (
              <li key={item.texto} className="flex items-center gap-3">
                <span className="text-xl">{item.emoji}</span>
                <p className="text-indigo-100 text-sm">{item.texto}</p>
              </li>
            ))}
          </ul>
        </div>
        <p className="text-indigo-300 text-xs">
          Después de los 30 días gratis, solo $199 MXN/mes. Cancelas cuando quieras.
        </p>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-md">

          <Link href="/" className="block mb-8 lg:hidden">
            <span className="text-indigo-600 font-bold text-xl">HuellaClub</span>
            <p className="text-gray-400 text-xs">Vuelven por ti.</p>
          </Link>

          <div className="flex items-center gap-3 mb-8">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition ${paso >= 1 ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
              {paso > 1 ? '✓' : '1'}
            </div>
            <div className={`flex-1 h-1 rounded transition ${paso > 1 ? 'bg-indigo-600' : 'bg-gray-200'}`} />
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition ${paso >= 2 ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
              2
            </div>
          </div>

          {paso === 1 && (
            <>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
                Empieza a construir algo que dura
              </h1>
              <p className="text-gray-500 mb-8 text-sm">
                Paso 1 de 2 · Crea tu acceso
              </p>
              <form onSubmit={(e) => { e.preventDefault(); setPaso(2) }} className="flex flex-col gap-4">
                <div>
                  <label className="text-gray-700 text-sm font-medium mb-1 block">Correo electrónico</label>
                  <input
                    type="email"
                    name="correo"
                    value={formulario.correo}
                    onChange={handleChange}
                    placeholder="tucorreo@email.com"
                    required
                    className="w-full bg-white border border-gray-200 text-gray-900 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm"
                  />
                </div>
                <div>
                  <label className="text-gray-700 text-sm font-medium mb-1 block">Contraseña</label>
                  <div className="relative">
                    <input
                      type={verPassword ? 'text' : 'password'}
                      name="password"
                      value={formulario.password}
                      onChange={handleChange}
                      placeholder="Mínimo 6 caracteres"
                      required
                      minLength={6}
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
                <button
                  type="submit"
                  disabled={!formulario.correo || !formulario.password}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-xl transition mt-2 disabled:opacity-50"
                >
                  Continuar →
                </button>
              </form>
            </>
          )}

          {paso === 2 && (
            <>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
                Cuéntanos de tu negocio
              </h1>
              <p className="text-gray-500 mb-8 text-sm">
                Paso 2 de 2 · Ya casi estás
              </p>
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div>
                  <label className="text-gray-700 text-sm font-medium mb-1 block">Nombre de tu negocio</label>
                  <input
                    type="text"
                    name="nombre"
                    value={formulario.nombre}
                    onChange={handleChange}
                    placeholder="Ej. Taquería El Güero"
                    required
                    className="w-full bg-white border border-gray-200 text-gray-900 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm"
                  />
                </div>
                <div>
                  <label className="text-gray-700 text-sm font-medium mb-1 block">Tipo de negocio</label>
                  <select
                    name="tipo"
                    value={formulario.tipo}
                    onChange={handleChange}
                    required
                    className="w-full bg-white border border-gray-200 text-gray-900 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm"
                  >
                    <option value="">Selecciona una opción</option>
                    <option value="cafeteria">Cafetería</option>
                    <option value="restaurante">Restaurante</option>
                    <option value="taqueria">Taquería</option>
                    <option value="tortilleria">Tortillería</option>
                    <option value="barberia">Barbería</option>
                    <option value="salon">Salón de belleza</option>
                    <option value="lavanderia">Lavandería</option>
                    <option value="abarrotes">Abarrotes</option>
                    <option value="farmacia">Farmacia</option>
                    <option value="tianguis">Tianguis</option>
                    <option value="pizzeria">Pizzería</option>
                    <option value="panaderia">Panadería</option>
                    <option value="carniceria">Carnicería</option>
                    <option value="fruteria">Frutería</option>
                    <option value="gym">Gimnasio</option>
                    <option value="otro">Otro</option>
                  </select>
                </div>
                <div>
                  <label className="text-gray-700 text-sm font-medium mb-1 block">¿Cuántas visitas para ganar el premio?</label>
                  <input
                    type="number"
                    name="visitas"
                    value={formulario.visitas}
                    onChange={handleChange}
                    placeholder="Ej. 10"
                    required
                    min="2"
                    max="50"
                    className="w-full bg-white border border-gray-200 text-gray-900 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm"
                  />
                  <p className="text-gray-400 text-xs mt-1">Recomendamos entre 8 y 12 visitas</p>
                </div>
                <div>
                  <label className="text-gray-700 text-sm font-medium mb-1 block">¿Cuál es el premio?</label>
                  <input
                    type="text"
                    name="recompensa"
                    value={formulario.recompensa}
                    onChange={handleChange}
                    placeholder="Ej. Un café gratis, 20% de descuento..."
                    required
                    className="w-full bg-white border border-gray-200 text-gray-900 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm"
                  />
                </div>
                <button
                  type="submit"
                  disabled={enviando || !formulario.nombre || !formulario.tipo || !formulario.visitas || !formulario.recompensa}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-xl transition mt-2 disabled:opacity-50"
                >
                  {enviando ? 'Creando tu cuenta...' : 'Crear mi programa gratis'}
                </button>
                <button
                  type="button"
                  onClick={() => setPaso(1)}
                  className="text-gray-400 hover:text-gray-600 text-sm transition text-center"
                >
                  ← Volver al paso anterior
                </button>
              </form>
            </>
          )}

          <p className="text-gray-500 text-sm text-center mt-6">
            ¿Ya tienes cuenta?{' '}
            <Link href="/login" className="text-indigo-600 hover:text-indigo-700 font-medium">
              Inicia sesión
            </Link>
          </p>

        </div>
      </div>

    </main>
  )
}