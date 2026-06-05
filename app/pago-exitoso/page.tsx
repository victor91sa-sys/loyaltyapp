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
      <main className="min-h-screen bg-gray-950 flex items-center justify-center">
        <p className="text-gray-400">Cargando...</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-8">
      <div className="text-center max-w-md">
        <p className="text-6xl mb-6">!</p>
        <h1 className="text-3xl font-bold text-white mb-4">
          Pago exitoso
        </h1>
        <p className="text-gray-400 text-lg mb-8">
          Tu suscripcion a HuellaClub Pro esta activa. Bienvenido al club.
        </p>
        <button
          onClick={irAlDashboard}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-8 rounded-xl transition"
        >
          Ir a mi dashboard
        </button>
      </div>
    </main>
  )
}