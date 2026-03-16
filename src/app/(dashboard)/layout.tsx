import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <div className="flex h-screen bg-slate-50">
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
        <div className="p-6 border-b border-slate-200">
          <span className="text-xl font-bold text-blue-600">HVACpro</span>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {[
            { href: '/dashboard', label: 'Dashboard', icon: '📊' },
            { href: '/leads', label: 'Leads', icon: '📥' },
            { href: '/quotes', label: 'Quotes', icon: '📋' },
            { href: '/jobs', label: 'Jobs', icon: '🔧' },
            { href: '/settings', label: 'Settings', icon: '⚙️' },
          ].map((item) => (
            <Link key={item.href} href={item.href}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors">
              <span>{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>
      </aside>
      <main className="flex-1 overflow-auto p-8">{children}</main>
    </div>
  )
}
