import { createClient } from '@/lib/supabase/server'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: company } = await supabase
    .from('companies')
    .select('*')
    .eq('owner_id', user!.id)
    .single()

  const [{ count: leadsCount }, { count: jobsCount }, { count: quotesCount }] = await Promise.all([
    supabase.from('leads').select('*', { count: 'exact', head: true }).eq('company_id', company?.id ?? ''),
    supabase.from('jobs').select('*', { count: 'exact', head: true }).eq('company_id', company?.id ?? '').eq('status', 'complete'),
    supabase.from('quotes').select('*', { count: 'exact', head: true }).eq('company_id', company?.id ?? '').eq('status', 'accepted'),
  ])

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-8">Dashboard</h1>
      <div className="grid grid-cols-3 gap-6 mb-8">
        {[
          { label: 'Total Leads', value: leadsCount ?? 0 },
          { label: 'Completed Jobs', value: jobsCount ?? 0 },
          { label: 'Accepted Quotes', value: quotesCount ?? 0 },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-slate-200 p-6">
            <p className="text-slate-500 text-sm mb-1">{stat.label}</p>
            <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
          </div>
        ))}
      </div>
      {!company?.google_review_link && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-amber-800 text-sm">
          Add your Google Review link in <a href="/settings" className="font-semibold underline">Settings</a> to enable automated review requests.
        </div>
      )}
    </div>
  )
}
