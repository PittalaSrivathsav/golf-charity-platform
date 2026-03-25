import Stripe from 'stripe'

let stripeInstance: Stripe | null = null

export const getStripe = () => {
  if (!stripeInstance) {
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2026-02-25.clover' as any,
      typescript: true,
    })
  }
  return stripeInstance
}

export const PLANS = {
  monthly: {
    name: 'Monthly',
    price: 999,
    priceId: process.env.STRIPE_MONTHLY_PRICE_ID!,
    interval: 'month' as const,
  },
  yearly: {
    name: 'Yearly',
    price: 8999,
    priceId: process.env.STRIPE_YEARLY_PRICE_ID!,
    interval: 'year' as const,
    savings: '25%',
  },
}
