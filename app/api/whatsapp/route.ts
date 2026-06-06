import { NextResponse } from 'next/server'
import twilio from 'twilio'

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
)

export async function POST(request: Request) {
  try {
    const { celular, visitas, meta, recompensa, negocioNombre } = await request.json()

    const numero = 'whatsapp:+52' + celular.replace(/\D/g, '')

    let mensaje = ''
    if (visitas >= meta) {
      mensaje = 'Felicidades! Completaste ' + meta + ' visitas en ' + negocioNombre + '. Ganaste: ' + recompensa + '. Muestra este mensaje en caja para reclamar tu premio.'
    } else {
      const faltan = meta - visitas
      mensaje = 'Visita registrada en ' + negocioNombre + '. Llevas ' + visitas + ' de ' + meta + ' visitas. Te faltan ' + faltan + ' para obtener: ' + recompensa + '.'
    }

    await client.messages.create({
      from: process.env.TWILIO_WHATSAPP_FROM,
      to: numero,
      body: mensaje
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}