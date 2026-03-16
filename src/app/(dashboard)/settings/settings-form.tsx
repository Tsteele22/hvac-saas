'use client'
import { useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import type { Company } from '@/types/database'
import type { SupabaseClient } from '@supabase/supabase-js'

export default function SettingsForm({ company }: { company: Company | null }) {
  const [form, setForm] = useState({
    name: company?.name ?? '',
    phone: company?.phone ?? '',
    google_review_link: company?.google_review_link ?? '',
  })
  const supabaseRef = useRef<SupabaseClient | null>(null)

  function getSupabase() {
    if (!supabaseRef.current) supabaseRef.current = createClient()
    return supabaseRef.current
  }

  async function save(e: React.FormEvent) {
    e.preventDefault()
    const { error } = await getSupabase().from('companies').update(form).eq('id', company!.id)
    if (error) toast.error(error.message)
    else toast.success('Settings saved')
  }

  return (
    <form onSubmit={save} className="max-w-lg space-y-4 bg-white rounded-xl border border-slate-200 p-6">
      {[
        { key: 'name', label: 'Business name', placeholder: '' },
        { key: 'phone', label: 'Business phone', placeholder: '' },
        { key: 'google_review_link', label: 'Google Review link', placeholder: 'https://g.page/r/...' },
      ].map(f => (
        <div key={f.key}>
          <label className="block text-sm font-medium text-slate-700 mb-1">{f.label}</label>
          <input
            value={(form as any)[f.key]}
            onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
            placeholder={f.placeholder}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      ))}
      <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-medium">
        Save changes
      </button>
    </form>
  )
}
