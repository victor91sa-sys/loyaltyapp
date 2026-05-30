'use client'

import { useSearchParams } from 'next/navigation'
import { QRCodeSVG } from 'qrcode.react'
import { Suspense } from 'react'

function DashboardContent() {
  const searchParams = useSearchParams()
  const negocioId = searchParams.get('id')
  const negocioNombre = searchParams.get('nombre')

  const urlCliente = `http://localhost:3000/visita?negocio=${negocioId}`

  return (
    <main className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-8">
      <div className="text-center max-w-md">
        
        <h1 className="text-3xl font-bold text-white mb-2">
          {negocioNombre}
        </h1>
        <p className="text-gray-400 mb-8">
          Este es tu código QR. Imprímelo y colócalo en tu caja.
        </p>

        <div className="bg-white p-6 rounded-2xl inline-block mb-8">
          <QRCodeSVG
            value={urlCliente}
            size={200}
          />
        </div>

        <p className="text-gray-500 text-sm">
          Cuando un cliente lo escanea, registra su visita automáticamente.
        </p>

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