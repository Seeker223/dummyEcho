import { supabase } from '../../../lib/supabase-admin'

const ENUMS = {
  gender: ["male", "female", "other", "prefer_not"],
  blood_group: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "I don't know"],
  genotype: ["AA", "AS", "SS", "AC", "SC", "I don't know"],
  language: ["English", "Yoruba", "Hausa", "Igbo", "Pidgin", "French", "Other"],
  marital_status: ["Single", "Married", "Divorced", "Widowed", "Separated"],
  religion: ["Christianity", "Islam", "Traditional", "Other", "None"],
  nationality: ["Nigerian", "Ghanaian", "Kenyan", "South African", "British", "American", "Other"],
  ec_relationship: ["Parent", "Sibling", "Spouse / Partner", "Child", "Friend", "Guardian", "Other"],
  admit: ["Yes", "No", "Not sure"],
  transfusion: ["Yes", "No", "Not sure"],
  mental_current: ["I feel fine", "A little low or anxious", "Quite low or anxious — it's affecting my life", "Very bad — I'm struggling a lot"],
  smoking: ["never", "former", "light", "moderate", "heavy"],
  alcohol: ["none", "occasional", "weekly", "daily_light", "daily_heavy"],
  diet: ["I eat everything — no restrictions", "I don't eat meat", "I don't eat meat or animal products", "I only eat Halal food", "I only eat Kosher food", "I avoid gluten (wheat, bread, etc.)", "Other / special diet"],
  exercise_freq: ["Mostly sitting — I don't exercise much", "I walk and move around but nothing intense", "I exercise a few times a week", "I exercise most days", "Very active — sports or hard training regularly"],
  occupation_cat: ["Healthcare (doctor, nurse, etc.)", "Teaching or education", "Farming or agriculture", "Building or construction", "Office or desk job", "Driving or transport", "Factory or industrial work", "I'm a student", "Retired", "Currently not working", "Other"],
  living_situation: ["I live alone", "With my partner", "With my family", "With housemates", "In a care home or assisted living", "I don't have a stable home right now"],
  pets: ["Yes", "No"],
  menstrual_regularity: ["Regular (comes around the same time each month)", "Irregular (comes at random times)", "Very infrequent or stopped", "I'm past menopause"],
  contraceptive_use: ["No", "Pills (taken by mouth daily)", "Coil / IUD (placed inside the womb)", "Implant (rod under the skin)", "Injection (every 3 months)", "Condoms or barrier method", "My tubes are tied (permanent)", "Other"],
  menopause: ["No, I still have periods", "My periods are becoming irregular (approaching menopause)", "Yes, they stopped (menopause)", "Not applicable"]
}

function sanitizeEnum(val, enumName) {
  if (!val) return null
  const clean = String(val).trim()
  const list = ENUMS[enumName]
  if (!list) return null
  
  // Exact match
  if (list.includes(clean)) return clean
  
  // Case-insensitive match
  const matched = list.find(x => x.toLowerCase() === clean.toLowerCase())
  if (matched) return matched

  // Custom fallback mappings
  if (enumName === 'diet') {
    if (clean.toLowerCase() === 'no specific diet' || clean.toLowerCase() === 'none') {
      return "I eat everything — no restrictions"
    }
  }
  
  return null
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const token = req.headers.authorization?.replace('Bearer ', '')?.trim()
  if (!token) {
    return res.status(401).json({ error: 'Missing token' })
  }

  // Resolve user session
  const { data: { user }, error: authError } = await supabase.auth.getUser(token)
  
  if (authError || !user) {
    console.error('getUser failed:', { token: token.substring(0, 10) + '...', authError })
    return res.status(401).json({ error: `Unauthorized: ${authError?.message || 'No user found'}.` })
  }

  // Fetch the user's base profile to get the submission_key and existing data
  const { data: profile, error: profileFetchError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (profileFetchError || !profile) {
    return res.status(404).json({ error: 'User profile not found' })
  }

  const body = req.body || {}

  // 1. Update basic fields on public.profiles if present in payload
  const profileUpdates = {}
  if (body.fullName || body.full_name) {
    profileUpdates.full_name = body.fullName || body.full_name
  }
  if (body.phone !== undefined) {
    profileUpdates.phone = body.phone
  }
  if (body.wallet_balance !== undefined) {
    profileUpdates.wallet_balance = body.wallet_balance
  }
  if (body.promo_balance !== undefined) {
    profileUpdates.promo_balance = body.promo_balance
  }
  if (body.is_subscribed !== undefined) {
    profileUpdates.is_subscribed = body.is_subscribed
  }

  if (Object.keys(profileUpdates).length > 0) {
    const { error: profileUpdateError } = await supabase
      .from('profiles')
      .update(profileUpdates)
      .eq('id', user.id)

    if (profileUpdateError) {
      return res.status(500).json({ error: 'Failed to update user profile: ' + profileUpdateError.message })
    }
  }

  // 2. Map payload to patients table columns and upsert it
  // Fetch existing patient row to get the submission_key if it exists
  const { data: patientRows, error: pFetchError } = await supabase
    .from('patients')
    .select('submission_key')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false })
  
  if (pFetchError) {
    console.error('Error fetching existing patient row:', pFetchError)
  }

  const submissionKey = (patientRows && patientRows.length > 0)
    ? patientRows[0].submission_key
    : `EE_${user.id.substring(0, 8)}`
  
  const patientUpdates = {
    user_id: user.id,
    submission_key: submissionKey,
    full_name: body.fullName || body.full_name || profile.full_name || null,
    dob: body.dob || null,
    gender: sanitizeEnum(body.gender || body.sex, 'gender'),
    blood_group: sanitizeEnum(body.bloodType || body.blood_group, 'blood_group'),
    genotype: sanitizeEnum(body.genotype, 'genotype'),
    language: sanitizeEnum(body.language, 'language'),
    marital_status: sanitizeEnum(body.maritalStatus || body.marital_status, 'marital_status'),
    religion: sanitizeEnum(body.religion, 'religion'),
    nationality: sanitizeEnum(body.nationality, 'nationality'),
    address: body.address || null,
    ec_name: body.emergencyName || body.ec_name || null,
    ec_relationship: sanitizeEnum(body.emergencyRelation || body.ec_relationship, 'ec_relationship'),
    ec_phone: body.emergencyPhone || body.ec_phone || null,
    ec_secondary: body.emergencyPhone2 || body.ec_secondary || null,
    conditions: Array.isArray(body.conditionsList) ? body.conditionsList : (Array.isArray(body.conditions) ? body.conditions : []),
    cond_other: body.conditionsOther || body.cond_other || null,
    surgeries: Array.isArray(body.surgeriesList) ? body.surgeriesList : (Array.isArray(body.surgeries) ? body.surgeries : []),
    surg_other: body.surgeriesOther || body.surg_other || null,
    drug_allergies: Array.isArray(body.drugAllergies) ? body.drugAllergies : [],
    food_allergies: Array.isArray(body.foodAllergies) ? body.foodAllergies : [],
    other_allergies: body.otherAllergies || body.other_allergies || null,
    rx_meds: Array.isArray(body.rxMeds) ? body.rxMeds : [],
    otc_meds: Array.isArray(body.otcMeds) ? body.otcMeds : [],
    herbal_meds: Array.isArray(body.herbalMeds) ? body.herbalMeds : [],
    meds_notes: body.medsNotes || body.meds_notes || null,
    admit: sanitizeEnum(body.admit, 'admit'),
    admit_details: body.admitDetails || body.admit_details || null,
    transfusion: sanitizeEnum(body.transfusion, 'transfusion'),
    transfusion_details: body.transfusionDetails || body.transfusion_details || null,
    immunisations: Array.isArray(body.vaccines) ? body.vaccines : (Array.isArray(body.immunisations) ? body.immunisations : []),
    imm_notes: body.vaccineNotes || body.imm_notes || null,
    mental_history: Array.isArray(body.mentalHistory) ? body.mentalHistory : [],
    mental_current: sanitizeEnum(body.mentalCurrent, 'mental_current'),
    cognitive: Array.isArray(body.cognitive) ? body.cognitive : [],
    mental_notes: body.mentalNotes || body.mental_notes || null,
    directives: Array.isArray(body.directives) ? body.directives : [],
    dir_notes: body.dirNotes || body.dir_notes || null,
    fam_history: Array.isArray(body.familyHistory) ? body.familyHistory : (Array.isArray(body.fam_history) ? body.fam_history : []),
    fam_history_notes: body.famHistoryNotes || body.fam_history_notes || null,
    assistive: Array.isArray(body.assistive) ? body.assistive : [],
    assistive_notes: body.assistiveNotes || body.assistive_notes || null,
    smoking: sanitizeEnum(body.smoking, 'smoking'),
    alcohol: sanitizeEnum(body.alcohol, 'alcohol'),
    substance_use: Array.isArray(body.substanceUse) ? body.substanceUse : (Array.isArray(body.substance_use) ? body.substance_use : []),
    substance_details: body.substanceDetails || body.substance_details || null,
    diet: sanitizeEnum(body.diet, 'diet'),
    exercise_freq: sanitizeEnum(body.exerciseFreq || body.exercise_freq, 'exercise_freq'),
    occupation_cat: sanitizeEnum(body.occupationCat || body.occupation_cat, 'occupation_cat'),
    living_situation: sanitizeEnum(body.livingSituation || body.living_situation, 'living_situation'),
    pets: sanitizeEnum(body.pets, 'pets'),
    pets_type: Array.isArray(body.petsType) ? body.petsType : (Array.isArray(body.pets_type) ? body.pets_type : []),
    pets_other: body.petsOther || body.pets_other || null,
    lifestyle_notes: body.lifestyleNotes || body.lifestyle_notes || null,
    gravida: typeof body.gravida === 'number' ? body.gravida : (parseInt(body.gravida, 10) || 0),
    para: typeof body.para === 'number' ? body.para : (parseInt(body.para, 10) || 0),
    miscarriages: typeof body.miscarriages === 'number' ? body.miscarriages : (parseInt(body.miscarriages, 10) || 0),
    pregnancy_complications: Array.isArray(body.pregnancyComplications) ? body.pregnancyComplications : (Array.isArray(body.pregnancy_complications) ? body.pregnancy_complications : []),
    last_menstrual_period: body.lmp || body.last_menstrual_period || null,
    menstrual_regularity: sanitizeEnum(body.menstrualRegularity || body.menstrual_regularity, 'menstrual_regularity'),
    contraceptive_use: sanitizeEnum(body.contraceptionUse || body.contraceptive_use, 'contraceptive_use'),
    menopause: sanitizeEnum(body.menopause, 'menopause'),
    obgyn_notes: body.obgynNotes || body.obgyn_notes || null,
    updated_at: new Date().toISOString(),
  }

  const { error: patientError } = await supabase
    .from('patients')
    .upsert(patientUpdates, { onConflict: 'submission_key' })

  if (patientError) {
    return res.status(500).json({ error: 'Failed to update patient medical kit: ' + patientError.message })
  }

  // 3. Update/upsert role-specific professional table
  const licNum = body.licenseNumber || body.license_number || body.license_id || body.licenseId || null
  const hosp = body.hospital || body.hospital_affiliation || body.hospitalAffiliation || null
  const expYears = body.years_of_experience || body.yearsOfExperience || body.experience || null
  const st = body.state || profile.state || null
  const spec = body.specialization || body.specialty || body.department || null

  const saveRoleRecord = async (table, updates, userId) => {
    const { data: existing } = await supabase.from(table).select('id').eq('user_id', userId).maybeSingle()
    if (existing) {
      const { error } = await supabase.from(table).update(updates).eq('id', existing.id)
      if (error) console.error(`Error updating ${table}:`, error)
    } else {
      const { error } = await supabase.from(table).insert([updates])
      if (error) {
        console.error(`Error inserting into ${table}:`, error)
        await supabase.from(table).update(updates).eq('user_id', userId)
      }
    }
  }

  if (profile.role === 'doctor') {
    const doctorUpdates = {
      user_id: user.id,
      submission_key: submissionKey,
      full_name: body.fullName || body.full_name || profile.full_name || null,
      phone_number: body.phone || body.phone_number || profile.phone || null,
      specialization: spec,
      license_number: licNum,
      license_id: licNum,
      hospital: hosp,
      hospital_affiliation: hosp,
      years_of_experience: expYears,
      state: st,
      updated_at: new Date().toISOString()
    }
    await saveRoleRecord('doctors', doctorUpdates, user.id)
  } else if (profile.role === 'nurse') {
    const nurseUpdates = {
      user_id: user.id,
      submission_key: submissionKey,
      full_name: body.fullName || body.full_name || profile.full_name || null,
      phone_number: body.phone || body.phone_number || profile.phone || null,
      specialization: spec,
      department: spec,
      license_number: licNum,
      license_id: licNum,
      hospital: hosp,
      hospital_affiliation: hosp,
      years_of_experience: expYears,
      state: st,
      updated_at: new Date().toISOString()
    }
    await saveRoleRecord('nurses', nurseUpdates, user.id)
  }

  return res.status(200).json({ success: true, message: 'Medical kit updated.' })
}
