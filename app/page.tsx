'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabase'

function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true) },
      { threshold: 0.15 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return { ref, visible }
}

function Reveal({ children, delay = 0 }: { children: React.ReactNode, delay?: number }) {
  const { ref, visible } = useScrollReveal()
  return (
    <div
      ref={ref}
      style={{
        transition: `opacity 0.7s ease ${delay}ms, transform 0.7s ease ${delay}ms`,
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(32px)'
      }}
    >
      {children}
    </div>
  )
}

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    const hash = window.location.hash
    if (hash.includes('access_token') || hash.includes('type=')) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event) => {
        if (event === 'PASSWORD_RECOVERY') router.push('/nueva-password')
        else if (event === 'SIGNED_IN' && hash.includes('type=signup')) router.push('/bienvenida')
      })
      return () => subscription.unsubscribe()
    }
  }, [])

  return (
    <main className="min-h-screen bg-gray-950 flex flex-col">

      <nav className="flex items-center justify-between px-8 py-6 sticky top-0 bg-gray-950 bg-opacity-90 backdrop-blur z-50 border-b border-gray-900">
        <span className="text-white font-bold text-xl">HuellaClub</span>
        <div className="flex items-center gap-6">
          <Link href="/login" className="text-gray-400 hover:text-white text-sm transition">
            Ya tengo cuenta
          </Link>
          <Link href="/registro" className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition">
            Empezar gratis
          </Link>
        </div>
      </nav>

      <section className="flex flex-col items-center justify-center text-center px-8 py-24 flex-1">
        <div
          style={{ animation: 'fadeUp 0.8s ease forwards', opacity: 0 }}
        >
          <div className="inline-block bg-indigo-900 text-indigo-300 text-xs font-semibold px-4 py-2 rounded-full mb-6">
            30 días gratis · Después $199 MXN/mes
          </div>
          <h1 className="text-5xl font-bold text-white mb-6 max-w-2xl leading-tight mx-auto">
            Un sistema para que tus clientes tengan razones para regresar a comprarte más
          </h1>
          <p className="text-gray-400 text-lg mb-4 max-w-lg mx-auto">
            Solo pones un código QR en tu negocio. Tus clientes lo escanean, acumulan visitas y ganan premios. Sin apps, sin aparatos, sin complicaciones.
          </p>
          <p className="text-gray-500 text-sm mb-10 max-w-md mx-auto">
            Funciona para abarrotes, tortillerías, taquerías, tianguis y cualquier negocio local.
          </p>
          <Link
            href="/registro"
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-10 rounded-xl transition text-lg mb-3 inline-block"
          >
            Pruébalo gratis 30 días
          </Link>
          <p className="text-gray-600 text-sm mt-3">Sin tarjeta. Sin letra chica.</p>
        </div>
      </section>

      <section className="px-8 py-20 bg-gray-900">
        <div className="max-w-3xl mx-auto">
          <Reveal>
            <h2 className="text-white font-bold text-3xl text-center mb-2">Cómo funciona</h2>
            <p className="text-gray-500 text-center text-sm mb-16">En menos de 10 minutos tienes todo listo</p>
          </Reveal>
          <div className="grid grid-cols-3 gap-8">
            {[
              { num: '1', title: 'Te registras', desc: 'Pones el nombre de tu negocio y cuántas visitas vale el premio' },
              { num: '2', title: 'Pones el QR', desc: 'Lo imprimes y lo pegas en tu mostrador o caja. Ya está.' },
              { num: '3', title: 'Ellos regresan', desc: 'Cada visita los acerca más a su premio. Tú ves todo desde tu panel.' }
            ].map((paso, i) => (
              <Reveal key={paso.num} delay={i * 150}>
                <div className="text-center">
                  <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl">
                    {paso.num}
                  </div>
                  <h3 className="text-white font-semibold mb-2">{paso.title}</h3>
                  <p className="text-gray-400 text-sm">{paso.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="px-8 py-20">
        <div className="max-w-3xl mx-auto">
          <Reveal>
            <h2 className="text-white font-bold text-3xl text-center mb-2">Para cualquier negocio</h2>
            <p className="text-gray-500 text-center text-sm mb-16">Si tienes clientes que regresan, HuellaClub es para ti</p>
          </Reveal>
          <div className="grid grid-cols-3 gap-4">
            {[
              'Abarrotes', 'Tortillerías', 'Taquerías',
              'Tianguis', 'Barberías', 'Lavanderías',
              'Salones de belleza', 'Farmacias', 'Cafeterías'
            ].map((negocio, i) => (
              <Reveal key={negocio} delay={i * 80}>
                <div className="bg-gray-900 border border-gray-800 hover:border-indigo-600 rounded-2xl p-4 text-center transition">
                  <p className="text-gray-300 text-sm">{negocio}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="px-8 py-20 bg-gray-900">
        <div className="max-w-2xl mx-auto">
          <Reveal>
            <h2 className="text-white font-bold text-3xl text-center mb-16">Lo que dicen los números</h2>
          </Reveal>
          <div className="grid grid-cols-3 gap-8 text-center">
            {[
              { num: '5x', desc: 'más barato retener un cliente que conseguir uno nuevo' },
              { num: '68%', desc: 'de los clientes regresan más seguido cuando tienen recompensas' },
              { num: '$199', desc: 'MXN al mes. Menos de lo que cuesta perder un cliente frecuente' }
            ].map((stat, i) => (
              <Reveal key={stat.num} delay={i * 150}>
                <div>
                  <p className="text-4xl font-bold text-indigo-400 mb-2">{stat.num}</p>
                  <p className="text-gray-400 text-sm">{stat.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="px-8 py-20">
        <div className="max-w-3xl mx-auto">
          <Reveal>
            <h2 className="text-white font-bold text-3xl text-center mb-16">Qué incluye</h2>
          </Reveal>
          <div className="grid grid-cols-2 gap-6">
            {[
              { titulo: 'Código QR personalizado', desc: 'Con los colores y logo de tu negocio. Listo para imprimir.' },
              { titulo: 'Panel de control', desc: 'Ve cuántos clientes tienes, cuántos han visitado y cuántos canjes se han dado.' },
              { titulo: 'Sin apps para tus clientes', desc: 'Solo escanean con la cámara del celular. Nada que descargar.' },
              { titulo: 'Protección anti-trampa', desc: 'Solo una visita por día por cliente. Sin posibilidad de hacer trampa.' },
              { titulo: 'Notificaciones por WhatsApp', desc: 'Tus clientes reciben su progreso directo en WhatsApp.' },
              { titulo: 'Soporte por email', desc: 'Si tienes dudas, te respondemos en menos de 24 horas.' }
            ].map((item, i) => (
              <Reveal key={item.titulo} delay={i * 100}>
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                  <h3 className="text-white font-semibold mb-2">{item.titulo}</h3>
                  <p className="text-gray-400 text-sm">{item.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="px-8 py-20 bg-indigo-600">
        <Reveal>
          <div className="max-w-lg mx-auto text-center">
            <h2 className="text-white font-bold text-4xl mb-4">
              Empieza hoy. Es gratis.
            </h2>
            <p className="text-indigo-200 mb-2">
              30 días gratis. Después $199 MXN al mes.
            </p>
            <p className="text-indigo-300 text-sm mb-10">
              Cancelas cuando quieras. Sin contratos.
            </p>
            <Link
              href="/registro"
              className="bg-white text-indigo-600 font-bold py-4 px-10 rounded-xl transition hover:bg-indigo-50 inline-block text-lg"
            >
              Registrar mi negocio gratis
            </Link>
          </div>
        </Reveal>
      </section>

      <footer className="px-8 py-8 border-t border-gray-900">
        <div className="max-w-3xl mx-auto flex justify-between items-center">
          <span className="text-gray-600 text-sm">HuellaClub 2026</span>
          <div className="flex gap-6">
            <Link href="/terminos" className="text-gray-600 hover:text-gray-400 text-sm transition">Términos</Link>
            <Link href="/login" className="text-gray-600 hover:text-gray-400 text-sm transition">Iniciar sesión</Link>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(32px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

    </main>
  )
}