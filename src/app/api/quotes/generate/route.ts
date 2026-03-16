import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateQuotes } from '@/lib/anthropic'
import { z } from 'zod'

const schema = z.object({
  jobDescription: z.string().min(10),
  customerName: z.string().min(1),
  customerPhone: z.string().optional(),
  customerEmail: z.string().email().optional(),
  leadId: z.string().uuid().optional(),
})

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: company } = await supabase
    .from('companies')
    .select('*')
    .eq('owner_id', user.id)
    .single()
  if (!company) return NextResponse.json({ error: 'Company not found' }, { status: 404 })

  const body = await request.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const tiers = await generateQuotes({
    jobDescription: parsed.data.jobDescription,
    businessName: company.name,
  })

  const { data: quote } = await supabase
    .from('quotes')
    .insert({
      company_id: company.id,
      job_description: parsed.data.jobDescription,
      tiers,
      customer_name: parsed.data.customerName,
      customer_phone: parsed.data.customerPhone ?? null,
      customer_email: parsed.data.customerEmail ?? null,
      lead_id: parsed.data.leadId ?? null,
      status: 'draft',
    })
    .select()
    .single()

  return NextResponse.json({ quote })
}
