'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function Cancelar() {
  const [enviado, setEnviado] = useState(false)
  const [motivo, setMotivo] = useState('')
  const [correo, setCorreo] = useState('')
  const [enviando, setEnviando] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setEnviando(true)

    try {
      await fetch('/api/cancelar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo, motivo })
      })
    } catch (error) {
      console.log('Error al enviar')
    }

    setEnviando(false)
    setEnviado(true)
  }

  if (enviado) {
    return (
      <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-8">
        <div className="bg-white rounded-3xl border border-gray-100 shadow-[0_8px_40px_rgba(0,0,0,0.06)] p-10 text-center max-w-md w-full">
          <div className="text-6xl mb-6">📬</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Solicitud recibida</h1>
          <p className="text-gray-500 mb-8">
            Recibimos tu solicitud de cancelación. Te contactaremos en menos de 24 horas para confirmar y procesar tu cancelación.
          </p>
          <Link href="/" className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">
            Volver al inicio
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-8">
      <div className="bg-white rounded-3xl border border-gray-100 shadow-[0_8px_40px_rgba(0,0,0,0.06)] p-10 w-full max-w-md">
        <Link href="/" className="text-indigo-600 font-bold text-xl block mb-8">
          HuellaClub
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Cancelar suscripción</h1>
        <p className="text-gray-500 text-sm mb-8">
          Lamentamos que quieras cancelar. Cuéntanos por qué para poder mejorar.
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-gray-700 text-sm font-medium mb-1 block">Tu correo</label>
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
            <label className="text-gray-700 text-sm font-medium mb-1 block">Motivo de cancelación</label>
            <select
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              required
              className="w-full bg-white border border-gray-200 text-gray-900 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm"
            >
              <option value="">Selecciona un motivo</option>
              <option value="precio">El precio es muy alto</option>
              <option value="uso">No lo estoy usando</option>
              <option value="funciones">Le faltan funciones</option>
              <option value="tecnico">Problemas técnicos</option>
              <option value="otro">Otro motivo</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={!correo || !motivo || enviando}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-xl transition disabled:opacity-50 mt-2"
          >
            {enviando ? 'Enviando...' : 'Solicitar cancelación'}
          </button>
        </form>
        <div className="mt-6 text-center">
          <Link href="/" className="text-gray-400 hover:text-gray-600 text-sm transition">
            Volver sin cancelar
          </Link>
        </div>
      </div>
    </main>
  )
}