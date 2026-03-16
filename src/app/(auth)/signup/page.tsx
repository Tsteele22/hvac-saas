'use client'
import { useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { SupabaseClient } from '@supabase/supabase-js'

export default function SignupPage() {
  const [form, setForm] = useState({ email: '', password: '', name: '', phone: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabaseRef = useRef<SupabaseClient | null>(null)

  function getSupabase() {
    if (!supabaseRef.current) supabaseRef.current = createClient()
    return supabaseRef.current
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const supabase = getSupabase()
    const { data, error: signupError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
    })
    if (signupError || !data.user) { setError(signupError?.message ?? 'Signup failed'); setLoading(false); return }

    // Create company record
    const { error: companyError } = await supabase.from('companies').insert({
      name: form.name,
      owner_id: data.user.id,
      phone: form.phone,
    })
    if (companyError) { setError(companyError.message); setLoading(false); return }

    router.push('/dashboard')
  }

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, [k]: e.target.value }))

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl border border-slate-200 p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Start your free trial</h1>
        <p className="text-slate-500 mb-6">14 days free, then $249/month</p>
        {error && <p className="text-red-600 text-sm mb-4 bg-red-50 rounded-lg p-3">{error}</p>}
        <form onSubmit={handleSignup} className="space-y-4">
          {[
            { key: 'name', label: 'Business name', type: 'text' },
            { key: 'phone', label: 'Business phone', type: 'tel' },
            { key: 'email', label: 'Email', type: 'email' },
            { key: 'password', label: 'Password', type: 'password' },
          ].map(f => (
            <div key={f.key}>
              <label className="block text-sm font-medium text-slate-700 mb-1">{f.label}</label>
              <input type={f.type} value={(form as any)[f.key]} onChange={set(f.key)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
            </div>
          ))}
          <button type="submit" disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50">
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>
        <p className="text-center text-slate-500 text-sm mt-4">
          Already have an account? <Link href="/login" className="text-blue-600 hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
