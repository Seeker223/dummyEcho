import { useEffect, useState, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import styled from 'styled-components'

const RecordWrapper = styled.div`
  min-height: 100vh;
  background: ${({ theme }) => theme.mode === 'dark' ? '#0b0f19' : '#f9fafb'};
  color: ${({ theme }) => theme.mode === 'dark' ? '#f3f4f6' : '#1f2937'};
  font-family: 'Outfit', sans-serif;
  padding: 1.5rem 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
`

const Header = styled.header`
  width: 100%;
  max-width: 700px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
  border-bottom: 2px solid ${({ theme }) => theme.mode === 'dark' ? '#1e293b' : '#e5e7eb'};
  padding-bottom: 1rem;
`

const LogoArea = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`

const LogoCircle = styled.div`
  width: 38px;
  height: 38px;
  border-radius: 999px;
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-weight: 900;
  font-size: 1.25rem;
`

const LogoText = styled.h1`
  font-size: 1.15rem;
  font-weight: 800;
  margin: 0;
  color: #ef4444;
`

const Badge = styled.span`
  background: #fee2e2;
  color: #ef4444;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 999px;
  text-transform: uppercase;
  border: 1px solid rgba(239, 68, 68, 0.2);
`

const Card = styled.div`
  width: 100%;
  max-width: 700px;
  background: ${({ theme }) => theme.mode === 'dark' ? '#111827' : '#ffffff'};
  border-radius: 24px;
  box-shadow: 0 20px 48px rgba(0, 0, 0, 0.08);
  border: 1px solid ${({ theme }) => theme.mode === 'dark' ? '#1f2937' : '#e5e7eb'};
  overflow: hidden;
  margin-bottom: 2rem;
`

const HeroSection = styled.div`
  background: linear-gradient(135deg, #ef4444 0%, #991b1b 100%);
  color: #ffffff;
  padding: 2.25rem 1.75rem;
  position: relative;
`

const PatientName = styled.h2`
  font-size: 1.75rem;
  font-weight: 800;
  margin: 0 0 6px 0;
  letter-spacing: -0.02em;
`

const SubHeader = styled.p`
  margin: 0;
  opacity: 0.9;
  font-size: 0.95rem;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
`

const EchoIdTag = styled.span`
  background: rgba(255, 255, 255, 0.2);
  padding: 2px 8px;
  border-radius: 6px;
  font-weight: 700;
  font-size: 0.8rem;
`

const CriticalGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1rem;
  padding: 1.5rem 1.75rem;
  border-bottom: 1px solid ${({ theme }) => theme.mode === 'dark' ? '#1f2937' : '#f3f4f6'};
  background: ${({ theme }) => theme.mode === 'dark' ? 'rgba(239, 68, 68, 0.05)' : 'rgba(239, 68, 68, 0.02)'};
`

const CriticalItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`

const CriticalLabel = styled.span`
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  color: ${({ theme }) => theme.mode === 'dark' ? '#9ca3af' : '#6b7280'};
`

const CriticalValue = styled.span`
  font-size: 1.35rem;
  font-weight: 800;
  color: #ef4444;
`

const Section = styled.section`
  padding: 1.75rem;
  border-bottom: 1px solid ${({ theme }) => theme.mode === 'dark' ? '#1f2937' : '#f3f4f6'};
`

const SectionTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 800;
  margin: 0 0 1rem 0;
  display: flex;
  align-items: center;
  gap: 8px;
  color: ${({ theme }) => theme.mode === 'dark' ? '#e5e7eb' : '#374151'};
`

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.25rem;
`

const InfoGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`

const InfoLabel = styled.span`
  font-size: 0.8rem;
  font-weight: 600;
  color: ${({ theme }) => theme.mode === 'dark' ? '#9ca3af' : '#6b7280'};
`

const InfoValue = styled.span`
  font-size: 1rem;
  font-weight: 600;
  color: ${({ theme }) => theme.mode === 'dark' ? '#f3f4f6' : '#1f2937'};
`

const AlertCard = styled.div`
  background: ${({ theme }) => theme.mode === 'dark' ? 'rgba(239, 68, 68, 0.12)' : '#fef2f2'};
  border: 1px solid rgba(239, 68, 68, 0.25);
  border-radius: 14px;
  padding: 1rem 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 6px;
`

const AlertTitle = styled.h4`
  margin: 0;
  font-size: 0.95rem;
  font-weight: 800;
  color: #ef4444;
  display: flex;
  align-items: center;
  gap: 6px;
`

const BadgeContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`

const ItemBadge = styled.span`
  background: ${({ theme }) => theme.mode === 'dark' ? '#1f2937' : '#f3f4f6'};
  color: ${({ theme }) => theme.mode === 'dark' ? '#e5e7eb' : '#4b5563'};
  font-weight: 700;
  font-size: 0.85rem;
  padding: 6px 12px;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.mode === 'dark' ? '#374151' : '#e5e7eb'};
`

const CallBtn = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #2563eb;
  color: #ffffff;
  padding: 6px 14px;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 700;
  text-decoration: none;
  width: fit-content;
  margin-top: 4px;
  border: 1px solid #1d4ed8;
  transition: all 0.2s ease;

  &:hover {
    background: #1d4ed8;
  }
`

const LoadingWrap = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 80vh;
  gap: 12px;
`

const Spinner = styled.div`
  width: 48px;
  height: 48px;
  border: 4px solid rgba(239, 68, 68, 0.1);
  border-top-color: #ef4444;
  border-radius: 999px;
  animation: spin 0.8s linear infinite;

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`

const ErrorCard = styled(Card)`
  padding: 3rem 2rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
`

const ErrorIcon = styled.div`
  width: 64px;
  height: 64px;
  border-radius: 999px;
  background: #fef2f2;
  color: #ef4444;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.25rem;
  font-weight: 900;
  margin-bottom: 0.5rem;
`

function calculateAge(dobStr) {
  if (!dobStr) return 'N/A'
  try {
    const birth = new Date(dobStr)
    const now = new Date()
    let age = now.getFullYear() - birth.getFullYear()
    const m = now.getMonth() - birth.getMonth()
    if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) {
      age--
    }
    return age >= 0 ? `${age} years` : 'N/A'
  } catch {
    return 'N/A'
  }
}

function formatEnum(val) {
  if (val === null || val === undefined) return 'N/A'
  if (typeof val === 'boolean') return val ? 'Yes' : 'No'
  const str = String(val).trim()
  if (!str) return 'N/A'
  return str
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export default function PublicRecordScreen() {
  const { submissionKey } = useParams()
  const [record, setRecord] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!submissionKey) {
      setError('Invalid URL: missing identification key.')
      setLoading(false)
      return
    }

    async function fetchRecord() {
      try {
        const response = await fetch(`/api/profile/public-record?key=${submissionKey}`)
        const data = await response.json()
        if (!response.ok) {
          throw new Error(data.error || 'Failed to load records.')
        }
        setRecord(data.record)
      } catch (err) {
        console.error(err)
        setError(err.message || 'Record not found or network connection failed.')
      } finally {
        setLoading(false)
      }
    }

    fetchRecord()
  }, [submissionKey])

  const age = useMemo(() => calculateAge(record?.dob), [record?.dob])

  const hasClinicalHistory = useMemo(() => {
    if (!record) return false
    return !!(
      (record.surgeries && record.surgeries.length > 0) ||
      record.surg_other ||
      record.admit ||
      record.admitDetails ||
      record.transfusion ||
      record.transfusionDetails ||
      (record.vaccines && record.vaccines.length > 0) ||
      record.vaccineNotes ||
      (record.familyHistory && record.familyHistory.length > 0) ||
      record.famHistoryNotes
    )
  }, [record])

  const hasLifestyleHistory = useMemo(() => {
    if (!record) return false
    return !!(
      record.smoking ||
      record.alcohol ||
      (record.substanceUse && record.substanceUse.length > 0) ||
      record.substanceDetails ||
      record.diet ||
      record.exerciseFreq ||
      record.occupationCat ||
      record.livingSituation ||
      (record.pets !== null && record.pets !== undefined && record.pets !== '') ||
      (record.petsType && record.petsType.length > 0) ||
      record.petsOther ||
      record.lifestyleNotes
    )
  }, [record])

  const hasMentalAssistiveHistory = useMemo(() => {
    if (!record) return false
    return !!(
      (record.assistive && record.assistive.length > 0) ||
      record.assistiveNotes ||
      (record.cognitive && record.cognitive.length > 0) ||
      (record.mentalHistory && record.mentalHistory.length > 0) ||
      record.mentalCurrent ||
      record.mentalNotes
    )
  }, [record])

  const showObgyn = useMemo(() => {
    if (!record) return false
    const isFemaleOrOther = record.gender?.toLowerCase() === 'female' || record.gender?.toLowerCase() === 'other'
    const hasObgynData =
      record.lmp ||
      record.gravida > 0 ||
      record.para > 0 ||
      record.miscarriages > 0 ||
      (record.pregnancyComplications && record.pregnancyComplications.length > 0) ||
      record.menstrualRegularity ||
      record.contraceptionUse ||
      record.menopause ||
      record.obgynNotes
    return !!(isFemaleOrOther || hasObgynData)
  }, [record])

  if (loading) {
    return (
      <RecordWrapper>
        <LoadingWrap>
          <Spinner />
          <p style={{ fontWeight: 700 }}>Locating Digital Medical Kit...</p>
        </LoadingWrap>
      </RecordWrapper>
    )
  }

  if (error || !record) {
    return (
      <RecordWrapper>
        <Header>
          <LogoArea>
            <LogoCircle>E</LogoCircle>
            <LogoText>EmergencyEcho</LogoText>
          </LogoArea>
        </Header>
        <ErrorCard>
          <ErrorIcon>!</ErrorIcon>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0 }}>Record Lookup Failed</h2>
          <p style={{ color: '#6b7280', margin: 0, fontSize: '0.95rem' }}>{error || 'The requested emergency kit records could not be found.'}</p>
        </ErrorCard>
      </RecordWrapper>
    )
  }

  const hasAllergies = !!((record.drugAllergies && record.drugAllergies.length > 0) || (record.foodAllergies && record.foodAllergies.length > 0) || record.otherAllergies)

  return (
    <RecordWrapper>
      <Header>
        <LogoArea>
          <LogoCircle>E</LogoCircle>
          <LogoText>EmergencyEcho</LogoText>
        </LogoArea>
        <Badge>Emergency Record</Badge>
      </Header>

      <Card>
        <HeroSection>
          <PatientName>{record.fullName || 'Anonymous Patient'}</PatientName>
          <SubHeader>
            <span>DOB: {record.dob || 'N/A'} ({age})</span>
            <span>•</span>
            <span>Sex: {record.gender || 'N/A'}</span>
            <span>•</span>
            <EchoIdTag>EchoID: {record.submissionKey}</EchoIdTag>
          </SubHeader>
        </HeroSection>

        <CriticalGrid>
          <CriticalItem>
            <CriticalLabel>Blood Group</CriticalLabel>
            <CriticalValue>{record.bloodType || 'N/A'}</CriticalValue>
          </CriticalItem>
          <CriticalItem>
            <CriticalLabel>Genotype</CriticalLabel>
            <CriticalValue>{record.genotype || 'N/A'}</CriticalValue>
          </CriticalItem>
          <CriticalItem>
            <CriticalLabel>Primary Language</CriticalLabel>
            <span style={{ fontSize: '1.05rem', fontWeight: 700 }}>{record.language || 'English'}</span>
          </CriticalItem>
        </CriticalGrid>

        {hasAllergies && (
          <Section>
            <SectionTitle>
              <span style={{ color: '#ef4444' }}>⚠️</span> Critical Allergies
            </SectionTitle>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {record.drugAllergies && record.drugAllergies.length > 0 && (
                <AlertCard>
                  <AlertTitle>Drug Allergies</AlertTitle>
                  <BadgeContainer>
                    {record.drugAllergies?.map((allergy, i) => (
                      <ItemBadge key={i} style={{ background: 'rgba(239, 68, 68, 0.08)', color: '#ef4444', borderColor: 'rgba(239,68,68,0.2)' }}>
                        {allergy}
                      </ItemBadge>
                    ))}
                  </BadgeContainer>
                </AlertCard>
              )}
              {record.foodAllergies && record.foodAllergies.length > 0 && (
                <AlertCard style={{ background: 'rgba(245, 158, 11, 0.1)', borderColor: 'rgba(245, 158, 11, 0.25)' }}>
                  <AlertTitle style={{ color: '#d97706' }}>Food Allergies</AlertTitle>
                  <BadgeContainer>
                    {record.foodAllergies?.map((allergy, i) => (
                      <ItemBadge key={i} style={{ background: 'rgba(245, 158, 11, 0.08)', color: '#d97706', borderColor: 'rgba(245, 158, 11, 0.2)' }}>
                        {allergy}
                      </ItemBadge>
                    ))}
                  </BadgeContainer>
                </AlertCard>
              )}
              {record.otherAllergies && (
                <AlertCard style={{ background: 'rgba(75, 85, 99, 0.1)', borderColor: 'rgba(75, 85, 99, 0.25)' }}>
                  <AlertTitle style={{ color: '#4b5563' }}>Other Allergies</AlertTitle>
                  <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600 }}>{record.otherAllergies}</p>
                </AlertCard>
              )}
            </div>
          </Section>
        )}

        {((record.conditions && record.conditions.length > 0) || record.cond_other) && (
          <Section>
            <SectionTitle>📋 Medical Conditions</SectionTitle>
            <BadgeContainer>
              {record.conditions?.map((condition, i) => (
                <ItemBadge key={i}>{condition}</ItemBadge>
              ))}
              {record.cond_other && <ItemBadge>Other: {record.cond_other}</ItemBadge>}
            </BadgeContainer>
          </Section>
        )}

        {((record.rxMeds && record.rxMeds.length > 0) || (record.otcMeds && record.otcMeds.length > 0) || (record.herbalMeds && record.herbalMeds.length > 0) || record.medsNotes) && (
          <Section>
            <SectionTitle>💊 Current Medications</SectionTitle>
            <Grid>
              {record.rxMeds && record.rxMeds.length > 0 && (
                <InfoGroup>
                  <InfoLabel>Prescribed (Rx)</InfoLabel>
                  <BadgeContainer style={{ marginTop: '4px' }}>
                    {record.rxMeds?.map((med, i) => <ItemBadge key={i}>{med}</ItemBadge>)}
                  </BadgeContainer>
                </InfoGroup>
              )}
              {record.otcMeds && record.otcMeds.length > 0 && (
                <InfoGroup>
                  <InfoLabel>Over the Counter (OTC)</InfoLabel>
                  <BadgeContainer style={{ marginTop: '4px' }}>
                    {record.otcMeds?.map((med, i) => <ItemBadge key={i}>{med}</ItemBadge>)}
                  </BadgeContainer>
                </InfoGroup>
              )}
              {record.herbalMeds && record.herbalMeds.length > 0 && (
                <InfoGroup>
                  <InfoLabel>Herbal / Supplements</InfoLabel>
                  <BadgeContainer style={{ marginTop: '4px' }}>
                    {record.herbalMeds?.map((med, i) => <ItemBadge key={i}>{med}</ItemBadge>)}
                  </BadgeContainer>
                </InfoGroup>
              )}
            </Grid>
            {record.medsNotes && (
              <div style={{ marginTop: '1rem', borderTop: '1px solid #f3f4f6', paddingTop: '0.75rem' }}>
                <InfoLabel>Medication Notes</InfoLabel>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.9rem', color: '#4b5563', fontWeight: 500 }}>{record.medsNotes}</p>
              </div>
            )}
          </Section>
        )}

        {hasClinicalHistory && (
          <Section>
            <SectionTitle>🏥 Clinical & Surgical History</SectionTitle>
            <Grid>
              {(record.admit || record.admitDetails) && (
                <InfoGroup>
                  <InfoLabel>Prior Hospital Admissions</InfoLabel>
                  <InfoValue>
                    {record.admit === true || record.admit === 'yes' ? 'Yes' : record.admit === false || record.admit === 'no' ? 'No' : formatEnum(record.admit)}
                    {record.admitDetails && ` - ${record.admitDetails}`}
                  </InfoValue>
                </InfoGroup>
              )}

              {(record.transfusion || record.transfusionDetails) && (
                <InfoGroup>
                  <InfoLabel>Blood Transfusions</InfoLabel>
                  <InfoValue>
                    {record.transfusion === true || record.transfusion === 'yes' ? 'Yes' : record.transfusion === false || record.transfusion === 'no' ? 'No' : formatEnum(record.transfusion)}
                    {record.transfusionDetails && ` - ${record.transfusionDetails}`}
                  </InfoValue>
                </InfoGroup>
              )}

              {((record.surgeries && record.surgeries.length > 0) || record.surg_other) && (
                <InfoGroup style={{ gridColumn: 'span 2' }}>
                  <InfoLabel>Surgeries & Major Procedures</InfoLabel>
                  <BadgeContainer style={{ marginTop: '4px' }}>
                    {record.surgeries?.map((surg, i) => (
                      <ItemBadge key={i}>{surg}</ItemBadge>
                    ))}
                    {record.surg_other && <ItemBadge>Other: {record.surg_other}</ItemBadge>}
                  </BadgeContainer>
                </InfoGroup>
              )}

              {((record.vaccines && record.vaccines.length > 0) || record.vaccineNotes) && (
                <InfoGroup style={{ gridColumn: 'span 2' }}>
                  <InfoLabel>Immunisations / Vaccinations</InfoLabel>
                  <BadgeContainer style={{ marginTop: '4px' }}>
                    {record.vaccines?.map((vac, i) => (
                      <ItemBadge key={i}>{vac}</ItemBadge>
                    ))}
                  </BadgeContainer>
                  {record.vaccineNotes && (
                    <p style={{ margin: '6px 0 0 0', fontSize: '0.85rem', color: 'inherit', opacity: 0.8, fontWeight: 500 }}>
                      Notes: {record.vaccineNotes}
                    </p>
                  )}
                </InfoGroup>
              )}

              {((record.familyHistory && record.familyHistory.length > 0) || record.famHistoryNotes) && (
                <InfoGroup style={{ gridColumn: 'span 2' }}>
                  <InfoLabel>Family Medical History</InfoLabel>
                  <BadgeContainer style={{ marginTop: '4px' }}>
                    {record.familyHistory?.map((fam, i) => (
                      <ItemBadge key={i}>{fam}</ItemBadge>
                    ))}
                  </BadgeContainer>
                  {record.famHistoryNotes && (
                    <p style={{ margin: '6px 0 0 0', fontSize: '0.85rem', color: 'inherit', opacity: 0.8, fontWeight: 500 }}>
                      Notes: {record.famHistoryNotes}
                    </p>
                  )}
                </InfoGroup>
              )}
            </Grid>
          </Section>
        )}

        {hasLifestyleHistory && (
          <Section>
            <SectionTitle>🌱 Lifestyle & Social History</SectionTitle>
            <Grid>
              {record.smoking && (
                <InfoGroup>
                  <InfoLabel>Smoking Status</InfoLabel>
                  <InfoValue>{formatEnum(record.smoking)}</InfoValue>
                </InfoGroup>
              )}

              {record.alcohol && (
                <InfoGroup>
                  <InfoLabel>Alcohol Consumption</InfoLabel>
                  <InfoValue>{formatEnum(record.alcohol)}</InfoValue>
                </InfoGroup>
              )}

              {record.diet && (
                <InfoGroup>
                  <InfoLabel>Dietary Preference</InfoLabel>
                  <InfoValue>{formatEnum(record.diet)}</InfoValue>
                </InfoGroup>
              )}

              {record.exerciseFreq && (
                <InfoGroup>
                  <InfoLabel>Exercise Frequency</InfoLabel>
                  <InfoValue>{formatEnum(record.exerciseFreq)}</InfoValue>
                </InfoGroup>
              )}

              {record.occupationCat && (
                <InfoGroup>
                  <InfoLabel>Occupation Category</InfoLabel>
                  <InfoValue>{formatEnum(record.occupationCat)}</InfoValue>
                </InfoGroup>
              )}

              {record.livingSituation && (
                <InfoGroup>
                  <InfoLabel>Living Situation</InfoLabel>
                  <InfoValue>{formatEnum(record.livingSituation)}</InfoValue>
                </InfoGroup>
              )}

              {((record.substanceUse && record.substanceUse.length > 0) || record.substanceDetails) && (
                <InfoGroup style={{ gridColumn: 'span 2' }}>
                  <InfoLabel>Substance Use History</InfoLabel>
                  {record.substanceUse && record.substanceUse.length > 0 && (
                    <BadgeContainer style={{ marginTop: '4px' }}>
                      {record.substanceUse?.map((sub, i) => (
                        <ItemBadge key={i}>{sub}</ItemBadge>
                      ))}
                    </BadgeContainer>
                  )}
                  {record.substanceDetails && (
                    <p style={{ margin: '6px 0 0 0', fontSize: '0.85rem', color: 'inherit', opacity: 0.8, fontWeight: 500 }}>
                      Details: {record.substanceDetails}
                    </p>
                  )}
                </InfoGroup>
              )}

              {(record.pets !== null && record.pets !== undefined && record.pets !== '') && (
                <InfoGroup style={{ gridColumn: 'span 2' }}>
                  <InfoLabel>Pets in Household</InfoLabel>
                  <InfoValue style={{ display: 'block', marginBottom: '4px' }}>
                    {record.pets === true || record.pets === 'yes' ? 'Yes' : record.pets === false || record.pets === 'no' ? 'No' : formatEnum(record.pets)}
                  </InfoValue>
                  {((record.petsType && record.petsType.length > 0) || record.petsOther) && (
                    <BadgeContainer>
                      {record.petsType?.map((pet, i) => (
                        <ItemBadge key={i}>{pet}</ItemBadge>
                      ))}
                      {record.petsOther && <ItemBadge>Other: {record.petsOther}</ItemBadge>}
                    </BadgeContainer>
                  )}
                </InfoGroup>
              )}

              {record.lifestyleNotes && (
                <InfoGroup style={{ gridColumn: 'span 2', borderTop: '1px solid rgba(128,128,128,0.15)', paddingTop: '0.75rem' }}>
                  <InfoLabel>Lifestyle & Habits Notes</InfoLabel>
                  <p style={{ margin: '4px 0 0 0', fontSize: '0.9rem', color: 'inherit', opacity: 0.8, fontWeight: 500 }}>
                    {record.lifestyleNotes}
                  </p>
                </InfoGroup>
              )}
            </Grid>
          </Section>
        )}

        {hasMentalAssistiveHistory && (
          <Section>
            <SectionTitle>🧠 Mental Health & Assistive Needs</SectionTitle>
            <Grid>
              {((record.assistive && record.assistive.length > 0) || record.assistiveNotes) && (
                <InfoGroup style={{ gridColumn: 'span 2' }}>
                  <InfoLabel>Assistive Devices / Mobility Aids</InfoLabel>
                  {record.assistive && record.assistive.length > 0 && (
                    <BadgeContainer style={{ marginTop: '4px' }}>
                      {record.assistive?.map((device, i) => (
                        <ItemBadge key={i}>{device}</ItemBadge>
                      ))}
                    </BadgeContainer>
                  )}
                  {record.assistiveNotes && (
                    <p style={{ margin: '6px 0 0 0', fontSize: '0.85rem', color: 'inherit', opacity: 0.8, fontWeight: 500 }}>
                      Notes: {record.assistiveNotes}
                    </p>
                  )}
                </InfoGroup>
              )}

              {record.cognitive && record.cognitive.length > 0 && (
                <InfoGroup style={{ gridColumn: 'span 2' }}>
                  <InfoLabel>Cognitive Support / Directives</InfoLabel>
                  <BadgeContainer style={{ marginTop: '4px' }}>
                    {record.cognitive?.map((cog, i) => (
                      <ItemBadge key={i}>{cog}</ItemBadge>
                    ))}
                  </BadgeContainer>
                </InfoGroup>
              )}

              {((record.mentalHistory && record.mentalHistory.length > 0) || record.mentalCurrent || record.mentalNotes) && (
                <InfoGroup style={{ gridColumn: 'span 2' }}>
                  <InfoLabel>Mental Health Status & Conditions</InfoLabel>
                  {record.mentalCurrent && (
                    <InfoValue style={{ display: 'block', margin: '4px 0' }}>
                      Current Status: {formatEnum(record.mentalCurrent)}
                    </InfoValue>
                  )}
                  {record.mentalHistory && record.mentalHistory.length > 0 && (
                    <BadgeContainer style={{ marginTop: '4px' }}>
                      {record.mentalHistory?.map((cond, i) => (
                        <ItemBadge key={i}>{cond}</ItemBadge>
                      ))}
                    </BadgeContainer>
                  )}
                  {record.mentalNotes && (
                    <p style={{ margin: '6px 0 0 0', fontSize: '0.85rem', color: 'inherit', opacity: 0.8, fontWeight: 500 }}>
                      Notes: {record.mentalNotes}
                    </p>
                  )}
                </InfoGroup>
              )}
            </Grid>
          </Section>
        )}

        {showObgyn && (
          <Section>
            <SectionTitle>🤰 OB/GYN History</SectionTitle>
            <Grid>
              {record.lmp && (
                <InfoGroup>
                  <InfoLabel>Last Menstrual Period (LMP)</InfoLabel>
                  <InfoValue>{record.lmp}</InfoValue>
                </InfoGroup>
              )}

              {(record.gravida > 0 || record.para > 0 || record.miscarriages > 0) && (
                <InfoGroup>
                  <InfoLabel>Pregnancy Statistics</InfoLabel>
                  <InfoValue>
                    Gravida: {record.gravida} | Para: {record.para} | Miscarriages: {record.miscarriages}
                  </InfoValue>
                </InfoGroup>
              )}

              {record.menstrualRegularity && (
                <InfoGroup>
                  <InfoLabel>Menstrual Regularity</InfoLabel>
                  <InfoValue>{formatEnum(record.menstrualRegularity)}</InfoValue>
                </InfoGroup>
              )}

              {record.contraceptionUse && (
                <InfoGroup>
                  <InfoLabel>Contraception Use</InfoLabel>
                  <InfoValue>{formatEnum(record.contraceptionUse)}</InfoValue>
                </InfoGroup>
              )}

              {record.menopause && (
                <InfoGroup>
                  <InfoLabel>Menopause Status</InfoLabel>
                  <InfoValue>{formatEnum(record.menopause)}</InfoValue>
                </InfoGroup>
              )}

              {record.pregnancyComplications && record.pregnancyComplications.length > 0 && (
                <InfoGroup style={{ gridColumn: 'span 2' }}>
                  <InfoLabel>Pregnancy Complications</InfoLabel>
                  <BadgeContainer style={{ marginTop: '4px' }}>
                    {record.pregnancyComplications?.map((comp, i) => (
                      <ItemBadge key={i}>{comp}</ItemBadge>
                    ))}
                  </BadgeContainer>
                </InfoGroup>
              )}

              {record.obgynNotes && (
                <InfoGroup style={{ gridColumn: 'span 2' }}>
                  <InfoLabel>OB/GYN Notes</InfoLabel>
                  <p style={{ margin: '4px 0 0 0', fontSize: '0.9rem', color: 'inherit', opacity: 0.8, fontWeight: 500 }}>
                    {record.obgynNotes}
                  </p>
                </InfoGroup>
              )}
            </Grid>
          </Section>
        )}

        {(record.emergencyName || record.emergencyPhone) && (
          <Section>
            <SectionTitle>📞 Emergency Contact</SectionTitle>
            <Grid>
              <InfoGroup>
                <InfoLabel>Contact Name</InfoLabel>
                <InfoValue>{record.emergencyName || 'N/A'}</InfoValue>
              </InfoGroup>
              <InfoGroup>
                <InfoLabel>Relationship</InfoLabel>
                <InfoValue>{record.emergencyRelation || 'N/A'}</InfoValue>
              </InfoGroup>
              <InfoGroup>
                <InfoLabel>Primary Phone</InfoLabel>
                <InfoValue>{record.emergencyPhone || 'N/A'}</InfoValue>
                {record.emergencyPhone && (
                  <CallBtn href={`tel:${record.emergencyPhone}`}>
                    📞 Call {record.emergencyRelation || 'Contact'}
                  </CallBtn>
                )}
              </InfoGroup>
              {record.emergencyPhone2 && (
                <InfoGroup>
                  <InfoLabel>Secondary Phone</InfoLabel>
                  <InfoValue>{record.emergencyPhone2}</InfoValue>
                  <CallBtn href={`tel:${record.emergencyPhone2}`}>
                    📞 Call secondary
                  </CallBtn>
                </InfoGroup>
              )}
            </Grid>
          </Section>
        )}

        {((record.directives && record.directives.length > 0) || record.dirNotes) && (
          <Section>
            <SectionTitle>📜 Care Wishes & Directives</SectionTitle>
            <BadgeContainer>
              {record.directives?.map((dir, i) => (
                <ItemBadge key={i}>{dir}</ItemBadge>
              ))}
            </BadgeContainer>
            {record.dirNotes && (
              <p style={{ margin: '10px 0 0 0', fontSize: '0.9rem', color: '#4b5563', fontWeight: 500 }}>
                {record.dirNotes}
              </p>
            )}
          </Section>
        )}

        {record.address && (
          <Section style={{ borderBottom: 0 }}>
            <SectionTitle>🏠 Home Address</SectionTitle>
            <p style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600 }}>{record.address}</p>
          </Section>
        )}
      </Card>
    </RecordWrapper>
  )
}
