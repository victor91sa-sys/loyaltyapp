import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== 'Bearer ' + process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { data: negocios } = await supabase
    .from('negocios')
    .select('id, nombre, correo, created_at, suscripcion_activa')
    .eq('suscripcion_activa', false)

  if (!negocios) return NextResponse.json({ enviados: 0 })

  const hoy = new Date()
  let enviados = 0

  for (const negocio of negocios) {
    const creado = new Date(negocio.created_at)
    const dias = Math.floor((hoy.getTime() - creado.getTime()) / (1000 * 60 * 60 * 24))

    let asunto = ''
    let html = ''

    if (dias === 25) {
      asunto = 'Tu negocio está creciendo. No lo pares ahora.'
      html = `
        <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; padding: 40px 24px; color: #111827;">
          <p style="font-size: 13px; color: #6366f1; font-weight: 600; margin-bottom: 8px;">HUELLACLUB</p>
          <h1 style="font-size: 24px; font-weight: 700; margin-bottom: 16px; line-height: 1.3;">
            Llevas 25 días construyendo tu base de clientes.
          </h1>
          <p style="font-size: 15px; color: #4b5563; margin-bottom: 12px;">
            Hola ${negocio.nombre},
          </p>
          <p style="font-size: 15px; color: #4b5563; margin-bottom: 12px;">
            En estos 25 días, cada cliente que escaneó tu QR eligió regresar. Eso no es casualidad. Es lo que estás construyendo.
          </p>
          <p style="font-size: 15px; color: #4b5563; margin-bottom: 32px;">
            Te quedan <strong>5 días de prueba gratis</strong>. Después son $199 MXN/mes para seguir reconociendo a quienes ya te eligen.
          </p>
          <a href="https://huellaclub.app/login" style="background-color: #4f46e5; color: white; padding: 14px 28px; border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 15px; display: inline-block; margin-bottom: 32px;">
            Ver mi panel
          </a>
          <p style="font-size: 13px; color: #9ca3af; border-top: 1px solid #e5e7eb; padding-top: 24px;">
            HuellaClub · <em>Vuelven por ti.</em>
          </p>
        </div>
      `
    } else if (dias === 29) {
      asunto = 'Mañana termina tu prueba. Tus clientes no.'
      html = `
        <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; padding: 40px 24px; color: #111827;">
          <p style="font-size: 13px; color: #6366f1; font-weight: 600; margin-bottom: 8px;">HUELLACLUB</p>
          <h1 style="font-size: 24px; font-weight: 700; margin-bottom: 16px; line-height: 1.3;">
            Mañana termina tu prueba gratuita.
          </h1>
          <p style="font-size: 15px; color: #4b5563; margin-bottom: 12px;">
            Hola ${negocio.nombre},
          </p>
          <p style="font-size: 15px; color: #4b5563; margin-bottom: 12px;">
            Has construido algo en estos 29 días. Tus clientes ya saben que aquí acumulan visitas. Ya esperan su premio.
          </p>
          <p style="font-size: 15px; color: #4b5563; margin-bottom: 32px;">
            No dejes que se detenga. Por <strong>$199 MXN al mes</strong> sigues reconociendo a quienes regresan contigo.
          </p>
          <a href="https://huellaclub.app/login" style="background-color: #4f46e5; color: white; padding: 14px 28px; border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 15px; display: inline-block; margin-bottom: 32px;">
            Suscribirme ahora
          </a>
          <p style="font-size: 13px; color: #9ca3af; border-top: 1px solid #e5e7eb; padding-top: 24px;">
            HuellaClub · <em>Vuelven por ti.</em>
          </p>
        </div>
      `
    } else if (dias === 31) {
      asunto = 'Tu programa está pausado. Un paso para reactivarlo.'
      html = `
        <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; padding: 40px 24px; color: #111827;">
          <p style="font-size: 13px; color: #6366f1; font-weight: 600; margin-bottom: 8px;">HUELLACLUB</p>
          <h1 style="font-size: 24px; font-weight: 700; margin-bottom: 16px; line-height: 1.3;">
            Tus clientes siguen ahí.
          </h1>
          <p style="font-size: 15px; color: #4b5563; margin-bottom: 12px;">
            Hola ${negocio.nombre},
          </p>
          <p style="font-size: 15px; color: #4b5563; margin-bottom: 12px;">
            Tu período de prueba terminó y tu QR está pausado. Pero las personas que eligieron tu negocio en estas semanas no se fueron a ningún lado.
          </p>
          <p style="font-size: 15px; color: #4b5563; margin-bottom: 32px;">
            Reactiva por <strong>$199 MXN al mes</strong> y sigue reconociendo a quienes vuelven por ti.
          </p>
          <a href="https://huellaclub.app/login" style="background-color: #4f46e5; color: white; padding: 14px 28px; border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 15px; display: inline-block; margin-bottom: 32px;">
            Reactivar mi programa
          </a>
          <p style="font-size: 13px; color: #9ca3af; border-top: 1px solid #e5e7eb; padding-top: 24px;">
            HuellaClub · <em>Vuelven por ti.</em>
          </p>
        </div>
      `
    } else {
      continue
    }

    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + process.env.RESEND_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'HuellaClub <sabino@maplo.com.mx>',
        to: negocio.correo,
        subject: asunto,
        html
      })
    })

    enviados++
  }

  return NextResponse.json({ enviados })
}