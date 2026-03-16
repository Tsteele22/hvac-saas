'use client'
import { useState } from 'react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export default function MarkCompleteButton({ jobId }: { jobId: string }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function markComplete() {
    setLoading(true)
    const res = await fetch('/api/jobs/complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobId }),
    })
    if (res.ok) {
      toast.success('Job marked complete. Review request will send in 2 hours.')
      router.refresh()
    } else {
      toast.error('Failed to update job')
    }
    setLoading(false)
  }

  return (
    <button onClick={markComplete} disabled={loading}
      className="text-xs bg-green-600 hover:bg-green-500 text-white px-3 py-1.5 rounded-lg font-medium disabled:opacity-50">
      {loading ? '...' : 'Mark Complete'}
    </button>
  )
}
