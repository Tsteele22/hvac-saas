import { createClient } from '@/lib/supabase/server'
import { formatPhone } from '@/lib/utils'
import { format } from 'date-fns'

export default async function LeadsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: company } = await supabase.from('companies').select('id').eq('owner_id', user!.id).single()
  const { data: leads } = await supabase
    .from('leads').select('*').eq('company_id', company?.id ?? '').order('created_at', { ascending: false })

  const statusColors: Record<string, string> = {
    new: 'bg-blue-100 text-blue-700',
    responded: 'bg-green-100 text-green-700',
    converted: 'bg-purple-100 text-purple-700',
    lost: 'bg-slate-100 text-slate-600',
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-8">Leads</h1>
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              {['Phone', 'Message', 'AI Response', 'Status', 'Date'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {leads?.map(lead => (
              <tr key={lead.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 text-sm font-medium">{formatPhone(lead.customer_phone)}</td>
                <td className="px-4 py-3 text-sm text-slate-600 max-w-xs truncate">{lead.message}</td>
                <td className="px-4 py-3 text-sm text-slate-600 max-w-xs truncate">{lead.ai_response ?? '—'}</td>
                <td className="px-4 py-3"><span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[lead.status]}`}>{lead.status}</span></td>
                <td className="px-4 py-3 text-sm text-slate-500">{format(new Date(lead.created_at), 'MMM d, h:mm a')}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!leads?.length && <p className="text-center text-slate-400 py-12">No leads yet. Leads appear here when customers text your Twilio number.</p>}
      </div>
    </div>
  )
}
