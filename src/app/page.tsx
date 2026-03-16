import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-950 to-slate-900 text-white">
      <nav className="flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
        <span className="text-2xl font-bold text-blue-400">HVACpro</span>
        <div className="flex gap-4">
          <Link href="/login" className="text-slate-300 hover:text-white transition-colors">Sign in</Link>
          <Link href="/signup" className="bg-blue-500 hover:bg-blue-400 px-4 py-2 rounded-lg font-medium transition-colors">
            Start free trial
          </Link>
        </div>
      </nav>

      <section className="max-w-5xl mx-auto px-8 py-24 text-center">
        <div className="inline-flex items-center gap-2 bg-blue-900/50 border border-blue-700 rounded-full px-4 py-1.5 text-sm text-blue-300 mb-8">
          AI responds to leads in under 90 seconds
        </div>
        <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
          Win more HVAC jobs.<br />
          <span className="text-blue-400">Work smarter.</span>
        </h1>
        <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
          AI-powered software built for 2–10 truck HVAC contractors. Respond to every lead instantly,
          quote jobs in seconds, and collect more 5-star reviews — automatically.
        </p>
        <Link href="/signup" className="inline-block bg-blue-500 hover:bg-blue-400 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-colors">
          Start your 14-day free trial — $249/mo after
        </Link>
      </section>

      <section className="max-w-5xl mx-auto px-8 pb-24 grid md:grid-cols-3 gap-8">
        {[
          { icon: '⚡', title: 'AI Lead Responder', desc: 'Every inbound SMS gets an intelligent reply within 90 seconds. Never lose a lead to a slow response again.' },
          { icon: '📋', title: 'Smart Quote Generator', desc: 'Describe the job, get Good/Better/Best quotes with line items instantly. Close more jobs with professional estimates.' },
          { icon: '⭐', title: 'Auto Review Requester', desc: '2 hours after job completion, we automatically text your customer a Google review link. Build your reputation on autopilot.' },
        ].map((f) => (
          <div key={f.title} className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
            <div className="text-3xl mb-3">{f.icon}</div>
            <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
            <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </section>
    </main>
  )
}
