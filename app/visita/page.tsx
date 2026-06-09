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
      <main className="min-h-screen bg-white flex flex-col items-center justify-center p-8">
        <div className="text-center max-w-sm bg-white rounded-3xl border border-orange-100 shadow-[0_8px_40px_rgba(251,146,60,0.12)] p-10">
          <div className="text-7xl mb-6">⏰</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Ya registraste hoy</h1>
          <p className="text-gray-500">
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
        <main className="min-h-screen bg-white flex flex-col items-center justify-center p-8">
          <div className="text-center max-w-sm w-full">
            <div className="text-8xl mb-4" style={{ animation: 'bounce 1s infinite' }}>🎉</div>
            <h1 className="text-4xl font-bold text-gray-900 mb-3">¡Felicidades!</h1>
            <p className="text-2xl text-indigo-600 font-bold mb-4">{resultado.recompensa}</p>
            <p className="text-gray-500 mb-8">
              Muestra esta pantalla en caja para reclamar tu premio.
            </p>
            <div className="bg-indigo-50 border-2 border-indigo-200 rounded-2xl p-6 mb-6 shadow-[0_4px_20px_rgba(99,102,241,0.12)]">
              <div className="text-5xl mb-3">🏆</div>
              <p className="text-indigo-700 font-semibold text-lg">{resultado.negocioNombre}</p>
              <p className="text-indigo-500 text-sm mt-1">
                Completaste {resultado.meta} visitas
              </p>
            </div>
            <div className="flex justify-center gap-2">
              {Array.from({ length: resultado.meta }, (_, i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-sm bg-indigo-500"
                >
                  ⭐
                </div>
              ))}
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
      <main className="min-h-screen bg-white flex flex-col items-center justify-center p-8">
        <div className="text-center max-w-sm w-full">
          <div className="text-6xl mb-4">✅</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">¡Visita registrada!</h1>
          <p className="text-gray-500 text-sm mb-8">en {resultado.negocioNombre}</p>

          <div className="bg-white border border-indigo-100 rounded-2xl p-6 mb-6 shadow-[0_4px_20px_rgba(99,102,241,0.10)]">
            <div className="flex justify-between items-center mb-3">
              <span className="text-gray-500 text-sm">Tu progreso</span>
              <span className="text-gray-900 font-bold text-sm">{resultado.visitas} de {resultado.meta} visitas</span>
            </div>
            <div className="w-full bg-indigo-100 rounded-full h-5 mb-4 overflow-hidden">
              <div
                className="h-5 rounded-full bg-indigo-500 transition-all duration-1000 flex items-center justify-end pr-2"
                style={{ width: progreso + '%' }}
              >
                {progreso > 15 && <span className="text-white text-xs font-bold">{Math.round(progreso)}%</span>}
              </div>
            </div>
            <p className="text-indigo-600 text-sm font-medium">
              {faltan === 1
                ? '¡Solo te falta 1 visita más! 🔥'
                : `Te faltan ${faltan} visitas para: ${resultado.recompensa}`
              }
            </p>
          </div>

          <div className="grid grid-cols-5 gap-2 mb-6">
            {Array.from({ length: resultado.meta }, (_, i) => (
              <div
                key={i}
                className="aspect-square rounded-xl flex items-center justify-center text-base font-bold transition-all duration-300"
                style={{
                  backgroundColor: i < resultado.visitas ? '#6366f1' : '#f0f0f0',
                  color: i < resultado.visitas ? 'white' : '#d1d5db',
                  transform: i === resultado.visitas - 1 ? 'scale(1.15)' : 'scale(1)',
                  transition: `all 0.3s ease ${i * 80}ms`
                }}
              >
                {i < resultado.visitas ? '⭐' : '○'}
              </div>
            ))}
          </div>

          <p className="text-gray-400 text-xs">
            Te enviamos tu progreso por WhatsApp
          </p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">📲</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Registra tu visita
          </h1>
          <p className="text-gray-500 text-sm">
            Ingresa tu número de celular para acumular visitas y ganar recompensas
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <input
              type="tel"
              value={celular}
              onChange={(e) => setCelular(e.target.value)}
              placeholder="Ej. 5512345678"
              className="w-full bg-white border-2 border-gray-200 focus:border-indigo-500 text-gray-900 rounded-2xl px-4 py-4 outline-none transition text-center text-xl tracking-widest shadow-sm"
            />
          </div>
          <button
            type="submit"
            disabled={enviando || !celular}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-6 rounded-2xl transition disabled:opacity-50 text-lg shadow-[0_4px_20px_rgba(99,102,241,0.3)]"
          >
            {enviando ? 'Registrando...' : 'Registrar visita'}
          </button>
        </form>

        <p className="text-gray-400 text-xs mt-6 text-center">
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