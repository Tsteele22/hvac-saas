import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { sendSMS, validateTwilioSignature } from '@/lib/twilio'
import { generateLeadResponse } from '@/lib/anthropic'

export async function POST(request: NextRequest) {
  const signature = request.headers.get('x-twilio-signature') || ''
  const url = `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/twilio`

  const formData = await request.formData()
  const params: Record<string, string> = {}
  formData.forEach((value, key) => { params[key] = value.toString() })

  if (!validateTwilioSignature(signature, url, params)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  const from = params['From']
  const body = params['Body']
  const to = params['To'] // our Twilio number

  const db = supabaseAdmin()

  // Find company by their Twilio number
  const { data: company } = await db
    .from('companies')
    .select('*')
    .eq('twilio_phone_number', to)
    .single()

  if (!company) {
    return NextResponse.json({ error: 'Company not found' }, { status: 404 })
  }

  // Check active subscription
  if (!['active', 'trialing'].includes(company.subscription_status)) {
    return NextResponse.json({ error: 'Subscription inactive' }, { status: 402 })
  }

  // Create lead record
  const { data: lead } = await db
    .from('leads')
    .insert({
      company_id: company.id,
      customer_phone: from,
      message: body,
      status: 'new',
    })
    .select()
    .single()

  if (!lead) {
    return NextResponse.json({ error: 'Failed to create lead' }, { status: 500 })
  }

  // Generate AI response and send SMS (target: under 90 seconds total)
  try {
    const aiResponse = await generateLeadResponse({
      customerName: '',
      message: body,
      businessName: company.name,
      businessPhone: company.phone,
    })

    await sendSMS(from, aiResponse)

    await db
      .from('leads')
      .update({ ai_response: aiResponse, responded_at: new Date().toISOString(), status: 'responded' })
      .eq('id', lead.id)
  } catch (err) {
    console.error('AI response failed:', err)
    // Fallback SMS if AI fails
    await sendSMS(from, `Hi! Thanks for reaching out to ${company.name}. We'll call you shortly to schedule. ${company.phone}`)
  }

  return NextResponse.json({ success: true })
}
