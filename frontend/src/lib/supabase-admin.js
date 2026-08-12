import { createClient } from '@supabase/supabase-js'

let adminClient = null

export function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Supabase admin environment variables are not configured.')
  }

  if (!adminClient) {
    adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    })
  }

  return adminClient
}

export const supabase = new Proxy(
  {},
  {
    get(_target, prop) {
      return getSupabaseAdmin()[prop]
    },
  },
)
