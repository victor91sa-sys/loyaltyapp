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
    let mensaje = ''

    if (dias === 25) {
      asunto = 'Te quedan 5 dias de prueba gratis en HuellaClub'
      mensaje = 'Hola ' + negocio.nombre + ', tu periodo de prueba termina en 5 dias. Suscribete ahora por $199 MXN/mes para no perder el acceso.'
    } else if (dias === 29) {
      asunto = 'Manana termina tu periodo de prueba en HuellaClub'
      mensaje = 'Hola ' + negocio.nombre + ', manana termina tu periodo de prueba. Suscribete hoy para que tus clientes sigan acumulando visitas.'
    } else if (dias === 31) {
      asunto = 'Tu periodo de prueba termino - Reactiva HuellaClub'
      mensaje = 'Hola ' + negocio.nombre + ', tu periodo de prueba ha terminado y tu QR esta desactivado. Suscribete por $199 MXN/mes para reactivarlo.'
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
        html: '<p>' + mensaje + '</p><br><p><a href="https://huellaclub.app/login">Ir a HuellaClub</a></p>'
      })
    })

    enviados++
  }

  return NextResponse.json({ enviados })
}