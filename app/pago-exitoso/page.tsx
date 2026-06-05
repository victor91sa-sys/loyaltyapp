'use client'

import { useRouter } from 'next/navigation'

export default function PagoExitoso() {
  const router = useRouter()

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
          onClick={() => router.push('/login')}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-8 rounded-xl transition"
        >
          Ir a mi dashboard
        </button>
      </div>
    </main>
  )
}