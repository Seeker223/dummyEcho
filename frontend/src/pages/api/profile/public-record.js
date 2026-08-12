import { supabase } from '../../../lib/supabase-admin'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { key } = req.query
  if (!key) {
    return res.status(400).json({ error: 'Missing submission key' })
  }

  try {
    const { data: patient, error } = await supabase
      .from('patients')
      .select('*')
      .eq('submission_key', key)
      .single()

    if (error || !patient) {
      return res.status(404).json({ error: 'Emergency record not found' })
    }

    // Return all fields from the patients record mapped to camelCase
    const safeData = {
      fullName: patient.full_name,
      dob: patient.dob,
      gender: patient.gender,
      bloodType: patient.blood_group,
      genotype: patient.genotype,
      language: patient.language,
      maritalStatus: patient.marital_status,
      religion: patient.religion,
      nationality: patient.nationality,
      address: patient.address,

      emergencyName: patient.ec_name,
      emergencyRelation: patient.ec_relationship,
      emergencyPhone: patient.ec_phone,
      emergencyPhone2: patient.ec_secondary,

      conditions: patient.conditions || [],
      cond_other: patient.cond_other,
      surgeries: patient.surgeries || [],
      surg_other: patient.surg_other,
      drugAllergies: patient.drug_allergies || [],
      foodAllergies: patient.food_allergies || [],
      otherAllergies: patient.other_allergies,
      rxMeds: patient.rx_meds || [],
      otcMeds: patient.otc_meds || [],
      herbalMeds: patient.herbal_meds || [],
      medsNotes: patient.meds_notes,

      admit: patient.admit,
      admitDetails: patient.admit_details,
      transfusion: patient.transfusion,
      transfusionDetails: patient.transfusion_details,
      vaccines: patient.immunisations || [],
      vaccineNotes: patient.imm_notes,

      mentalHistory: patient.mental_history || [],
      mentalCurrent: patient.mental_current,
      cognitive: patient.cognitive || [],
      mentalNotes: patient.mental_notes,

      directives: patient.directives || [],
      dirNotes: patient.dir_notes,
      familyHistory: patient.fam_history || [],
      famHistoryNotes: patient.fam_history_notes,

      assistive: patient.assistive || [],
      assistiveNotes: patient.assistive_notes,

      smoking: patient.smoking,
      alcohol: patient.alcohol,
      substanceUse: patient.substance_use || [],
      substanceDetails: patient.substance_details,
      diet: patient.diet,
      exerciseFreq: patient.exercise_freq,
      occupationCat: patient.occupation_cat,
      livingSituation: patient.living_situation,
      pets: patient.pets,
      petsType: patient.pets_type || [],
      petsOther: patient.pets_other,
      lifestyleNotes: patient.lifestyle_notes,

      gravida: patient.gravida,
      para: patient.para,
      miscarriages: patient.miscarriages,
      pregnancyComplications: patient.pregnancy_complications || [],
      lmp: patient.last_menstrual_period,
      menstrualRegularity: patient.menstrual_regularity,
      contraceptionUse: patient.contraceptive_use,
      menopause: patient.menopause,
      obgynNotes: patient.obgyn_notes,

      submissionKey: patient.submission_key
    }

    return res.status(200).json({ success: true, record: safeData })
  } catch (err) {
    console.error('Error fetching public record:', err)
    return res.status(500).json({ error: 'Internal server error: ' + err.message })
  }
}
