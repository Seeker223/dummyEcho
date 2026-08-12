import { supabase } from '../../../lib/supabaseClient'

const TX_KEY = 'ee_wallet_transactions:v1'
const PROFILE_LOOKUP_DISABLED_KEY = 'ee_disable_supabase_profile_lookup:v1'

function hasWindow() {
  return typeof window !== 'undefined'
}

function readJson(key, fallback) {
  if (!hasWindow()) return fallback
  const raw = window.localStorage.getItem(key)
  if (!raw) return fallback
  try {
    return JSON.parse(raw)
  } catch {
    return fallback
  }
}

function writeJson(key, value) {
  if (!hasWindow()) return
  window.localStorage.setItem(key, JSON.stringify(value))
}

function isProfileLookupDisabled() {
  if (!hasWindow()) return false
  return window.localStorage.getItem(PROFILE_LOOKUP_DISABLED_KEY) === '1'
}

function markProfileLookupDisabled() {
  if (!hasWindow()) return
  window.localStorage.setItem(PROFILE_LOOKUP_DISABLED_KEY, '1')
}

function isMissingTableError(error) {
  const message = String(error?.message || '').toLowerCase()
  return error?.code === 'PGRST205' || error?.code === 'PGRST116' || message.includes('could not find the table') || message.includes('not found')
}

export function formatWalletDate(date = new Date()) {
  const d = date instanceof Date ? date : new Date(date)
  const day = d.getDate()
  const month = d.toLocaleString('en-US', { month: 'short' })
  const year = d.getFullYear()
  const time = d.toLocaleString('en-US', { hour: 'numeric', minute: '2-digit' })
  return `${day} ${month}, ${year} | ${time}`
}

export async function fetchLiveBalance(userId) {
  if (!userId) return null
  if (isProfileLookupDisabled()) return null
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('wallet_balance, walletBalanceNgn')
      .eq('id', userId)
      .single()
    if (error) throw error
    const liveBalance = data?.wallet_balance ?? data?.walletBalanceNgn ?? null
    return liveBalance === null || liveBalance === undefined ? null : Number(liveBalance)
  } catch (error) {
    const missingTable = isMissingTableError(error)
    if (!missingTable) {
      console.error('Error fetching live balance:', error)
    } else {
      markProfileLookupDisabled()
    }
    return null
  }
}

export async function fetchWalletTransactions(userId) {
  if (!userId) return []
  if (isProfileLookupDisabled()) return getWalletTransactions()

  const candidates = ['wallet_transactions', 'transactions']
  let lastError = null

  for (const tableName of candidates) {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) throw error

      return (data || []).map((tx) => {
        const isCredit = tx.type === 'topup' || tx.type === 'earning' || tx.type === 'credit'
        const type = isCredit ? 'credit' : 'debit'
        const prefix = isCredit ? '+' : '-'
      
        let title = tx.type === 'topup' ? 'Wallet Top-up' : 'Transaction'
        if (tx.metadata?.type === 'subscription' && tx.metadata?.plan) {
          title = `${tx.metadata.plan}`
        } else if (tx.metadata?.title) {
          title = String(tx.metadata.title)
        } else if (tx.reference?.startsWith('withdraw_')) {
          title = 'Wallet Withdrawal'
        } else if (tx.reference?.startsWith('sub_')) {
          title = 'Subscription Payment'
        } else if (tx.type === 'debit') {
          title = 'Wallet Debit'
        }

        return {
          id: tx.id,
          title,
          date: formatWalletDate(tx.paid_at || tx.created_at),
          doctor: String(tx.metadata?.doctor || ''),
          amount: `${prefix}NGN ${Math.abs(Number(tx.amount)).toLocaleString('en-NG', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
          })}`,
          type,
          status: tx.status === 'success' ? 'Successful' : tx.status === 'pending' ? 'Pending' : 'Failed',
        }
      })
    } catch (error) {
      lastError = error
      const missingTable = isMissingTableError(error)
      if (!missingTable || tableName === candidates[candidates.length - 1]) {
        console.error('Error fetching transactions:', error)
      } else {
        markProfileLookupDisabled()
      }
    }
  }

  if (lastError && !isMissingTableError(lastError)) {
    console.error('Error fetching transactions:', lastError)
  }

  return []
}

export function getWalletTransactions() {
  const existing = readJson(TX_KEY, null)
  if (Array.isArray(existing) && existing.length) return existing

  const seed = [
    {
      id: 'seed-1',
      title: 'Chest Pain',
      date: '27 Jan, 2025 | 7:18 PM',
      doctor: 'Dr. Adebayo Okafor',
      amount: '-NGN 500',
      type: 'debit',
      status: 'Successful',
    },
    {
      id: 'seed-2',
      title: 'Wallet Top-up',
      date: '27 Jan, 2025 | 7:18 PM',
      doctor: '',
      amount: '+NGN 2,000',
      type: 'credit',
      status: 'Successful',
    },
  ]

  writeJson(TX_KEY, seed)
  return seed
}

export function addWalletTransaction(tx) {
  const existing = getWalletTransactions()
  const next = [
    {
      id: tx?.id || `tx-${Date.now()}`,
      title: String(tx?.title || 'Transaction'),
      date: tx?.date || formatWalletDate(new Date()),
      doctor: String(tx?.doctor || ''),
      amount: String(tx?.amount || ''),
      type: tx?.type === 'credit' ? 'credit' : 'debit',
      status: String(tx?.status || 'Successful'),
    },
    ...existing,
  ].slice(0, 20)

  writeJson(TX_KEY, next)
  return next
}

export function updateWalletTransaction(id, partial) {
  const existing = getWalletTransactions()
  const index = existing.findIndex((t) => t.id === id)
  if (index < 0) return existing

  const nextItem = {
    ...existing[index],
    ...partial,
  }

  const next = [...existing]
  next[index] = nextItem
  writeJson(TX_KEY, next)
  return next
}

export function deleteWalletTransaction(id) {
  const existing = getWalletTransactions()
  const next = existing.filter((t) => t.id !== id)
  writeJson(TX_KEY, next)
  return next
}

export function parseWalletAmount(amount) {
  const raw = String(amount || '').replace(/,/g, '').trim()
  const sign = raw.startsWith('-') ? -1 : 1
  const num = Number(raw.replace(/[^\d.]/g, '')) || 0
  return sign * num
}

export function getWalletSummary(transactions = getWalletTransactions()) {
  const credits = transactions.filter((t) => String(t.type) === 'credit').reduce((sum, t) => sum + parseWalletAmount(t.amount), 0)
  const debits = transactions.filter((t) => String(t.type) !== 'credit').reduce((sum, t) => sum + Math.abs(parseWalletAmount(t.amount)), 0)
  const balance = credits - debits
  return { balance, credits, debits, count: transactions.length }
}
