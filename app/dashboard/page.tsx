'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { QRCodeSVG } from 'qrcode.react'
import { Suspense, useEffect, useState, useRef } from 'react'
import { supabase } from '../../lib/supabase'

function DashboardContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const negocioId = searchParams.get('id')
  const negocioNombre = searchParams.get('nombre')
  const qrRef = useRef<HTMLDivElement>(null)

  const [clientes, setClientes] = useState<any[]>([])
  const [negocio, setNegocio] = useState<any>(null)
  const [cargando, setCargando] = useState(true)
  const [pagando, setPagando] = useState(false)
  const [editando, setEditando] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [visitasPorDia, setVisitasPorDia] = useState<{ dia: string, visitas: number }[]>([])
  const [configForm, setConfigForm] = useState({
    nombre: '',
    visitas: '',
    recompensas: ''
  })

  useEffect(() => {
    const cargarDatos = async () => {
      const { data: negocioData } = await supabase
        .from('negocios')
        .select('*')
        .eq('id', negocioId)
        .single()

      setNegocio(negocioData)
      setConfigForm({
        nombre: negocioData?.nombre || '',
        visitas: negocioData?.visitas?.toString() || '',
        recompensas: negocioData?.recompensas || ''
      })

      const { data: clientesData } = await supabase
        .from('clientes')
        .select('*')
        .eq('negocio_id', negocioId)
        .order('visitas', { ascending: false })

      if (clientesData) {
        setClientes(clientesData)

        const ultimos7 = Array.from({ length: 7 }, (_, i) => {
          const d = new Date()
          d.setDate(d.getDate() - (6 - i))
          return {
            dia: d.toLocaleDateString('es-MX', { weekday: 'short' }),
            fecha: d.toISOString().split('T')[0],
            visitas: 0
          }
        })

        clientesData.forEach(c => {
          if (c.ultima_visita) {
            const fecha = c.ultima_visita.split('T')[0]
            const entry = ultimos7.find(d => d.fecha === fecha)
            if (entry) entry.visitas++
          }
        })

        setVisitasPorDia(ultimos7.map(d => ({ dia: d.dia, visitas: d.visitas })))
      }

      setCargando(false)
    }

    if (negocioId) cargarDatos()
  }, [negocioId])

  const urlCliente = 'https://huellaclub.app/visita?negocio=' + negocioId

  const diasRestantes = negocio ? (() => {
    const creado = new Date(negocio.created_at)
    const hoy = new Date()
    const dias = Math.floor((hoy.getTime() - creado.getTime()) / (1000 * 60 * 60 * 24))
    return Math.max(0, 30 - dias)
  })() : 0

  const trialActivo = diasRestantes > 0
  const accesoActivo = negocio?.suscripcion_activa || trialActivo

  const totalClientes = clientes.length
  const unaSemanaAtras = new Date()
  unaSemanaAtras.setDate(unaSemanaAtras.getDate() - 7)
  const visitasSemana = clientes.filter(c =>
    c.ultima_visita && new Date(c.ultima_visita) > unaSemanaAtras
  ).length
  const canjes = clientes.filter(c => c.visitas >= (negocio?.visitas || 0)).length
  const maxVisitas = Math.max(...visitasPorDia.map(d => d.visitas), 1)
  const clientesTop = [...clientes].slice(0, 5)
  const actividadReciente = [...clientes]
    .filter(c => c.ultima_visita)
    .sort((a, b) => new Date(b.ultima_visita).getTime() - new Date(a.ultima_visita).getTime())
    .slice(0, 5)

  const irAlEditor = () => {
    router.push('/editor-qr?id=' + negocioId + '&nombre=' + encodeURIComponent(negocio?.nombre || negocioNombre || ''))
  }

  const cerrarSesion = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const descargarQR = () => {
    const svg = qrRef.current?.querySelector('svg')
    if (!svg) return
    const svgData = new XMLSerializer().serializeToString(svg)
    const canvas = document.createElement('canvas')
    const size = 600
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.fillStyle = 'white'
    ctx.fillRect(0, 0, size, size)
    const img = new Image()
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(svgBlob)
    img.onload = () => {
      ctx.drawImage(img, 0, 0, size, size)
      URL.revokeObjectURL(url)
      const link = document.createElement('a')
      link.download = 'QR-' + negocioNombre + '.png'
      link.href = canvas.toDataURL('image/png')
      link.click()
    }
    img.src = url
  }

  const handlePago = async () => {
    setPagando(true)
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ negocioId, negocioNombre, correo: negocio?.correo })
      })
      const data = await response.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        alert('Error al procesar el pago: ' + data.error)
      }
    } catch (error) {
      alert('Error al conectar con el servidor de pagos')
    } finally {
      setPagando(false)
    }
  }

  const guardarConfiguracion = async () => {
    setGuardando(true)
    const { error } = await supabase
      .from('negocios')
      .update({
        nombre: configForm.nombre,
        visitas: parseInt(configForm.visitas),
        recompensas: configForm.recompensas
      })
      .eq('id', negocioId)

    if (error) {
      alert('Error al guardar: ' + error.message)
    } else {
      setNegocio({ ...negocio, ...configForm, visitas: parseInt(configForm.visitas) })
      setEditando(false)
    }
    setGuardando(false)
  }

  if (cargando) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 text-sm">Cargando tu panel...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50">

      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-gray-900 font-bold text-lg">{negocio?.nombre || negocioNombre}</h1>
            <p className="text-gray-500 text-xs">Panel de control</p>
          </div>
          <button onClick={cerrarSesion} className="text-gray-400 hover:text-gray-600 text-sm transition">
            Cerrar sesión
          </button>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-8">

        {negocio?.suscripcion_activa && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-6 flex items-center gap-3 shadow-[0_2px_8px_rgba(34,197,94,0.08)]">
            <span className="text-green-500 text-xl">✅</span>
            <p className="text-green-700 text-sm font-semibold">HuellaClub Pro activo</p>
          </div>
        )}

        {!negocio?.suscripcion_activa && trialActivo && (
          <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-5 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-[0_2px_8px_rgba(99,102,241,0.08)]">
            <div>
              <p className="text-indigo-900 font-semibold">Período de prueba</p>
              <p className="text-indigo-600 text-sm">Te quedan {diasRestantes} días gratis</p>
            </div>
            <button
              onClick={handlePago}
              disabled={pagando}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-5 rounded-xl transition disabled:opacity-50 text-sm whitespace-nowrap"
            >
              {pagando ? 'Cargando...' : 'Suscribirme $199/mes'}
            </button>
          </div>
        )}

        {!negocio?.suscripcion_activa && !trialActivo && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-5 mb-6 shadow-[0_2px_8px_rgba(239,68,68,0.08)]">
            <p className="text-red-800 font-semibold mb-1">Tu período de prueba terminó</p>
            <p className="text-red-600 text-sm mb-4">Suscríbete para reactivar tu programa de lealtad.</p>
            <button
              onClick={handlePago}
              disabled={pagando}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-5 rounded-xl transition disabled:opacity-50 text-sm"
            >
              {pagando ? 'Cargando...' : 'Reactivar por $199/mes'}
            </button>
          </div>
        )}

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-2xl p-5 text-center border border-indigo-100 shadow-[0_4px_20px_rgba(99,102,241,0.08)]">
            <p className="text-4xl md:text-5xl font-bold text-gray-900 mb-1">{totalClientes}</p>
            <p className="text-gray-500 text-xs md:text-sm">Clientes totales</p>
            <p className="text-indigo-500 text-xs mt-1">👥 registrados</p>
          </div>
          <div className="bg-white rounded-2xl p-5 text-center border border-indigo-100 shadow-[0_4px_20px_rgba(99,102,241,0.08)]">
            <p className="text-4xl md:text-5xl font-bold text-indigo-600 mb-1">{visitasSemana}</p>
            <p className="text-gray-500 text-xs md:text-sm">Visitas esta semana</p>
            <p className="text-indigo-500 text-xs mt-1">📅 7 días</p>
          </div>
          <div className="bg-white rounded-2xl p-5 text-center border border-indigo-100 shadow-[0_4px_20px_rgba(99,102,241,0.08)]">
            <p className="text-4xl md:text-5xl font-bold text-green-600 mb-1">{canjes}</p>
            <p className="text-gray-500 text-xs md:text-sm">Canjes completados</p>
            <p className="text-green-500 text-xs mt-1">🎁 recompensas</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 mb-6 border border-indigo-100 shadow-[0_4px_20px_rgba(99,102,241,0.08)]">
          <h2 className="text-gray-900 font-semibold mb-6">Visitas últimos 7 días</h2>
          <div className="flex items-end gap-2 h-32">
            {visitasPorDia.map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <span className="text-gray-500 text-xs">{d.visitas > 0 ? d.visitas : ''}</span>
                <div
                  className="w-full rounded-t-lg transition-all duration-500"
                  style={{
                    height: Math.max((d.visitas / maxVisitas) * 100, d.visitas > 0 ? 8 : 4) + 'px',
                    backgroundColor: d.visitas > 0 ? '#6366f1' : '#e0e7ff',
                  }}
                />
                <span className="text-gray-400 text-xs">{d.dia}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 mb-6 border border-indigo-100 shadow-[0_4px_20px_rgba(99,102,241,0.08)]">
          <h2 className="text-gray-900 font-semibold mb-4">Tu código QR</h2>
          {accesoActivo ? (
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <div ref={qrRef} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <QRCodeSVG value={urlCliente} size={120} />
              </div>
              <div className="flex flex-col gap-3 flex-1">
                <p className="text-gray-600 text-sm">
                  Imprime este QR y colócalo en tu caja. Tus clientes lo escanean para registrar su visita.
                </p>
                <button
                  onClick={descargarQR}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2 px-4 rounded-xl transition text-sm"
                >
                  Descargar QR en PNG
                </button>
                <button
                  onClick={irAlEditor}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-xl transition text-sm"
                >
                  Personalizar QR
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 text-sm mb-4">Tu QR está desactivado. Suscríbete para reactivarlo.</p>
              <button
                onClick={handlePago}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-5 rounded-xl transition text-sm"
              >
                Reactivar
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-2xl p-6 border border-indigo-100 shadow-[0_4px_20px_rgba(99,102,241,0.08)]">
            <h2 className="text-gray-900 font-semibold mb-4">🏆 Clientes más frecuentes</h2>
            {clientesTop.length === 0 ? (
              <p className="text-gray-400 text-sm">Aún no tienes clientes.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {clientesTop.map((cliente, i) => (
                  <div key={cliente.id} className="flex items-center gap-3">
                    <span className="text-lg">
                      {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '⭐'}
                    </span>
                    <div className="flex-1">
                      <p className="text-gray-900 text-sm">{cliente.celular}</p>
                      <div className="w-full bg-indigo-100 rounded-full h-1.5 mt-1">
                        <div
                          className="bg-indigo-500 h-1.5 rounded-full"
                          style={{ width: Math.min((cliente.visitas / negocio.visitas) * 100, 100) + '%' }}
                        />
                      </div>
                    </div>
                    <span className="text-indigo-600 text-sm font-bold">{cliente.visitas}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl p-6 border border-indigo-100 shadow-[0_4px_20px_rgba(99,102,241,0.08)]">
            <h2 className="text-gray-900 font-semibold mb-4">🕐 Actividad reciente</h2>
            {actividadReciente.length === 0 ? (
              <p className="text-gray-400 text-sm">Sin actividad reciente.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {actividadReciente.map((cliente) => {
                  const fecha = new Date(cliente.ultima_visita)
                  const hoy = new Date()
                  const ayer = new Date()
                  ayer.setDate(ayer.getDate() - 1)
                  let cuandoFue = fecha.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })
                  if (fecha.toDateString() === hoy.toDateString()) cuandoFue = 'Hoy'
                  else if (fecha.toDateString() === ayer.toDateString()) cuandoFue = 'Ayer'

                  return (
                    <div key={cliente.id} className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-900 text-sm">{cliente.celular}</p>
                        <p className="text-gray-400 text-xs">{cuandoFue}</p>
                      </div>
                      <span className="text-gray-500 text-xs bg-gray-100 px-2 py-1 rounded-lg">{cliente.visitas} visitas</span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 mb-6 border border-indigo-100 shadow-[0_4px_20px_rgba(99,102,241,0.08)]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-gray-900 font-semibold">Configuración de tu programa</h2>
            {!editando && (
              <button
                onClick={() => setEditando(true)}
                className="text-indigo-600 hover:text-indigo-700 text-sm font-medium transition"
              >
                Editar
              </button>
            )}
          </div>

          {!editando ? (
            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="text-gray-500 text-sm">Nombre del negocio</span>
                <span className="text-gray-900 text-sm font-semibold">{negocio?.nombre}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="text-gray-500 text-sm">Visitas para la recompensa</span>
                <span className="text-gray-900 text-sm font-semibold">{negocio?.visitas} visitas</span>
              </div>
              <div className="flex justify-between items-center py-3">
                <span className="text-gray-500 text-sm">Recompensa</span>
                <span className="text-gray-900 text-sm font-semibold">{negocio?.recompensas}</span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-gray-700 text-sm font-medium block mb-1">Nombre del negocio</label>
                <input
                  type="text"
                  value={configForm.nombre}
                  onChange={(e) => setConfigForm({ ...configForm, nombre: e.target.value })}
                  className="w-full bg-white border border-gray-200 text-gray-900 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 text-sm shadow-sm"
                />
              </div>
              <div>
                <label className="text-gray-700 text-sm font-medium block mb-1">¿Cuántas visitas para la recompensa?</label>
                <input
                  type="number"
                  value={configForm.visitas}
                  onChange={(e) => setConfigForm({ ...configForm, visitas: e.target.value })}
                  min="2"
                  max="50"
                  className="w-full bg-white border border-gray-200 text-gray-900 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 text-sm shadow-sm"
                />
              </div>
              <div>
                <label className="text-gray-700 text-sm font-medium block mb-1">¿Cuál es la recompensa?</label>
                <input
                  type="text"
                  value={configForm.recompensas}
                  onChange={(e) => setConfigForm({ ...configForm, recompensas: e.target.value })}
                  placeholder="Ej. Un café gratis"
                  className="w-full bg-white border border-gray-200 text-gray-900 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 text-sm shadow-sm"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={guardarConfiguracion}
                  disabled={guardando}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition disabled:opacity-50 text-sm"
                >
                  {guardando ? 'Guardando...' : 'Guardar cambios'}
                </button>
                <button
                  onClick={() => setEditando(false)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 rounded-xl transition text-sm"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl p-6 border border-indigo-100 shadow-[0_4px_20px_rgba(99,102,241,0.08)]">
          <h2 className="text-gray-900 font-semibold mb-4">Todos tus clientes</h2>
          {clientes.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-4xl mb-3">👥</p>
              <p className="text-gray-500 text-sm">Aún no tienes clientes registrados.</p>
              <p className="text-gray-400 text-xs mt-1">Coloca tu QR en tu negocio y empezarán a llegar.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {clientes.map((cliente) => {
                const progreso = Math.min((cliente.visitas / negocio.visitas) * 100, 100)
                const completo = cliente.visitas >= negocio.visitas
                return (
                  <div key={cliente.id} className="bg-gray-50 border border-gray-100 rounded-xl p-4">
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-900 text-sm font-medium">{cliente.celular}</span>
                      <span className={`text-xs font-semibold ${completo ? 'text-green-600' : 'text-gray-500'}`}>
                        {completo ? '🎁 Canje completado' : cliente.visitas + ' de ' + negocio.visitas + ' visitas'}
                      </span>
                    </div>
                    <div className="w-full bg-indigo-100 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${completo ? 'bg-green-500' : 'bg-indigo-500'}`}
                        style={{ width: progreso + '%' }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className="mt-10 pt-6 border-t border-gray-200 flex justify-between items-center">
          <a href="/terminos" className="text-gray-400 hover:text-gray-600 text-xs transition">
            Términos y condiciones
          </a>
          <a href="/cancelar" className="text-gray-400 hover:text-gray-600 text-xs transition">
            Cancelar suscripción
          </a>
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