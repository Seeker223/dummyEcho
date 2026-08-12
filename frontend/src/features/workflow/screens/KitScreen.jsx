import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import { useAuth } from '../../auth/context/useAuth'
import { useAppState } from '../../../app/context/useAppState'
import { Button, Card, CurvedHeader, FieldLabel, Screen, SelectField, TextField } from './ScreenPrimitives'
import { InPageMenuButton } from '../components/InPageMenuButton'

const HeaderRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 8px;
`

const KitCard = styled(Card)`
  background: ${({ theme }) =>
    theme?.mode === 'dark'
      ? 'linear-gradient(180deg, rgba(9,17,31,1) 0%, rgba(15,23,42,1) 100%)'
      : theme?.colors?.surface || '#ffffff'};
  color: ${({ theme }) => (theme?.mode === 'dark' ? '#eaf2ff' : theme?.colors?.text || '#111827')};
  border-color: ${({ theme }) =>
    theme?.mode === 'dark' ? 'rgba(239, 68, 68, 0.18)' : theme?.colors?.border || '#e5e7eb'};
  box-shadow: ${({ theme }) => theme?.shadow?.elevated || '0 20px 48px rgba(15, 31, 68, 0.18)'};
`

const TopRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
`

const BackMini = styled.button`
  width: 40px;
  height: 40px;
  border-radius: 999px;
  border: 1px solid ${({ theme }) => (theme?.mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : theme?.colors?.border || '#e5e7eb')};
  background: ${({ theme }) => (theme?.mode === 'dark' ? 'rgba(255, 255, 255, 0.06)' : theme?.colors?.surface || '#ffffff')};
  color: ${({ theme }) => (theme?.mode === 'dark' ? 'rgba(234, 242, 255, 0.9)' : theme?.colors?.text || '#111827')};
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 900;
`

const TopMeta = styled.div`
  color: ${({ theme }) => (theme?.mode === 'dark' ? 'rgba(234, 242, 255, 0.72)' : theme?.colors?.muted || '#6b7280')};
  font-weight: 800;
  font-size: clamp(0.85rem, 3vw, 0.95rem);
`

const Grid = styled.div`
  display: grid;
  gap: 12px;

  @media (min-width: 520px) {
    grid-template-columns: 1fr 1fr;
  }
`

const Actions = styled.div`
  display: grid;
  gap: 10px;
  margin-top: 14px;
`

const Section = styled.section`
  margin-top: 12px;
  border-radius: 16px;
  border: 1px solid ${({ theme }) => (theme?.mode === 'dark' ? 'rgba(255,255,255,0.10)' : theme?.colors?.border || '#e5e7eb')};
  overflow: hidden;
  background: ${({ theme }) => (theme?.mode === 'dark' ? 'rgba(255,255,255,0.02)' : theme?.colors?.surface || '#ffffff')};
`

const SectionHeader = styled.button`
  width: 100%;
  border: 0;
  cursor: pointer;
  padding: 12px 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  background: ${({ theme }) =>
    theme?.mode === 'dark' ? 'rgba(255,255,255,0.04)' : theme?.colors?.surfaceAlt || 'rgba(15,23,42,0.03)'};
  color: ${({ theme }) => (theme?.mode === 'dark' ? '#fff' : theme?.colors?.text || '#111827')};
`

const SectionTitle = styled.div`
  font-weight: 1000;
  letter-spacing: -0.02em;
  text-align: left;
  font-size: clamp(0.95rem, 3.5vw, 1.15rem);
`

const Chevron = styled.span`
  color: ${({ theme }) => (theme?.mode === 'dark' ? 'rgba(234,242,255,0.7)' : theme?.colors?.muted || '#6b7280')};
  font-weight: 1000;
  transform: ${({ $open }) => ($open ? 'rotate(0deg)' : 'rotate(-90deg)')};
  transition: transform 160ms ease;
`

const SectionBody = styled.div`
  padding: 14px;
  display: ${({ $open }) => ($open ? 'block' : 'none')};
`

const SelectorRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`

const SelectPill = styled.button`
  border-radius: 10px;
  border: 1px solid ${({ theme }) => (theme?.mode === 'dark' ? 'rgba(255, 255, 255, 0.14)' : theme?.colors?.border || '#e5e7eb')};
  background: ${({ theme }) => (theme?.mode === 'dark' ? 'rgba(255, 255, 255, 0.04)' : theme?.colors?.surface || '#ffffff')};
  color: ${({ theme }) => (theme?.mode === 'dark' ? 'rgba(234, 242, 255, 0.9)' : theme?.colors?.text || '#111827')};
  padding: clamp(6px, 1.5vw, 8px) clamp(8px, 2vw, 10px);
  font-size: clamp(0.75rem, 2.5vw, 0.9rem);
  min-height: 34px;
  font-weight: 900;
  cursor: pointer;
  transition: transform 120ms ease, background 120ms ease, border-color 120ms ease;

  ${({ $selected }) =>
    $selected
      ? `
    border-color: rgba(239, 68, 68, 0.55);
    background: rgba(239, 68, 68, 0.14);
    color: #fff;
  `
      : ''}

  @media (hover: hover) {
    &:hover {
      transform: translateY(-1px);
      border-color: rgba(239, 68, 68, 0.38);
      background: ${({ theme }) => (theme?.mode === 'dark' ? 'rgba(239, 68, 68, 0.08)' : 'rgba(220, 38, 38, 0.06)')};
    }
  }
`

const TagWrap = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
`

const Hint = styled.div`
  color: ${({ theme }) => (theme?.mode === 'dark' ? 'rgba(234,242,255,0.7)' : theme?.colors?.muted || '#6b7280')};
  font-weight: 650;
  font-size: 0.9rem;
  margin-top: 4px;
`

const ChipRow = styled.div`
  margin-top: 8px;
  border-radius: 14px;
  border: 1px solid ${({ theme }) => (theme?.mode === 'dark' ? 'rgba(255,255,255,0.14)' : theme?.colors?.border || '#e5e7eb')};
  background: ${({ theme }) => (theme?.mode === 'dark' ? 'rgba(255,255,255,0.04)' : theme?.colors?.surface || '#fff')};
  padding: 10px 10px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
`

const Chip = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border-radius: 999px;
  padding: 6px 10px;
  font-weight: 900;
  border: 1px solid rgba(239, 68, 68, 0.22);
  background: rgba(239, 68, 68, 0.10);
  color: ${({ theme }) => (theme?.mode === 'dark' ? '#fff' : theme?.colors?.text || '#111827')};
`

const ChipDel = styled.button`
  border: 0;
  background: transparent;
  cursor: pointer;
  color: ${({ theme }) => (theme?.mode === 'dark' ? 'rgba(254,202,202,0.9)' : '#dc2626')};
  font-weight: 1000;
`

const ChipInput = styled.input`
  flex: 1 1 180px;
  border: 0;
  outline: none;
  background: transparent;
  color: inherit;
  font-weight: 750;
  min-height: 30px;
`

const Sugg = styled.div`
  margin-top: 8px;
  border-radius: 14px;
  border: 1px solid ${({ theme }) => (theme?.mode === 'dark' ? 'rgba(255,255,255,0.12)' : theme?.colors?.border || '#e5e7eb')};
  background: ${({ theme }) => (theme?.mode === 'dark' ? 'rgba(2,6,23,0.65)' : theme?.colors?.surface || '#fff')};
  overflow: hidden;
`

const SuggItem = styled.button`
  width: 100%;
  border: 0;
  background: transparent;
  padding: 10px 12px;
  cursor: pointer;
  text-align: left;
  color: inherit;
  font-weight: 800;

  @media (hover: hover) {
    &:hover {
      background: ${({ theme }) => (theme?.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.04)')};
    }
  }
`

const Notice = styled.div`
  margin-bottom: 10px;
  font-weight: 850;
  color: ${({ theme, $tone }) => {
    if ($tone === 'ok') return theme?.mode === 'dark' ? '#22c55e' : '#166534'
    return theme?.mode === 'dark' ? 'rgba(254,202,202,0.95)' : '#b91c1c'
  }};
`

const StepperContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 12px 0 28px;
  position: relative;
  padding: 0 10px;

  &::before {
    content: '';
    position: absolute;
    top: 20px;
    left: 20px;
    right: 20px;
    height: 3px;
    background: ${({ theme }) => theme?.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.06)'};
    z-index: 1;
  }
`

const StepperProgress = styled.div`
  position: absolute;
  top: 20px;
  left: 20px;
  width: ${({ $progress }) => $progress}%;
  height: 3px;
  background: ${({ theme }) => theme?.colors?.primary || '#dc2626'};
  z-index: 2;
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
`

const StepNode = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  background: none;
  border: none;
  cursor: pointer;
  z-index: 3;
  width: 42px;
  position: relative;
  padding: 0;
`

const StepCircle = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 15px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);

  ${({ $active, $completed, theme }) => {
    if ($active) return `
      background: ${theme?.colors?.primary || '#dc2626'};
      color: #fff;
      border: 2px solid ${theme?.colors?.primary || '#dc2626'};
      transform: scale(1.1);
      box-shadow: 0 0 14px ${(theme && theme.colors && theme.colors.glowRed) || 'rgba(220, 38, 38, 0.4)'};
    `
    if ($completed) return `
      background: ${theme?.mode === 'dark' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(34, 197, 94, 0.12)'};
      color: ${theme?.mode === 'dark' ? '#4ade80' : '#15803d'};
      border: 2px solid #22c55e;
    `
    return `
      background: ${theme?.mode === 'dark' ? '#0f172a' : '#ffffff'};
      color: ${theme?.mode === 'dark' ? 'rgba(255,255,255,0.4)' : '#64748b'};
      border: 2px solid ${theme?.mode === 'dark' ? 'rgba(255,255,255,0.1)' : '#e2e8f0'};
    `
  }}
`

const StepLabel = styled.div`
  font-size: 10px;
  font-weight: 800;
  margin-top: 8px;
  text-align: center;
  white-space: nowrap;
  position: absolute;
  top: 42px;
  transition: color 0.3s ease;
  letter-spacing: -0.01em;

  ${({ $active, $completed, theme }) => {
    if ($active) return `
      color: ${theme?.mode === 'dark' ? '#eaf2ff' : '#0f172a'};
      font-weight: 900;
    `
    if ($completed) return `
      color: ${theme?.mode === 'dark' ? '#22c55e' : '#166534'};
    `
    return `
      color: ${theme?.mode === 'dark' ? 'rgba(255,255,255,0.4)' : '#64748b'};
    `
  }}

  @media (max-width: 600px) {
    display: none;
  }
`

const NavigationRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-top: 24px;
  border-top: 1px solid ${({ theme }) => theme?.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.06)'};
  padding-top: 20px;
`

function digitsOnly(input) {
  return String(input || '').replace(/[^\d+]/g, '')
}

function uniq(arr) {
  const items = Array.isArray(arr) ? arr.map((x) => String(x || '').trim()).filter(Boolean) : []
  return [...new Set(items)]
}

export default function KitScreen() {
  const { currentUser } = useAuth()
  const careerRole = String(currentUser?.role || '').trim().toLowerCase()

  return <PatientKitScreen />
}

function PatientKitScreen() {
  const { currentUser, updateProfile } = useAuth()
  const navigate = useNavigate()

  const kit = useMemo(
    () => ({
      fullName: currentUser?.fullName || currentUser?.name || '',
      dob: currentUser?.dob || '',
      sex: currentUser?.sex || currentUser?.gender || '',
      bloodType: currentUser?.bloodType || '',
      genotype: currentUser?.genotype || '',
      language: currentUser?.language || '',
      maritalStatus: currentUser?.maritalStatus || '',
      religion: currentUser?.religion || '',
      nationality: currentUser?.nationality || '',
      address: currentUser?.address || '',

      emergencyName: currentUser?.emergencyName || currentUser?.ecName || '',
      emergencyPhone: currentUser?.emergencyPhone || currentUser?.ecPhone || '',
      emergencyPhone2: currentUser?.emergencyPhone2 || currentUser?.ecSecondary || '',
      emergencyRelation: currentUser?.emergencyRelation || currentUser?.ecRelationship || '',

      conditions: Array.isArray(currentUser?.conditionsList) ? currentUser.conditionsList : [],
      conditionsOther: currentUser?.conditionsOther || '',

      surgeries: Array.isArray(currentUser?.surgeriesList) ? currentUser.surgeriesList : [],
      surgeriesOther: currentUser?.surgeriesOther || '',

      drugAllergies: Array.isArray(currentUser?.drugAllergies) ? currentUser.drugAllergies : [],
      foodAllergies: Array.isArray(currentUser?.foodAllergies) ? currentUser.foodAllergies : [],
      otherAllergies: currentUser?.otherAllergies || '',

      rxMeds: Array.isArray(currentUser?.rxMeds) ? currentUser.rxMeds : [],
      otcMeds: Array.isArray(currentUser?.otcMeds) ? currentUser.otcMeds : [],
      herbalMeds: Array.isArray(currentUser?.herbalMeds) ? currentUser.herbalMeds : [],
      medsNotes: currentUser?.medsNotes || '',

      admit: currentUser?.admit || '',
      admitDetails: currentUser?.admitDetails || '',
      transfusion: currentUser?.transfusion || '',
      transfusionDetails: currentUser?.transfusionDetails || '',

      vaccines: Array.isArray(currentUser?.vaccines) ? currentUser.vaccines : [],
      vaccineNotes: currentUser?.vaccineNotes || '',

      mentalHistory: Array.isArray(currentUser?.mentalHistory) ? currentUser.mentalHistory : [],
      mentalCurrent: currentUser?.mentalCurrent || '',
      cognitive: Array.isArray(currentUser?.cognitive) ? currentUser.cognitive : [],
      mentalNotes: currentUser?.mentalNotes || '',

      directives: Array.isArray(currentUser?.directives) ? currentUser.directives : [],
      dirNotes: currentUser?.dirNotes || '',

      familyHistory: Array.isArray(currentUser?.familyHistory) ? currentUser.familyHistory : [],
      famHistoryNotes: currentUser?.famHistoryNotes || '',

      assistive: Array.isArray(currentUser?.assistive) ? currentUser.assistive : [],
      assistiveNotes: currentUser?.assistiveNotes || '',

      smoking: currentUser?.smoking || '',
      alcohol: currentUser?.alcohol || '',
      substanceUse: Array.isArray(currentUser?.substanceUse) ? currentUser.substanceUse : [],
      substanceDetails: currentUser?.substanceDetails || '',
      diet: currentUser?.diet || '',
      exerciseFreq: currentUser?.exerciseFreq || '',
      occupationCat: currentUser?.occupationCat || '',
      livingSituation: currentUser?.livingSituation || '',
      pets: currentUser?.pets || '',
      petsType: Array.isArray(currentUser?.petsType) ? currentUser.petsType : [],
      petsOther: currentUser?.petsOther || '',
      lifestyleNotes: currentUser?.lifestyleNotes || '',

      gravida: Number.isFinite(Number(currentUser?.gravida)) ? Number(currentUser?.gravida) : 0,
      para: Number.isFinite(Number(currentUser?.para)) ? Number(currentUser?.para) : 0,
      miscarriages: Number.isFinite(Number(currentUser?.miscarriages)) ? Number(currentUser?.miscarriages) : 0,
      pregnancyComplications: Array.isArray(currentUser?.pregnancyComplications) ? currentUser.pregnancyComplications : [],
      lmp: currentUser?.lmp || '',
      menstrualRegularity: currentUser?.menstrualRegularity || '',
      contraceptionUse: currentUser?.contraceptionUse || '',
      menopause: currentUser?.menopause || '',
      obgynNotes: currentUser?.obgynNotes || '',
    }),
    [currentUser],
  )

  const { kitStep, setKitStep } = useAppState()
  const step = kitStep || 1
  const setStep = setKitStep
  const [draft, setDraft] = useState(kit)
  const [saving, setSaving] = useState(false)
  const [notice, setNotice] = useState(null) // { tone: 'ok' | 'error', text }

  const sexOptions = useMemo(() => ['male', 'female', 'other', 'prefer_not'], [])
  const langOptions = useMemo(() => ['English', 'Yoruba', 'Hausa', 'Igbo', 'Pidgin', 'French', 'Other'], [])
  const maritalOptions = useMemo(() => ['Single', 'Married', 'Divorced', 'Widowed', 'Separated'], [])
  const religionOptions = useMemo(() => ['Christianity', 'Islam', 'Traditional', 'Other', 'None'], [])
  const countryOptions = useMemo(() => ['Nigerian', 'Ghanaian', 'Kenyan', 'South African', 'British', 'American', 'Other'], [])
  const smokingOptions = useMemo(() => ['never', 'former', 'light', 'moderate', 'heavy'], [])
  const alcoholOptions = useMemo(() => ['none', 'occasional', 'weekly', 'daily_light', 'daily_heavy'], [])
  const dietOptions = useMemo(() => [
    'I eat everything — no restrictions',
    "I don't eat meat",
    "I don't eat meat or animal products",
    'I only eat Halal food',
    'I only eat Kosher food',
    'I avoid gluten (wheat, bread, etc.)',
    'Other / special diet'
  ], [])
  const exerciseOptions = useMemo(() => [
    "Mostly sitting — I don't exercise much",
    'I walk and move around but nothing intense',
    'I exercise a few times a week',
    'I exercise most days',
    'Very active — sports or hard training regularly'
  ], [])
  const regularityOptions = useMemo(() => [
    'Regular (comes around the same time each month)',
    'Irregular (comes at random times)',
    'Very infrequent or stopped',
    "I'm past menopause"
  ], [])
  const contraceptionOptions = useMemo(() => [
    'No',
    'Pills (taken by mouth daily)',
    'Coil / IUD (placed inside the womb)',
    'Implant (rod under the skin)',
    'Injection (every 3 months)',
    'Condoms or barrier method',
    'My tubes are tied (permanent)',
    'Other'
  ], [])
  const menopauseOptions = useMemo(() => [
    'No, I still have periods',
    'My periods are becoming irregular (approaching menopause)',
    'Yes, they stopped (menopause)',
    'Not applicable'
  ], [])
  const livingOptions = useMemo(() => [
    'I live alone',
    'With my partner',
    'With my family',
    'With housemates',
    'In a care home or assisted living',
    "I don't have a stable home right now"
  ], [])
  const occupationOptions = useMemo(() => [
    'Healthcare (doctor, nurse, etc.)',
    'Teaching or education',
    'Farming or agriculture',
    'Building or construction',
    'Office or desk job',
    'Driving or transport',
    'Factory or industrial work',
    "I'm a student",
    'Retired',
    'Currently not working',
    'Other'
  ], [])
  const relationshipOptions = useMemo(() => [
    'Parent',
    'Sibling',
    'Spouse / Partner',
    'Child',
    'Friend',
    'Guardian',
    'Other'
  ], [])

  const comboRefs = useRef({
    drugAll: { q: '', open: false },
    foodAll: { q: '', open: false },
    rxMeds: { q: '', open: false },
    otcMeds: { q: '', open: false },
    herbalMeds: { q: '', open: false },
  })

  useEffect(() => {
    const sex = String(draft.sex || '').trim().toLowerCase()
    if (sex !== 'male') return
    if (!draft.lmp && !draft.contraceptionUse && !draft.obgynNotes) return
    setDraft((s) => ({
      ...s,
      lmp: '',
      contraceptionUse: '',
      obgynNotes: '',
      gravida: 0,
      para: 0,
      miscarriages: 0,
      pregnancyComplications: [],
      menstrualRegularity: '',
      menopause: '',
    }))
  }, [draft.contraceptionUse, draft.lmp, draft.obgynNotes, draft.sex])

  const bloodOptions = useMemo(() => ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'], [])
  const genoOptions = useMemo(() => ['AA', 'AS', 'SS', 'AC', 'SC', "I don't know"], [])

  const conditionOptions = useMemo(
    () => [
      'High blood pressure',
      'Diabetes (sugar disease)',
      'Asthma (breathing problem)',
      'Epilepsy (seizures / fits)',
      'Sickle cell disease',
      'Heart disease',
      'Kidney disease',
      'Liver disease',
      'Cancer',
      'Tuberculosis (TB)',
      'HIV / AIDS',
      'Thyroid problem',
      'Autoimmune disease (where the body attacks itself)',
      'Brain or nerve condition',
      'Mental health condition',
      'None of these',
    ],
    [],
  )

  const surgeryOptions = useMemo(
    () => [
      'Appendix removed',
      'Hernia repair',
      'Caesarean section (C-section)',
      'Bone or joint surgery',
      'Heart surgery',
      'Brain surgery',
      'Ear, nose or throat surgery',
      'Eye surgery',
      'Stomach or bowel surgery',
      'Womb removed',
      'Gallbladder removed',
      "I've never had an operation",
    ],
    [],
  )

  const vaccineOptions = useMemo(
    () => [
      'Tetanus (lockjaw)',
      'Hepatitis B',
      'Hepatitis A',
      'Yellow fever',
      'COVID-19',
      'Polio',
      'Measles',
      'HPV (cervical cancer vaccine)',
      'Chickenpox',
      'Flu (influenza)',
      'Meningitis',
      'Typhoid',
      "I'm not sure",
    ],
    [],
  )

  const mentalHistoryOptions = useMemo(
    () => [
      'Depression (persistent sadness)',
      'Anxiety (constant worry or panic)',
      'Bipolar disorder (extreme mood swings)',
      'Schizophrenia',
      'PTSD (trauma)',
      'ADHD (difficulty focusing)',
      'OCD',
      'Eating disorder',
      'None of these',
    ],
    [],
  )

  const cognitiveOptions = useMemo(
    () => ['Forgetting things more than usual', 'Difficulty concentrating', 'Dementia (memory loss getting worse over time)', 'None of these'],
    [],
  )

  const directivesOptions = useMemo(
    () => [
      'I do NOT want to be resuscitated if my heart stops (DNR)',
      'I agree to donate my organs',
      'I do NOT want to receive blood transfusions',
      'I have special dietary needs',
      'I have cultural or religious preferences for my care',
      'I have a written care plan with my doctor',
    ],
    [],
  )

  const familyHistoryOptions = useMemo(
    () => [
      'High blood pressure',
      'Diabetes',
      'Heart disease',
      'Stroke',
      'Cancer',
      'Sickle cell',
      'Haemophilia (bleeding disorder)',
      'Mental health problems',
      'A genetic / inherited condition',
      'None that I know of',
    ],
    [],
  )

  const assistiveOptions = useMemo(
    () => [
      'Wheelchair',
      'Hearing aid',
      'Pacemaker (heart device)',
      'Insulin pump',
      'Cochlear implant (hearing device inside ear)',
      'Oxygen machine or breathing support at home',
      'Artificial limb',
      'Glasses or contact lenses',
      'None',
    ],
    [],
  )

  const substanceOptions = useMemo(
    () => [
      'Cannabis (weed)',
      'Cigarettes / tobacco',
      'Shisha / hookah',
      'Cocaine',
      'Strong painkillers (not prescribed)',
      'Khat (miraa)',
      'Sleeping pills (not prescribed)',
      'Alcohol (heavily)',
      'None of these',
    ],
    [],
  )

  const petsOptions = useMemo(() => ['Dog', 'Cat', 'Bird', 'Reptile', 'Rodent', 'Farm animals'], [])

  const pregnancyCompOptions = useMemo(
    () => [
      'High blood pressure during pregnancy',
      'Diabetes during pregnancy',
      'Heavy bleeding',
      'Baby came early (premature)',
      'Baby was in wrong position',
      'I needed a blood transfusion after delivery',
      'No problems',
    ],
    [],
  )

  const comboData = useMemo(
    () => ({
      drugAll: [
        'Penicillin',
        'Amoxicillin',
        'Ibuprofen',
        'Aspirin',
        'Codeine',
        'Metformin',
        'Warfarin',
        'Sulfonamides',
        'Contrast dye (used in scans)',
        'Latex (rubber gloves)',
      ],
      foodAll: ['Peanuts', 'Tree nuts', 'Milk / Dairy', 'Eggs', 'Wheat / Bread / Gluten', 'Shellfish (prawns, crab)', 'Fish', 'Soy', 'Sesame'],
      rxMeds: [
        'Metformin',
        'Amlodipine',
        'Lisinopril',
        'Atorvastatin',
        'Furosemide',
        'Levothyroxine',
        'Omeprazole',
        'Metoprolol',
        'Aspirin 75mg',
        'Insulin',
        'Artemether-Lumefantrine (malaria)',
        'Cotrimoxazole',
      ],
      otcMeds: ['Paracetamol', 'Ibuprofen', 'Loratadine (allergy tablet)', 'Antacid', 'Oral rehydration salts', 'Multivitamins', 'Vitamin C', 'Zinc'],
      herbalMeds: ['Moringa', 'Ginger', 'Turmeric', 'Aloe vera', 'Black seed (Nigella)', 'Bitter leaf', 'Scent leaf', 'Garlic supplements'],
    }),
    [],
  )



  const toggleFromList = useCallback((arr, value) => {
    const v = String(value || '').trim()
    if (!v) return arr
    const list = uniq(arr)
    if (list.includes(v)) return list.filter((x) => x !== v)
    return [...list, v]
  }, [])

  const removeChip = useCallback((key, value) => {
    setDraft((p) => ({ ...p, [key]: (p[key] || []).filter((x) => x !== value) }))
  }, [])

  const upsertChip = useCallback((key, value) => {
    const v = String(value || '').trim()
    if (!v) return
    setDraft((p) => ({ ...p, [key]: uniq([...(p[key] || []), v]) }))
  }, [])

  const forceRerender = useCallback(() => setDraft((p) => ({ ...p })), [])

  const onSave = useCallback(
    async ({ goLive = false } = {}) => {
      setNotice(null)
      setSaving(true)

      try {
        const sex = String(draft.sex || '').trim().toLowerCase()
        const cleaned = { ...draft, sex, gender: sex }

        const conditionsText = uniq(cleaned.conditions).join(', ')
        const surgeriesText = uniq(cleaned.surgeries).join(', ')
        const allergiesText = [uniq(cleaned.drugAllergies).join(', '), uniq(cleaned.foodAllergies).join(', '), String(cleaned.otherAllergies || '').trim()]
          .filter(Boolean)
          .join(' | ')
        const medsText = [uniq(cleaned.rxMeds).join(', '), uniq(cleaned.otcMeds).join(', '), uniq(cleaned.herbalMeds).join(', ')].filter(Boolean).join(' | ')

        const pastMedicalHistory = [conditionsText, String(cleaned.conditionsOther || '').trim()].filter(Boolean).join(' | ')
        const surgicalHistory = [surgeriesText, String(cleaned.surgeriesOther || '').trim()].filter(Boolean).join(' | ')

        const gravidaPara = `G${Number(cleaned.gravida || 0)} P${Number(cleaned.para || 0)} M${Number(cleaned.miscarriages || 0)}`
        const obstetricHistory = uniq(cleaned.pregnancyComplications).join(', ')
        const gynComplaints = String(cleaned.obgynNotes || '').trim()

        const payload = {
          fullName: String(cleaned.fullName || '').trim(),
          dob: String(cleaned.dob || '').trim(),
          sex: cleaned.sex,
          gender: cleaned.gender,
          bloodType: String(cleaned.bloodType || '').trim(),
          genotype: String(cleaned.genotype || '').trim(),
          language: String(cleaned.language || '').trim(),
          maritalStatus: String(cleaned.maritalStatus || '').trim(),
          religion: String(cleaned.religion || '').trim(),
          nationality: String(cleaned.nationality || '').trim(),
          address: String(cleaned.address || '').trim(),

          emergencyName: String(cleaned.emergencyName || '').trim(),
          emergencyRelation: String(cleaned.emergencyRelation || '').trim(),
          emergencyPhone: digitsOnly(cleaned.emergencyPhone),
          emergencyPhone2: digitsOnly(cleaned.emergencyPhone2),

          conditionsList: uniq(cleaned.conditions),
          conditionsOther: String(cleaned.conditionsOther || '').trim(),
          surgeriesList: uniq(cleaned.surgeries),
          surgeriesOther: String(cleaned.surgeriesOther || '').trim(),
          drugAllergies: uniq(cleaned.drugAllergies),
          foodAllergies: uniq(cleaned.foodAllergies),
          otherAllergies: String(cleaned.otherAllergies || '').trim(),
          rxMeds: uniq(cleaned.rxMeds),
          otcMeds: uniq(cleaned.otcMeds),
          herbalMeds: uniq(cleaned.herbalMeds),
          medsNotes: String(cleaned.medsNotes || '').trim(),

          admit: String(cleaned.admit || '').trim(),
          admitDetails: String(cleaned.admitDetails || '').trim(),
          transfusion: String(cleaned.transfusion || '').trim(),
          transfusionDetails: String(cleaned.transfusionDetails || '').trim(),

          vaccines: uniq(cleaned.vaccines),
          vaccineNotes: String(cleaned.vaccineNotes || '').trim(),

          mentalHistory: uniq(cleaned.mentalHistory),
          mentalCurrent: String(cleaned.mentalCurrent || '').trim(),
          cognitive: uniq(cleaned.cognitive),
          mentalNotes: String(cleaned.mentalNotes || '').trim(),

          directives: uniq(cleaned.directives),
          dirNotes: String(cleaned.dirNotes || '').trim(),
          familyHistory: uniq(cleaned.familyHistory),
          famHistoryNotes: String(cleaned.famHistoryNotes || '').trim(),

          assistive: uniq(cleaned.assistive),
          assistiveNotes: String(cleaned.assistiveNotes || '').trim(),

          smoking: String(cleaned.smoking || '').trim(),
          alcohol: String(cleaned.alcohol || '').trim(),
          substanceUse: uniq(cleaned.substanceUse),
          substanceDetails: String(cleaned.substanceDetails || '').trim(),
          diet: String(cleaned.diet || '').trim(),
          exerciseFreq: String(cleaned.exerciseFreq || '').trim(),
          occupationCat: String(cleaned.occupationCat || '').trim(),
          livingSituation: String(cleaned.livingSituation || '').trim(),
          pets: String(cleaned.pets || '').trim(),
          petsType: uniq(cleaned.petsType),
          petsOther: String(cleaned.petsOther || '').trim(),
          lifestyleNotes: String(cleaned.lifestyleNotes || '').trim(),

          allergies: allergiesText,
          pastMedicalHistory,
          surgicalHistory,
          currentMedications: medsText,

          lmp: String(cleaned.lmp || '').trim(),
          gravidaPara,
          obstetricHistory,
          gynComplaints,
          contraceptionUse: String(cleaned.contraceptionUse || '').trim(),
        }

        if (sex === 'male') {
          payload.lmp = ''
          payload.gravidaPara = ''
          payload.obstetricHistory = ''
          payload.gynComplaints = ''
          payload.contraceptionUse = ''
        }

        await updateProfile(payload)
        setNotice({ tone: 'ok', text: 'Saved. Your medical kit has been updated.' })
        if (goLive) {
          try { showAssistant({ title: 'EchoAI Triage', message: 'Live sessions require AI triage first.', avatar: 'nurse', durationMs: 4000 }) } catch {}
          navigate('/app/voice-ai')
        }
      } catch (err) {
        setNotice({ tone: 'error', text: err?.message ? String(err.message) : 'Could not save.' })
      } finally {
        setSaving(false)
      }
    },
    [draft, navigate, updateProfile],
  )

  const renderCombo = (id, label, keyName) => {
    const state = comboRefs.current[id]
    const list = draft[keyName] || []
    const q = state.q || ''
    const openSugg = state.open && q.trim().length > 0
    const suggestions = comboData[id]
      .filter((x) => x.toLowerCase().includes(q.toLowerCase()) && !list.includes(x))
      .slice(0, 7)

    return (
      <div>
        <FieldLabel>{label}</FieldLabel>
        <Hint>Type and press Enter to add.</Hint>
        <ChipRow>
          {list.map((v) => (
            <Chip key={v}>
              {v}
              <ChipDel type="button" aria-label={`Remove ${v}`} onClick={() => removeChip(keyName, v)}>
                ×
              </ChipDel>
            </Chip>
          ))}
          <ChipInput
            placeholder="Type…"
            value={q}
            onChange={(e) => {
              state.q = e.target.value
              state.open = true
              forceRerender()
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ',') {
                e.preventDefault()
                const next = state.q
                state.q = ''
                state.open = false
                upsertChip(keyName, next)
                forceRerender()
              }
              if (e.key === 'Backspace' && !state.q && list.length) {
                const last = list[list.length - 1]
                removeChip(keyName, last)
              }
            }}
            onFocus={() => {
              state.open = true
              forceRerender()
            }}
            onBlur={() => {
              window.setTimeout(() => {
                state.open = false
                forceRerender()
              }, 120)
            }}
          />
        </ChipRow>

        {openSugg && suggestions.length ? (
          <Sugg>
            {suggestions.map((x) => (
              <SuggItem
                key={x}
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault()
                  state.q = ''
                  state.open = false
                  upsertChip(keyName, x)
                  forceRerender()
                }}
              >
                {x}
              </SuggItem>
            ))}
          </Sugg>
        ) : null}
      </div>
    )
  }

  const sexLower = String(draft.sex || '').trim().toLowerCase()

  return (
    <Screen>
      <HeaderRow>
        <InPageMenuButton />
        <span />
      </HeaderRow>

      <CurvedHeader>
        <h2>Digital Medical Kit</h2>
        <p>Your health profile — fill as much as you can.</p>
      </CurvedHeader>

      <KitCard as="section">
        <TopRow>
          <BackMini type="button" onClick={() => navigate(-1)} aria-label="Back">
            ←
          </BackMini>
          <TopMeta>Patient health profile</TopMeta>
          <span style={{ width: 40 }} />
        </TopRow>

        {notice ? (
          <Notice $tone={notice.tone} role={notice.tone === 'error' ? 'alert' : 'status'}>
            {notice.text}
          </Notice>
        ) : null}

        {/* Stepper Progress Bar */}
        <StepperContainer>
          <StepperProgress $progress={(step - 1) * 25} />
          {[
            { s: 1, label: 'About You' },
            { s: 2, label: 'Emergency' },
            { s: 3, label: 'History' },
            { s: 4, label: 'Meds & Allergies' },
            { s: 5, label: 'Care Wishes' }
          ].map((item) => (
            <StepNode key={item.s} type="button" onClick={() => setStep(item.s)} aria-label={`Go to step ${item.s}: ${item.label}`}>
              <StepCircle $active={step === item.s} $completed={step > item.s}>
                {item.s}
              </StepCircle>
              <StepLabel $active={step === item.s} $completed={step > item.s}>
                {item.label}
              </StepLabel>
            </StepNode>
          ))}
        </StepperContainer>

        {/* Step 1: About You */}
        {step === 1 && (
          <>
            <Section>
              <SectionHeader type="button" as="div" style={{ cursor: 'default' }}>
                <SectionTitle>About you</SectionTitle>
              </SectionHeader>
              <SectionBody $open={true}>
                <Grid>
                  <div>
                    <FieldLabel>Full name</FieldLabel>
                    <TextField value={draft.fullName} onChange={(e) => setDraft((p) => ({ ...p, fullName: e.target.value }))} placeholder="e.g. Amara Okonkwo" />
                  </div>
                  <div>
                    <FieldLabel>Date of birth</FieldLabel>
                    <TextField type="date" value={draft.dob} onChange={(e) => setDraft((p) => ({ ...p, dob: e.target.value }))} placeholder="YYYY-MM-DD" />
                  </div>
                </Grid>

                <Grid style={{ marginTop: 12 }}>
                  <div>
                    <FieldLabel>Sex</FieldLabel>
                    <SelectField value={draft.sex} onChange={(e) => setDraft((p) => ({ ...p, sex: e.target.value }))}>
                      <option value="">Select sex…</option>
                      {sexOptions.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt === 'prefer_not' ? 'Prefer not to say' : opt.charAt(0).toUpperCase() + opt.slice(1)}
                        </option>
                      ))}
                    </SelectField>
                  </div>
                  <div>
                    <FieldLabel>Blood group</FieldLabel>
                    <SelectorRow>
                      {bloodOptions.map((b) => (
                        <SelectPill key={b} type="button" $selected={String(draft.bloodType || '').toUpperCase() === b} onClick={() => setDraft((p) => ({ ...p, bloodType: b }))}>
                          {b}
                        </SelectPill>
                      ))}
                      <SelectPill type="button" $selected={String(draft.bloodType || '').toLowerCase() === "i don't know"} onClick={() => setDraft((p) => ({ ...p, bloodType: "I don't know" }))}>
                        I don't know
                      </SelectPill>
                    </SelectorRow>
                  </div>
                </Grid>

                <Grid style={{ marginTop: 12 }}>
                  <div>
                    <FieldLabel>Genotype</FieldLabel>
                    <SelectorRow>
                      {genoOptions.map((g) => (
                        <SelectPill key={g} type="button" $selected={String(draft.genotype || '').toUpperCase() === String(g).toUpperCase()} onClick={() => setDraft((p) => ({ ...p, genotype: g }))}>
                          {g}
                        </SelectPill>
                      ))}
                    </SelectorRow>
                  </div>
                  <div>
                    <FieldLabel>Main language</FieldLabel>
                    <SelectField value={draft.language} onChange={(e) => setDraft((p) => ({ ...p, language: e.target.value }))}>
                      <option value="">Select language…</option>
                      {langOptions.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </SelectField>
                  </div>
                </Grid>

                <Grid style={{ marginTop: 12 }}>
                  <div>
                    <FieldLabel>Relationship status</FieldLabel>
                    <SelectField value={draft.maritalStatus} onChange={(e) => setDraft((p) => ({ ...p, maritalStatus: e.target.value }))}>
                      <option value="">Select status…</option>
                      {maritalOptions.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </SelectField>
                  </div>
                  <div>
                    <FieldLabel>Religion</FieldLabel>
                    <SelectField value={draft.religion} onChange={(e) => setDraft((p) => ({ ...p, religion: e.target.value }))}>
                      <option value="">Select religion…</option>
                      {religionOptions.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </SelectField>
                  </div>
                </Grid>

                <Grid style={{ marginTop: 12 }}>
                  <div>
                    <FieldLabel>Nationality</FieldLabel>
                    <SelectField value={draft.nationality} onChange={(e) => setDraft((p) => ({ ...p, nationality: e.target.value }))}>
                      <option value="">Select nationality…</option>
                      {countryOptions.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </SelectField>
                  </div>
                  <div>
                    <FieldLabel>Home address</FieldLabel>
                    <TextField value={draft.address} onChange={(e) => setDraft((p) => ({ ...p, address: e.target.value }))} placeholder="Street, city, state" />
                  </div>
                </Grid>
              </SectionBody>
            </Section>

            <Section>
              <SectionHeader type="button" as="div" style={{ cursor: 'default' }}>
                <SectionTitle>Lifestyle</SectionTitle>
              </SectionHeader>
              <SectionBody $open={true}>
                <Grid>
                  <div>
                    <FieldLabel>Smoking</FieldLabel>
                    <SelectField value={draft.smoking} onChange={(e) => setDraft((p) => ({ ...p, smoking: e.target.value }))}>
                      <option value="">Select smoking status…</option>
                      {smokingOptions.map((opt) => (
                        <option key={opt} value={opt}>{opt.charAt(0).toUpperCase() + opt.slice(1)}</option>
                      ))}
                    </SelectField>
                  </div>
                  <div>
                    <FieldLabel>Alcohol</FieldLabel>
                    <SelectField value={draft.alcohol} onChange={(e) => setDraft((p) => ({ ...p, alcohol: e.target.value }))}>
                      <option value="">Select alcohol frequency…</option>
                      {alcoholOptions.map((opt) => {
                        let label = opt.charAt(0).toUpperCase() + opt.slice(1);
                        if (opt === 'none') label = 'None';
                        if (opt === 'daily_light') label = 'Daily (light)';
                        if (opt === 'daily_heavy') label = 'Daily (heavy)';
                        return (
                          <option key={opt} value={opt}>{label}</option>
                        );
                      })}
                    </SelectField>
                  </div>
                </Grid>

                <div style={{ marginTop: 12 }}>
                  <FieldLabel>Substance use</FieldLabel>
                  <TagWrap>
                    {substanceOptions.map((c) => (
                      <SelectPill key={c} type="button" $selected={draft.substanceUse.includes(c)} onClick={() => setDraft((p) => ({ ...p, substanceUse: toggleFromList(p.substanceUse || [], c) }))}>
                        {c}
                      </SelectPill>
                    ))}
                  </TagWrap>
                  {draft.substanceUse.some((x) => x !== 'None of these') ? (
                    <div style={{ marginTop: 12 }}>
                      <FieldLabel>How often?</FieldLabel>
                      <TextField value={draft.substanceDetails} onChange={(e) => setDraft((p) => ({ ...p, substanceDetails: e.target.value }))} placeholder="Optional" />
                    </div>
                  ) : null}
                </div>

                <Grid style={{ marginTop: 12 }}>
                  <div>
                    <FieldLabel>Diet</FieldLabel>
                    <SelectField value={draft.diet} onChange={(e) => setDraft((p) => ({ ...p, diet: e.target.value }))}>
                      <option value="">Select diet type…</option>
                      {dietOptions.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </SelectField>
                  </div>
                  <div>
                    <FieldLabel>Exercise</FieldLabel>
                    <SelectField value={draft.exerciseFreq} onChange={(e) => setDraft((p) => ({ ...p, exerciseFreq: e.target.value }))}>
                      <option value="">Select exercise frequency…</option>
                      {exerciseOptions.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </SelectField>
                  </div>
                </Grid>

                <Grid style={{ marginTop: 12 }}>
                  <div>
                    <FieldLabel>Occupation category</FieldLabel>
                    <SelectField value={draft.occupationCat} onChange={(e) => setDraft((p) => ({ ...p, occupationCat: e.target.value }))}>
                      <option value="">Select occupation category…</option>
                      {occupationOptions.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </SelectField>
                  </div>
                  <div>
                    <FieldLabel>Living situation</FieldLabel>
                    <SelectField value={draft.livingSituation} onChange={(e) => setDraft((p) => ({ ...p, livingSituation: e.target.value }))}>
                      <option value="">Select living situation…</option>
                      {livingOptions.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </SelectField>
                  </div>
                </Grid>

                <div style={{ marginTop: 12 }}>
                  <FieldLabel>Pets</FieldLabel>
                  <SelectorRow>
                    {['Yes', 'No'].map((v) => (
                      <SelectPill key={v} type="button" $selected={draft.pets === v} onClick={() => setDraft((p) => ({ ...p, pets: v }))}>
                        {v}
                      </SelectPill>
                    ))}
                  </SelectorRow>
                  {draft.pets === 'Yes' ? (
                    <div style={{ marginTop: 10 }}>
                      <FieldLabel>What kind?</FieldLabel>
                      <TagWrap>
                        {petsOptions.map((c) => (
                          <SelectPill key={c} type="button" $selected={draft.petsType.includes(c)} onClick={() => setDraft((p) => ({ ...p, petsType: toggleFromList(p.petsType || [], c) }))}>
                            {c}
                          </SelectPill>
                        ))}
                      </TagWrap>
                      <div style={{ marginTop: 10 }}>
                        <FieldLabel>Other</FieldLabel>
                        <TextField value={draft.petsOther} onChange={(e) => setDraft((p) => ({ ...p, petsOther: e.target.value }))} placeholder="Optional" />
                      </div>
                    </div>
                  ) : null}
                </div>

                <div style={{ marginTop: 12 }}>
                  <FieldLabel>Lifestyle notes</FieldLabel>
                  <TextField value={draft.lifestyleNotes} onChange={(e) => setDraft((p) => ({ ...p, lifestyleNotes: e.target.value }))} placeholder="Anything else the doctor should know?" />
                </div>
              </SectionBody>
            </Section>

            {sexLower === 'female' ? (
              <Section>
                <SectionHeader type="button" as="div" style={{ cursor: 'default' }}>
                  <SectionTitle>Pregnancy & women’s health</SectionTitle>
                </SectionHeader>
                <SectionBody $open={true}>
                  <Grid>
                    <div>
                      <FieldLabel>Gravida</FieldLabel>
                      <TextField value={String(draft.gravida)} onChange={(e) => setDraft((p) => ({ ...p, gravida: Number(e.target.value || 0) }))} placeholder="0" />
                    </div>
                    <div>
                      <FieldLabel>Para</FieldLabel>
                      <TextField value={String(draft.para)} onChange={(e) => setDraft((p) => ({ ...p, para: Number(e.target.value || 0) }))} placeholder="0" />
                    </div>
                  </Grid>
                  <Grid style={{ marginTop: 12 }}>
                    <div>
                      <FieldLabel>Miscarriages/terminations</FieldLabel>
                      <TextField value={String(draft.miscarriages)} onChange={(e) => setDraft((p) => ({ ...p, miscarriages: Number(e.target.value || 0) }))} placeholder="0" />
                    </div>
                    <div>
                      <FieldLabel>Last period (LMP)</FieldLabel>
                      <TextField type="date" value={draft.lmp} onChange={(e) => setDraft((p) => ({ ...p, lmp: e.target.value }))} placeholder="YYYY-MM-DD" />
                    </div>
                  </Grid>

                  <div style={{ marginTop: 12 }}>
                    <FieldLabel>Pregnancy complications</FieldLabel>
                    <TagWrap>
                      {pregnancyCompOptions.map((c) => (
                        <SelectPill key={c} type="button" $selected={draft.pregnancyComplications.includes(c)} onClick={() => setDraft((p) => ({ ...p, pregnancyComplications: toggleFromList(p.pregnancyComplications || [], c) }))}>
                          {c}
                        </SelectPill>
                      ))}
                    </TagWrap>
                  </div>

                  <Grid style={{ marginTop: 12 }}>
                    <div>
                      <FieldLabel>Period regularity</FieldLabel>
                      <SelectField value={draft.menstrualRegularity} onChange={(e) => setDraft((p) => ({ ...p, menstrualRegularity: e.target.value }))}>
                        <option value="">Select regularity…</option>
                        {regularityOptions.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </SelectField>
                    </div>
                    <div>
                      <FieldLabel>Contraception use</FieldLabel>
                      <SelectField value={draft.contraceptionUse} onChange={(e) => setDraft((p) => ({ ...p, contraceptionUse: e.target.value }))}>
                        <option value="">Select option…</option>
                        {contraceptionOptions.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </SelectField>
                    </div>
                  </Grid>

                  <Grid style={{ marginTop: 12 }}>
                    <div>
                      <FieldLabel>Menopause</FieldLabel>
                      <SelectField value={draft.menopause} onChange={(e) => setDraft((p) => ({ ...p, menopause: e.target.value }))}>
                        <option value="">Select option…</option>
                        {menopauseOptions.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </SelectField>
                    </div>
                    <div />
                  </Grid>

                  <div style={{ marginTop: 12 }}>
                    <FieldLabel>Notes</FieldLabel>
                    <TextField value={draft.obgynNotes} onChange={(e) => setDraft((p) => ({ ...p, obgynNotes: e.target.value }))} placeholder="Optional" />
                  </div>
                </SectionBody>
              </Section>
            ) : null}
          </>
        )}

        {/* Step 2: Emergency Contact */}
        {step === 2 && (
          <Section>
            <SectionHeader type="button" as="div" style={{ cursor: 'default' }}>
              <SectionTitle>Who to call in an emergency</SectionTitle>
            </SectionHeader>
            <SectionBody $open={true}>
              <Grid>
                <div>
                  <FieldLabel>Their name</FieldLabel>
                  <TextField value={draft.emergencyName} onChange={(e) => setDraft((p) => ({ ...p, emergencyName: e.target.value }))} placeholder="Full name" />
                </div>
                <div>
                  <FieldLabel>Relationship</FieldLabel>
                  <SelectField value={draft.emergencyRelation} onChange={(e) => setDraft((p) => ({ ...p, emergencyRelation: e.target.value }))}>
                    <option value="">Select relationship…</option>
                    {relationshipOptions.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </SelectField>
                </div>
              </Grid>
              <Grid style={{ marginTop: 12 }}>
                <div>
                  <FieldLabel>Phone number</FieldLabel>
                  <TextField value={draft.emergencyPhone} onChange={(e) => setDraft((p) => ({ ...p, emergencyPhone: e.target.value }))} placeholder="+234..." />
                </div>
                <div>
                  <FieldLabel>Second phone (optional)</FieldLabel>
                  <TextField value={draft.emergencyPhone2} onChange={(e) => setDraft((p) => ({ ...p, emergencyPhone2: e.target.value }))} placeholder="+234..." />
                </div>
              </Grid>
            </SectionBody>
          </Section>
        )}

        {/* Step 3: Medical & Surgical History */}
        {step === 3 && (
          <>
            <Section>
              <SectionHeader type="button" as="div" style={{ cursor: 'default' }}>
                <SectionTitle>Health conditions you live with</SectionTitle>
              </SectionHeader>
              <SectionBody $open={true}>
                <FieldLabel>Pick everything that applies</FieldLabel>
                <Hint>Long-term conditions you’ve been told you have.</Hint>
                <TagWrap>
                  {conditionOptions.map((c) => (
                    <SelectPill key={c} type="button" $selected={draft.conditions.includes(c)} onClick={() => setDraft((p) => ({ ...p, conditions: toggleFromList(p.conditions || [], c) }))}>
                      {c}
                    </SelectPill>
                  ))}
                </TagWrap>
                <div style={{ marginTop: 12 }}>
                  <FieldLabel>Anything else?</FieldLabel>
                  <TextField value={draft.conditionsOther} onChange={(e) => setDraft((p) => ({ ...p, conditionsOther: e.target.value }))} placeholder="Write in your own words" />
                </div>
              </SectionBody>
            </Section>

            <Section>
              <SectionHeader type="button" as="div" style={{ cursor: 'default' }}>
                <SectionTitle>Operations you’ve had</SectionTitle>
              </SectionHeader>
              <SectionBody $open={true}>
                <FieldLabel>Pick any operations (surgeries) you’ve had</FieldLabel>
                <TagWrap>
                  {surgeryOptions.map((c) => (
                    <SelectPill key={c} type="button" $selected={draft.surgeries.includes(c)} onClick={() => setDraft((p) => ({ ...p, surgeries: toggleFromList(p.surgeries || [], c) }))}>
                      {c}
                    </SelectPill>
                  ))}
                </TagWrap>
                <div style={{ marginTop: 12 }}>
                  <FieldLabel>Anything else?</FieldLabel>
                  <TextField value={draft.surgeriesOther} onChange={(e) => setDraft((p) => ({ ...p, surgeriesOther: e.target.value }))} placeholder="Describe it simply" />
                </div>
              </SectionBody>
            </Section>

            <Section>
              <SectionHeader type="button" as="div" style={{ cursor: 'default' }}>
                <SectionTitle>Hospital stays & blood transfusions</SectionTitle>
              </SectionHeader>
              <SectionBody $open={true}>
                <FieldLabel>Admitted to hospital in last 5 years?</FieldLabel>
                <SelectorRow>
                  {['Yes', 'No', 'Not sure'].map((v) => (
                    <SelectPill key={v} type="button" $selected={draft.admit === v} onClick={() => setDraft((p) => ({ ...p, admit: v }))}>
                      {v}
                    </SelectPill>
                  ))}
                </SelectorRow>
                {draft.admit === 'Yes' ? (
                  <div style={{ marginTop: 12 }}>
                    <FieldLabel>What was it for? When?</FieldLabel>
                    <TextField value={draft.admitDetails} onChange={(e) => setDraft((p) => ({ ...p, admitDetails: e.target.value }))} placeholder="Describe briefly" />
                  </div>
                ) : null}

                <div style={{ marginTop: 12 }}>
                  <FieldLabel>Ever had a blood transfusion?</FieldLabel>
                  <SelectorRow>
                    {['Yes', 'No', 'Not sure'].map((v) => (
                      <SelectPill key={v} type="button" $selected={draft.transfusion === v} onClick={() => setDraft((p) => ({ ...p, transfusion: v }))}>
                        {v}
                      </SelectPill>
                    ))}
                  </SelectorRow>
                  {draft.transfusion === 'Yes' ? (
                    <div style={{ marginTop: 12 }}>
                      <FieldLabel>When, and did anything go wrong?</FieldLabel>
                      <TextField value={draft.transfusionDetails} onChange={(e) => setDraft((p) => ({ ...p, transfusionDetails: e.target.value }))} placeholder="Describe briefly" />
                    </div>
                  ) : null}
                </div>
              </SectionBody>
            </Section>

            <Section>
              <SectionHeader type="button" as="div" style={{ cursor: 'default' }}>
                <SectionTitle>Family history</SectionTitle>
              </SectionHeader>
              <SectionBody $open={true}>
                <FieldLabel>Do any run in your family?</FieldLabel>
                <TagWrap>
                  {familyHistoryOptions.map((c) => (
                    <SelectPill key={c} type="button" $selected={draft.familyHistory.includes(c)} onClick={() => setDraft((p) => ({ ...p, familyHistory: toggleFromList(p.familyHistory || [], c) }))}>
                      {c}
                    </SelectPill>
                  ))}
                </TagWrap>
                <div style={{ marginTop: 12 }}>
                  <FieldLabel>Notes</FieldLabel>
                  <TextField value={draft.famHistoryNotes} onChange={(e) => setDraft((p) => ({ ...p, famHistoryNotes: e.target.value }))} placeholder="Optional" />
                </div>
              </SectionBody>
            </Section>
          </>
        )}

        {/* Step 4: Medications & Allergies */}
        {step === 4 && (
          <>
            <Section>
              <SectionHeader type="button" as="div" style={{ cursor: 'default' }}>
                <SectionTitle>Allergies</SectionTitle>
              </SectionHeader>
              <SectionBody $open={true}>
                <Grid>
                  {renderCombo('drugAll', 'Drug allergies', 'drugAllergies')}
                  {renderCombo('foodAll', 'Food allergies', 'foodAllergies')}
                </Grid>
                <div style={{ marginTop: 12 }}>
                  <FieldLabel>Other allergies</FieldLabel>
                  <TextField value={draft.otherAllergies} onChange={(e) => setDraft((p) => ({ ...p, otherAllergies: e.target.value }))} placeholder="Dust, animals, plants, chemicals, etc." />
                </div>
              </SectionBody>
            </Section>

            <Section>
              <SectionHeader type="button" as="div" style={{ cursor: 'default' }}>
                <SectionTitle>Medicines you take regularly</SectionTitle>
              </SectionHeader>
              <SectionBody $open={true}>
                {renderCombo('rxMeds', 'Prescribed medicines', 'rxMeds')}
                <Grid style={{ marginTop: 12 }}>
                  {renderCombo('otcMeds', 'OTC medicines', 'otcMeds')}
                  {renderCombo('herbalMeds', 'Herbal remedies', 'herbalMeds')}
                </Grid>
                <div style={{ marginTop: 12 }}>
                  <FieldLabel>Notes</FieldLabel>
                  <TextField value={draft.medsNotes} onChange={(e) => setDraft((p) => ({ ...p, medsNotes: e.target.value }))} placeholder="Optional" />
                </div>
              </SectionBody>
            </Section>

            <Section>
              <SectionHeader type="button" as="div" style={{ cursor: 'default' }}>
                <SectionTitle>Aids or devices you use</SectionTitle>
              </SectionHeader>
              <SectionBody $open={true}>
                <FieldLabel>Pick all that apply</FieldLabel>
                <TagWrap>
                  {assistiveOptions.map((c) => (
                    <SelectPill key={c} type="button" $selected={draft.assistive.includes(c)} onClick={() => setDraft((p) => ({ ...p, assistive: toggleFromList(p.assistive || [], c) }))}>
                      {c}
                    </SelectPill>
                  ))}
                </TagWrap>
                <div style={{ marginTop: 12 }}>
                  <FieldLabel>Notes</FieldLabel>
                  <TextField value={draft.assistiveNotes} onChange={(e) => setDraft((p) => ({ ...p, assistiveNotes: e.target.value }))} placeholder="Optional" />
                </div>
              </SectionBody>
            </Section>
          </>
        )}

        {/* Step 5: Care & Wellness */}
        {step === 5 && (
          <>
            <Section>
              <SectionHeader type="button" as="div" style={{ cursor: 'default' }}>
                <SectionTitle>Vaccines</SectionTitle>
              </SectionHeader>
              <SectionBody $open={true}>
                <FieldLabel>Pick the ones you’ve had</FieldLabel>
                <TagWrap>
                  {vaccineOptions.map((c) => (
                    <SelectPill key={c} type="button" $selected={draft.vaccines.includes(c)} onClick={() => setDraft((p) => ({ ...p, vaccines: toggleFromList(p.vaccines || [], c) }))}>
                      {c}
                    </SelectPill>
                  ))}
                </TagWrap>
                <div style={{ marginTop: 12 }}>
                  <FieldLabel>Notes</FieldLabel>
                  <TextField value={draft.vaccineNotes} onChange={(e) => setDraft((p) => ({ ...p, vaccineNotes: e.target.value }))} placeholder="Optional" />
                </div>
              </SectionBody>
            </Section>

            <Section>
              <SectionHeader type="button" as="div" style={{ cursor: 'default' }}>
                <SectionTitle>Mental health & memory</SectionTitle>
              </SectionHeader>
              <SectionBody $open={true}>
                <FieldLabel>History</FieldLabel>
                <TagWrap>
                  {mentalHistoryOptions.map((c) => (
                    <SelectPill key={c} type="button" $selected={draft.mentalHistory.includes(c)} onClick={() => setDraft((p) => ({ ...p, mentalHistory: toggleFromList(p.mentalHistory || [], c) }))}>
                      {c}
                    </SelectPill>
                  ))}
                </TagWrap>
                <div style={{ marginTop: 12 }}>
                  <FieldLabel>How are you feeling right now?</FieldLabel>
                  <TextField value={draft.mentalCurrent} onChange={(e) => setDraft((p) => ({ ...p, mentalCurrent: e.target.value }))} placeholder="e.g. I feel fine" />
                </div>
                <div style={{ marginTop: 12 }}>
                  <FieldLabel>Memory / concentration</FieldLabel>
                  <TagWrap>
                    {cognitiveOptions.map((c) => (
                      <SelectPill key={c} type="button" $selected={draft.cognitive.includes(c)} onClick={() => setDraft((p) => ({ ...p, cognitive: toggleFromList(p.cognitive || [], c) }))}>
                        {c}
                      </SelectPill>
                    ))}
                  </TagWrap>
                </div>
                <div style={{ marginTop: 12 }}>
                  <FieldLabel>Notes</FieldLabel>
                  <TextField value={draft.mentalNotes} onChange={(e) => setDraft((p) => ({ ...p, mentalNotes: e.target.value }))} placeholder="Optional" />
                </div>
              </SectionBody>
            </Section>

            <Section>
              <SectionHeader type="button" as="div" style={{ cursor: 'default' }}>
                <SectionTitle>Special wishes for your care</SectionTitle>
              </SectionHeader>
              <SectionBody $open={true}>
                <FieldLabel>Pick anything that applies</FieldLabel>
                <TagWrap>
                  {directivesOptions.map((c) => (
                    <SelectPill key={c} type="button" $selected={draft.directives.includes(c)} onClick={() => setDraft((p) => ({ ...p, directives: toggleFromList(p.directives || [], c) }))}>
                      {c}
                    </SelectPill>
                  ))}
                </TagWrap>
                <div style={{ marginTop: 12 }}>
                  <FieldLabel>Notes</FieldLabel>
                  <TextField value={draft.dirNotes} onChange={(e) => setDraft((p) => ({ ...p, dirNotes: e.target.value }))} placeholder="Optional" />
                </div>
              </SectionBody>
            </Section>
          </>
        )}

        {/* Bottom Wizard Navigation Buttons */}
        <NavigationRow>
          {step > 1 ? (
            <Button type="button" $tone="ghost" onClick={() => setStep((s) => s - 1)} disabled={saving} style={{ flex: 1, padding: '10px' }}>
              ← Back
            </Button>
          ) : (
            <div style={{ flex: 1 }} />
          )}

          {step < 5 && (
            <Button
              type="button"
              $tone="ghost"
              onClick={() => onSave({ goLive: false })}
              disabled={saving}
              style={{
                flex: 1,
                padding: '10px',
                opacity: 0.8,
                border: '1px dashed #cbd5e1',
                background: 'transparent',
                color: 'inherit',
              }}
            >
              {saving ? 'Saving…' : 'Save draft'}
            </Button>
          )}

          {step < 5 ? (
            <Button type="button" onClick={() => setStep((s) => s + 1)} disabled={saving} style={{ flex: 1, padding: '10px' }}>
              Next →
            </Button>
          ) : (
            <div style={{ flex: 2, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <Button type="button" onClick={() => onSave({ goLive: false })} disabled={saving}>
                {saving ? 'Saving…' : 'Save medical kit'}
              </Button>
              <Button type="button" $tone="ghost" onClick={() => onSave({ goLive: true })} disabled={saving}>
                Save & start session →
              </Button>
            </div>
          )}
        </NavigationRow>
      </KitCard>
    </Screen>
  )
}

