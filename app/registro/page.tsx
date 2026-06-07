'use client'

import { useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function Registro() {
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
      <main className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-8">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-6">📧</div>
          <h1 className="text-3xl font-bold text-white mb-4">
            Revisa tu bandeja de entrada
          </h1>
          <p className="text-gray-400 text-lg mb-2">
            Te mandamos un correo a:
          </p>
          <p className="text-indigo-400 font-semibold mb-6">
            {formulario.correo}
          </p>
          <p className="text-gray-500 text-sm mb-8">
            Haz click en el enlace del correo para confirmar tu cuenta y empezar a usar HuellaClub.
          </p>
          <button
            onClick={reenviarCorreo}
            disabled={reenviando}
            className="text-indigo-400 hover:text-indigo-300 text-sm transition disabled:opacity-50 mb-4 block w-full text-center"
          >
            {reenviando ? 'Reenviando...' : '¿No llegó el correo? Reenviar'}
          </button>
          <p className="text-gray-600 text-xs">
            Revisa también tu carpeta de spam.
          </p>
          <div className="mt-8">
            <a href="/login" className="text-gray-600 hover:text-gray-400 text-sm transition">
              Volver al inicio de sesión
            </a>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-white mb-2">
          Registra tu negocio
        </h1>
        <p className="text-gray-400 mb-8">
          Configura tu programa de lealtad en minutos
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-gray-300 text-sm mb-1 block">Nombre del negocio</label>
            <input
              type="text"
              name="nombre"
              value={formulario.nombre}
              onChange={handleChange}
              placeholder="Ej. Taquería El Güero"
              required
              className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="text-gray-300 text-sm mb-1 block">Tipo de negocio</label>
            <select
              name="tipo"
              value={formulario.tipo}
              onChange={handleChange}
              required
              className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
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
              <option value="otro">Otro</option>
            </select>
          </div>
          <div>
            <label className="text-gray-300 text-sm mb-1 block">Correo del dueño</label>
            <input
              type="email"
              name="correo"
              value={formulario.correo}
              onChange={handleChange}
              placeholder="tucorreo@email.com"
              required
              className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="text-gray-300 text-sm mb-1 block">Contraseña</label>
            <div className="relative">
              <input
                type={verPassword ? 'text' : 'password'}
                name="password"
                value={formulario.password}
                onChange={handleChange}
                placeholder="Mínimo 6 caracteres"
                required
                minLength={6}
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
          <div>
            <label className="text-gray-300 text-sm mb-1 block">¿Cuántas visitas para obtener la recompensa?</label>
            <input
              type="number"
              name="visitas"
              value={formulario.visitas}
              onChange={handleChange}
              placeholder="Ej. 10"
              required
              min="2"
              max="50"
              className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="text-gray-300 text-sm mb-1 block">¿Cuál es la recompensa?</label>
            <input
              type="text"
              name="recompensa"
              value={formulario.recompensa}
              onChange={handleChange}
              placeholder="Ej. Un café gratis"
              required
              className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <button
            type="submit"
            disabled={enviando}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-xl transition mt-2 disabled:opacity-50"
          >
            {enviando ? 'Creando cuenta...' : 'Crear mi programa de lealtad'}
          </button>
        </form>
        <p className="text-gray-500 text-sm text-center mt-6">
          ¿Ya tienes cuenta?{' '}
          <a href="/login" className="text-indigo-400 hover:text-indigo-300">
            Inicia sesión
          </a>
        </p>
      </div>
    </main>
  )
}