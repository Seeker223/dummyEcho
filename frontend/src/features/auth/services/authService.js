import { supabase } from '../../../lib/supabaseClient'

const USERS_KEY = 'ee_dummy_users'
const SESSION_KEY = 'ee_active_session'
const PENDING_SIGNUPS_KEY = 'ee_pending_signups:v1'
const CAREER_ROLE_CONFIG_KEY = 'ee_admin_roles:v1'
const ACCESS_ROLE_CONFIG_KEY = 'ee_admin_access_roles:v1'
const SUPABASE_PROFILE_LOOKUP_DISABLED_KEY = 'ee_disable_supabase_profile_lookup:v1'

const defaultUsers = [
  {
    id: 'p-1001',
    role: 'patient',
    title: 'Mr.',
    fullName: 'Junior Okafor',
    username: 'junior.patient',
    email: 'junior.patient@echo.test',
    
    age: '24',
    phone: '08030000001',
    gender: 'male',
    language: 'english',
    avatarUrl: 'https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=200&h=200&fit=crop',
  },
  {
    id: 'd-2001',
    role: 'doctor',
    professionalKitComplete: true,
    title: 'Dr.',
    fullName: 'Sarah Johnson',
    username: 'sarah.doctor',
    email: 'sarah.doctor@echo.test',
    
    specialization: 'Emergency Medicine',
    phone: '08030000002',
    avatarUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&h=200&fit=crop',
  },
  {
    id: 'n-3001',
    role: 'nurse',
    professionalKitComplete: true,
    title: 'Nurse',
    fullName: 'Grace Mensah',
    username: 'grace.nurse',
    email: 'grace.nurse@echo.test',
    
    specialization: 'General Nursing / Midwifery',
    phone: '08030000003',
    avatarUrl: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=200&h=200&fit=crop',
  },
]

export function getUsers() {
  const existing = readJson(USERS_KEY, null)
  if (existing) {
    const normalized = normalizeStoredUsers(existing)
    const merged = mergeDefaultUsers(normalized)
    if (merged !== existing) {
      localStorage.setItem(USERS_KEY, JSON.stringify(merged))
    }
    return merged
  }
  localStorage.setItem(USERS_KEY, JSON.stringify(defaultUsers))
  return defaultUsers
}

export async function getSessionUser() {
  const localSessionUser = readJson(SESSION_KEY, null)
  if (localSessionUser?.id) {
    const profile = await fetchProfileById(localSessionUser.id)
    if (!profile) {
      if (isBrowser() && localSessionUser?.authProvider === 'n8n' && isProfileLookupDisabled()) {
        return normalizeUser(localSessionUser)
      }
      clearStoredSession()
    } else {
      const mergedLocalSession = normalizeUser({
        ...localSessionUser,
        ...profile,
        id: profile.id || localSessionUser.id,
        profile_id: profile.id || localSessionUser.id,
      })
      localStorage.setItem(SESSION_KEY, JSON.stringify(mergedLocalSession))
      return mergedLocalSession
    }
  }

  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) return null

  // Fetch the role from the profiles table
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single()

  if (error) {
    const missingTable = isMissingSupabaseProfileError(error)
    if (!missingTable) {
      console.error('Error fetching profile:', error)
    } else {
      setProfileLookupDisabled()
    }
  }

  if (!profile) {
    if (isMissingSupabaseProfileError(error)) {
      return normalizeUser({
        ...session.user,
        id: session.user.id,
        profile_id: session.user.id,
        authProvider: 'supabase',
      })
    }
    clearStoredSession()
    try {
      await supabase.auth.signOut()
    } catch {
      // Ignore sign-out failures in recovery mode.
    }
    return null
  }

  // 1. Fetch personal medical kit data from patients table (always applicable to all users)
  let patientData = {}
  const { data: pDataList } = await supabase
    .from('patients')
    .select('*')
    .eq('user_id', session.user.id)
    .order('updated_at', { ascending: false })
    .limit(1)
  if (pDataList && pDataList.length > 0) {
    patientData = pDataList[0]
  }

  // 2. Fetch role-specific details (professional/business columns)
  let roleData = {}
  if (profile?.role) {
    const table = profile.role === 'nurse' ? 'nurses' : profile.role === 'doctor' ? 'doctors' : profile.role === 'patient' ? 'patients' : null
    // Avoid double fetching patients table if role is patient
    if (table && table !== 'patients') {
      let { data: rData } = await supabase.from(table).select('*').eq('user_id', session.user.id).single()
      if (!rData) {
        const { data: rData2 } = await supabase.from(table).select('*').eq('profile_id', session.user.id).single()
        rData = rData2
      }
      if (rData) roleData = rData
    }
  }

  // IMPORTANT: spread roleData and patientData but NEVER let them overwrite the user's auth id or profile id.
  const { id: _pId, user_id: _pUserId, submission_key: pSubKey, ...safePatientData } = patientData || {}
  const { id: _roleId, user_id: _roleUserId, profile_id: _roleProfileId, submission_key: roleSubKey, ...safeRoleData } = roleData || {}

  const submissionKey = roleSubKey || pSubKey || (session.user.id ? `EE_${session.user.id.substring(0, 8)}` : null)

  return normalizeUser({
    ...session.user,
    ...(profile || {}),
    ...safePatientData,
    ...safeRoleData,
    submission_key: submissionKey,
    id: profile?.id || session.user.id,       // always the auth/profile id
    profile_id: profile?.id || session.user.id,
  })
}

// Normalize Supabase snake_case fields → camelCase so the whole app
// can reliably use currentUser.fullName, currentUser.avatarUrl etc.
function normalizeUser(raw) {
  if (!raw) return raw
  return {
    ...raw,
    ...(raw.user_metadata || {}),
    fullName:  raw.fullName  || raw.full_name  || raw.user_metadata?.full_name || raw.user_metadata?.fullName || '',
    avatarUrl: raw.avatarUrl || raw.avatar_url || '',
    language:  raw.language  || raw.preferred_language || '',
    role:      raw.role      || '',
    submission_key: raw.submission_key || raw.submissionKey || raw.echo_id || raw.echoId || '',
    echo_id: raw.echo_id || raw.echoId || raw.submission_key || raw.submissionKey || '',
    licenseNumber: raw.licenseNumber || raw.license_number || raw.license_id || raw.licenseId || '',
    specialization: raw.specialization || raw.specialty || raw.department || raw.certification || '',
    hospital: raw.hospital || raw.hospital_affiliation || '',
    yearsOfExperience: raw.yearsOfExperience || raw.years_of_experience || '',

    dob: raw.dob || '',
    sex: raw.gender || raw.sex || '',
    gender: raw.gender || raw.sex || '',
    bloodType: raw.blood_group || raw.bloodType || '',
    genotype: raw.genotype || '',
    maritalStatus: raw.marital_status || raw.maritalStatus || '',
    religion: raw.religion || '',
    nationality: raw.nationality || '',
    address: raw.address || '',
    
    emergencyName: raw.ec_name || raw.emergencyName || '',
    emergencyRelation: raw.ec_relationship || raw.emergencyRelation || '',
    emergencyPhone: raw.ec_phone || raw.emergencyPhone || '',
    emergencyPhone2: raw.ec_secondary || raw.emergencyPhone2 || '',
    
    conditionsList: raw.conditions || raw.conditionsList || [],
    conditionsOther: raw.cond_other || raw.conditionsOther || '',
    surgeriesList: raw.surgeries || raw.surgeriesList || [],
    surgeriesOther: raw.surg_other || raw.surgeriesOther || '',
    
    drugAllergies: raw.drug_allergies || raw.drugAllergies || [],
    foodAllergies: raw.food_allergies || raw.foodAllergies || [],
    otherAllergies: raw.other_allergies || raw.otherAllergies || '',
    
    rxMeds: raw.rx_meds || raw.rxMeds || [],
    otcMeds: raw.otc_meds || raw.otcMeds || [],
    herbalMeds: raw.herbal_meds || raw.herbalMeds || [],
    medsNotes: raw.meds_notes || raw.medsNotes || '',
    
    admit: raw.admit || '',
    admitDetails: raw.admit_details || raw.admitDetails || '',
    transfusion: raw.transfusion || '',
    transfusionDetails: raw.transfusion_details || raw.transfusionDetails || '',
    
    vaccines: raw.immunisations || raw.vaccines || [],
    vaccineNotes: raw.imm_notes || raw.vaccineNotes || '',
    
    mentalHistory: raw.mental_history || raw.mentalHistory || [],
    mentalCurrent: raw.mental_current || raw.mentalCurrent || '',
    cognitive: raw.cognitive || [],
    mentalNotes: raw.mental_notes || raw.mentalNotes || '',
    
    directives: raw.directives || [],
    dirNotes: raw.dir_notes || raw.dirNotes || '',
    
    familyHistory: raw.fam_history || raw.familyHistory || [],
    famHistoryNotes: raw.fam_history_notes || raw.famHistoryNotes || '',
    
    assistive: raw.assistive || [],
    assistiveNotes: raw.assistive_notes || raw.assistiveNotes || '',
    
    smoking: raw.smoking || '',
    alcohol: raw.alcohol || '',
    substanceUse: raw.substance_use || raw.substanceUse || [],
    substanceDetails: raw.substance_details || raw.substanceDetails || '',
    diet: raw.diet || '',
    exerciseFreq: raw.exercise_freq || raw.exerciseFreq || '',
    occupationCat: raw.occupation_cat || raw.occupationCat || '',
    livingSituation: raw.living_situation || raw.livingSituation || '',
    pets: raw.pets || '',
    petsType: raw.pets_type || raw.petsType || [],
    petsOther: raw.pets_other || raw.petsOther || '',
    lifestyleNotes: raw.lifestyle_notes || raw.lifestyleNotes || '',
    
    gravida: typeof raw.gravida === 'number' ? raw.gravida : 0,
    para: typeof raw.para === 'number' ? raw.para : 0,
    miscarriages: typeof raw.miscarriages === 'number' ? raw.miscarriages : 0,
    pregnancyComplications: raw.pregnancy_complications || raw.pregnancyComplications || [],
    lmp: raw.last_menstrual_period || raw.lmp || '',
    menstrualRegularity: raw.menstrual_regularity || raw.menstrualRegularity || '',
    contraceptionUse: raw.contraceptive_use || raw.contraceptionUse || '',
    menopause: raw.menopause || '',
    obgynNotes: raw.obgyn_notes || raw.obgynNotes || '',
  }
}

export async function loginUser({ email, password }) {
  const identifier = String(email || '').trim().toLowerCase()
  const normalizedPassword = String(password || '').trim()
  const signupHint = findPendingSignupDraft(identifier, normalizedPassword)

  if (!identifier) throw new Error('Enter your email or username.')
  if (!normalizedPassword) throw new Error('Enter your password.')

  const response = await fetch('/api/auth/login-n8n', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      raw_identifier: String(email || '').trim(),
      identifier,
      login_identifier: identifier,
      email: identifier,
      email_raw: String(email || '').trim(),
      username: String(email || '').trim(),
      username_lower: identifier,
      action: 'login',
      password: normalizedPassword,
      password_hash: normalizedPassword,
      raw_password: normalizedPassword,
      full_name: signupHint?.fullName || '',
      title: signupHint?.title || '',
      role: signupHint?.role || '',
      phone: signupHint?.phone || '',
      user_id: signupHint?.user_id || '',
      echo_id: signupHint?.echo_id || '',
      submission_key: signupHint?.echo_id || signupHint?.submission_key || '',
      verification_status: signupHint?.verification_status || '',
      email_verified: Boolean(signupHint?.email_verified || signupHint?.is_verified),
      is_verified: Boolean(signupHint?.is_verified || signupHint?.email_verified),
      verified_at: signupHint?.verified_at || '',
    })
  })

  const n8nData = await readApiResponse(response)

  if (!response.ok) {
    const cachedSignup = getVerifiedPendingSignup(identifier, normalizedPassword)
    if (cachedSignup) {
      const localSession = buildLocalSessionFromSignup(cachedSignup)
      localStorage.setItem(SESSION_KEY, JSON.stringify(localSession))
      return localSession
    }

    throw new Error(n8nData.error || 'Login failed. Please check your credentials.')
  }

  const sessionUser = normalizeUser({
    ...(n8nData.profile || n8nData.user || {}),
    email: n8nData?.profile?.email || n8nData?.user?.email || identifier,
    fullName:
      n8nData?.profile?.fullName ||
      n8nData?.profile?.full_name ||
      n8nData?.user?.fullName ||
      n8nData?.user?.full_name ||
      '',
    role: String(n8nData?.profile?.role || n8nData?.user?.role || '').trim().toLowerCase(),
    id:
      n8nData?.profile?.id ||
      n8nData?.user?.id ||
      n8nData?.profile?.user_id ||
      n8nData?.user?.user_id ||
      identifier,
    submission_key:
      n8nData?.profile?.submission_key ||
      n8nData?.profile?.echo_id ||
      n8nData?.user?.submission_key ||
      n8nData?.user?.echo_id ||
      n8nData?.submission_key ||
      n8nData?.echo_id ||
      '',
    access_token: n8nData.access_token || '',
    refresh_token: n8nData.refresh_token || '',
    authProvider: 'n8n',
  })

  localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser))
  return sessionUser
}

export async function registerUser(payload) {
  const email = String(payload.email || '').trim().toLowerCase()
  const password = String(payload.password || '').trim()
  const role = String(payload.role || '').trim().toLowerCase()
  const fullName = String(payload.fullName || '').trim()
  const username = String(payload.username || payload.email || '').trim().toLowerCase()
  const title = String(payload.title || '').trim()
  const phone = String(payload.phone || '').trim()

  if (password.trim().length < 8) throw new Error('Password must be at least 8 characters.')
  if (!role) throw new Error('Select what you are joining as.')
  if (!['patient', 'doctor', 'nurse', 'partner', 'admin'].includes(role)) throw new Error('Invalid career selection.')

  const response = await fetch('/api/auth/signup-all-roles', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, full_name: fullName, role, phone: String(payload.phone || '') }),
  })

  const data = await readApiResponse(response)

  if (!response.ok) {
    throw new Error(data.error || 'Signup failed. Please try again.')
  }

  savePendingSignupDraft({
    email,
    password,
    role,
    fullName,
    username,
    title,
    phone,
    user_id: data?.user_id || data?.id || '',
    echo_id: data?.echo_id || data?.submission_key || '',
    verification_status: 'pending',
    email_verified: false,
    is_verified: false,
    verified_at: null,
  })

  return data
}

export function savePendingSignupDraft(draft) {
  const nextDraft = normalizeSignupDraft(draft)
  if (!nextDraft.email || !nextDraft.password) return null

  const drafts = readJson(PENDING_SIGNUPS_KEY, [])
  const nextDrafts = Array.isArray(drafts) ? drafts.slice() : []
  const index = nextDrafts.findIndex((item) => item.email === nextDraft.email)
  if (index >= 0) nextDrafts[index] = { ...nextDrafts[index], ...nextDraft }
  else nextDrafts.unshift(nextDraft)

  localStorage.setItem(PENDING_SIGNUPS_KEY, JSON.stringify(nextDrafts))
  localStorage.setItem('ee_pending_verification_email', nextDraft.email)
  return nextDraft
}

export function markPendingSignupVerified(email, verificationCode = '') {
  const targetEmail = String(email || '').trim().toLowerCase()
  if (!targetEmail) return null

  const drafts = readJson(PENDING_SIGNUPS_KEY, [])
  if (!Array.isArray(drafts) || !drafts.length) return null

  let updatedDraft = null
  const nextDrafts = drafts.map((draft) => {
    if (String(draft?.email || '').trim().toLowerCase() !== targetEmail) return draft

    updatedDraft = {
      ...draft,
      verification_status: 'verified',
      email_verified: true,
      is_verified: true,
      verified_at: new Date().toISOString(),
      verification_code: verificationCode || draft.verification_code || '',
    }

    return updatedDraft
  })

  if (updatedDraft) {
    localStorage.setItem(PENDING_SIGNUPS_KEY, JSON.stringify(nextDrafts))
  }

  return updatedDraft
}

export function getVerifiedPendingSignup(identifier, password) {
  const target = String(identifier || '').trim().toLowerCase()
  const secret = String(password || '').trim()
  if (!target || !secret) return null

  const drafts = readJson(PENDING_SIGNUPS_KEY, [])
  if (!Array.isArray(drafts) || !drafts.length) return null

  return drafts.find((draft) => {
    const draftEmail = String(draft?.email || '').trim().toLowerCase()
    const draftUsername = String(draft?.username || '').trim().toLowerCase()
    const draftPassword = String(draft?.password || '').trim()
    const verified = Boolean(draft?.is_verified || draft?.email_verified || String(draft?.verification_status || '').toLowerCase() === 'verified')
    return verified && draftPassword === secret && (draftEmail === target || draftUsername === target)
  }) || null
}

export function getEnabledRoles() {
  const stored = readJson(CAREER_ROLE_CONFIG_KEY, null)
  const enabled = stored?.enabled
  if (Array.isArray(enabled) && enabled.length) {
    return enabled.map((r) => String(r || '').trim().toLowerCase()).filter(Boolean)
  }
  return ['patient', 'doctor', 'nurse', 'partner']
}

export function setEnabledRoles(nextEnabled) {
  const enabled = Array.isArray(nextEnabled)
    ? nextEnabled.map((r) => String(r || '').trim().toLowerCase()).filter(Boolean)
    : ['patient', 'doctor', 'nurse', 'partner']

  localStorage.setItem(CAREER_ROLE_CONFIG_KEY, JSON.stringify({ enabled }))
  return enabled
}

export function getEnabledAccessRoles() {
  const stored = readJson(ACCESS_ROLE_CONFIG_KEY, null)
  const enabled = stored?.enabled
  if (Array.isArray(enabled) && enabled.length) {
    return enabled.map((r) => String(r || '').trim().toLowerCase()).filter(Boolean)
  }
  return ['user', 'admin']
}

export function setEnabledAccessRoles(nextEnabled) {
  const enabled = Array.isArray(nextEnabled) ? nextEnabled.map((r) => String(r || '').trim().toLowerCase()).filter(Boolean) : ['user', 'admin']
  localStorage.setItem(ACCESS_ROLE_CONFIG_KEY, JSON.stringify({ enabled }))
  return enabled
}

export function adminUpsertUser(user) {
  const users = getUsers()
  const id = String(user?.id || `u-${Date.now()}`).trim()
  const role = String(user?.role || 'patient').trim().toLowerCase() // career role
  const accessRole = String(user?.accessRole || 'user').trim().toLowerCase()

  if (!['patient', 'doctor', 'nurse', 'partner'].includes(role)) throw new Error('Invalid career selection.')
  if (!['user', 'admin'].includes(accessRole)) throw new Error('Invalid access role selection.')
  if (!id) throw new Error('User id is required.')

  const existing = users.find((u) => u.id === id) || null
  const nextPassword =
    String(user?.password || '').trim() || String(existing?.password || '').trim() || 'password123'

  const nextUser = {
    ...user,
    id,
    role,
    accessRole,
    username: String(user?.username || '').trim().toLowerCase(),
    email: String(user?.email || '').trim().toLowerCase(),
    password: nextPassword,
  }

  const index = users.findIndex((u) => u.id === id)
  const nextUsers = index < 0 ? [nextUser, ...users] : users.map((u) => (u.id === id ? { ...u, ...nextUser } : u))
  localStorage.setItem(USERS_KEY, JSON.stringify(nextUsers))

  const sessionUser = readJson(SESSION_KEY, null)
  if (sessionUser && sessionUser.id === id) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(nextUsers.find((u) => u.id === id)))
  }

  return nextUsers.map(sanitizeUser)
}

export function adminDeleteUser(userId) {
  const users = getUsers()
  const id = String(userId || '').trim()
  if (!id) throw new Error('User id is required.')

  const nextUsers = users.filter((u) => u.id !== id)
  localStorage.setItem(USERS_KEY, JSON.stringify(nextUsers))

  const sessionUser = readJson(SESSION_KEY, null)
  if (sessionUser && sessionUser.id === id) {
    localStorage.removeItem(SESSION_KEY)
  }

  return nextUsers.map(sanitizeUser)
}

export async function logoutUser() {
  localStorage.removeItem(SESSION_KEY)
  localStorage.removeItem('supabase.auth.token')
  localStorage.removeItem('ee_pending_verification_email')
  try {
    const { error } = await supabase.auth.signOut()
    if (error) console.error('Logout error:', error)
  } catch {
    // Ignore if no Supabase session exists.
  }
}

export async function uploadAvatar(file) {
  const localSessionUser = readJson(SESSION_KEY, null)
  const { data: { session } } = await supabase.auth.getSession()
  if (!session && !localSessionUser) throw new Error('No active user session.')

  if (!session && localSessionUser) {
    const nextAvatar = URL.createObjectURL(file)
    const updatedUser = normalizeUser({ ...localSessionUser, avatarUrl: nextAvatar })
    localStorage.setItem(SESSION_KEY, JSON.stringify(updatedUser))
    const users = getUsers()
    const nextUsers = users.map((user) => (user.id === updatedUser.id ? { ...user, avatarUrl: nextAvatar } : user))
    localStorage.setItem(USERS_KEY, JSON.stringify(nextUsers))
    return updatedUser
  }

  const formData = new FormData()
  formData.append('avatar', file)

  const response = await fetch('/api/profile/upload-avatar', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${session.access_token}`
    },
    body: formData
  })

  const data = await readApiResponse(response)
  if (!response.ok) {
    throw new Error(data.error || 'Failed to upload avatar.')
  }

  return await getSessionUser()
}

export async function updateUserProfile(partial) {
  const localSessionUser = readJson(SESSION_KEY, null)
  const { data: { session } } = await supabase.auth.getSession()
  if (!session && !localSessionUser) throw new Error('No active user session.')

  if (!session && localSessionUser) {
    const nextUser = normalizeUser({ ...localSessionUser, ...partial })
    localStorage.setItem(SESSION_KEY, JSON.stringify(nextUser))

    const users = getUsers()
    const nextUsers = users.map((user) => (user.id === nextUser.id ? { ...user, ...partial } : user))
    localStorage.setItem(USERS_KEY, JSON.stringify(nextUsers))

    return nextUser
  }

  const { data: current } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single()

  const nextSexRaw = partial?.sex ?? partial?.gender ?? current?.sex ?? current?.gender ?? ''
  const nextSex = String(nextSexRaw || '').trim().toLowerCase()

  const obsKeys = ['lmp', 'gravidaPara', 'obstetricHistory', 'gynComplaints', 'contraceptionUse']
  if (nextSex === 'male') {
    const hasObsInPayload = obsKeys.some((k) => String(partial?.[k] || '').trim().length > 0)
    if (hasObsInPayload) {
      throw new Error('Obs & Gynae fields cannot be submitted for male patients.')
    }
  }

  // Update bio and title in Supabase user metadata
  if (partial.bio !== undefined || partial.title !== undefined) {
    const metaUpdates = {}
    if (partial.bio !== undefined) metaUpdates.bio = partial.bio
    if (partial.title !== undefined) metaUpdates.title = partial.title
    await supabase.auth.updateUser({ data: metaUpdates })
  }

  // Call the new Next.js API endpoint to update profiles and patients tables in Supabase
  const response = await fetch('/api/profile/update-kit', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`
    },
    body: JSON.stringify(partial)
  })

  const data = await readApiResponse(response)
  if (!response.ok) {
    throw new Error(data.error || 'Failed to update medical kit.')
  }

  const updatedUser = await getSessionUser()
  // Optimistically merge kit data into session so frontend updates immediately
  return { ...updatedUser, ...partial }
}

export async function resetUserPassword({ email, identifier, password, newPassword }) {
  const nextPassword = String(password || newPassword || '').trim()
  const rawTarget = String(email || identifier || '').trim().toLowerCase()

  if (!rawTarget) throw new Error('Enter the email on the account.')
  if (!nextPassword) throw new Error('Enter a new password.')

  if (!rawTarget.includes('@')) {
    throw new Error('Enter the email on the account.')
  }

  const response = await fetch('/api/auth/reset-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'reset_password',
      email: rawTarget,
      password: nextPassword,
      password_hash: nextPassword,
    }),
  })

  const data = await readApiResponse(response)

  if (!response.ok) {
    throw new Error(data.error || 'Failed to trigger password reset. Please try again.')
  }

  return true
}

function readJson(key, fallback) {
  const raw = localStorage.getItem(key)
  if (!raw) return fallback
  try {
    return JSON.parse(raw)
  } catch {
    return fallback
  }
}

function normalizeSignupDraft(draft) {
  return {
    email: String(draft?.email || '').trim().toLowerCase(),
    password: String(draft?.password || '').trim(),
    role: String(draft?.role || '').trim().toLowerCase(),
    fullName: String(draft?.fullName || draft?.full_name || '').trim(),
    username: String(draft?.username || '').trim().toLowerCase(),
    title: String(draft?.title || '').trim(),
    phone: String(draft?.phone || '').trim(),
    user_id: String(draft?.user_id || draft?.id || '').trim(),
    echo_id: String(draft?.echo_id || draft?.submission_key || '').trim(),
    verification_status: String(draft?.verification_status || 'pending').trim().toLowerCase(),
    email_verified: Boolean(draft?.email_verified),
    is_verified: Boolean(draft?.is_verified),
    verified_at: draft?.verified_at || null,
    verification_code: String(draft?.verification_code || '').trim(),
  }
}

function buildLocalSessionFromSignup(draft) {
  const baseId = draft.user_id || draft.echo_id || draft.email
  return normalizeUser({
    id: baseId,
    profile_id: baseId,
    email: draft.email,
    fullName: draft.fullName,
    role: draft.role,
    username: draft.username || draft.email,
    title: draft.title,
    phone: draft.phone,
    submission_key: draft.echo_id || '',
    echo_id: draft.echo_id || '',
    verification_status: draft.verification_status || 'verified',
    email_verified: true,
    is_verified: true,
    verified_at: draft.verified_at || new Date().toISOString(),
    authProvider: 'n8n',
    access_token: '',
    refresh_token: '',
  })
}

async function readApiResponse(response) {
  const text = await response.text()
  if (!text) return {}

  try {
    const parsed = JSON.parse(text)
    
    // Sanitize error messages to remove HTML
    if (parsed.error && typeof parsed.error === 'string') {
      if (parsed.error.includes('<') || parsed.error.includes('>')) {
        parsed.error = 'A server error occurred. Please try again.'
      }
    }
    
    return parsed
  } catch {
    return {
      error: response.ok
        ? 'The server returned an unreadable response.'
        : 'The server returned an unexpected error page. Please try again.',
    }
  }
}

function clearStoredSession() {
  localStorage.removeItem(SESSION_KEY)
  localStorage.removeItem('supabase.auth.token')
}

function findPendingSignupDraft(identifier, password) {
  const target = String(identifier || '').trim().toLowerCase()
  const secret = String(password || '').trim()
  if (!target || !secret) return null

  const drafts = readJson(PENDING_SIGNUPS_KEY, [])
  if (!Array.isArray(drafts) || !drafts.length) return null

  return drafts.find((draft) => {
    const draftEmail = String(draft?.email || '').trim().toLowerCase()
    const draftUsername = String(draft?.username || '').trim().toLowerCase()
    const draftPassword = String(draft?.password || '').trim()
    return draftPassword === secret && (draftEmail === target || draftUsername === target)
  }) || null
}

async function fetchProfileById(profileId) {
  if (!profileId) return null

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', profileId)
    .single()

  if (error) {
    const missingRow = error.code === 'PGRST116' || /not found|no rows/i.test(error.message || '')
    const missingTable = isMissingSupabaseProfileError(error)
    if (missingTable) {
      setProfileLookupDisabled()
    } else if (!missingRow) {
      console.error('Error validating stored session profile:', error)
    }
    return null
  }

  return data || null
}

function sanitizeUser(user) {
  const { password: _password, ...safeUser } = user
  return safeUser
}

function getFriendlyAuthError(message) {
  const text = String(message || '').toLowerCase()

  if (text.includes('jwt') || text.includes('signature') || text.includes('token')) {
    return 'We could not complete your sign-in securely. Please try again in a moment.'
  }

  if (text.includes('session')) {
    return 'We could not create your session right now. Please try again.'
  }

  return 'We could not sign you in right now. Please try again.'
}

function mergeDefaultUsers(existingUsers) {
  let changed = false
  const byId = new Map(existingUsers.map((user) => [user.id, user]))

  for (const defaultUser of defaultUsers) {
    const existing = byId.get(defaultUser.id)
    if (!existing) {
      byId.set(defaultUser.id, defaultUser)
      changed = true
      continue
    }

    const nextUser = { ...defaultUser, ...existing }
    if (JSON.stringify(nextUser) !== JSON.stringify(existing)) {
      byId.set(defaultUser.id, nextUser)
      changed = true
    }
  }

  return changed ? Array.from(byId.values()) : existingUsers
}

function normalizeStoredUsers(existingUsers) {
  if (!Array.isArray(existingUsers)) return defaultUsers

  let changed = false
  const normalizedUsers = existingUsers.map((user) => {
    const nextUser = {
      ...user,
      role: String(user?.role || '').trim(),
      username: String(user?.username || '').trim().toLowerCase(),
      email: String(user?.email || '').trim().toLowerCase(),
      title: String(user?.title || '').trim(),
    }

    if (JSON.stringify(nextUser) !== JSON.stringify(user)) {
      changed = true
    }

    return nextUser
  })

  return changed ? normalizedUsers : existingUsers
}

function isBrowser() {
  return typeof window !== 'undefined'
}

function isProfileLookupDisabled() {
  if (!isBrowser()) return false
  return window.localStorage.getItem(SUPABASE_PROFILE_LOOKUP_DISABLED_KEY) === '1'
}

function setProfileLookupDisabled() {
  if (!isBrowser()) return
  window.localStorage.setItem(SUPABASE_PROFILE_LOOKUP_DISABLED_KEY, '1')
}

function isMissingSupabaseProfileError(error) {
  const message = String(error?.message || '').toLowerCase()
  return error?.code === 'PGRST205' || error?.code === 'PGRST116' || message.includes('could not find the table') || message.includes('not found')
}
