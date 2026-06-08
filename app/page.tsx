'use client'

import Link from 'next/link'
import Image from 'next/image'
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

function MockupCartel() {
  const [color, setColor] = useState('#4f46e5')
  const colores = ['#4f46e5', '#e11d48', '#059669', '#d97706', '#7c3aed', '#0891b2']

  return (
    <div className="flex flex-col items-center gap-6">
      <div
        className="rounded-3xl p-6 w-full max-w-xs shadow-2xl transition-all duration-500"
        style={{ backgroundColor: color }}
      >
        <div className="text-center mb-4">
          <div className="text-4xl mb-1">🌮</div>
          <h3 className="text-white font-bold text-lg">Taquería El Güero</h3>
          <p className="text-white text-xs mt-1" style={{ opacity: 0.8 }}>
            Escanea y acumula visitas
          </p>
        </div>
        <div className="bg-white rounded-2xl p-4 mb-4 flex items-center justify-center">
          <div className="grid grid-cols-7 gap-0.5">
            {[1,1,1,0,1,0,1, 1,0,1,0,0,0,1, 1,0,1,0,1,0,1, 1,1,1,0,0,1,0, 0,1,0,1,0,1,1, 1,0,0,0,1,0,1, 0,1,1,1,0,1,0].map((cell, i) => (
              <div key={i} className="w-4 h-4 rounded-sm" style={{ backgroundColor: cell ? color : 'white' }} />
            ))}
          </div>
        </div>
        <div className="rounded-2xl p-3" style={{ backgroundColor: 'rgba(0,0,0,0.25)' }}>
          <div className="flex justify-between text-white text-xs mb-2">
            <span>Tu progreso</span>
            <span className="font-bold">3 de 10 visitas</span>
          </div>
          <div className="w-full rounded-full h-2 mb-2" style={{ backgroundColor: 'rgba(255,255,255,0.3)' }}>
            <div className="h-2 rounded-full bg-white transition-all" style={{ width: '30%' }} />
          </div>
          <p className="text-white text-xs text-center" style={{ opacity: 0.9 }}>
            7 visitas más para tu taco gratis 🎁
          </p>
        </div>
      </div>
      <div>
        <p className="text-gray-500 text-xs text-center mb-3">Elige el color de tu negocio</p>
        <div className="flex gap-3 justify-center">
          {colores.map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className="w-8 h-8 rounded-full transition-all hover:scale-110 border-2"
              style={{ backgroundColor: c, borderColor: color === c ? '#111' : 'transparent' }}
            />
          ))}
        </div>
      </div>
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
    <main className="min-h-screen bg-white flex flex-col">

      <nav className="flex items-center justify-between px-6 md:px-8 py-5 sticky top-0 bg-white z-50 border-b border-gray-200 shadow-sm">
        <span className="text-indigo-600 font-bold text-xl">HuellaClub</span>
        <div className="flex items-center gap-3 md:gap-6">
          <Link href="/login" className="text-gray-500 hover:text-gray-900 text-sm transition hidden md:block">
            Ya tengo cuenta
          </Link>
          <Link href="/registro" className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition">
            Empezar gratis
          </Link>
        </div>
      </nav>

      <section className="relative flex flex-col items-center justify-center text-center px-6 md:px-8 py-20 md:py-32 overflow-hidden bg-white">
        <div className="absolute inset-0 z-0">
          <Image src="/images/hero.png" alt="Dueña de tortillería" fill className="object-cover opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-b from-white/60 via-white/50 to-white" />
        </div>
        <div className="relative z-10 w-full max-w-3xl mx-auto" style={{ animation: 'fadeUp 0.8s ease forwards', opacity: 0 }}>
          <div className="inline-block bg-indigo-100 text-indigo-600 text-xs font-semibold px-4 py-2 rounded-full mb-6">
            30 días gratis · Después $199 MXN/mes
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
            Un sistema para que tus clientes tengan razones para regresar a comprarte más
          </h1>
          <p className="text-gray-600 text-base md:text-lg mb-4 max-w-lg mx-auto">
            Solo pones un código QR en tu negocio. Tus clientes lo escanean, acumulan visitas y ganan premios. Sin apps, sin aparatos, sin complicaciones.
          </p>
          <p className="text-gray-400 text-sm mb-10 max-w-md mx-auto">
            Funciona para cafeterías, restaurantes, barberías, taquerías, tortillerías, abarrotes, tianguis y más.
          </p>
          <Link
            href="/registro"
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-8 md:px-10 rounded-xl transition text-base md:text-lg mb-3 inline-block"
          >
            Pruébalo gratis 30 días
          </Link>
          <p className="text-gray-400 text-sm mt-3">Sin tarjeta. Sin letras pequeñas.</p>
        </div>
      </section>

      <section className="px-6 md:px-8 py-16 md:py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <Reveal>
            <h2 className="text-gray-900 font-bold text-2xl md:text-3xl text-center mb-2">Cómo funciona</h2>
            <p className="text-gray-500 text-center text-sm mb-12 md:mb-16">En menos de 10 minutos tienes todo listo</p>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            {[
              { emoji: '📝', num: '1', title: 'Te registras', desc: 'Pones el nombre de tu negocio y cuántas visitas vale el premio' },
              { emoji: '📲', num: '2', title: 'Pones el QR', desc: 'Lo imprimes y lo pegas en tu mostrador o caja. Ya está.' },
              { emoji: '🎁', num: '3', title: 'Ellos regresan', desc: 'Cada visita los acerca más a su premio. Tú ves todo desde tu panel.' }
            ].map((paso, i) => (
              <Reveal key={paso.num} delay={i * 150}>
                <div className="text-center bg-white border border-indigo-100 rounded-2xl p-8 shadow-[0_4px_20px_rgba(99,102,241,0.08)] h-full flex flex-col items-center justify-start">
                  <div className="text-5xl mb-4">{paso.emoji}</div>
                  <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-sm">
                    {paso.num}
                  </div>
                  <h3 className="text-gray-900 font-semibold mb-2">{paso.title}</h3>
                  <p className="text-gray-600 text-sm">{paso.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 md:px-8 py-16 md:py-20 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
            <Reveal>
              <div className="relative h-64 md:h-80 rounded-3xl overflow-hidden shadow-[0_8px_40px_rgba(99,102,241,0.15)]">
                <Image src="/images/tacos.png" alt="Taquero con QR" fill className="object-cover" />
              </div>
            </Reveal>
            <Reveal delay={200}>
              <div>
                <h2 className="text-gray-900 font-bold text-2xl md:text-3xl mb-4">Tu negocio. Tu programa.</h2>
                <p className="text-gray-600 mb-6">
                  No necesitas saber de tecnología. Si sabes usar WhatsApp, puedes usar HuellaClub. En menos de 10 minutos tienes tu programa de lealtad funcionando.
                </p>
                <Link href="/registro" className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-xl transition inline-block">
                  Empieza hoy gratis
                </Link>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="px-6 md:px-8 py-16 md:py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <Reveal>
            <h2 className="text-gray-900 font-bold text-2xl md:text-3xl text-center mb-2">Tu QR, a tu manera</h2>
            <p className="text-gray-500 text-center text-sm mb-12 md:mb-16">Personaliza tu cartel con los colores y nombre de tu negocio. Listo para imprimir.</p>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
            <Reveal delay={100}>
              <MockupCartel />
            </Reveal>
            <Reveal delay={250}>
              <div>
                <h3 className="text-gray-900 font-bold text-xl md:text-2xl mb-4">Diseña tu cartel en minutos</h3>
                <ul className="flex flex-col gap-4 mb-8">
                  {[
                    { emoji: '🎨', texto: 'Elige los colores de tu negocio' },
                    { emoji: '🏪', texto: 'Agrega el nombre de tu negocio' },
                    { emoji: '🖼️', texto: 'Sube tu logo si tienes uno' },
                    { emoji: '🖨️', texto: 'Descarga listo para imprimir' },
                    { emoji: '✅', texto: 'Sin diseñador, sin Photoshop, sin complicaciones' }
                  ].map((item) => (
                    <li key={item.texto} className="flex items-start gap-3">
                      <span className="text-2xl">{item.emoji}</span>
                      <p className="text-gray-600 text-sm pt-1">{item.texto}</p>
                    </li>
                  ))}
                </ul>
                <Link href="/registro" className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-xl transition inline-block">
                  Crear mi cartel gratis
                </Link>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="px-6 md:px-8 py-16 md:py-20 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
            <Reveal>
              <div>
                <h2 className="text-gray-900 font-bold text-2xl md:text-3xl mb-4">Para cualquier negocio local</h2>
                <p className="text-gray-600 mb-6">
                  Si tienes clientes que regresan, HuellaClub es para ti. Sin importar el tamaño de tu negocio.
                </p>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { emoji: '☕', nombre: 'Cafeterías' },
                    { emoji: '🌮', nombre: 'Taquerías' },
                    { emoji: '✂️', nombre: 'Barberías' },
                    { emoji: '🫓', nombre: 'Tortillerías' },
                    { emoji: '🛒', nombre: 'Abarrotes' },
                    { emoji: '🛍️', nombre: 'Tianguis' }
                  ].map((negocio) => (
                    <div key={negocio.nombre} className="bg-gray-50 border border-indigo-100 rounded-xl p-3 text-center shadow-[0_2px_8px_rgba(99,102,241,0.06)]">
                      <div className="text-2xl mb-1">{negocio.emoji}</div>
                      <p className="text-gray-600 text-xs">{negocio.nombre}</p>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
            <Reveal delay={200}>
              <div className="relative h-64 md:h-80 rounded-3xl overflow-hidden shadow-[0_8px_40px_rgba(99,102,241,0.15)]">
                <Image src="/images/barberia.png" alt="Barbero sonriendo" fill className="object-cover" />
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="px-6 md:px-8 py-16 md:py-20 bg-gray-50">
        <div className="max-w-2xl mx-auto">
          <Reveal>
            <h2 className="text-gray-900 font-bold text-2xl md:text-3xl text-center mb-12 md:mb-16">Lo que dicen los números</h2>
          </Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            {[
              { num: '5x', desc: 'más barato retener un cliente que conseguir uno nuevo' },
              { num: '68%', desc: 'de los clientes regresan más seguido cuando tienen recompensas' },
              { num: '$199', desc: 'MXN al mes. Menos de lo que cuesta perder un cliente frecuente' }
            ].map((stat, i) => (
              <Reveal key={stat.num} delay={i * 150}>
                <div className="bg-white rounded-2xl p-6 shadow-[0_4px_20px_rgba(99,102,241,0.08)] border border-indigo-100">
                  <p className="text-4xl md:text-5xl font-bold text-indigo-600 mb-2">{stat.num}</p>
                  <p className="text-gray-600 text-sm">{stat.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 md:px-8 py-16 md:py-20 bg-white">
        <div className="max-w-3xl mx-auto">
          <Reveal>
            <h2 className="text-gray-900 font-bold text-2xl md:text-3xl text-center mb-2">Qué incluye</h2>
            <p className="text-gray-500 text-center text-sm mb-12 md:mb-16">Todo lo que necesitas para empezar hoy</p>
          </Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
            {[
              { emoji: '📱', titulo: 'QR personalizado', desc: 'Con los colores y nombre de tu negocio. Listo para imprimir.' },
              { emoji: '📊', titulo: 'Panel de control', desc: 'Ve cuántos clientes tienes, visitas y canjes en tiempo real.' },
              { emoji: '🚀', titulo: 'Sin apps para tus clientes', desc: 'Solo escanean con la cámara del celular. Nada que descargar.' },
              { emoji: '🛡️', titulo: 'Protección anti-trampa', desc: 'Solo una visita por día por cliente. Sin posibilidad de hacer trampa.' },
              { emoji: '💬', titulo: 'Notificaciones por WhatsApp', desc: 'Tus clientes reciben su progreso directo en WhatsApp.' },
              { emoji: '🎨', titulo: 'Editor de cartel', desc: 'Diseña tu cartel en minutos sin necesidad de un diseñador.' }
            ].map((item, i) => (
              <Reveal key={item.titulo} delay={i * 100}>
                <div className="bg-gray-50 border border-indigo-100 rounded-2xl p-5 md:p-6 flex gap-4 shadow-[0_4px_20px_rgba(99,102,241,0.06)]">
                  <div className="text-3xl">{item.emoji}</div>
                  <div>
                    <h3 className="text-gray-900 font-semibold mb-1">{item.titulo}</h3>
                    <p className="text-gray-600 text-sm">{item.desc}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 md:px-8 py-16 md:py-20 bg-gray-50">
        <div className="max-w-lg mx-auto">
          <Reveal>
            <h2 className="text-gray-900 font-bold text-2xl md:text-3xl text-center mb-2">Un precio. Todo incluido.</h2>
            <p className="text-gray-500 text-center text-sm mb-10 md:mb-12">Sin sorpresas. Sin comisiones. Sin contratos.</p>
          </Reveal>
          <Reveal delay={200}>
            <div className="bg-white border-2 border-indigo-500 rounded-3xl p-8 md:p-10 text-center shadow-[0_8px_40px_rgba(99,102,241,0.15)]">
              <div className="inline-block bg-indigo-100 text-indigo-600 text-xs font-semibold px-3 py-1 rounded-full mb-6">
                Precio de lanzamiento
              </div>
              <div className="mb-2">
                <span className="text-6xl md:text-7xl font-bold text-gray-900">$199</span>
                <span className="text-gray-500 text-lg"> MXN/mes</span>
              </div>
              <p className="text-gray-400 text-sm mb-8">Primeros 30 días completamente gratis</p>
              <ul className="flex flex-col gap-3 mb-8 text-left">
                {[
                  'Clientes ilimitados',
                  'QR personalizado con tu marca',
                  'Panel de control en tiempo real',
                  'Notificaciones por WhatsApp',
                  'Editor de cartel incluido',
                  'Soporte por email',
                  'Cancelas cuando quieras'
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-gray-700 text-sm">
                    <span className="text-indigo-600 font-bold">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                href="/registro"
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-8 rounded-xl transition inline-block w-full text-center text-lg"
              >
                Empezar gratis ahora
              </Link>
              <p className="text-gray-400 text-xs mt-4">Sin tarjeta de crédito para empezar</p>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="px-6 md:px-8 py-16 md:py-20 bg-white">
        <div className="max-w-lg mx-auto text-center">
          <Reveal>
            <h2 className="text-gray-900 font-bold text-2xl md:text-3xl mb-4">¿Tienes dudas?</h2>
            <p className="text-gray-600 mb-6">
              Escríbenos directamente y te respondemos en menos de 24 horas.
            </p>
            <a href="mailto:sabino@maplo.com.mx" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-8 rounded-xl transition inline-block text-base md:text-lg mb-4">
              sabino@maplo.com.mx
            </a>
            <p className="text-gray-500 text-sm">También puedes escribirnos para agendar una demo gratuita.</p>
          </Reveal>
        </div>
      </section>

      <section className="relative px-6 md:px-8 py-24 md:py-32 overflow-hidden bg-gray-50">
        <div className="absolute inset-0 z-0">
          <Image src="/images/comunidad.png" alt="Comunidad de negocios" fill className="object-cover opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-b from-gray-50/60 via-gray-50/50 to-gray-50" />
        </div>
        <Reveal>
          <div className="relative z-10 max-w-lg mx-auto text-center">
            <h2 className="text-gray-900 font-bold text-3xl md:text-4xl mb-4">
              Empieza hoy. Es gratis.
            </h2>
            <p className="text-gray-600 mb-2">
              30 días gratis. Después $199 MXN al mes.
            </p>
            <p className="text-gray-500 text-sm mb-10">
              Cancelas cuando quieras. Sin contratos.
            </p>
            <Link
              href="/registro"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-8 md:px-10 rounded-xl transition inline-block text-base md:text-lg"
            >
              Registrar mi negocio gratis
            </Link>
          </div>
        </Reveal>
      </section>

      <footer className="px-6 md:px-8 py-8 border-t border-gray-200 bg-white">
        <div className="max-w-3xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <span className="text-gray-500 text-sm">HuellaClub 2026</span>
          <div className="flex gap-4 md:gap-6">
            <Link href="/terminos" className="text-gray-500 hover:text-gray-700 text-sm transition">Términos</Link>
            <a href="mailto:sabino@maplo.com.mx" className="text-gray-500 hover:text-gray-700 text-sm transition">Contacto</a>
            <Link href="/login" className="text-gray-500 hover:text-gray-700 text-sm transition">Iniciar sesión</Link>
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