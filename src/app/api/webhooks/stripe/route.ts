import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { supabaseAdmin } from '@/lib/supabase/admin'
import Stripe from 'stripe'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe().webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const db = supabaseAdmin()
  const session = event.data.object as Stripe.Subscription | Stripe.Checkout.Session

  switch (event.type) {
    case 'customer.subscription.updated':
    case 'customer.subscription.deleted': {
      const sub = session as Stripe.Subscription
      await db.from('companies')
        .update({
          subscription_status: sub.status as any,
          stripe_subscription_id: sub.id,
        })
        .eq('stripe_customer_id', sub.customer as string)
      break
    }
    case 'checkout.session.completed': {
      const cs = session as Stripe.Checkout.Session
      if (cs.mode === 'subscription') {
        await db.from('companies')
          .update({
            stripe_customer_id: cs.customer as string,
            stripe_subscription_id: cs.subscription as string,
            subscription_status: 'active',
          })
          .eq('id', cs.metadata?.company_id as string)
      }
      break
    }
  }

  return NextResponse.json({ received: true })
}
