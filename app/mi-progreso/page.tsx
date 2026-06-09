'use client'

import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import Link from 'next/link'

type Progreso = {
  negocioNombre: string
  visitas: number
  meta: number
  recompensa: string
  negocioId: string
}

export default function MiProgreso() {
  const [celular, setCelular] = useState('')
  const [buscando, setBuscando] = useState(false)
  const [resultados, setResultados] = useState<Progreso[] | null>(null)
  const [buscado, setBuscado] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setBuscando(true)
    setBuscado(false)

    const { data: clientes } = await supabase
      .from('clientes')
      .select('visitas, negocio_id')
      .eq('celular', celular)

    if (!clientes || clientes.length === 0) {
      setResultados([])
      setBuscado(true)
      setBuscando(false)
      return
    }

    const negocioIds = clientes.map(c => c.negocio_id)

    const { data: negocios } = await supabase
      .from('negocios')
      .select('id, nombre, visitas, recompensas')
      .in('id', negocioIds)

    if (!negocios) {
      setResultados([])
      setBuscado(true)
      setBuscando(false)
      return
    }

    const progreso: Progreso[] = clientes.map(cliente => {
      const negocio = negocios.find(n => n.id === cliente.negocio_id)
      return {
        negocioNombre: negocio?.nombre || 'Negocio',
        visitas: cliente.visitas,
        meta: negocio?.visitas || 10,
        recompensa: negocio?.recompensas || '',
        negocioId: cliente.negocio_id
      }
    })

    setResultados(progreso)
    setBuscado(true)
    setBuscando(false)
  }

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col">

      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm">
        <Link href="/" className="block">
          <span className="text-indigo-600 font-bold text-xl">HuellaClub</span>
          <p className="text-gray-400 text-xs">Vuelven por ti.</p>
        </Link>
        <Link href="/login" className="text-gray-500 hover:text-gray-700 text-sm transition">
          Soy dueño de un negocio
        </Link>
      </nav>

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">

          {!buscado ? (
            <>
              <div className="text-center mb-10">
                <div className="text-6xl mb-4">🏆</div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                  ¿Cuánto llevas acumulado?
                </h1>
                <p className="text-gray-500 text-sm">
                  Ingresa tu número y ve tu progreso en todos tus negocios favoritos.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <input
                  type="tel"
                  value={celular}
                  onChange={(e) => setCelular(e.target.value)}
                  placeholder="Ej. 5512345678"
                  required
                  className="w-full bg-white border-2 border-gray-200 focus:border-indigo-500 text-gray-900 rounded-2xl px-4 py-4 outline-none transition text-center text-xl tracking-widest shadow-sm"
                />
                <button
                  type="submit"
                  disabled={buscando || !celular}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-6 rounded-2xl transition disabled:opacity-50 text-lg shadow-[0_4px_20px_rgba(99,102,241,0.3)]"
                >
                  {buscando ? 'Buscando...' : 'Ver mi progreso'}
                </button>
              </form>

              <p className="text-gray-400 text-xs mt-6 text-center">
                Tu número solo se usa para ver tu progreso. No se comparte con nadie.
              </p>
            </>
          ) : (
            <>
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-1">Tu progreso</h1>
                <p className="text-gray-500 text-sm">Número: {celular}</p>
              </div>

              {resultados && resultados.length === 0 ? (
                <div className="bg-white rounded-3xl border border-indigo-100 shadow-[0_8px_40px_rgba(99,102,241,0.08)] p-10 text-center">
                  <div className="text-6xl mb-4">📲</div>
                  <h2 className="text-gray-900 font-bold text-lg mb-2">Aún no tienes visitas registradas</h2>
                  <p className="text-gray-500 text-sm mb-6">
                    Escanea el QR de tu negocio favorito para empezar a acumular.
                  </p>
                  <button
                    onClick={() => { setResultados(null); setBuscado(false); setCelular('') }}
                    className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                  >
                    Intentar con otro número
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {resultados?.map((r, i) => {
                    const progreso = Math.min((r.visitas / r.meta) * 100, 100)
                    const completo = r.visitas >= r.meta
                    const faltan = r.meta - r.visitas

                    return (
                      <div
                        key={i}
                        className="bg-white rounded-2xl border border-indigo-100 shadow-[0_4px_20px_rgba(99,102,241,0.08)] p-6"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <h2 className="text-gray-900 font-bold text-lg">{r.negocioNombre}</h2>
                          {completo && (
                            <span className="bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full">
                              🎁 Premio ganado
                            </span>
                          )}
                        </div>

                        <div className="flex justify-between items-center mb-2">
                          <span className="text-gray-500 text-sm">Tu progreso</span>
                          <span className="text-gray-900 font-bold text-sm">{r.visitas} de {r.meta} visitas</span>
                        </div>

                        <div className="w-full bg-indigo-100 rounded-full h-4 mb-3 overflow-hidden">
                          <div
                            className={`h-4 rounded-full transition-all duration-1000 ${completo ? 'bg-green-500' : 'bg-indigo-500'}`}
                            style={{ width: progreso + '%' }}
                          />
                        </div>

                        <p className={`text-sm font-medium ${completo ? 'text-green-600' : 'text-indigo-600'}`}>
                          {completo
                            ? `¡Completaste tu recompensa! Premio: ${r.recompensa}`
                            : faltan === 1
                              ? `¡Solo te falta 1 visita para: ${r.recompensa}! 🔥`
                              : `Te faltan ${faltan} visitas para: ${r.recompensa}`
                          }
                        </p>

                        <div className="flex flex-wrap gap-1.5 mt-4">
                          {Array.from({ length: r.meta }, (_, i) => (
                            <div
                              key={i}
                              className="w-7 h-7 rounded-lg flex items-center justify-center text-xs transition-all"
                              style={{
                                backgroundColor: i < r.visitas ? (completo ? '#22c55e' : '#6366f1') : '#f0f0f0',
                                color: i < r.visitas ? 'white' : '#d1d5db',
                              }}
                            >
                              {i < r.visitas ? '⭐' : '○'}
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })}

                  <button
                    onClick={() => { setResultados(null); setBuscado(false); setCelular('') }}
                    className="text-gray-400 hover:text-gray-600 text-sm transition text-center mt-2"
                  >
                    Buscar otro número
                  </button>
                </div>
              )}
            </>
          )}

        </div>
      </div>

      <footer className="px-6 py-6 border-t border-gray-200 bg-white text-center">
        <p className="text-gray-400 text-xs">HuellaClub · <em>Vuelven por ti.</em></p>
      </footer>

    </main>
  )
}