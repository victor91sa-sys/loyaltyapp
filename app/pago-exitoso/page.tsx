'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'

export default function PagoExitoso() {
  const router = useRouter()
  const [cargando, setCargando] = useState(true)
  const [negocio, setNegocio] = useState<any>(null)

  useEffect(() => {
    const cargarNegocio = async () => {
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        router.push('/login')
        return
      }

      const { data } = await supabase
        .from('negocios')
        .select('id, nombre')
        .eq('correo', session.user.email)
        .single()

      setNegocio(data)
      setCargando(false)
    }

    cargarNegocio()
  }, [])

  const irAlDashboard = () => {
    if (negocio) {
      router.push('/dashboard?id=' + negocio.id + '&nombre=' + encodeURIComponent(negocio.nombre))
    } else {
      router.push('/login')
    }
  }

  if (cargando) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 text-sm">Verificando tu pago...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-8">
      <div className="bg-white rounded-3xl border border-indigo-100 shadow-[0_8px_40px_rgba(99,102,241,0.12)] p-10 text-center max-w-md w-full">
        <div className="text-7xl mb-6">🎉</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          ¡Pago exitoso!
        </h1>
        <p className="text-gray-500 mb-8">
          Tu suscripción a HuellaClub Pro está activa. Bienvenido al club.
        </p>
        <div className="bg-green-50 border border-green-200 rounded-2xl p-5 mb-8">
          <ul className="flex flex-col gap-2 text-left">
            {[
              '✅ Clientes ilimitados',
              '✅ QR personalizado activo',
              '✅ Panel de control en tiempo real',
              '✅ Notificaciones por WhatsApp',
            ].map((item) => (
              <li key={item} className="text-green-700 text-sm font-medium">{item}</li>
            ))}
          </ul>
        </div>
        <button
          onClick={irAlDashboard}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-8 rounded-xl transition w-full text-lg"
        >
          Ir a mi panel
        </button>
      </div>
    </main>
  )
}