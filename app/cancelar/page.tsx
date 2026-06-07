'use client'

import { useState } from 'react'

export default function Cancelar() {
  const [enviado, setEnviado] = useState(false)
  const [motivo, setMotivo] = useState('')
  const [correo, setCorreo] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setEnviado(true)
  }

  if (enviado) {
    return (
      <main className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-8">
        <div className="text-center max-w-md">
          <h1 className="text-3xl font-bold text-white mb-4">Solicitud recibida</h1>
          <p className="text-gray-400 mb-8">
            Recibimos tu solicitud de cancelacion. Te contactaremos en menos de 24 horas para confirmar y procesar tu cancelacion.
          </p>
          <a href="/dashboard" className="text-indigo-400 hover:text-indigo-300 text-sm">
            Volver al dashboard
          </a>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-white mb-2">Cancelar suscripcion</h1>
        <p className="text-gray-400 mb-8">
          Lamentamos que quieras cancelar. Cuéntanos por qué para poder mejorar.
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-gray-300 text-sm mb-1 block">Tu correo</label>
            <input
              type="email"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              placeholder="tucorreo@email.com"
              required
              className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="text-gray-300 text-sm mb-1 block">Motivo de cancelacion</label>
            <select
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              required
              className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Selecciona un motivo</option>
              <option value="precio">El precio es muy alto</option>
              <option value="uso">No lo estoy usando</option>
              <option value="funciones">Le faltan funciones</option>
              <option value="tecnico">Problemas tecnicos</option>
              <option value="otro">Otro motivo</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={!correo || !motivo}
            className="bg-red-700 hover:bg-red-800 text-white font-semibold py-3 px-6 rounded-xl transition disabled:opacity-50 mt-2"
          >
            Solicitar cancelacion
          </button>
        </form>
        <div className="mt-6 text-center">
          <a href="/" className="text-gray-600 hover:text-gray-400 text-sm transition">
            Volver sin cancelar
          </a>
        </div>
      </div>
    </main>
  )
}