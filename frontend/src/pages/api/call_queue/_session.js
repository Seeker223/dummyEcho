import { createClient } from '@supabase/supabase-js'
import { getSupabaseAdmin } from '../../../lib/supabase-admin'

function createAnonClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) return null

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  })
}

async function getProfileById(profileId) {
  const admin = getSupabaseAdmin()
  const searchId = String(profileId || '').trim()
  if (!searchId) return null

  const columns = 'id, user_id, email, role, full_name, submission_key, wallet_balance, walletBalanceNgn'
  const byId = await admin
    .from('profiles')
    .select(columns)
    .eq('id', searchId)
    .maybeSingle()

  if (!byId.error && byId.data) {
    return byId.data
  }

  if (byId.error) {
    const missingRow = byId.error.code === 'PGRST116' || /not found|no rows/i.test(byId.error.message || '')
    const missingTable = isMissingProfileTableError(byId.error)
    if (missingTable || missingRow) {
      return null
    }
    throw byId.error
  }

  const byUserId = await admin
    .from('profiles')
    .select(columns)
    .eq('user_id', searchId)
    .maybeSingle()

  if (byUserId.error) {
    const missingRow = byUserId.error.code === 'PGRST116' || /not found|no rows/i.test(byUserId.error.message || '')
    const missingTable = isMissingProfileTableError(byUserId.error)
    if (missingTable || missingRow) {
      return null
    }
    throw byUserId.error
  }

  return byUserId.data || null
}

export async function resolveQueueActor(req) {
  const authHeader = String(req.headers.authorization || '').trim()
  const bearerToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : ''
  const anonClient = createAnonClient()

  if (bearerToken && anonClient) {
    const { data, error } = await anonClient.auth.getUser(bearerToken)
    if (!error && data?.user) {
      return {
        id: data.user.id,
        email: data.user.email || '',
        role: data.user.user_metadata?.role || '',
        source: 'bearer',
      }
    }
  }

  const headerUserId = String(req.headers['x-echo-user-id'] || '').trim()
  const bodyUserId = String(req.body?.user_id || '').trim()
  const queryUserId = String(req.query?.user_id || '').trim()
  const userId = headerUserId || bodyUserId || queryUserId

  if (!userId) {
    return null
  }

  const profile = await getProfileById(userId).catch(() => null)

  return {
    id: profile?.id || profile?.user_id || userId,
    email: profile?.email || String(req.headers['x-echo-user-email'] || '').trim() || '',
    role: profile?.role || '',
    full_name: profile?.full_name || '',
    submission_key: profile?.submission_key || `EE_${String(userId).substring(0, 8)}`,
    wallet_balance: profile?.wallet_balance ?? profile?.walletBalanceNgn ?? null,
    source: profile ? 'profile' : 'fallback',
  }
}

export function unauthorizedResponse(res, message = 'Invalid or expired session.') {
  return res.status(401).json({ error: message })
}

function isMissingProfileTableError(error) {
  const message = String(error?.message || '').toLowerCase()
  return error?.code === 'PGRST205' || message.includes('could not find the table') || message.includes('not found')
}
