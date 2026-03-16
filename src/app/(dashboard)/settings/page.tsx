import { createClient } from '@/lib/supabase/server'
import SettingsForm from './settings-form'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: company } = await supabase.from('companies').select('*').eq('owner_id', user!.id).single()
  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-8">Settings</h1>
      <SettingsForm company={company} />
    </div>
  )
}
