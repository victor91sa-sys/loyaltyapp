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
      password: formulario.password
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

  if (registrado) {
    return (
      <main className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-8">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-6">📧</div>
          <h1 className="text-3xl font-bold text-white mb-4">
            Revisa tu bandeja de entrada
          </h1>
          <p className="text-gray-400 text-lg mb-4">
            Te mandamos un correo a <span className="text-white font-semibold">{formulario.correo}</span>
          </p>
          <p className="text-gray-500 text-sm mb-8">
            Haz click en el enlace del correo para confirmar tu cuenta y empezar a usar LoyaltyApp.
          </p>
          <p className="text-gray-600 text-xs">
            No encuentras el correo? Revisa tu carpeta de spam.
          </p>
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
              placeholder="Ej. Cafe La Paloma"
              className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="text-gray-300 text-sm mb-1 block">Tipo de negocio</label>
            <select
              name="tipo"
              value={formulario.tipo}
              onChange={handleChange}
              className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Selecciona una opcion</option>
              <option value="cafeteria">Cafeteria</option>
              <option value="restaurante">Restaurante</option>
              <option value="barberia">Barberia</option>
              <option value="salon">Salon de belleza</option>
              <option value="lavanderia">Lavanderia</option>
              <option value="otro">Otro</option>
            </select>
          </div>
          <div>
            <label className="text-gray-300 text-sm mb-1 block">Correo del dueno</label>
            <input
              type="email"
              name="correo"
              value={formulario.correo}
              onChange={handleChange}
              placeholder="tucorreo@email.com"
              className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="text-gray-300 text-sm mb-1 block">Contrasena</label>
            <div className="relative">
              <input
                type={verPassword ? 'text' : 'password'}
                name="password"
                value={formulario.password}
                onChange={handleChange}
                placeholder="Minimo 6 caracteres"
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
            <label className="text-gray-300 text-sm mb-1 block">Cuantas visitas para obtener recompensa</label>
            <input
              type="number"
              name="visitas"
              value={formulario.visitas}
              onChange={handleChange}
              placeholder="Ej. 10"
              min="1"
              max="50"
              className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="text-gray-300 text-sm mb-1 block">Cual es la recompensa</label>
            <input
              type="text"
              name="recompensa"
              value={formulario.recompensa}
              onChange={handleChange}
              placeholder="Ej. Cafe gratis"
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
          Ya tienes cuenta?{' '}
          <a href="/login" className="text-indigo-400 hover:text-indigo-300">
            Inicia sesion
          </a>
        </p>
      </div>
    </main>
  )
}