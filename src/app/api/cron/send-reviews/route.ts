import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { sendSMS } from '@/lib/twilio'
import type { Job, Company } from '@/types/database'

type JobWithCompany = Job & { companies: Company | null }

// Protect with CRON_SECRET - set this in Vercel cron config
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
  const db = supabaseAdmin()

  // Find jobs completed 2+ hours ago that haven't had review sent
  const { data: jobs } = await db
    .from('jobs')
    .select('*, companies(*)')
    .eq('status', 'complete')
    .lte('completed_at', twoHoursAgo)
    .is('review_sent_at', null)

  if (!jobs?.length) return NextResponse.json({ sent: 0 })

  let sent = 0
  for (const rawJob of jobs) {
    const job = rawJob as unknown as JobWithCompany
    const company = job.companies
    if (!company?.google_review_link) continue
    if (!['active', 'trialing'].includes(company.subscription_status)) continue

    try {
      const message = `Hi ${job.customer_name}! We hope your HVAC service with ${company.name} went well. If you're happy with the work, we'd love a quick Google review: ${company.google_review_link} Thank you!`
      await sendSMS(job.customer_phone, message)
      await db
        .from('jobs')
        .update({ review_sent_at: new Date().toISOString() })
        .eq('id', job.id)
      sent++
    } catch (err) {
      console.error(`Failed to send review for job ${job.id}:`, err)
    }
  }

  return NextResponse.json({ sent })
}
