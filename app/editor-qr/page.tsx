'use client'

import { useState, useEffect, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Suspense } from 'react'
import QRCodeStyling from 'qr-code-styling'

const FUENTES = [
  { nombre: 'Sans-serif (moderna)', valor: 'sans-serif' },
  { nombre: 'Serif (elegante)', valor: 'serif' },
  { nombre: 'Monospace (tecnica)', valor: 'monospace' },
  { nombre: 'Georgia (clasica)', valor: 'Georgia' },
  { nombre: 'Arial Black (impacto)', valor: 'Arial Black' },
  { nombre: 'Courier New (retro)', valor: 'Courier New' },
]

function EditorQRContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const negocioId = searchParams.get('id')
  const negocioNombre = searchParams.get('nombre')

  const [colorFondo, setColorFondo] = useState('#4f46e5')
  const [colorPuntos, setColorPuntos] = useState('#000000')
  const [logo, setLogo] = useState<string | null>(null)
  const [usarNombre, setUsarNombre] = useState(false)
  const [nombrePersonalizado, setNombrePersonalizado] = useState(negocioNombre || '')
  const [titulo, setTitulo] = useState('Acumula visitas y gana premios')
  const [tamanoTitulo, setTamanoTitulo] = useState(22)
  const [subtitulo, setSubtitulo] = useState('Escanea el codigo con la camara de tu telefono')
  const [contacto, setContacto] = useState('')
  const [fuente, setFuente] = useState('sans-serif')
  const [descargando, setDescargando] = useState(false)
  const qrRef = useRef<HTMLDivElement>(null)
  const qrCode = useRef<QRCodeStyling | null>(null)

  const urlCliente = 'https://loyaltyapp-4knq.vercel.app/visita?negocio=' + negocioId

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
        ctx.fillStyle = '#ffffff'
        ctx.font = 'bold 60px ' + fuente
        ctx.textAlign = 'center'
        ctx.fillText(nombrePersonalizado || negocioNombre || '', W / 2, yActual + 50)
        ctx.textAlign = 'left'
        yActual += 110
      }

      ctx.fillStyle = 'rgba(255,255,255,0.92)'
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

      ctx.fillStyle = 'rgba(255,255,255,0.85)'
      ctx.font = '24px ' + fuente
      ctx.textAlign = 'center'
      ctx.fillText(subtitulo, W / 2, yActual)
      yActual += 50

      if (contacto) {
        ctx.fillStyle = 'rgba(255,255,255,0.55)'
        ctx.font = '20px ' + fuente
        ctx.fillText(contacto, W / 2, yActual + 20)
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
    <main className="min-h-screen bg-gray-950 p-8">
      <div className="max-w-4xl mx-auto">

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">Editor de cartel</h1>
            <p className="text-gray-400">Personaliza el cartel de {negocioNombre}</p>
          </div>
          <button
            onClick={() => router.back()}
            className="border border-gray-600 hover:border-gray-400 text-gray-300 font-semibold py-2 px-5 rounded-xl transition text-sm"
          >
            Volver al dashboard
          </button>
        </div>

        <div className="grid grid-cols-2 gap-8">

          <div className="flex flex-col gap-5">

            <div className="bg-gray-900 rounded-2xl p-5">
              <label className="text-white font-semibold block mb-1">Encabezado</label>
              <p className="text-gray-500 text-xs mb-3">Lo primero que ve el cliente</p>
              <div className="flex gap-3 mb-4">
                <button
                  onClick={() => setUsarNombre(false)}
                  className={`flex-1 py-2 px-3 rounded-xl text-sm font-semibold transition ${!usarNombre ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-400'}`}
                >
                  Subir logo
                </button>
                <button
                  onClick={() => setUsarNombre(true)}
                  className={`flex-1 py-2 px-3 rounded-xl text-sm font-semibold transition ${usarNombre ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-400'}`}
                >
                  Usar nombre
                </button>
              </div>
              {!usarNombre ? (
                <div>
                  <input type="file" accept="image/*" onChange={handleLogo} className="text-gray-400 text-sm w-full" />
                  {logo && <button onClick={() => setLogo(null)} className="text-red-400 text-xs mt-2">Quitar logo</button>}
                </div>
              ) : (
                <div>
                  <label className="text-gray-400 text-sm block mb-2">Nombre en el cartel</label>
                  <input
                    type="text"
                    value={nombrePersonalizado}
                    onChange={(e) => setNombrePersonalizado(e.target.value)}
                    placeholder="Ej. Cafe La Paloma"
                    className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  />
                </div>
              )}
            </div>

            <div className="bg-gray-900 rounded-2xl p-5">
              <label className="text-white font-semibold block mb-1">Titulo del cartel</label>
              <p className="text-gray-500 text-xs mb-3">El mensaje principal para tu cliente</p>
              <input
                type="text"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 text-sm mb-3"
              />
              <label className="text-gray-400 text-sm block mb-2">Tamaño: {tamanoTitulo}px</label>
              <input
                type="range"
                min="14"
                max="36"
                value={tamanoTitulo}
                onChange={(e) => setTamanoTitulo(Number(e.target.value))}
                className="w-full"
              />
            </div>

            <div className="bg-gray-900 rounded-2xl p-5">
              <label className="text-white font-semibold block mb-1">Instruccion para el cliente</label>
              <p className="text-gray-500 text-xs mb-3">Aparece debajo del QR</p>
              <input
                type="text"
                value={subtitulo}
                onChange={(e) => setSubtitulo(e.target.value)}
                className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              />
            </div>

            <div className="bg-gray-900 rounded-2xl p-5">
              <label className="text-white font-semibold block mb-1">Color de fondo</label>
              <p className="text-gray-500 text-xs mb-3">El color principal del cartel</p>
              <div className="flex items-center gap-3">
                <input type="color" value={colorFondo} onChange={(e) => setColorFondo(e.target.value)} className="w-12 h-12 rounded-xl cursor-pointer border-0" />
                <span className="text-gray-400 text-sm">{colorFondo}</span>
              </div>
            </div>

            <div className="bg-gray-900 rounded-2xl p-5">
              <label className="text-white font-semibold block mb-1">Color del QR</label>
              <p className="text-gray-500 text-xs mb-3">El color de los puntos del codigo</p>
              <div className="flex items-center gap-3">
                <input type="color" value={colorPuntos} onChange={(e) => setColorPuntos(e.target.value)} className="w-12 h-12 rounded-xl cursor-pointer border-0" />
                <span className="text-gray-400 text-sm">{colorPuntos}</span>
              </div>
            </div>

            <div className="bg-gray-900 rounded-2xl p-5">
              <label className="text-white font-semibold block mb-1">Tipografia</label>
              <p className="text-gray-500 text-xs mb-3">Se aplica a todo el cartel</p>
              <div className="flex flex-col gap-2">
                {FUENTES.map((f) => (
                  <button
                    key={f.valor}
                    onClick={() => setFuente(f.valor)}
                    className={`py-2 px-4 rounded-xl text-sm text-left transition ${fuente === f.valor ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-400'}`}
                    style={{ fontFamily: f.valor }}
                  >
                    {f.nombre}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-gray-900 rounded-2xl p-5">
              <label className="text-white font-semibold block mb-1">Contacto o sitio web</label>
              <p className="text-gray-500 text-xs mb-3">Opcional, aparece al pie del cartel</p>
              <input
                type="text"
                value={contacto}
                onChange={(e) => setContacto(e.target.value)}
                placeholder="Ej. instagram.com/minegocio"
                className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              />
            </div>

            <button
              onClick={descargarCartel}
              disabled={descargando}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-xl transition disabled:opacity-50"
            >
              {descargando ? 'Generando cartel...' : 'Descargar cartel en PNG'}
            </button>

            <button
              onClick={() => router.back()}
              className="border border-gray-600 hover:border-gray-400 text-gray-300 font-semibold py-3 px-6 rounded-xl transition text-center"
            >
              Volver al dashboard
            </button>

          </div>

          <div className="flex flex-col items-center sticky top-8">
            <p className="text-gray-400 text-sm mb-4">Vista previa</p>
            <div
              className="rounded-2xl p-8 flex flex-col items-center gap-4 w-full"
              style={{ backgroundColor: colorFondo, fontFamily: fuente }}
            >
              {usarNombre ? (
                <p className="text-white font-bold text-3xl text-center">{nombrePersonalizado || negocioNombre}</p>
              ) : logo ? (
                <img src={logo} alt="logo" className="h-20 object-contain" />
              ) : (
                <p className="text-gray-400 text-sm">Sin logo aun</p>
              )}
              <p className="text-white text-center" style={{ fontSize: tamanoTitulo + 'px' }}>{titulo}</p>
              <div className="bg-white p-4 rounded-2xl">
                <div ref={qrRef} />
              </div>
              <p className="text-white text-center text-sm">{subtitulo}</p>
              {contacto && <p className="text-white text-opacity-50 text-xs text-center">{contacto}</p>}
            </div>
          </div>

        </div>

      </div>
    </main>
  )
}

export default function EditorQR() {
  return (
    <Suspense>
      <EditorQRContent />
    </Suspense>
  )
}