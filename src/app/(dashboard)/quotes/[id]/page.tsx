import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'
import type { QuoteTier } from '@/lib/anthropic'
import AcceptTierButton from './accept-tier-button'

const TIER_STYLES: Record<string, { border: string; badge: string; heading: string }> = {
  good:   { border: 'border-slate-200',  badge: 'bg-slate-100 text-slate-600',   heading: 'text-slate-900' },
  better: { border: 'border-blue-300',   badge: 'bg-blue-100 text-blue-700',     heading: 'text-blue-900' },
  best:   { border: 'border-violet-300', badge: 'bg-violet-100 text-violet-700', heading: 'text-violet-900' },
}

const STATUS_COLORS: Record<string, string> = {
  draft:    'bg-slate-100 text-slate-600',
  sent:     'bg-blue-100 text-blue-700',
  accepted: 'bg-green-100 text-green-700',
  declined: 'bg-red-100 text-red-600',
}

function formatDollars(amount: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount)
}

export default async function QuoteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: company } = await supabase.from('companies').select('id').eq('owner_id', user!.id).single()

  const { data: quote } = await supabase
    .from('quotes')
    .select('*')
    .eq('id', id)
    .eq('company_id', company?.id ?? '')
    .single()

  if (!quote) notFound()

  const tiers = quote.tiers as unknown as QuoteTier[]
  const isDraft = quote.status === 'draft'

  return (
    <div>
      <div className="flex items-center gap-3 mb-2">
        <Link href="/quotes" className="text-slate-400 hover:text-slate-600 text-sm">
          ← Quotes
        </Link>
        <span className="text-slate-300">/</span>
        <h1 className="text-2xl font-bold text-slate-900">{quote.customer_name}</h1>
        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[quote.status]}`}>
          {quote.status}
        </span>
      </div>

      <p className="text-slate-500 text-sm mb-1">{quote.job_description}</p>
      <p className="text-xs text-slate-400 mb-8">{format(new Date(quote.created_at), 'MMM d, yyyy h:mm a')}</p>

      {quote.status === 'accepted' && quote.selected_tier && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 text-green-800 text-sm font-medium">
          Accepted: {tiers.find(t => t.tier === quote.selected_tier)?.label ?? quote.selected_tier} tier
          {quote.total_amount != null && ` — ${formatDollars(quote.total_amount)}`}
        </div>
      )}

      <div className="grid grid-cols-3 gap-5">
        {tiers.map((tier) => {
          const styles = TIER_STYLES[tier.tier]
          const isSelected = quote.selected_tier === tier.tier
          return (
            <div
              key={tier.tier}
              className={`bg-white rounded-xl border-2 p-5 flex flex-col ${isSelected ? 'ring-2 ring-green-400' : styles.border}`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wide ${styles.badge}`}>
                  {tier.tier}
                </span>
                {isSelected && (
                  <span className="text-xs font-medium text-green-600">Accepted</span>
                )}
              </div>

              <p className={`text-xl font-bold mb-1 ${styles.heading}`}>{tier.label}</p>
              <p className="text-3xl font-bold text-slate-900 mb-3">{formatDollars(tier.total)}</p>
              <p className="text-sm text-slate-500 mb-4">{tier.description}</p>

              <div className="border-t border-slate-100 pt-3 flex-1">
                <p className="text-xs font-semibold text-slate-400 uppercase mb-2">Line Items</p>
                <table className="w-full text-xs">
                  <tbody className="divide-y divide-slate-50">
                    {tier.lineItems.map((item, i) => (
                      <tr key={i}>
                        <td className="py-1 text-slate-600 pr-2">{item.description}</td>
                        <td className="py-1 text-slate-400 text-right whitespace-nowrap">
                          {item.qty > 1 && <span className="mr-1">{item.qty}×</span>}
                          {formatDollars(item.total)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {isDraft && (
                <AcceptTierButton quoteId={quote.id} tier={tier.tier} total={tier.total} />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
