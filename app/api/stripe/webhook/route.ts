export const dynamic = 'force-dynamic'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe/client'
import Stripe from 'stripe'
import { createAdminClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!
  const body = await req.text()
  const head = await headers()
  const signature = head.get('stripe-signature') as string

  if (!signature || !webhookSecret) {
    return new NextResponse('Missing signature or secret', { status: 400 })
  }

  let event: Stripe.Event
  const stripe = getStripe()

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`)
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 })
  }

  const supabase = await createAdminClient()

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as any
    
    if (session.mode === 'subscription') {
      const subscription = await stripe.subscriptions.retrieve(session.subscription as string) as any
      const userId = session.metadata?.userId
      const plan = session.metadata?.plan

      if (userId) {
        await supabase.from('subscriptions').upsert({
          user_id: userId,
          stripe_customer_id: session.customer as string,
          stripe_subscription_id: subscription.id,
          plan: plan,
          status: 'active',
          current_period_start: new Date((subscription.current_period_start || 0) * 1000).toISOString(),
          current_period_end: new Date((subscription.current_period_end || 0) * 1000).toISOString(),
        })

        await supabase.from('payments').insert({
          user_id: userId,
          amount: (session.amount_total || 0) / 100,
          currency: session.currency || 'inr',
          type: 'subscription',
          status: 'succeeded'
        })
      }
    }
  }

  if (event.type === 'invoice.payment_succeeded') {
    const invoice = event.data.object as any
    const subId = typeof invoice.subscription === 'string' ? invoice.subscription : invoice.subscription?.id || invoice.subscription
    const subscription = await stripe.subscriptions.retrieve(subId) as any
    
    const { data: subRec } = await supabase
      .from('subscriptions')
      .select('user_id')
      .eq('stripe_subscription_id', subscription.id)
      .single()

    if (subRec) {
      await supabase
        .from('subscriptions')
        .update({
          status: 'active',
          current_period_start: new Date((subscription.current_period_start || 0) * 1000).toISOString(),
          current_period_end: new Date((subscription.current_period_end || 0) * 1000).toISOString(),
        })
        .eq('stripe_subscription_id', subscription.id)

      await supabase.from('payments').insert({
        user_id: subRec.user_id,
        amount: invoice.amount_paid / 100,
        currency: invoice.currency || 'inr',
        type: 'subscription',
        status: 'succeeded'
      })
    }
  }

  if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object as any
    await supabase
      .from('subscriptions')
      .update({ status: 'cancelled' })
      .eq('stripe_subscription_id', subscription.id)
  }

  return new NextResponse('OK', { status: 200 })
}
