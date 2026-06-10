import { createClient, SupabaseClient } from '@supabase/supabase-js'

let _client: SupabaseClient | null = null

export function getSupabase() {
  if (!_client) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    _client = createClient(url, key)
  }
  return _client
}

// Lazy proxy — only throws if URL missing when actually called
export const supabase = new Proxy({} as SupabaseClient, {
  get(_t, prop) {
    return getSupabase()[prop as keyof SupabaseClient]
  }
})

export type Agent = {
  id: string; name: string; country: string; city: string
  website?: string; account_manager?: string
  status: 'Active' | 'Inactive' | 'Prospect'; notes?: string; created_at: string
}
export type Branch = {
  id: string; agent_id: string; city: string; country: string; address?: string
  contact_name?: string; contact_email?: string; contact_phone?: string
  is_main: boolean; notes?: string
}
export type School = {
  id: string; name: string; country: string; city: string; type?: string
  website?: string; contact_name?: string; contact_email?: string; notes?: string
}
export type Trip = {
  id: string; title: string; countries: string[]; start_date: string; end_date: string
  status: 'Draft' | 'Approved' | 'In Progress' | 'Completed'
  created_by?: string; notes?: string; created_at: string
}
export type TripDay = {
  id: string; trip_id: string; date: string; day_number: number; notes?: string
}
export type Activity = {
  id: string; trip_day_id: string
  type: 'travel' | 'agent_visit' | 'school_visit' | 'recruitment_event' | 'rest' | 'other'
  title?: string; time_from?: string; time_to?: string
  agent_branch_id?: string; school_id?: string; agent_id?: string
  venue_name?: string; venue_address?: string; transport_mode?: string
  departure_time?: string; arrival_time?: string; arrival_date?: string
  airline?: string; flight_number?: string; cost?: number
  rest_type?: string; description?: string; notes?: string; sort_order: number
}
export type Form = {
  id: string; title: string; activity_type: string; fields: FormField[]
  qr_code?: string; created_at: string
}
export type FormField = {
  id: string; label: string
  type: 'text' | 'email' | 'phone' | 'select' | 'textarea' | 'number' | 'date'
  required: boolean; options?: string[]
}
export type FormSubmission = {
  id: string; form_id: string; activity_id?: string
  data: Record<string, unknown>; submitted_at: string; submitted_by?: string
}
