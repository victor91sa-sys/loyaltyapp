import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

export async function POST(request: Request) {
  try {
    const { negocioId, estrellas, comentario } = await request.json()

    const { data: negocio } = await supabase
      .from('negocios')
      .select('nombre, correo')
      .eq('id', negocioId)
      .single()

    if (!negocio) {
      return NextResponse.json({ error: 'Negocio no encontrado' }, { status: 404 })
    }

    const estrellasTxt = '⭐'.repeat(estrellas)

    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + process.env.RESEND_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'HuellaClub <sabino@maplo.com.mx>',
        to: negocio.correo,
        subject: `Un cliente calificó tu negocio con ${estrellas} ${estrellas === 1 ? 'estrella' : 'estrellas'}`,
        html: `
          <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; padding: 40px 24px; color: #111827;">
            <p style="font-size: 13px; color: #6366f1; font-weight: 600; margin-bottom: 8px;">HUELLACLUB</p>
            <h1 style="font-size: 22px; font-weight: 700; margin-bottom: 16px;">
              Un cliente calificó ${negocio.nombre}
            </h1>
            <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 16px; padding: 24px; margin-bottom: 24px;">
              <p style="font-size: 32px; margin-bottom: 8px;">${estrellasTxt}</p>
              <p style="font-size: 24px; font-weight: 700; color: #4f46e5; margin-bottom: 4px;">${estrellas} ${estrellas === 1 ? 'estrella' : 'estrellas'}</p>
            </div>
            ${comentario ? `
            <div style="background: #eff6ff; border: 1px solid #dbeafe; border-radius: 16px; padding: 20px; margin-bottom: 24px;">
              <p style="font-size: 13px; color: #6366f1; font-weight: 600; margin-bottom: 8px;">COMENTARIO DEL CLIENTE</p>
              <p style="font-size: 15px; color: #1e40af; font-style: italic;">"${comentario}"</p>
            </div>
            ` : ''}
            <p style="font-size: 14px; color: #6b7280; margin-bottom: 24px;">
              Este feedback es privado. Solo tú lo puedes ver. Úsalo para seguir mejorando.
            </p>
            <a href="https://huellaclub.app/login" style="background-color: #4f46e5; color: white; padding: 14px 28px; border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 15px; display: inline-block; margin-bottom: 32px;">
              Ver mi panel
            </a>
            <p style="font-size: 13px; color: #9ca3af; border-top: 1px solid #e5e7eb; padding-top: 24px;">
              HuellaClub · <em>Vuelven por ti.</em>
            </p>
          </div>
        `
      })
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json({ error: 'Error enviando feedback' }, { status: 500 })
  }
}