'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '../../lib/supabase'
import { Suspense } from 'react'

type NivelRecompensa = {
  id: string
  visitas_requeridas: number
  descripcion: string
  orden: number
}

function VisitaContent() {
  const searchParams = useSearchParams()
  const negocioId = searchParams.get('negocio')

  const [celular, setCelular] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [resultado, setResultado] = useState<null | {
    visitas: number
    meta: number
    recompensa: string
    negocioNombre: string
    googleMapsUrl: string
    completo: boolean
    premioPendiente: boolean
    niveles: NivelRecompensa[]
    nivelGanado: NivelRecompensa | null
  }>(null)
  const [bloqueado, setBloqueado] = useState(false)
  const [estrellas, setEstrellas] = useState(0)
  const [feedback, setFeedback] = useState('')
  const [feedbackEnviado, setFeedbackEnviado] = useState(false)
  const [enviandoFeedback, setEnviandoFeedback] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setEnviando(true)

    const { data: negocio } = await supabase
      .from('negocios')
      .select('visitas, recompensas, nombre, google_maps_url')
      .eq('id', negocioId)
      .single()

    const { data: nivelesData } = await supabase
      .from('recompensas')
      .select('*')
      .eq('negocio_id', negocioId)
      .order('orden', { ascending: true })

    const niveles: NivelRecompensa[] = nivelesData || []

    let { data: cliente } = await supabase
      .from('clientes')
      .select('*')
      .eq('celular', celular)
      .eq('negocio_id', negocioId)
      .single()

    const meta = negocio?.visitas ?? 10
    const recompensa = negocio?.recompensas ?? ''
    const negocioNombre = negocio?.nombre ?? ''
    const googleMapsUrl = negocio?.google_maps_url ?? ''

    if (cliente) {

      if (cliente.premio_pendiente) {
        setEnviando(false)
        setResultado({
          visitas: cliente.visitas,
          meta,
          recompensa,
          negocioNombre,
          googleMapsUrl,
          completo: true,
          premioPendiente: true,
          niveles,
          nivelGanado: null
        })
        return
      }

      const ultimaVisita = new Date(cliente.ultima_visita)
      const ahora = new Date()
      const diferenciaHoras = (ahora.getTime() - ultimaVisita.getTime()) / (1000 * 60 * 60)

      if (diferenciaHoras < 24) {
        setEnviando(false)
        setBloqueado(true)
        return
      }

      const nuevasVisitas = cliente.visitas + 1

      const nivelGanado = niveles.find(n => n.visitas_requeridas === nuevasVisitas) || null
      const completoPrincipal = nuevasVisitas >= meta

      if (nivelGanado || completoPrincipal) {
        await supabase
          .from('clientes')
          .update({
            visitas: nuevasVisitas,
            ultima_visita: new Date().toISOString(),
            premio_pendiente: true
          })
          .eq('id', cliente.id)
      } else {
        await supabase
          .from('clientes')
          .update({
            visitas: nuevasVisitas,
            ultima_visita: new Date().toISOString()
          })
          .eq('id', cliente.id)
      }

      try {
        await fetch('/api/whatsapp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ celular, visitas: nuevasVisitas, meta, recompensa, negocioNombre })
        })
      } catch (error) {
        console.log('WhatsApp no disponible')
      }

      setEnviando(false)
      setResultado({
        visitas: nuevasVisitas,
        meta,
        recompensa: nivelGanado ? nivelGanado.descripcion : recompensa,
        negocioNombre,
        googleMapsUrl,
        completo: !!(nivelGanado || completoPrincipal),
        premioPendiente: !!(nivelGanado || completoPrincipal),
        niveles,
        nivelGanado
      })

    } else {
      await supabase
        .from('clientes')
        .insert([{
          celular,
          negocio_id: negocioId,
          visitas: 1,
          ultima_visita: new Date().toISOString(),
          premio_pendiente: false
        }])

      try {
        await fetch('/api/whatsapp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ celular, visitas: 1, meta, recompensa, negocioNombre })
        })
      } catch (error) {
        console.log('WhatsApp no disponible')
      }

      setEnviando(false)
      setResultado({
        visitas: 1,
        meta,
        recompensa,
        negocioNombre,
        googleMapsUrl,
        completo: false,
        premioPendiente: false,
        niveles,
        nivelGanado: null
      })
    }
  }

  const handleEstrellas = (num: number) => {
    setEstrellas(num)
    if (num === 5 && resultado?.googleMapsUrl) {
      window.location.href = resultado.googleMapsUrl
    }
  }

  const handleFeedback = async (e: React.FormEvent) => {
    e.preventDefault()
    setEnviandoFeedback(true)
    try {
      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ negocioId, estrellas, comentario: feedback })
      })
    } catch (error) {
      console.log('Error enviando feedback')
    }
    setEnviandoFeedback(false)
    setFeedbackEnviado(true)
  }

  if (bloqueado) {
    return (
      <main className="min-h-screen bg-white flex flex-col items-center justify-center p-8">
        <div className="text-center max-w-sm bg-white rounded-3xl border border-orange-100 shadow-[0_8px_40px_rgba(251,146,60,0.12)] p-10">
          <div className="text-7xl mb-6">⏰</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Ya registraste tu visita hoy</h1>
          <p className="text-gray-500">Vuelve mañana. Tu negocio favorito te espera.</p>
        </div>
      </main>
    )
  }

  if (resultado) {
    const faltan = resultado.meta - resultado.visitas
    const progreso = Math.min((resultado.visitas / resultado.meta) * 100, 100)
    const tieneNiveles = resultado.niveles.length > 0

    if (resultado.completo || resultado.premioPendiente) {

      if (feedbackEnviado) {
        return (
          <main className="min-h-screen bg-white flex flex-col items-center justify-center p-8">
            <div className="text-center max-w-sm w-full bg-white rounded-3xl border border-indigo-100 shadow-[0_8px_40px_rgba(99,102,241,0.12)] p-10">
              <div className="text-6xl mb-4">🙏</div>
              <h1 className="text-2xl font-bold text-gray-900 mb-3">¡Gracias por tu opinión!</h1>
              <p className="text-gray-500 text-sm">Tu feedback ayuda a {resultado.negocioNombre} a mejorar para ti.</p>
            </div>
          </main>
        )
      }

      if (estrellas > 0 && estrellas < 5) {
        return (
          <main className="min-h-screen bg-white flex flex-col items-center justify-center p-8">
            <div className="text-center max-w-sm w-full">
              <div className="text-5xl mb-4">💬</div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">¿Qué podemos mejorar?</h1>
              <p className="text-gray-500 text-sm mb-8">Tu opinión ayuda a {resultado.negocioNombre} a ser mejor para ti.</p>
              <form onSubmit={handleFeedback} className="flex flex-col gap-4">
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Cuéntanos qué podría mejorar..."
                  rows={4}
                  className="w-full bg-white border-2 border-gray-200 focus:border-indigo-500 text-gray-900 rounded-2xl px-4 py-3 outline-none transition text-sm resize-none shadow-sm"
                />
                <button
                  type="submit"
                  disabled={enviandoFeedback || !feedback}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-2xl transition disabled:opacity-50"
                >
                  {enviandoFeedback ? 'Enviando...' : 'Enviar comentario'}
                </button>
                <button type="button" onClick={() => setFeedbackEnviado(true)} className="text-gray-400 hover:text-gray-600 text-sm transition">
                  Omitir
                </button>
              </form>
            </div>
          </main>
        )
      }

      if (resultado.premioPendiente && !resultado.completo) {
        return (
          <main className="min-h-screen bg-white flex flex-col items-center justify-center p-8">
            <div className="text-center max-w-sm w-full">
              <div className="text-7xl mb-4">🎁</div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Tienes un premio esperándote</h1>
              <p className="text-gray-500 text-sm mb-6">{resultado.negocioNombre}</p>
              <div className="bg-indigo-50 border-2 border-indigo-200 rounded-2xl p-6 mb-6">
                <p className="text-indigo-700 font-bold text-lg mb-3">{resultado.recompensa}</p>
                <div className="bg-indigo-100 rounded-xl p-3">
                  <p className="text-indigo-700 text-sm font-semibold">📲 Muestra esta pantalla en caja para reclamar tu premio</p>
                </div>
              </div>
            </div>
          </main>
        )
      }

      return (
        <main className="min-h-screen bg-white flex flex-col items-center justify-center p-8">
          <div className="text-center max-w-sm w-full">
            <div className="text-8xl mb-4" style={{ animation: 'bounce 1s infinite' }}>🎉</div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">¡Lo lograste!</h1>
            <p className="text-gray-500 text-sm mb-2">Tu lealtad tiene recompensa.</p>
            <p className="text-2xl text-indigo-600 font-bold mb-6">{resultado.recompensa}</p>

            <div className="bg-indigo-50 border-2 border-indigo-200 rounded-2xl p-6 mb-6 shadow-[0_4px_20px_rgba(99,102,241,0.12)]">
              <div className="text-4xl mb-2">🏆</div>
              <p className="text-indigo-700 font-bold text-lg mb-1">{resultado.negocioNombre}</p>
              <p className="text-indigo-500 text-sm mb-3">
                {resultado.nivelGanado
                  ? `Completaste ${resultado.nivelGanado.visitas_requeridas} visitas`
                  : `Completaste ${resultado.meta} visitas`
                }
              </p>
              <div className="bg-indigo-100 rounded-xl p-3">
                <p className="text-indigo-700 text-sm font-semibold">📲 Muestra esta pantalla en caja para reclamar tu premio</p>
              </div>
            </div>

            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
              <p className="text-gray-700 font-semibold mb-4">¿Cómo fue tu experiencia?</p>
              <div className="flex justify-center gap-3 mb-2">
                {[1, 2, 3, 4, 5].map((num) => (
                  <button
                    key={num}
                    onClick={() => handleEstrellas(num)}
                    className="text-4xl transition hover:scale-125"
                    style={{ opacity: estrellas === 0 || estrellas >= num ? 1 : 0.3 }}
                  >
                    ⭐
                  </button>
                ))}
              </div>
              {resultado.googleMapsUrl && (
                <p className="text-gray-400 text-xs mt-2">5 estrellas → te llevamos directo a Google Maps</p>
              )}
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
          <h1 className="text-2xl font-bold text-gray-900 mb-1">¡Gracias por regresar!</h1>
          <p className="text-gray-500 text-sm mb-2">{resultado.negocioNombre} te reconoce.</p>
          <p className="text-gray-400 text-xs mb-8">
            Has elegido este lugar {resultado.visitas} {resultado.visitas === 1 ? 'vez' : 'veces'}
          </p>

          {tieneNiveles ? (
            <div className="flex flex-col gap-4 mb-6">
              {resultado.niveles.map((nivel, i) => {
                const progresoNivel = Math.min((resultado.visitas / nivel.visitas_requeridas) * 100, 100)
                const nivelCompleto = resultado.visitas >= nivel.visitas_requeridas
                const nivelAnterior = i > 0 ? resultado.niveles[i - 1] : null
                const visitasDesdeAnterior = nivelAnterior ? resultado.visitas - nivelAnterior.visitas_requeridas : resultado.visitas
                const metaDesdeAnterior = nivelAnterior
                  ? nivel.visitas_requeridas - nivelAnterior.visitas_requeridas
                  : nivel.visitas_requeridas
                const progresoSegmento = Math.min((visitasDesdeAnterior / metaDesdeAnterior) * 100, 100)

                return (
                  <div key={nivel.id} className={`border rounded-2xl p-4 ${nivelCompleto ? 'bg-green-50 border-green-200' : 'bg-white border-indigo-100 shadow-[0_2px_8px_rgba(99,102,241,0.06)]'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${nivelCompleto ? 'bg-green-500 text-white' : 'bg-indigo-600 text-white'}`}>
                          {nivelCompleto ? '✓' : i + 1}
                        </div>
                        <span className="text-gray-900 text-sm font-semibold">{nivel.descripcion}</span>
                      </div>
                      <span className={`text-xs font-semibold ${nivelCompleto ? 'text-green-600' : 'text-indigo-600'}`}>
                        {nivelCompleto ? '✅ Ganado' : `${resultado.visitas} / ${nivel.visitas_requeridas}`}
                      </span>
                    </div>
                    {!nivelCompleto && (
                      <div className="w-full bg-indigo-100 rounded-full h-3 overflow-hidden">
                        <div
                          className="h-3 rounded-full bg-indigo-500 transition-all duration-1000"
                          style={{ width: progresoNivel + '%' }}
                        />
                      </div>
                    )}
                  </div>
                )
              })}

              <div className={`border rounded-2xl p-4 ${resultado.visitas >= resultado.meta ? 'bg-green-50 border-green-200' : 'bg-white border-indigo-100 shadow-[0_2px_8px_rgba(99,102,241,0.06)]'}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${resultado.visitas >= resultado.meta ? 'bg-green-500 text-white' : 'bg-indigo-600 text-white'}`}>
                      {resultado.visitas >= resultado.meta ? '✓' : '🏆'}
                    </div>
                    <span className="text-gray-900 text-sm font-semibold">{resultado.recompensa}</span>
                  </div>
                  <span className={`text-xs font-semibold ${resultado.visitas >= resultado.meta ? 'text-green-600' : 'text-indigo-600'}`}>
                    {resultado.visitas >= resultado.meta ? '✅ Ganado' : `${resultado.visitas} / ${resultado.meta}`}
                  </span>
                </div>
                {resultado.visitas < resultado.meta && (
                  <div className="w-full bg-indigo-100 rounded-full h-3 overflow-hidden">
                    <div
                      className="h-3 rounded-full bg-indigo-500 transition-all duration-1000"
                      style={{ width: progreso + '%' }}
                    />
                  </div>
                )}
              </div>
            </div>
          ) : (
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
                  ? '¡Solo te falta 1 visita más! 🔥 Sigues construyendo algo bueno aquí.'
                  : `Te faltan ${faltan} visitas para: ${resultado.recompensa}`
                }
              </p>
            </div>
          )}

          {!tieneNiveles && (
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
          )}

          <p className="text-gray-400 text-xs">Te enviamos tu progreso por WhatsApp</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">📲</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Registra tu visita</h1>
          <p className="text-gray-500 text-sm">
            Tu negocio favorito te está reconociendo. Ingresa tu número para acumular visitas y ganar recompensas.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="tel"
            value={celular}
            onChange={(e) => setCelular(e.target.value)}
            placeholder="Ej. 5512345678"
            className="w-full bg-white border-2 border-gray-200 focus:border-indigo-500 text-gray-900 rounded-2xl px-4 py-4 outline-none transition text-center text-xl tracking-widest shadow-sm"
          />
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