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
    <main className="min-h-screen bg-[#FAFBFF] flex flex-col">

      <nav className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <img src="/images/estrella.svg" alt="estrella HuellaClub" style={{ height: '32px', width: '32px' }} />
          <div>
            <span className="text-marca-azul font-bold text-xl" style={{ fontFamily: 'var(--font-fredoka)' }}>HuellaClub</span>
            <p className="text-gray-400 text-xs">Vuelven por ti.</p>
          </div>
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
                  className="w-full bg-white border-2 border-[#EDEEFB] focus:border-marca-azul text-gray-900 rounded-2xl px-4 py-4 outline-none transition text-center text-xl tracking-widest"
                />
                <button
                  type="submit"
                  disabled={buscando || !celular}
                  className="btn-3d btn-3d-azul disabled:opacity-50"
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
                <div className="ficha p-10 text-center">
                  <div className="text-6xl mb-4">📲</div>
                  <h2 className="text-gray-900 font-bold text-lg mb-2">Aún no tienes visitas registradas</h2>
                  <p className="text-gray-500 text-sm mb-6">
                    Escanea el QR de tu negocio favorito para empezar a acumular.
                  </p>
                  <button
                    onClick={() => { setResultados(null); setBuscado(false); setCelular('') }}
                    className="text-marca-azul hover:brightness-110 text-sm font-bold"
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
                      <div key={i} className="ficha p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h2 className="text-gray-900 font-bold text-lg">{r.negocioNombre}</h2>
                          {completo && (
                            <span className="bg-[#EAFBEA] text-[#2AB84A] text-xs font-bold px-3 py-1 rounded-full">
                              🎁 Premio ganado
                            </span>
                          )}
                        </div>

                        <div className="flex justify-between items-center mb-2">
                          <span className="text-gray-500 text-sm">Tu progreso</span>
                          <span className="text-gray-900 font-bold text-sm">{r.visitas} de {r.meta} visitas</span>
                        </div>

                        <div className="w-full bg-[#EDEEFB] rounded-full h-4 mb-3 overflow-hidden">
                          <div
                            className={`h-4 rounded-full transition-all duration-1000 ${completo ? 'bg-[#2AB84A]' : 'bg-marca-azul'}`}
                            style={{ width: progreso + '%' }}
                          />
                        </div>

                        <p className={`text-sm font-bold ${completo ? 'text-[#2AB84A]' : 'text-marca-azul'}`}>
                          {completo
                            ? `¡Completaste tu recompensa! Premio: ${r.recompensa}`
                            : faltan === 1
                              ? `¡Solo te falta 1 visita para: ${r.recompensa}! 🔥`
                              : `Te faltan ${faltan} visitas para: ${r.recompensa}`
                          }
                        </p>

                        <div className="flex flex-wrap gap-1.5 mt-4">
                          {Array.from({ length: r.meta }, (_, idx) => (
                            <div
                              key={idx}
                              className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold transition-all"
                              style={{
                                backgroundColor: idx < r.visitas ? (completo ? '#2AB84A' : '#4247B9') : '#EDEEFB',
                                color: idx < r.visitas ? 'white' : '#C9CBF0',
                              }}
                            >
                              {idx < r.visitas ? '✓' : ''}
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