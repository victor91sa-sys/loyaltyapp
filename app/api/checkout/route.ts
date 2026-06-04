import { NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-05-27.dahlia'
})

export async function POST(request: Request) {
  try {
    const { negocioId, negocioNombre, correo } = await request.json()

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      customer_email: correo,
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID,
          quantity: 1
        }
      ],
      metadata: {
        negocioId,
        negocioNombre
      },
      success_url: 'https://huellaclub.app/pago-exitoso?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: 'https://huellaclub.app/dashboard?id=' + negocioId + '&nombre=' + encodeURIComponent(negocioNombre)
    })

    return NextResponse.json({ url: session.url })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}