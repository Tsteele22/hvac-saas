import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const schema = z.object({ jobId: z.string().uuid() })

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const completedAt = new Date().toISOString()
  const { data: job } = await supabase
    .from('jobs')
    .update({ status: 'complete', completed_at: completedAt })
    .eq('id', parsed.data.jobId)
    .select()
    .single()

  if (!job) return NextResponse.json({ error: 'Job not found' }, { status: 404 })

  // Schedule review request for 2 hours from now
  // This endpoint is polled by the review sender cron
  return NextResponse.json({ job, reviewScheduledFor: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString() })
}
