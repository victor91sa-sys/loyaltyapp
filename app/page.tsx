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

function useCounter(target: number, visible: boolean) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (!visible) return
    let start = 0
    const duration = 1500
    const increment = target / (duration / 16)
    const timer = setInterval(() => {
      start += increment
      if (start >= target) { setCount(target); clearInterval(timer) }
      else { setCount(Math.floor(start)) }
    }, 16)
    return () => clearInterval(timer)
  }, [visible, target])
  return count
}

function Mascota({ src, className, size = 70 }: { src: string, className: string, size?: number }) {
  return (
    <img
      src={src}
      alt=""
      aria-hidden="true"
      className={`pointer-events-none select-none absolute opacity-90 hidden md:block ${className}`}
      style={{ width: size, height: size }}
    />
  )
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-2 bg-[#EDEEFB] text-marca-azul text-xs font-bold px-4 py-2 rounded-full mb-5 uppercase tracking-wide">
      <span className="w-1.5 h-1.5 rounded-full bg-marca-azul" />
      {children}
    </div>
  )
}

function AnimatedStat({ num, suffix, desc, color }: { num: number, suffix: string, desc: string, color: string }) {
  const { ref, visible } = useScrollReveal()
  const count = useCounter(num, visible)
  const display = suffix === '$' ? '$' + count : count + suffix
  return (
    <div ref={ref} className="ficha ficha-hover p-7 text-center">
      <p className="text-5xl md:text-6xl font-bold mb-3" style={{ color, fontFamily: 'var(--font-fredoka)' }}>{display}</p>
      <p className="text-gray-600 text-sm">{desc}</p>
    </div>
  )
}

function MockupCartel() {
  const [color, setColor] = useState('#4247B9')
  const colores = ['#4247B9', '#F726E3', '#FEB000', '#2AEE2A', '#F73D19']
  return (
    <div className="flex flex-col items-center gap-6">
      <div className="rounded-3xl p-6 w-full max-w-xs shadow-2xl transition-all duration-500" style={{ backgroundColor: color }}>
        <div className="text-center mb-4">
          <div className="text-4xl mb-1">🌮</div>
          <h3 className="text-white font-bold text-lg">Taquería El Güero</h3>
          <p className="text-white text-xs mt-1" style={{ opacity: 0.85 }}>Escanea y acumula visitas</p>
        </div>
        <div className="bg-white rounded-2xl p-4 mb-4 flex items-center justify-center">
          <div className="grid grid-cols-7 gap-0.5">
            {[1,1,1,0,1,0,1, 1,0,1,0,0,0,1, 1,0,1,0,1,0,1, 1,1,1,0,0,1,0, 0,1,0,1,0,1,1, 1,0,0,0,1,0,1, 0,1,1,1,0,1,0].map((cell, i) => (
              <div key={i} className="w-4 h-4 rounded-sm" style={{ backgroundColor: cell ? color : 'white' }} />
            ))}
          </div>
        </div>
        <div className="rounded-2xl p-3" style={{ backgroundColor: 'rgba(0,0,0,0.22)' }}>
          <div className="flex justify-between text-white text-xs mb-2">
            <span>Tu progreso</span>
            <span className="font-bold">3 de 10 visitas</span>
          </div>
          <div className="w-full rounded-full h-2 mb-2" style={{ backgroundColor: 'rgba(255,255,255,0.3)' }}>
            <div className="h-2 rounded-full bg-white" style={{ width: '30%' }} />
          </div>
          <p className="text-white text-xs text-center" style={{ opacity: 0.9 }}>7 visitas más para tu taco gratis 🎁</p>
        </div>
      </div>
      <div>
        <p className="text-gray-500 text-xs text-center mb-3 font-semibold">Elige el color de tu negocio</p>
        <div className="flex gap-3 justify-center">
          {colores.map((c) => (
            <button key={c} onClick={() => setColor(c)} className="w-9 h-9 rounded-xl transition-all hover:scale-110 border-2" style={{ backgroundColor: c, borderColor: color === c ? '#1f2244' : 'transparent' }} />
          ))}
        </div>
      </div>
    </div>
  )
}

function FAQItem({ pregunta, respuesta }: { pregunta: string, respuesta: string }) {
  const [abierto, setAbierto] = useState(false)
  return (
    <div className="ficha overflow-hidden">
      <button onClick={() => setAbierto(!abierto)} className="w-full text-left px-6 py-4 flex justify-between items-center">
        <span className="text-gray-900 font-bold text-sm">{pregunta}</span>
        <span className="text-marca-azul text-xl ml-4">{abierto ? '−' : '+'}</span>
      </button>
      {abierto && (<div className="px-6 pb-4"><p className="text-gray-600 text-sm">{respuesta}</p></div>)}
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

  const negociosMarquee = [
    '☕ Cafeterías', '🌮 Taquerías', '✂️ Barberías', '🫓 Tortillerías',
    '🛒 Abarrotes', '💅 Salones', '🛍️ Tianguis', '🍽️ Restaurantes',
    '💊 Farmacias', '🚿 Lavanderías', '🍕 Pizzerías', '🥐 Panaderías',
    '🥩 Carnicerías', '✏️ Papelerías', '💐 Florerías', '🐾 Veterinarias',
    '💪 Gimnasios', '🍊 Fruterías', '🦐 Marisquerías', '🔧 Ferreterías'
  ]

  const negocios = [
    { nombre: 'Café Centenario', archivo: 'icono-cafeteria' },
    { nombre: 'Tacos El Compadre', archivo: 'icono-taqueria' },
    { nombre: 'Barbería Tres Reyes', archivo: 'icono-barberia' },
    { nombre: 'Tortillería Doña Carmen', archivo: 'icono-tortilleria' },
    { nombre: 'Abarrotes El Güero', archivo: 'icono-abarrotes' },
    { nombre: 'Mercado San Judas', archivo: 'icono-tianguis' },
    { nombre: 'El Rincón de Lupita', archivo: 'icono-restaurante' },
    { nombre: 'Salón Divina', archivo: 'icono-salon' },
    { nombre: 'Farmacia San Ángel', archivo: 'icono-farmacia' },
    { nombre: 'Lavandería Express 24', archivo: 'icono-lavanderia' },
    { nombre: 'Pizza Don Paco', archivo: 'icono-pizzeria' },
    { nombre: 'Panadería La Flor de Trigo', archivo: 'icono-panaderia' },
    { nombre: 'Carnicería Los Hermanos', archivo: 'icono-carniceria' },
    { nombre: 'Papelería El Estudiante', archivo: 'icono-papeleria' },
    { nombre: 'Flores y Más', archivo: 'icono-floreria' },
    { nombre: 'Clínica Veterinaria Patitas', archivo: 'icono-veterinaria' },
    { nombre: 'GymFit Cholula', archivo: 'icono-gym' },
    { nombre: 'Frutas y Verduras El Paraíso', archivo: 'icono-fruteria' },
    { nombre: 'Mariscos El Capitán', archivo: 'icono-marisqueria' },
    { nombre: 'Ferretería El Clavo', archivo: 'icono-ferreteria' },
  ]

  const pasoStamps = [1,1,1,0,0,0,0,0,0,0]

  return (
    <main className="min-h-screen bg-white flex flex-col overflow-x-hidden">

      <nav className="flex items-center justify-between px-6 md:px-8 py-4 sticky top-0 bg-white/95 backdrop-blur z-50 border-b border-gray-100">
        <Link href="/" className="flex items-center gap-2">
          <img src="/images/estrella.svg" alt="estrella HuellaClub" style={{ height: '38px', width: '38px' }} />
          <div>
            <span className="text-marca-azul font-bold text-xl" style={{ fontFamily: 'var(--font-fredoka)' }}>HuellaClub</span>
            <p className="text-gray-400 text-xs">Vuelven por ti.</p>
          </div>
        </Link>
        <div className="hidden md:flex items-center gap-7 text-sm font-semibold text-gray-500">
          <a href="#como-funciona" className="hover:text-marca-azul transition">Cómo funciona</a>
          <a href="#cartel" className="hover:text-marca-azul transition">Tu cartel</a>
          <a href="#precio" className="hover:text-marca-azul transition">Precio</a>
          <a href="#preguntas" className="hover:text-marca-azul transition">Preguntas</a>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="hidden md:inline-block border border-gray-200 text-gray-700 text-sm font-semibold px-4 py-2 rounded-xl hover:border-gray-300 transition">
            Ya tengo cuenta
          </Link>
          <Link href="/registro" className="bg-marca-azul hover:brightness-105 text-white text-sm font-bold px-4 py-2 rounded-xl transition">
            Empezar gratis
          </Link>
        </div>
      </nav>

      <section className="relative px-6 md:px-8 py-16 md:py-24 bg-white">
        <Mascota src="/images/clover.svg" className="top-10 left-4 rotate-[-12deg]" size={64} />
        <Mascota src="/images/flower.svg" className="bottom-8 left-10" size={52} />
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
          <div>
            <Eyebrow>30 días gratis · Niveles de premio · Reseñas en Google</Eyebrow>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-[1.05]">
              Cada cliente que regresa es prueba de que <span className="text-marca-azul">lo estás haciendo bien</span>
            </h1>
            <p className="text-gray-600 text-base md:text-lg mb-3 max-w-lg">
              HuellaClub convierte cada visita en una señal de que tu negocio está creciendo. Sin apps, sin aparatos, sin complicaciones.
            </p>
            <p className="text-gray-400 text-sm mb-8 max-w-md">
              Funciona para cafeterías, restaurantes, barberías, taquerías, tortillerías, abarrotes, tianguis y más.
            </p>
            <div className="flex flex-wrap gap-4 mb-4">
              <Link href="/registro" className="btn-3d btn-3d-azul">Empieza a construir tu base de clientes</Link>
              <a href="#como-funciona" className="btn-3d btn-3d-blanco">Ver cómo funciona</a>
            </div>
            <p className="text-gray-400 text-sm">🔒 Sin tarjeta. Sin letras pequeñas.</p>
          </div>

          <div className="flex justify-center lg:justify-end">
            <div className="ficha p-6 w-full max-w-sm">
              <div className="flex items-center gap-3 mb-5">
                <div className="text-3xl">🌮</div>
                <div>
                  <h3 className="text-gray-900 font-bold leading-tight">Taquería El Güero</h3>
                  <p className="text-gray-400 text-xs">Escanea y acumula visitas</p>
                </div>
              </div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-gray-400 text-xs font-bold uppercase tracking-wide">Tu progreso</span>
                <span className="text-marca-azul text-sm font-bold">3 de 10 visitas</span>
              </div>
              <div className="grid grid-cols-5 gap-2 mb-5">
                {pasoStamps.map((s, i) => (
                  <div key={i} className="aspect-square rounded-xl flex items-center justify-center text-lg font-bold"
                    style={s ? { backgroundColor: '#4247B9', color: 'white' } : { border: '2px dashed #DADBF3' }}>
                    {s ? '✓' : ''}
                  </div>
                ))}
              </div>
              <div className="w-full rounded-full h-2.5 mb-3 bg-[#EDEEFB]">
                <div className="h-2.5 rounded-full bg-marca-azul" style={{ width: '30%' }} />
              </div>
              <div className="bg-[#FFF6E0] rounded-xl px-3 py-2 flex items-center gap-2">
                <span className="text-lg">🎁</span>
                <p className="text-gray-700 text-xs font-semibold">7 visitas más para tu taco gratis</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="overflow-hidden bg-[#F5F6FE] py-5 border-y border-[#EDEEFB]">
        <div className="flex gap-2 animate-marquee whitespace-nowrap">
          {negociosMarquee.concat(negociosMarquee).map((n, i) => (
            <span key={i} className="inline-flex items-center bg-white border-2 border-[#EDEEFB] text-marca-azul font-bold text-sm px-4 py-2 rounded-full mx-1">{n}</span>
          ))}
        </div>
      </div>

      <section id="como-funciona" className="relative px-6 md:px-8 py-16 md:py-24 bg-white">
        <Mascota src="/images/sun.svg" className="top-12 right-6 rotate-[10deg]" size={58} />
        <div className="max-w-5xl mx-auto relative z-10">
          <Reveal>
            <div className="text-center mb-14">
              <Eyebrow>Tan fácil como un juego de 3 pasos</Eyebrow>
              <h2 className="text-gray-900 font-bold text-3xl md:text-4xl mb-3">Tan simple como abrir las puertas</h2>
              <p className="text-gray-500 text-sm">Si ya sabes recibir clientes, ya sabes usar HuellaClub.</p>
            </div>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            {[
              { emoji: '📝', num: '1', label: 'Paso 1', title: 'Registra tu negocio', desc: 'En 10 minutos tienes todo listo. Sin conocimientos técnicos.', color: '#4247B9' },
              { emoji: '📲', num: '2', label: 'Paso 2', title: 'Pon tu QR en caja', desc: 'Lo imprimes y lo pegas. Tus clientes hacen el resto.', color: '#FEB000' },
              { emoji: '🎯', num: '3', label: 'Paso 3', title: 'Ellos regresan. Y regresan de nuevo.', desc: 'Cada visita los acerca a su premio. Cuando llegan, hay otro esperándolos. El ciclo nunca para.', color: '#F726E3' }
            ].map((paso, i) => (
              <Reveal key={paso.num} delay={i * 150}>
                <div className="ficha ficha-hover relative p-7 h-full overflow-hidden">
                  <span className="absolute top-3 right-5 text-7xl font-bold opacity-10" style={{ color: paso.color, fontFamily: 'var(--font-fredoka)' }}>{paso.num}</span>
                  <div className="text-4xl mb-4">{paso.emoji}</div>
                  <p className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: paso.color }}>{paso.label}</p>
                  <h3 className="text-gray-900 font-bold mb-2">{paso.title}</h3>
                  <p className="text-gray-600 text-sm">{paso.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 md:px-8 py-16 md:py-24 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
            <Reveal>
              <div className="relative h-64 md:h-80 rounded-3xl overflow-hidden ficha">
                <Image src="/images/tacos.png" alt="Taquero con clientes" fill className="object-cover" />
              </div>
            </Reveal>
            <Reveal delay={200}>
              <div>
                <Eyebrow>Tu negocio · Tu comunidad</Eyebrow>
                <h2 className="text-gray-900 font-bold text-2xl md:text-3xl mb-4">No necesitas ser Starbucks para tener clientes leales</h2>
                <p className="text-gray-600 mb-6">Solo necesitas reconocer a los que ya te eligen. HuellaClub te ayuda a hacerlo en menos de 10 minutos.</p>
                <Link href="/registro" className="btn-3d btn-3d-azul">Empieza hoy gratis</Link>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section id="cartel" className="px-6 md:px-8 py-16 md:py-24 bg-[#FAFBFF]">
        <div className="max-w-5xl mx-auto">
          <Reveal>
            <div className="text-center mb-14">
              <Eyebrow>Tu QR, a tu manera</Eyebrow>
              <h2 className="text-gray-900 font-bold text-3xl md:text-4xl mb-3">Diseña tu cartel en minutos</h2>
              <p className="text-gray-500 text-sm">Personaliza tu cartel con los colores y nombre de tu negocio. Listo para imprimir.</p>
            </div>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
            <Reveal delay={100}><MockupCartel /></Reveal>
            <Reveal delay={250}>
              <div>
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
                <Link href="/registro" className="btn-3d btn-3d-azul">Crear mi cartel gratis</Link>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="px-6 md:px-8 py-16 md:py-24 bg-white">
        <div className="max-w-5xl mx-auto">
          <Reveal>
            <div className="text-center mb-12">
              <Eyebrow>Para cualquier negocio local</Eyebrow>
              <h2 className="text-gray-900 font-bold text-3xl md:text-4xl">Si tienes clientes que regresan, HuellaClub es para ti</h2>
            </div>
          </Reveal>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {negocios.map((negocio, i) => (
              <Reveal key={negocio.nombre} delay={i * 40}>
                <div className="ficha ficha-hover p-4 text-center">
                  <div className="relative w-16 h-16 mx-auto mb-3">
                    <Image src={`/images/${negocio.archivo}.png`} alt={negocio.nombre} fill className="object-contain rounded-xl" />
                  </div>
                  <p className="text-gray-700 text-xs font-semibold leading-tight">{negocio.nombre}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 md:px-8 py-16 md:py-24 bg-[#FAFBFF]">
        <div className="max-w-4xl mx-auto">
          <Reveal>
            <div className="text-center mb-12">
              <Eyebrow>Comparativa</Eyebrow>
              <h2 className="text-gray-900 font-bold text-3xl md:text-4xl mb-3">HuellaClub vs. la tarjeta de papel</h2>
              <p className="text-gray-500 text-sm">¿Todavía usas tarjetitas de papel? Mira la diferencia.</p>
            </div>
          </Reveal>
          <Reveal delay={100}>
            <div className="ficha overflow-hidden">
              <div className="grid grid-cols-3 bg-marca-azul text-white text-sm font-bold">
                <div className="p-4 text-center">Característica</div>
                <div className="p-4 text-center border-x border-white/20">Tarjeta de papel</div>
                <div className="p-4 text-center">HuellaClub</div>
              </div>
              {[
                ['Se pierde o se moja', '❌ Sí', '✅ Nunca'],
                ['El cliente necesita traerla', '❌ Siempre', '✅ Solo su celular'],
                ['Puedes ver tus métricas', '❌ No', '✅ En tiempo real'],
                ['Costo mensual', '💸 Impresión', '✅ $199 MXN'],
                ['El cliente puede hacer trampa', '❌ Fácil', '✅ Protección incluida'],
                ['Personalización', '❌ Limitada', '✅ Colores y logo'],
                ['Múltiples niveles de premio', '❌ Imposible', '✅ Hasta 3 niveles'],
                ['Reseñas en Google automáticas', '❌ No', '✅ Solo clientes felices'],
              ].map(([feature, paper, digital], i) => (
                <div key={i} className={`grid grid-cols-3 text-sm ${i % 2 === 0 ? 'bg-[#FAFBFF]' : 'bg-white'}`}>
                  <div className="p-4 text-gray-700 font-semibold">{feature}</div>
                  <div className="p-4 text-center text-gray-500 border-x border-gray-100">{paper}</div>
                  <div className="p-4 text-center text-gray-800 font-bold">{digital}</div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <section className="relative px-6 md:px-8 py-16 md:py-24 bg-white">
        <Mascota src="/images/sun.svg" className="top-16 right-8 rotate-[-8deg]" size={56} />
        <div className="max-w-3xl mx-auto relative z-10">
          <Reveal>
            <div className="text-center mb-14">
              <Eyebrow>Lo que dicen los números</Eyebrow>
              <h2 className="text-gray-900 font-bold text-3xl md:text-4xl">Los clientes leales valen más</h2>
            </div>
          </Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            <AnimatedStat num={5} suffix="x" color="#4247B9" desc="Un cliente que regresa vale 5 veces más que uno nuevo" />
            <AnimatedStat num={68} suffix="%" color="#F726E3" desc="De los clientes vuelven más seguido cuando sienten que los reconocen" />
            <AnimatedStat num={199} suffix="$" color="#2AB84A" desc="MXN al mes. Menos de lo que cuesta perder a tu cliente más fiel" />
          </div>
        </div>
      </section>

      <section className="px-6 md:px-8 py-16 md:py-24 bg-[#FAFBFF]">
        <div className="max-w-4xl mx-auto">
          <Reveal>
            <div className="text-center mb-14">
              <Eyebrow>Todo incluido</Eyebrow>
              <h2 className="text-gray-900 font-bold text-3xl md:text-4xl mb-3">Todo lo que necesitas para construir tu comunidad</h2>
              <p className="text-gray-500 text-sm">Sin complicaciones. Sin contratos. Sin sorpresas.</p>
            </div>
          </Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { emoji: '📱', titulo: 'QR personalizado', desc: 'Con los colores y nombre de tu negocio. Listo para imprimir.' },
              { emoji: '📊', titulo: 'Panel de control', desc: 'Ve cuántos clientes eligieron regresar contigo esta semana.' },
              { emoji: '🚀', titulo: 'Sin apps para tus clientes', desc: 'Solo escanean con la cámara del celular. Nada que descargar.' },
              { emoji: '🛡️', titulo: 'Protección anti-trampa', desc: 'Solo una visita por día por cliente. Sin posibilidad de hacer trampa.' },
              { emoji: '💬', titulo: 'Notificaciones por WhatsApp', desc: 'Tus clientes reciben su progreso directo en WhatsApp.' },
              { emoji: '🎨', titulo: 'Editor de cartel', desc: 'Diseña tu cartel en minutos sin necesidad de un diseñador.' },
              { emoji: '🌟', titulo: 'Las mejores reseñas llegan a Google', desc: 'Tus clientes felices te dejan reseñas. Los que tienen algo que decir, te lo dicen a ti primero.' },
              { emoji: '🎯', titulo: 'Hasta 3 razones para regresar', desc: 'Configura niveles de premio. Cada cliente siempre tiene algo por qué volver.' },
              { emoji: '👤', titulo: 'Tu cliente sabe cuánto lo reconoces', desc: 'Pueden ver su progreso cuando quieran desde huellaclub.app/mi-progreso' }
            ].map((item, i) => (
              <Reveal key={item.titulo} delay={i * 80}>
                <div className="ficha ficha-hover p-6 h-full">
                  <div className="text-3xl mb-3">{item.emoji}</div>
                  <h3 className="text-gray-900 font-bold mb-1 text-sm">{item.titulo}</h3>
                  <p className="text-gray-600 text-sm">{item.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 md:px-8 py-16 md:py-24 bg-white">
        <div className="max-w-4xl mx-auto">
          <Reveal>
            <div className="text-center mb-12">
              <Eyebrow>Negocios reales que ya construyen comunidad</Eyebrow>
              <h2 className="text-gray-900 font-bold text-3xl md:text-4xl">Lo que dicen quienes ya lo usan</h2>
            </div>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { nombre: 'Don Ernesto', negocio: 'Tortillería El Molino', foto: '/images/testimonio1.png', texto: 'Antes no sabía si mis clientes regresaban por costumbre o porque les gustaba. Ahora lo sé. Y eso me motiva a seguir.' },
              { nombre: 'Señora Lupita', negocio: 'Abarrotes La Esperanza', foto: '/images/testimonio2.png', texto: 'Ver que mis clientes regresan me dice que estoy haciendo algo bien. HuellaClub me lo confirma cada semana.' },
              { nombre: 'Chuy', negocio: 'Barbería El Estilo', foto: '/images/testimonio3.png', texto: 'Mis mejores clientes ahora saben que los reconozco. Eso no tiene precio.' }
            ].map((t, i) => (
              <Reveal key={t.nombre} delay={i * 150}>
                <div className="ficha p-6 flex flex-col gap-4 h-full">
                  <div className="text-marca-naranja text-sm">★★★★★</div>
                  <p className="text-gray-700 text-sm leading-relaxed flex-1">&quot;{t.texto}&quot;</p>
                  <div className="flex items-center gap-3">
                    <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-[#EDEEFB]">
                      <Image src={t.foto} alt={t.nombre} fill className="object-cover" />
                    </div>
                    <div>
                      <p className="text-gray-900 font-bold text-sm">{t.nombre}</p>
                      <p className="text-gray-500 text-xs">{t.negocio}</p>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section id="preguntas" className="px-6 md:px-8 py-16 md:py-24 bg-[#FAFBFF]">
        <div className="max-w-2xl mx-auto">
          <Reveal>
            <div className="text-center mb-12">
              <Eyebrow>Preguntas frecuentes</Eyebrow>
              <h2 className="text-gray-900 font-bold text-3xl md:text-4xl">Las dudas más comunes antes de empezar</h2>
            </div>
          </Reveal>
          <div className="flex flex-col gap-4">
            {[
              { pregunta: '¿Mis clientes necesitan descargar una app?', respuesta: 'No. Solo abren la cámara de su celular, escanean el QR y listo. Sin descargas, sin registros complicados.' },
              { pregunta: '¿Puedo dar más de un premio?', respuesta: 'Sí. Puedes configurar hasta 3 niveles de recompensa. A las 5 visitas un premio, a las 10 otro, a las 20 el mejor. Tus clientes siempre tienen una razón para seguir.' },
              { pregunta: '¿Cómo funciona la integración con Google Maps?', respuesta: 'Cuando un cliente completa su recompensa, le preguntamos cómo fue su experiencia. Si da 5 estrellas, lo llevamos directo a Google Maps. Si da menos, nos manda el comentario a ti directamente.' },
              { pregunta: '¿Puede un cliente ver su progreso sin ir al negocio?', respuesta: 'Sí. Desde cualquier celular pueden entrar a huellaclub.app/mi-progreso, poner su número y ver cuánto llevan acumulado en todos sus negocios favoritos.' },
              { pregunta: '¿Qué pasa si un cliente cambia de número?', respuesta: 'El programa está ligado al número de celular. Si cambia de número, empieza de cero. Pero en la práctica esto casi nunca pasa.' },
              { pregunta: '¿Cómo evito que un cliente haga trampa?', respuesta: 'HuellaClub solo permite una visita por celular cada 24 horas. No importa cuántas veces escaneen.' },
              { pregunta: '¿Necesito internet en mi negocio para que funcione?', respuesta: 'Tu cliente necesita internet en su celular para escanear. Tú puedes ver tu panel desde cualquier dispositivo con internet.' },
              { pregunta: '¿Puedo cancelar cuando quiera?', respuesta: 'Sí. Sin contratos ni penalizaciones. Cancelas desde tu panel y listo.' }
            ].map((faq, i) => (<FAQItem key={i} pregunta={faq.pregunta} respuesta={faq.respuesta} />))}
          </div>
        </div>
      </section>

      <section id="precio" className="px-6 md:px-8 py-16 md:py-24 bg-white">
        <div className="max-w-lg mx-auto">
          <Reveal>
            <div className="text-center mb-10">
              <Eyebrow>Un precio. Todo incluido.</Eyebrow>
              <h2 className="text-gray-900 font-bold text-3xl md:text-4xl mb-3">Invierte en tus clientes</h2>
              <p className="text-gray-500 text-sm">Ellos ya están invirtiendo en ti.</p>
            </div>
          </Reveal>
          <Reveal delay={200}>
            <div className="ficha p-8 md:p-10 text-center" style={{ borderColor: '#4247B9', borderWidth: '2px' }}>
              <div className="inline-block bg-marca-coral text-white text-xs font-bold px-3 py-1 rounded-full mb-6">⚡ PRECIO DE LANZAMIENTO</div>
              <div className="mb-2">
                <span className="text-6xl md:text-7xl font-bold text-marca-azul" style={{ fontFamily: 'var(--font-fredoka)' }}>$199</span>
                <span className="text-gray-500 text-lg"> MXN/mes</span>
              </div>
              <p className="text-sm font-bold mb-8" style={{ color: '#2AB84A' }}>✨ Primeros 30 días completamente gratis</p>
              <ul className="flex flex-col gap-3 mb-8 text-left">
                {['Clientes ilimitados','QR personalizado con tu marca','Panel de control en tiempo real','Hasta 3 niveles de recompensa','Reseñas filtradas en Google','Portal de progreso para clientes','Notificaciones por WhatsApp','Editor de cartel incluido','Soporte por email','Cancelas cuando quieras'].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-gray-700 text-sm">
                    <span className="font-bold" style={{ color: '#2AB84A' }}>✓</span>{item}
                  </li>
                ))}
              </ul>
              <Link href="/registro" className="btn-3d btn-3d-naranja w-full">Empezar gratis ahora</Link>
              <p className="text-gray-400 text-xs mt-4">Sin tarjeta de crédito para empezar</p>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="px-6 md:px-8 py-14 bg-white">
        <Reveal>
          <div className="max-w-3xl mx-auto ficha p-8 md:p-10 bg-[#FAFBFF] grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div>
              <Eyebrow>¿Tienes dudas?</Eyebrow>
              <h2 className="text-gray-900 font-bold text-2xl md:text-3xl">Cuéntanos de tu negocio y te ayudamos a arrancar</h2>
            </div>
            <div>
              <a href="mailto:sabino@maplo.com.mx" className="inline-block bg-white border-2 border-[#EDEEFB] text-marca-azul font-bold px-5 py-3 rounded-xl mb-3">📧 sabino@maplo.com.mx</a>
              <p className="text-gray-500 text-sm">También puedes escribirnos para agendar una demo gratuita.</p>
            </div>
          </div>
        </Reveal>
      </section>

      <section className="relative px-6 md:px-8 py-20 md:py-28 bg-marca-azul overflow-hidden">
        <Mascota src="/images/flower.svg" className="top-12 left-8" size={62} />
        <Mascota src="/images/sun.svg" className="bottom-10 right-10" size={58} />
        <Reveal>
          <div className="max-w-lg mx-auto text-center relative z-10">
            <h2 className="text-white font-bold text-3xl md:text-4xl mb-4" style={{ fontFamily: 'var(--font-fredoka)' }}>Vuelven por ti. Empieza hoy a saberlo.</h2>
            <p className="text-white/90 mb-1">30 días gratis para descubrirlo.</p>
            <p className="text-white/70 text-sm mb-8">Cancelas cuando quieras. Sin contratos.</p>
            <Link href="/registro" className="btn-3d btn-3d-naranja">Empieza hoy gratis</Link>
            <p className="text-white/70 text-xs mt-4">🔒 Sin tarjeta de crédito para empezar</p>
          </div>
        </Reveal>
      </section>

      <footer className="px-6 md:px-8 py-8 border-t border-gray-200 bg-white">
        <div className="max-w-3xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <img src="/images/estrella.svg" alt="estrella HuellaClub" style={{ height: '28px', width: '28px' }} />
            <div>
              <span className="text-gray-700 text-sm font-bold" style={{ fontFamily: 'var(--font-fredoka)' }}>HuellaClub</span>
              <p className="text-gray-400 text-xs">Vuelven por ti.</p>
            </div>
          </div>
          <div className="flex gap-4 md:gap-6">
            <Link href="/terminos" className="text-gray-500 hover:text-gray-700 text-sm transition">Términos</Link>
            <a href="mailto:sabino@maplo.com.mx" className="text-gray-500 hover:text-gray-700 text-sm transition">Contacto</a>
            <Link href="/login" className="text-gray-500 hover:text-gray-700 text-sm transition">Iniciar sesión</Link>
          </div>
        </div>
      </footer>

      <a href="https://wa.me/525537195028?text=Hola%2C%20me%20interesa%20saber%20m%C3%A1s%20sobre%20HuellaClub" target="_blank" rel="noopener noreferrer" className="fixed bottom-6 right-6 bg-green-500 hover:bg-green-600 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg transition z-50 text-2xl">💬</a>

    </main>
  )
}