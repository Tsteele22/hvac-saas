import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { z } from 'zod'

const schema = z.object({
  userId: z.string().uuid(),
  name: z.string().min(1),
  phone: z.string().min(1),
})

export async function POST(request: NextRequest) {
  const body = await request.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 })

  const { userId, name, phone } = parsed.data
  const admin = supabaseAdmin()

  // Prevent duplicate companies for the same owner
  const { data: existing } = await admin
    .from('companies')
    .select('id')
    .eq('owner_id', userId)
    .maybeSingle()
  if (existing) return NextResponse.json({ error: 'Company already exists' }, { status: 409 })

  const { data: company, error } = await admin
    .from('companies')
    .insert({ owner_id: userId, name, phone })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ company })
}
