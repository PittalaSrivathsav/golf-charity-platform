export const dynamic = 'force-dynamic'
import { getStripe } from '@/lib/stripe/client'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { plan } = await req.json()
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ message: 'Unauthorized. Please log in.' }, { status: 401 })
    }

    const priceId = plan === 'yearly' 
      ? process.env.STRIPE_YEARLY_PRICE_ID 
      : process.env.STRIPE_MONTHLY_PRICE_ID

    if (!priceId) {
      return NextResponse.json({ message: 'Stripe Price ID missing. Please check your .env.local' }, { status: 400 })
    }

    const stripe = getStripe()
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/subscription?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?canceled=true`,
      metadata: {
        userId: user.id,
        plan: plan,
      },
      customer_email: user.email,
    })

    return NextResponse.json({ url: session.url })
  } catch (err: any) {
    console.error('Stripe Checkout Error:', err)
    return NextResponse.json({ message: 'Internal Server Error', error: err.message }, { status: 500 })
  }
}
