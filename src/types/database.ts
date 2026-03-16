export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      companies: {
        Row: {
          id: string
          created_at: string
          name: string
          owner_id: string
          phone: string
          google_review_link: string | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          subscription_status: 'trialing' | 'active' | 'past_due' | 'canceled'
          twilio_phone_number: string | null
        }
        Insert: Omit<Database['public']['Tables']['companies']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['companies']['Insert']>
      }
      leads: {
        Row: {
          id: string
          created_at: string
          company_id: string
          customer_name: string | null
          customer_phone: string
          message: string
          ai_response: string | null
          responded_at: string | null
          status: 'new' | 'responded' | 'converted' | 'lost'
        }
        Insert: Omit<Database['public']['Tables']['leads']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['leads']['Insert']>
      }
      quotes: {
        Row: {
          id: string
          created_at: string
          company_id: string
          lead_id: string | null
          job_description: string
          tiers: Json
          selected_tier: 'good' | 'better' | 'best' | null
          status: 'draft' | 'sent' | 'accepted' | 'declined'
          customer_name: string
          customer_phone: string | null
          customer_email: string | null
          total_amount: number | null
        }
        Insert: Omit<Database['public']['Tables']['quotes']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['quotes']['Insert']>
      }
      jobs: {
        Row: {
          id: string
          created_at: string
          company_id: string
          quote_id: string | null
          customer_name: string
          customer_phone: string
          description: string
          status: 'scheduled' | 'in_progress' | 'complete' | 'invoiced'
          completed_at: string | null
          review_sent_at: string | null
          scheduled_for: string | null
          technician_name: string | null
        }
        Insert: Omit<Database['public']['Tables']['jobs']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['jobs']['Insert']>
      }
    }
  }
}

export type Company = Database['public']['Tables']['companies']['Row']
export type Lead = Database['public']['Tables']['leads']['Row']
export type Quote = Database['public']['Tables']['quotes']['Row']
export type Job = Database['public']['Tables']['jobs']['Row']
