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
  const [resultado, setResultado] = useState<null | { visitas: number, meta: number, recompensa: string }>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setEnviando(true)

    const { data: negocio } = await supabase
      .from('negocios')
      .select('visitas, recompensas')
      .eq('id', negocioId)
      .single()

    let { data: cliente } = await supabase
      .from('clientes')
      .select('*')
      .eq('celular', celular)
      .eq('negocio_id', negocioId)
      .single()

    if (!cliente) {
      const { data: nuevoCliente } = await supabase
        .from('clientes')
        .insert([{ celular, negocio_id: negocioId, visitas: 1 }])
        .select()
        .single()
      cliente = nuevoCliente
    } else {
      await supabase
        .from('clientes')
        .update({ visitas: cliente.visitas + 1 })
        .eq('id', cliente.id)
      cliente.visitas = cliente.visitas + 1
    }

    setEnviando(false)
    setResultado({
      visitas: cliente.visitas,
      meta: negocio.visitas,
      recompensa: negocio.recompensas
    })
  }

  if (resultado) {
    const faltan = resultado.meta - resultado.visitas
    const completo = resultado.visitas >= resultado.meta

    return (
      <main className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-8">
        <div className="text-center max-w-md">
          {completo ? (
            <>
              <h1 className="text-4xl font-bold text-white mb-4">🎉 Felicidades</h1>
              <p className="text-xl text-indigo-400 mb-4">Ganaste: {resultado.recompensa}</p>
              <p className="text-gray-400">Muestra esta pantalla en caja para reclamar tu recompensa.</p>
            </>
          ) : (
            <>
              <h1 className="text-4xl font-bold text-white mb-4">✅ Visita registrada</h1>
              <p className="text-2xl text-indigo-400 mb-2">{resultado.visitas} de {resultado.meta} visitas</p>
              <p className="text-gray-400">Te faltan {faltan} visita{faltan !== 1 ? 's' : ''} para obtener: {resultado.recompensa}</p>
            </>
          )}
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-md text-center">
        <h1 className="text-3xl font-bold text-white mb-2">
          Registra tu visita
        </h1>
        <p className="text-gray-400 mb-8">
          Ingresa tu número de celular para acumular puntos
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="tel"
            value={celular}
            onChange={(e) => setCelular(e.target.value)}
            placeholder="Ej. 2221234567"
            className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 text-center text-lg"
          />
          <button
            type="submit"
            disabled={enviando || !celular}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-xl transition disabled:opacity-50"
          >
            {enviando ? 'Registrando...' : 'Registrar visita'}
          </button>
        </form>
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