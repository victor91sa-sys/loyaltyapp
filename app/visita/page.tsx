'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '../../lib/supabase'
import { Suspense } from 'react'

function VisitaContent() {
  const searchParams = useSearchParams()
  const negocioId = searchParams.get('negocio')

  const [celular, setCelular] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [resultado, setResultado] = useState<null | { visitas: number, meta: number, recompensa: string, negocioNombre: string }>(null)
  const [bloqueado, setBloqueado] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setEnviando(true)

    const { data: negocio } = await supabase
      .from('negocios')
      .select('visitas, recompensas, nombre')
      .eq('id', negocioId)
      .single()

    let { data: cliente } = await supabase
      .from('clientes')
      .select('*')
      .eq('celular', celular)
      .eq('negocio_id', negocioId)
      .single()

    if (cliente) {
      const ultimaVisita = new Date(cliente.ultima_visita)
      const ahora = new Date()
      const diferenciaHoras = (ahora.getTime() - ultimaVisita.getTime()) / (1000 * 60 * 60)

      if (diferenciaHoras < 24) {
        setEnviando(false)
        setBloqueado(true)
        return
      }

      await supabase
        .from('clientes')
        .update({ visitas: cliente.visitas + 1, ultima_visita: new Date().toISOString() })
        .eq('id', cliente.id)
      cliente.visitas = cliente.visitas + 1

    } else {
      const { data: nuevoCliente } = await supabase
        .from('clientes')
        .insert([{ celular, negocio_id: negocioId, visitas: 1, ultima_visita: new Date().toISOString() }])
        .select()
        .single()
      cliente = nuevoCliente
    }

    const visitasActuales = cliente?.visitas ?? 0
    const meta = negocio?.visitas ?? 0
    const recompensa = negocio?.recompensas ?? ''
    const negocioNombre = negocio?.nombre ?? ''

    try {
      await fetch('/api/whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ celular, visitas: visitasActuales, meta, recompensa, negocioNombre })
      })
    } catch (error) {
      console.log('WhatsApp no disponible')
    }

    setEnviando(false)
    setResultado({ visitas: visitasActuales, meta, recompensa, negocioNombre })
  }

  if (bloqueado) {
    return (
      <main className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-8">
        <div className="text-center max-w-sm">
          <div className="text-7xl mb-6">⏰</div>
          <h1 className="text-3xl font-bold text-white mb-3">Ya registraste hoy</h1>
          <p className="text-gray-400 text-lg">
            Solo puedes registrar una visita por día. Vuelve mañana y sigue acumulando.
          </p>
        </div>
      </main>
    )
  }

  if (resultado) {
    const faltan = resultado.meta - resultado.visitas
    const completo = resultado.visitas >= resultado.meta
    const progreso = Math.min((resultado.visitas / resultado.meta) * 100, 100)

    if (completo) {
      return (
        <main className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-8">
          <div className="text-center max-w-sm">
            <div className="text-8xl mb-6" style={{ animation: 'bounce 1s infinite' }}>🎉</div>
            <h1 className="text-4xl font-bold text-white mb-3">¡Felicidades!</h1>
            <p className="text-2xl text-indigo-400 font-semibold mb-4">Ganaste: {resultado.recompensa}</p>
            <p className="text-gray-400 mb-8">
              Muestra esta pantalla en caja para reclamar tu recompensa.
            </p>
            <div className="bg-indigo-900 border border-indigo-600 rounded-2xl p-6">
              <p className="text-indigo-300 text-sm">
                Completaste {resultado.meta} visitas en {resultado.negocioNombre}
              </p>
            </div>
          </div>
          <style>{`
            @keyframes bounce {
              0%, 100% { transform: translateY(0); }
              50% { transform: translateY(-20px); }
            }
          `}</style>
        </main>
      )
    }

    return (
      <main className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-8">
        <div className="text-center max-w-sm w-full">
          <div className="text-6xl mb-4">✅</div>
          <h1 className="text-3xl font-bold text-white mb-2">¡Visita registrada!</h1>
          <p className="text-gray-400 mb-8">en {resultado.negocioNombre}</p>

          <div className="bg-gray-900 rounded-2xl p-6 mb-6">
            <div className="flex justify-between items-center mb-3">
              <span className="text-gray-400 text-sm">Tu progreso</span>
              <span className="text-white font-bold">{resultado.visitas} de {resultado.meta} visitas</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-4 mb-3">
              <div
                className="h-4 rounded-full bg-indigo-500 transition-all duration-1000"
                style={{ width: progreso + '%' }}
              />
            </div>
            <p className="text-indigo-300 text-sm">
              {faltan === 1
                ? '¡Solo te falta 1 visita más! 🔥'
                : `Te faltan ${faltan} visitas para obtener: ${resultado.recompensa}`
              }
            </p>
          </div>

          <div className="grid grid-cols-5 gap-2 mb-6">
            {Array.from({ length: resultado.meta }, (_, i) => (
              <div
                key={i}
                className="aspect-square rounded-xl flex items-center justify-center text-lg"
                style={{
                  backgroundColor: i < resultado.visitas ? '#4f46e5' : '#1f2937',
                  transition: `background-color 0.3s ease ${i * 100}ms`
                }}
              >
                {i < resultado.visitas ? '⭐' : '○'}
              </div>
            ))}
          </div>

          <p className="text-gray-600 text-xs">
            Te enviamos tu progreso por WhatsApp
          </p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-sm text-center">
        <div className="text-7xl mb-6">📲</div>
        <h1 className="text-3xl font-bold text-white mb-2">
          Registra tu visita
        </h1>
        <p className="text-gray-400 mb-10">
          Ingresa tu número de celular para acumular puntos y ganar recompensas
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="tel"
            value={celular}
            onChange={(e) => setCelular(e.target.value)}
            placeholder="Ej. 5512345678"
            className="w-full bg-gray-800 text-white rounded-2xl px-4 py-4 outline-none focus:ring-2 focus:ring-indigo-500 text-center text-xl tracking-widest"
          />
          <button
            type="submit"
            disabled={enviando || !celular}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-6 rounded-2xl transition disabled:opacity-50 text-lg"
          >
            {enviando ? 'Registrando...' : 'Registrar visita'}
          </button>
        </form>
        <p className="text-gray-700 text-xs mt-8">
          Tu número solo se usa para llevar tu progreso. No se comparte con nadie.
        </p>
      </div>
    </main>
  )
}

export default function Visita() {
  return (
    <Suspense>
      <VisitaContent />
    </Suspense>
  )
}