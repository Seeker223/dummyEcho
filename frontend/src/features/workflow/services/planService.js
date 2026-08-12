const PLANS_KEY = 'ee_plans:v1'

function readJson(key, fallback) {
  const raw = window.localStorage.getItem(key)
  if (!raw) return fallback
  try {
    return JSON.parse(raw)
  } catch {
    return fallback
  }
}

function writeJson(key, value) {
  window.localStorage.setItem(key, JSON.stringify(value))
}

const seedPlans = [
  { id: 'plan-bronze', name: 'Bronze', price: 'NGN 3,500 / mo', meta: '4 consults', active: true },
  { id: 'plan-silver', name: 'Silver', price: 'NGN 6,500 / mo', meta: 'Best value', active: true },
  { id: 'plan-gold', name: 'Gold', price: 'NGN 12,000 / mo', meta: 'Unlimited', active: true },
]

const seedFamilyPlans = [
  { id: 'family-silver', name: 'Family Silver', price: 'NGN 12,500 / mo', meta: 'Up to 4 people', active: true },
  { id: 'family-gold', name: 'Family Gold', price: 'NGN 22,000 / mo', meta: 'Up to 8 people', active: true },
]

export function getPlans() {
  const existing = readJson(PLANS_KEY, null)
  if (existing && typeof existing === 'object') {
    const plans = Array.isArray(existing.plans) ? existing.plans : seedPlans
    const familyPlans = Array.isArray(existing.familyPlans) ? existing.familyPlans : seedFamilyPlans
    return { plans, familyPlans }
  }

  const payload = { plans: seedPlans, familyPlans: seedFamilyPlans }
  writeJson(PLANS_KEY, payload)
  return payload
}

export function savePlans(next) {
  const payload = {
    plans: Array.isArray(next?.plans) ? next.plans : seedPlans,
    familyPlans: Array.isArray(next?.familyPlans) ? next.familyPlans : seedFamilyPlans,
  }
  writeJson(PLANS_KEY, payload)
  return payload
}

export function upsertPlan(listName, plan) {
  const existing = getPlans()
  const listKey = listName === 'familyPlans' ? 'familyPlans' : 'plans'
  const list = existing[listKey]
  const id = String(plan?.id || `plan-${Date.now()}`)
  const nextItem = {
    id,
    name: String(plan?.name || 'Plan'),
    price: String(plan?.price || 'NGN 0 / mo'),
    meta: String(plan?.meta || ''),
    active: Boolean(plan?.active ?? true),
  }

  const index = list.findIndex((p) => p.id === id)
  const nextList = index < 0 ? [nextItem, ...list] : list.map((p) => (p.id === id ? nextItem : p))
  return savePlans({ ...existing, [listKey]: nextList })
}

export function deletePlan(listName, id) {
  const existing = getPlans()
  const listKey = listName === 'familyPlans' ? 'familyPlans' : 'plans'
  const nextList = existing[listKey].filter((p) => p.id !== id)
  return savePlans({ ...existing, [listKey]: nextList })
}

export function togglePlanActive(listName, id) {
  const existing = getPlans()
  const listKey = listName === 'familyPlans' ? 'familyPlans' : 'plans'
  const nextList = existing[listKey].map((p) => (p.id === id ? { ...p, active: !p.active } : p))
  return savePlans({ ...existing, [listKey]: nextList })
}

