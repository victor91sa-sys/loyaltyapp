import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

export async function POST(request: Request) {
  try {
    const { correo, motivo } = await request.json()

    const { data: negocio } = await supabase
      .from('negocios')
      .select('id, nombre')
      .eq('correo', correo)
      .single()

    const nombreNegocio = negocio?.nombre || 'Desconocido'
    const negocioId = negocio?.id || 'N/A'

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + process.env.RESEND_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'HuellaClub <sabino@maplo.com.mx>',
        to: 'sabino@maplo.com.mx',
        subject: 'Solicitud de cancelacion - ' + nombreNegocio,
        html: '<h2>Solicitud de cancelacion</h2>' +
          '<p><strong>Negocio:</strong> ' + nombreNegocio + '</p>' +
          '<p><strong>Correo:</strong> ' + correo + '</p>' +
          '<p><strong>Motivo:</strong> ' + motivo + '</p>' +
          '<p><strong>ID Negocio:</strong> ' + negocioId + '</p>' +
          '<br>' +
          '<p>Para cancelar su suscripcion en Stripe, busca el cliente por correo en:</p>' +
          '<p><a href="https://dashboard.stripe.com/customers">https://dashboard.stripe.com/customers</a></p>' +
          '<p>Una vez cancelada en Stripe, Supabase se actualizara automaticamente.</p>'
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
