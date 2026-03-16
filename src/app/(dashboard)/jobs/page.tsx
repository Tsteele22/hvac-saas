import { createClient } from '@/lib/supabase/server'
import { format } from 'date-fns'
import MarkCompleteButton from './mark-complete-button'

export default async function JobsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: company } = await supabase.from('companies').select('id').eq('owner_id', user!.id).single()
  const { data: jobs } = await supabase
    .from('jobs').select('*').eq('company_id', company?.id ?? '').order('created_at', { ascending: false })

  const statusColors: Record<string, string> = {
    scheduled: 'bg-blue-100 text-blue-700',
    in_progress: 'bg-yellow-100 text-yellow-700',
    complete: 'bg-green-100 text-green-700',
    invoiced: 'bg-purple-100 text-purple-700',
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-8">Jobs</h1>
      <div className="space-y-3">
        {jobs?.map(job => (
          <div key={job.id} className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-900">{job.customer_name}</p>
                <p className="text-sm text-slate-500">{job.description}</p>
                {job.scheduled_for && <p className="text-xs text-slate-400 mt-1">Scheduled: {format(new Date(job.scheduled_for), 'MMM d, h:mm a')}</p>}
              </div>
              <div className="flex items-center gap-3">
                <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[job.status]}`}>{job.status.replace('_', ' ')}</span>
                {job.status !== 'complete' && job.status !== 'invoiced' && (
                  <MarkCompleteButton jobId={job.id} />
                )}
                {job.review_sent_at && <span className="text-xs text-green-600">Review sent</span>}
              </div>
            </div>
          </div>
        ))}
        {!jobs?.length && <p className="text-center text-slate-400 py-12">No jobs yet.</p>}
      </div>
    </div>
  )
}
