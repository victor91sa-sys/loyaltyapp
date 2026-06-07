import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { correo, motivo } = await request.json()

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + process.env.RESEND_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'HuellaClub <sabino@maplo.com.mx>',
        to: 'sabino@maplo.com.mx',
        subject: 'Solicitud de cancelacion - HuellaClub',
        html: '<h2>Solicitud de cancelacion</h2><p><strong>Correo:</strong> ' + correo + '</p><p><strong>Motivo:</strong> ' + motivo + '</p>'
      })
    })

    if (!response.ok) {
      throw new Error('Error al enviar correo')
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}