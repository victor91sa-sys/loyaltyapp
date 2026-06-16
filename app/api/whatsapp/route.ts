import { NextResponse } from 'next/server'
import twilio from 'twilio'

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
)

// Content SIDs de las plantillas aprobadas en Twilio
const PLANTILLA_VISITA = 'HX55e988afd855d144e9d75ddd41a29ac3'
const PLANTILLA_PREMIO = 'HX5b2e127f911d507c6767285b52f56037'

export async function POST(request: Request) {
  try {
    const { celular, visitas, meta, recompensa, negocioNombre } = await request.json()

    const numero = 'whatsapp:+52' + celular.replace(/\D/g, '')

    let contentSid = ''
    let contentVariables = {}

    if (visitas >= meta) {
      // Premio ganado
      contentSid = PLANTILLA_PREMIO
      contentVariables = {
        '1': String(meta),
        '2': negocioNombre,
        '3': recompensa
      }
    } else {
      // Visita registrada
      const faltan = meta - visitas
      contentSid = PLANTILLA_VISITA
      contentVariables = {
        '1': negocioNombre,
        '2': String(visitas),
        '3': String(meta),
        '4': String(faltan),
        '5': recompensa
      }
    }

    await client.messages.create({
      from: process.env.TWILIO_WHATSAPP_FROM,
      to: numero,
      contentSid: contentSid,
      contentVariables: JSON.stringify(contentVariables)
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}