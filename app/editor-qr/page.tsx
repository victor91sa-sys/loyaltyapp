'use client'

import { useState, useEffect, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Suspense } from 'react'
import QRCodeStyling from 'qr-code-styling'

const FUENTES = [
  { nombre: 'Moderna', valor: 'sans-serif' },
  { nombre: 'Elegante', valor: 'Georgia' },
  { nombre: 'Impacto', valor: 'Arial Black' },
  { nombre: 'Clásica', valor: 'serif' },
  { nombre: 'Retro', valor: 'Courier New' },
  { nombre: 'Técnica', valor: 'monospace' },
]

const COLORES_FONDO = [
  { nombre: 'Índigo', valor: '#4f46e5' },
  { nombre: 'Rojo', valor: '#dc2626' },
  { nombre: 'Verde', valor: '#16a34a' },
  { nombre: 'Naranja', valor: '#ea580c' },
  { nombre: 'Morado', valor: '#7c3aed' },
  { nombre: 'Azul', valor: '#0284c7' },
  { nombre: 'Rosa', valor: '#db2777' },
  { nombre: 'Negro', valor: '#111827' },
]

const TITULOS_SUGERIDOS = [
  'Acumula visitas y gana premios',
  'Cada visita te acerca a tu premio',
  'Regresa y gana recompensas',
  'Tu lealtad tiene recompensa',
]

function EditorQRContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const negocioId = searchParams.get('id')
  const negocioNombre = searchParams.get('nombre')

  const [colorFondo, setColorFondo] = useState('#4f46e5')
  const [colorTexto, setColorTexto] = useState('#ffffff')
  const [colorPuntos, setColorPuntos] = useState('#000000')
  const [logo, setLogo] = useState<string | null>(null)
  const [usarNombre, setUsarNombre] = useState(true)
  const [nombrePersonalizado, setNombrePersonalizado] = useState(negocioNombre || '')
  const [titulo, setTitulo] = useState('Acumula visitas y gana premios')
  const [tamanoTitulo, setTamanoTitulo] = useState(22)
  const [subtitulo, setSubtitulo] = useState('Escanea el código con la cámara de tu teléfono')
  const [contacto, setContacto] = useState('')
  const [fuente, setFuente] = useState('sans-serif')
  const [descargando, setDescargando] = useState(false)
  const qrRef = useRef<HTMLDivElement>(null)
  const qrCode = useRef<QRCodeStyling | null>(null)

  const urlCliente = 'https://huellaclub.app/visita?negocio=' + negocioId

  const listo = (usarNombre ? nombrePersonalizado.length > 0 : logo !== null) && titulo.length > 0

  useEffect(() => {
    qrCode.current = new QRCodeStyling({
      width: 200,
      height: 200,
      data: urlCliente,
      dotsOptions: { color: colorPuntos, type: 'rounded' },
      backgroundOptions: { color: '#ffffff' },
      image: logo || undefined,
      imageOptions: { crossOrigin: 'anonymous', margin: 8 }
    })

    if (qrRef.current) {
      qrRef.current.innerHTML = ''
      qrCode.current.append(qrRef.current)
    }
  }, [])

  useEffect(() => {
    qrCode.current?.update({
      dotsOptions: { color: colorPuntos, type: 'rounded' },
      image: logo || undefined,
    })
  }, [colorPuntos, logo])

  const handleLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      setLogo(reader.result as string)
      setUsarNombre(false)
    }
    reader.readAsDataURL(file)
  }

  const cargarImagen = (src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => resolve(img)
      img.onerror = reject
      img.src = src
    })
  }

  const generarQRCanvas = (): Promise<HTMLCanvasElement> => {
    return new Promise((resolve) => {
      const tempDiv = document.createElement('div')
      tempDiv.style.position = 'absolute'
      tempDiv.style.left = '-9999px'
      document.body.appendChild(tempDiv)

      const qrSize = 400
      const tempQR = new QRCodeStyling({
        width: qrSize,
        height: qrSize,
        data: urlCliente,
        dotsOptions: { color: colorPuntos, type: 'rounded' },
        backgroundOptions: { color: '#ffffff' },
      })
      tempQR.append(tempDiv)

      setTimeout(() => {
        const canvas = tempDiv.querySelector('canvas') as HTMLCanvasElement
        if (canvas) {
          document.body.removeChild(tempDiv)
          resolve(canvas)
        } else {
          const svg = tempDiv.querySelector('svg')
          if (svg) {
            const svgData = new XMLSerializer().serializeToString(svg)
            const blob = new Blob([svgData], { type: 'image/svg+xml' })
            const url = URL.createObjectURL(blob)
            const img = new Image()
            img.onload = () => {
              const c = document.createElement('canvas')
              c.width = qrSize
              c.height = qrSize
              const ctx2 = c.getContext('2d')
              if (ctx2) {
                ctx2.fillStyle = '#ffffff'
                ctx2.fillRect(0, 0, qrSize, qrSize)
                ctx2.drawImage(img, 0, 0, qrSize, qrSize)
              }
              URL.revokeObjectURL(url)
              document.body.removeChild(tempDiv)
              resolve(c)
            }
            img.src = url
          }
        }
      }, 800)
    })
  }

  const descargarCartel = async () => {
    setDescargando(true)
    try {
      const W = 800
      const pad = 24
      const qrSize = 360

      const canvas = document.createElement('canvas')
      canvas.width = W

      const ctxTemp = canvas.getContext('2d')
      if (!ctxTemp) return

      let yActual = 60
      let encabezadoH = 0

      if (!usarNombre && logo) {
        const logoImg = await cargarImagen(logo)
        const maxLogoH = 120
        const maxLogoW = 500
        const ratio = Math.min(maxLogoW / logoImg.width, maxLogoH / logoImg.height)
        encabezadoH = logoImg.height * ratio + 40
      } else {
        encabezadoH = 110
      }

      const tituloSize = Math.min(tamanoTitulo * 1.5, 44)
      ctxTemp.font = tituloSize + 'px ' + fuente
      const words = titulo.split(' ')
      let line = ''
      let lineas = 1
      for (const word of words) {
        const test = line + word + ' '
        if (ctxTemp.measureText(test).width > W - 80) {
          line = word + ' '
          lineas++
        } else {
          line = test
        }
      }
      const tituloH = lineas * (tituloSize + 10) + 50
      const qrBlockH = qrSize + pad * 2 + 50
      const subtituloH = 60
      const contactoH = contacto ? 60 : 0
      const H = yActual + encabezadoH + tituloH + qrBlockH + subtituloH + contactoH + 60

      canvas.height = H
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      ctx.fillStyle = colorFondo
      ctx.fillRect(0, 0, W, H)

      if (!usarNombre && logo) {
        const logoImg = await cargarImagen(logo)
        const maxLogoH = 120
        const maxLogoW = 500
        const ratio = Math.min(maxLogoW / logoImg.width, maxLogoH / logoImg.height)
        const lw = logoImg.width * ratio
        const lh = logoImg.height * ratio
        const logoX = (W - lw) / 2
        ctx.drawImage(logoImg, logoX, yActual, lw, lh)
        yActual += lh + 40
      } else {
        ctx.fillStyle = colorTexto
        ctx.font = 'bold 60px ' + fuente
        ctx.textAlign = 'center'
        ctx.fillText(nombrePersonalizado || negocioNombre || '', W / 2, yActual + 50)
        ctx.textAlign = 'left'
        yActual += 110
      }

      ctx.fillStyle = colorTexto
      ctx.font = tituloSize + 'px ' + fuente
      ctx.textAlign = 'center'
      let lineText = ''
      let lineY = yActual + tituloSize
      for (const word of words) {
        const test = lineText + word + ' '
        if (ctx.measureText(test).width > W - 80) {
          ctx.fillText(lineText.trim(), W / 2, lineY)
          lineText = word + ' '
          lineY += tituloSize + 10
        } else {
          lineText = test
        }
      }
      ctx.fillText(lineText.trim(), W / 2, lineY)
      yActual = lineY + 50

      const qrCanvas = await generarQRCanvas()
      const qrX = (W - qrSize) / 2
      const qrY = yActual

      ctx.fillStyle = '#ffffff'
      ctx.beginPath()
      ctx.roundRect(qrX - pad, qrY - pad, qrSize + pad * 2, qrSize + pad * 2, 20)
      ctx.fill()

      ctx.drawImage(qrCanvas, qrX, qrY, qrSize, qrSize)
      yActual = qrY + qrSize + pad + 50

      ctx.fillStyle = colorTexto
      ctx.globalAlpha = 0.85
      ctx.font = '24px ' + fuente
      ctx.textAlign = 'center'
      ctx.fillText(subtitulo, W / 2, yActual)
      ctx.globalAlpha = 1
      yActual += 50

      if (contacto) {
        ctx.fillStyle = colorTexto
        ctx.globalAlpha = 0.55
        ctx.font = '20px ' + fuente
        ctx.fillText(contacto, W / 2, yActual + 20)
        ctx.globalAlpha = 1
      }

      const link = document.createElement('a')
      link.download = 'Cartel-' + (nombrePersonalizado || negocioNombre) + '.png'
      link.href = canvas.toDataURL('image/png')
      link.click()
    } finally {
      setDescargando(false)
    }
  }

  return (
    <main className="min-h-screen bg-gray-50">

      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-gray-900 font-bold text-lg">Editor de cartel</h1>
            <p className="text-gray-500 text-xs">{negocioNombre}</p>
          </div>
          <div className="flex items-center gap-3">
            {listo && (
              <span className="bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full">
                ✅ Listo para imprimir
              </span>
            )}
            <button
              onClick={() => router.back()}
              className="border border-gray-200 hover:border-gray-400 text-gray-600 font-semibold py-2 px-4 rounded-xl transition text-sm"
            >
              Volver al panel
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          <div className="flex flex-col gap-5">

            <div className="bg-white rounded-2xl p-5 border border-indigo-100 shadow-[0_2px_8px_rgba(99,102,241,0.06)]">
              <label className="text-gray-900 font-semibold block mb-1">1. Encabezado</label>
              <p className="text-gray-400 text-xs mb-4">Lo primero que ven tus clientes. Usa tu logo si tienes uno, o el nombre de tu negocio.</p>
              <div className="flex gap-3 mb-4">
                <button
                  onClick={() => setUsarNombre(true)}
                  className={`flex-1 py-2 px-3 rounded-xl text-sm font-semibold transition ${usarNombre ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-500'}`}
                >
                  Nombre del negocio
                </button>
                <button
                  onClick={() => setUsarNombre(false)}
                  className={`flex-1 py-2 px-3 rounded-xl text-sm font-semibold transition ${!usarNombre ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-500'}`}
                >
                  Subir logo
                </button>
              </div>
              {usarNombre ? (
                <input
                  type="text"
                  value={nombrePersonalizado}
                  onChange={(e) => setNombrePersonalizado(e.target.value)}
                  placeholder="Ej. Taquería El Güero"
                  className="w-full bg-white border border-gray-200 text-gray-900 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 text-sm shadow-sm"
                />
              ) : (
                <div>
                  <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-indigo-200 rounded-xl cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 transition">
                    <span className="text-2xl mb-1">🖼️</span>
                    <span className="text-indigo-600 text-sm font-semibold">Haz click para subir tu logo</span>
                    <span className="text-gray-400 text-xs">PNG, JPG o SVG</span>
                    <input type="file" accept="image/*" onChange={handleLogo} className="hidden" />
                  </label>
                  {logo && (
                    <div className="mt-3 flex items-center gap-3">
                      <img src={logo} alt="logo" className="h-10 object-contain rounded-lg border border-gray-200" />
                      <button onClick={() => { setLogo(null); setUsarNombre(true) }} className="text-red-500 text-xs hover:text-red-700">
                        Quitar logo
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl p-5 border border-indigo-100 shadow-[0_2px_8px_rgba(99,102,241,0.06)]">
              <label className="text-gray-900 font-semibold block mb-1">2. Título del cartel</label>
              <p className="text-gray-400 text-xs mb-3">El mensaje que motiva a tu cliente a participar.</p>
              <input
                type="text"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                className="w-full bg-white border border-gray-200 text-gray-900 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 text-sm shadow-sm mb-3"
              />
              <p className="text-gray-400 text-xs mb-2">Sugerencias rápidas:</p>
              <div className="flex flex-wrap gap-2 mb-3">
                {TITULOS_SUGERIDOS.map((s) => (
                  <button
                    key={s}
                    onClick={() => setTitulo(s)}
                    className="bg-indigo-50 hover:bg-indigo-100 text-indigo-600 text-xs px-3 py-1 rounded-full transition"
                  >
                    {s}
                  </button>
                ))}
              </div>
              <label className="text-gray-500 text-xs block mb-1">Tamaño del texto: {tamanoTitulo}px</label>
              <input
                type="range"
                min="14"
                max="36"
                value={tamanoTitulo}
                onChange={(e) => setTamanoTitulo(Number(e.target.value))}
                className="w-full accent-indigo-600"
              />
            </div>

            <div className="bg-white rounded-2xl p-5 border border-indigo-100 shadow-[0_2px_8px_rgba(99,102,241,0.06)]">
              <label className="text-gray-900 font-semibold block mb-1">3. Color de fondo</label>
              <p className="text-gray-400 text-xs mb-3">El color principal de tu cartel.</p>
              <div className="flex flex-wrap gap-2 mb-3">
                {COLORES_FONDO.map((c) => (
                  <button
                    key={c.valor}
                    onClick={() => setColorFondo(c.valor)}
                    title={c.nombre}
                    className="w-9 h-9 rounded-xl transition hover:scale-110 border-2"
                    style={{
                      backgroundColor: c.valor,
                      borderColor: colorFondo === c.valor ? '#111' : 'transparent'
                    }}
                  />
                ))}
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={colorFondo}
                  onChange={(e) => setColorFondo(e.target.value)}
                  className="w-10 h-10 rounded-lg cursor-pointer border border-gray-200"
                />
                <span className="text-gray-500 text-sm">Color personalizado: {colorFondo}</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-indigo-100 shadow-[0_2px_8px_rgba(99,102,241,0.06)]">
              <label className="text-gray-900 font-semibold block mb-1">4. Color del texto</label>
              <p className="text-gray-400 text-xs mb-3">Asegúrate de que el texto se vea bien sobre tu color de fondo.</p>
              <div className="flex gap-3 mb-3">
                <button
                  onClick={() => setColorTexto('#ffffff')}
                  className={`flex-1 py-2 px-3 rounded-xl text-sm font-semibold transition border-2 ${colorTexto === '#ffffff' ? 'border-indigo-600 bg-indigo-50 text-indigo-600' : 'border-gray-200 text-gray-500'}`}
                >
                  Blanco
                </button>
                <button
                  onClick={() => setColorTexto('#111827')}
                  className={`flex-1 py-2 px-3 rounded-xl text-sm font-semibold transition border-2 ${colorTexto === '#111827' ? 'border-indigo-600 bg-indigo-50 text-indigo-600' : 'border-gray-200 text-gray-500'}`}
                >
                  Negro
                </button>
                <button
                  onClick={() => setColorTexto('#fef08a')}
                  className={`flex-1 py-2 px-3 rounded-xl text-sm font-semibold transition border-2 ${colorTexto === '#fef08a' ? 'border-indigo-600 bg-indigo-50 text-indigo-600' : 'border-gray-200 text-gray-500'}`}
                >
                  Amarillo
                </button>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={colorTexto}
                  onChange={(e) => setColorTexto(e.target.value)}
                  className="w-10 h-10 rounded-lg cursor-pointer border border-gray-200"
                />
                <span className="text-gray-500 text-sm">Color personalizado: {colorTexto}</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-indigo-100 shadow-[0_2px_8px_rgba(99,102,241,0.06)]">
              <label className="text-gray-900 font-semibold block mb-1">5. Color del QR</label>
              <p className="text-gray-400 text-xs mb-3">El color de los puntos del código QR. El fondo del QR siempre es blanco para que funcione.</p>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={colorPuntos}
                  onChange={(e) => setColorPuntos(e.target.value)}
                  className="w-10 h-10 rounded-lg cursor-pointer border border-gray-200"
                />
                <span className="text-gray-500 text-sm">{colorPuntos}</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-indigo-100 shadow-[0_2px_8px_rgba(99,102,241,0.06)]">
              <label className="text-gray-900 font-semibold block mb-1">6. Tipografía</label>
              <p className="text-gray-400 text-xs mb-3">El estilo de letra de todo el cartel.</p>
              <div className="grid grid-cols-2 gap-2">
                {FUENTES.map((f) => (
                  <button
                    key={f.valor}
                    onClick={() => setFuente(f.valor)}
                    className={`py-3 px-4 rounded-xl text-sm text-center transition border-2 ${fuente === f.valor ? 'border-indigo-600 bg-indigo-50 text-indigo-600 font-semibold' : 'border-gray-200 text-gray-600'}`}
                    style={{ fontFamily: f.valor }}
                  >
                    {f.nombre}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-indigo-100 shadow-[0_2px_8px_rgba(99,102,241,0.06)]">
              <label className="text-gray-900 font-semibold block mb-1">7. Instrucción para el cliente</label>
              <p className="text-gray-400 text-xs mb-3">Aparece debajo del QR. Explica cómo escanear.</p>
              <input
                type="text"
                value={subtitulo}
                onChange={(e) => setSubtitulo(e.target.value)}
                className="w-full bg-white border border-gray-200 text-gray-900 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 text-sm shadow-sm"
              />
            </div>

            <div className="bg-white rounded-2xl p-5 border border-indigo-100 shadow-[0_2px_8px_rgba(99,102,241,0.06)]">
              <label className="text-gray-900 font-semibold block mb-1">8. Contacto o redes sociales</label>
              <p className="text-gray-400 text-xs mb-3">Opcional. Aparece al pie del cartel.</p>
              <input
                type="text"
                value={contacto}
                onChange={(e) => setContacto(e.target.value)}
                placeholder="Ej. @minegocio o minegocio.com"
                className="w-full bg-white border border-gray-200 text-gray-900 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 text-sm shadow-sm"
              />
            </div>

            <button
              onClick={descargarCartel}
              disabled={descargando || !listo}
              className={`font-bold py-4 px-6 rounded-xl transition text-lg ${listo ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-[0_4px_20px_rgba(99,102,241,0.3)]' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
            >
              {descargando ? '⏳ Generando cartel...' : listo ? '⬇️ Descargar cartel en PNG' : 'Completa el encabezado para descargar'}
            </button>

            <button
              onClick={() => router.back()}
              className="border border-gray-200 hover:border-gray-400 text-gray-500 font-semibold py-3 px-6 rounded-xl transition text-center text-sm"
            >
              Volver al panel sin guardar
            </button>

          </div>

          <div className="lg:sticky lg:top-24 flex flex-col items-center gap-4">
            <div className="flex items-center justify-between w-full">
              <p className="text-gray-500 text-sm font-medium">Vista previa del cartel</p>
              {listo && (
                <span className="bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full">
                  ✅ Listo para imprimir
                </span>
              )}
            </div>

            <div
              className="rounded-2xl p-8 flex flex-col items-center gap-5 w-full shadow-2xl transition-all duration-300"
              style={{ backgroundColor: colorFondo, fontFamily: fuente }}
            >
              {usarNombre ? (
                <p className="font-bold text-3xl text-center" style={{ color: colorTexto }}>
                  {nombrePersonalizado || negocioNombre || 'Nombre de tu negocio'}
                </p>
              ) : logo ? (
                <img src={logo} alt="logo" className="h-20 object-contain" />
              ) : (
                <div className="border-2 border-dashed border-white/40 rounded-xl px-6 py-4">
                  <p className="text-white/60 text-sm text-center">Sube tu logo aquí</p>
                </div>
              )}

              <p className="text-center font-medium" style={{ fontSize: tamanoTitulo + 'px', color: colorTexto }}>
                {titulo}
              </p>

              <div className="bg-white p-4 rounded-2xl shadow-lg">
                <div ref={qrRef} />
              </div>

              <p className="text-center text-sm" style={{ color: colorTexto, opacity: 0.85 }}>
                {subtitulo}
              </p>

              {contacto && (
                <p className="text-center text-xs" style={{ color: colorTexto, opacity: 0.55 }}>
                  {contacto}
                </p>
              )}
            </div>

            <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 w-full">
              <p className="text-indigo-700 text-xs font-semibold mb-2">💡 Consejos para un buen cartel</p>
              <ul className="flex flex-col gap-1">
                <li className="text-indigo-600 text-xs">• Usa colores de tu negocio para que lo reconozcan</li>
                <li className="text-indigo-600 text-xs">• Imprime en tamaño carta o media carta</li>
                <li className="text-indigo-600 text-xs">• Ponlo donde el cliente espera o paga</li>
                <li className="text-indigo-600 text-xs">• Plastifícalo para que dure más</li>
              </ul>
            </div>
          </div>

        </div>
      </div>
    </main>
  )
}

export default function EditorQR() {
  return (
    <Suspense></Suspense>
  )
}