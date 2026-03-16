import Stripe from 'stripe'

export function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2026-02-25.clover',
    typescript: true,
  })
}

// Lazy singleton for server-side usage
let _stripe: Stripe | null = null
export function stripe() {
  if (!_stripe) _stripe = getStripe()
  return _stripe
}

export const PLANS = {
  PRO: {
    name: 'Pro',
    price: 249,
    priceId: process.env.STRIPE_PRICE_ID!,
    features: [
      'AI Lead Responder (< 90 sec)',
      'Smart Quote Generator',
      'Automated Review Requests',
      'Unlimited SMS',
      'Up to 10 technicians',
    ],
  },
} as const
