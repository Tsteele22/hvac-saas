'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function NewQuotePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    jobDescription: '',
  })

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/quotes/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: form.customerName,
          customerPhone: form.customerPhone || undefined,
          customerEmail: form.customerEmail || undefined,
          jobDescription: form.jobDescription,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Failed to generate quote')
      }

      const { quote } = await res.json()
      router.push(`/quotes/${quote.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/quotes" className="text-slate-400 hover:text-slate-600 text-sm">
          ← Quotes
        </Link>
        <span className="text-slate-300">/</span>
        <h1 className="text-2xl font-bold text-slate-900">New Quote</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Customer Name <span className="text-red-500">*</span>
          </label>
          <input
            name="customerName"
            value={form.customerName}
            onChange={handleChange}
            required
            placeholder="Jane Smith"
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
            <input
              name="customerPhone"
              value={form.customerPhone}
              onChange={handleChange}
              placeholder="(555) 123-4567"
              type="tel"
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input
              name="customerEmail"
              value={form.customerEmail}
              onChange={handleChange}
              placeholder="jane@example.com"
              type="email"
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Job Description <span className="text-red-500">*</span>
          </label>
          <textarea
            name="jobDescription"
            value={form.jobDescription}
            onChange={handleChange}
            required
            minLength={10}
            rows={5}
            placeholder="Describe the HVAC work needed — e.g. 'Replace 3-ton AC unit in 1,500 sq ft home, existing ductwork in good condition, need SEER 16+ unit'"
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
          <p className="text-xs text-slate-400 mt-1">The more detail you provide, the more accurate the quote tiers will be.</p>
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
        )}

        <div className="flex items-center justify-end gap-3 pt-2">
          <Link href="/quotes" className="text-sm text-slate-500 hover:text-slate-700 px-4 py-2">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-500 disabled:bg-blue-300 text-white px-5 py-2 rounded-lg font-medium text-sm transition-colors"
          >
            {loading ? 'Generating quote…' : 'Generate Quote'}
          </button>
        </div>
      </form>
    </div>
  )
}
