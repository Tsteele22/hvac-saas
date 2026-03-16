'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface Props {
  quoteId: string
  tier: 'good' | 'better' | 'best'
  total: number
}

export default function AcceptTierButton({ quoteId, tier, total }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleAccept() {
    setLoading(true)
    const supabase = createClient()
    await supabase
      .from('quotes')
      .update({ selected_tier: tier, status: 'accepted', total_amount: total })
      .eq('id', quoteId)
    router.refresh()
  }

  return (
    <button
      onClick={handleAccept}
      disabled={loading}
      className="w-full mt-4 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-300 text-white py-2 rounded-lg font-medium text-sm transition-colors"
    >
      {loading ? 'Accepting…' : 'Accept this tier'}
    </button>
  )
}
