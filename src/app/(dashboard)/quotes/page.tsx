import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { format } from 'date-fns'

export default async function QuotesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: company } = await supabase.from('companies').select('id').eq('owner_id', user!.id).single()
  const { data: quotes } = await supabase
    .from('quotes').select('*').eq('company_id', company?.id ?? '').order('created_at', { ascending: false })

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Quotes</h1>
        <Link href="/quotes/new" className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-medium text-sm">
          + New Quote
        </Link>
      </div>
      <div className="space-y-3">
        {quotes?.map(q => (
          <Link key={q.id} href={`/quotes/${q.id}`}
            className="block bg-white rounded-xl border border-slate-200 p-4 hover:border-blue-300 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-900">{q.customer_name}</p>
                <p className="text-sm text-slate-500 mt-0.5 truncate max-w-xl">{q.job_description}</p>
              </div>
              <div className="text-right">
                <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">{q.status}</span>
                <p className="text-xs text-slate-400 mt-1">{format(new Date(q.created_at), 'MMM d')}</p>
              </div>
            </div>
          </Link>
        ))}
        {!quotes?.length && <p className="text-center text-slate-400 py-12">No quotes yet. Create your first quote to get started.</p>}
      </div>
    </div>
  )
}
