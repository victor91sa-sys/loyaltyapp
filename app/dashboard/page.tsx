'use client'

import { useSearchParams } from 'next/navigation'
import { QRCodeSVG } from 'qrcode.react'
import { Suspense, useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

function DashboardContent() {
  const searchParams = useSearchParams()
  const negocioId = searchParams.get('id')
  const negocioNombre = searchParams.get('nombre')

  const [metricas, setMetricas] = useState({
    totalClientes: 0,
    visitasSemana: 0,
    canjes: 0
  })
  const [clientes, setClientes] = useState<any[]>([])
  const [negocio, setNegocio] = useState<any>(null)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    const cargarDatos = async () => {
      const { data: negocioData } = await supabase
        .from('negocios')
        .select('*')
        .eq('id', negocioId)
        .single()

      setNegocio(negocioData)

      const { data: clientesData } = await supabase
        .from('clientes')
        .select('*')
        .eq('negocio_id', negocioId)
        .order('visitas', { ascending: false })

      if (clientesData) {
        setClientes(clientesData)

        const unaSemanaAtras = new Date()
        unaSemanaAtras.setDate(unaSemanaAtras.getDate() - 7)

        const visitasSemana = clientesData.filter(c =>
          c.ultima_visita && new Date(c.ultima_visita) > unaSemanaAtras
        ).length

        const canjes = clientesData.filter(c =>
          c.visitas >= negocioData.visitas
        ).length

        setMetricas({
          totalClientes: clientesData.length,
          visitasSemana,
          canjes
        })
      }

      setCargando(false)
    }

    if (negocioId) cargarDatos()
  }, [negocioId])

  const urlCliente = `http://localhost:3000/visita?negocio=${negocioId}`

  if (cargando) {
    return (
      <main className="min-h-screen bg-gray-950 flex items-center justify-center">
        <p className="text-gray-400">Cargando...</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-950 p-8">
      <div className="max-w-2xl mx-auto">

        <h1 className="text-3xl font-bold text-white mb-2">{negocioNombre}</h1>
        <p className="text-gray-400 mb-8">Panel de control</p>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-gray-900 rounded-2xl p-5 text-center">
            <p className="text-4xl font-bold text-white">{metricas.totalClientes}</p>
            <p className="text-gray-400 text-sm mt-1">Clientes</p>
          </div>
          <div className="bg-gray-900 rounded-2xl p-5 text-center">
            <p className="text-4xl font-bold text-indigo-400">{metricas.visitasSemana}</p>
            <p className="text-gray-400 text-sm mt-1">Visitas esta semana</p>
          </div>
          <div className="bg-gray-900 rounded-2xl p-5 text-center">
            <p className="text-4xl font-bold text-green-400">{metricas.canjes}</p>
            <p className="text-gray-400 text-sm mt-1">Canjes</p>
          </div>
        </div>

        <div className="bg-gray-900 rounded-2xl p-6 mb-8">
          <h2 className="text-white font-semibold mb-4">Tu código QR</h2>
          <div className="flex items-center gap-6">
            <div className="bg-white p-4 rounded-xl">
              <QRCodeSVG value={urlCliente} size={120} />
            </div>
            <p className="text-gray-400 text-sm">
              Imprime este QR y colócalo en tu caja. Tus clientes lo escanean para registrar su visita.
            </p>
          </div>
        </div>

        <div className="bg-gray-900 rounded-2xl p-6">
          <h2 className="text-white font-semibold mb-4">Tus clientes</h2>
          {clientes.length === 0 ? (
            <p className="text-gray-400">Aún no tienes clientes registrados.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {clientes.map((cliente) => {
                const progreso = Math.min((cliente.visitas / negocio.visitas) * 100, 100)
                return (
                  <div key={cliente.id} className="bg-gray-800 rounded-xl p-4">
                    <div className="flex justify-between mb-2">
                      <span className="text-white text-sm">{cliente.celular}</span>
                      <span className="text-gray-400 text-sm">{cliente.visitas} de {negocio.visitas} visitas</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-indigo-500 h-2 rounded-full"
                        style={{ width: `${progreso}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

      </div>
    </main>
  )
}

export default function Dashboard() {
  return (
    <Suspense>
      <DashboardContent />
    </Suspense>
  )
}