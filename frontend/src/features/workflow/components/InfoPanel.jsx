import styled from 'styled-components'
import { useAuth } from '../../auth/context/useAuth'
import { Skeleton } from '../../../shared/components/Skeleton'
import { useWorkflowData } from '../hooks/useWorkflowData'

const Panel = styled.aside`
  min-width: 0;
  padding: 18px;
  border-radius: ${({ theme }) => theme?.radii?.lg || '16px'};
  border: 1px solid ${({ theme }) => theme?.colors?.border || '#e5e7eb'};
  background: ${({ theme }) => (theme?.mode === 'dark' ? 'rgba(17, 26, 42, 0.86)' : 'rgba(255, 255, 255, 0.74)')};
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  align-self: start;
  box-shadow: 0 12px 28px rgba(15, 31, 68, 0.1);

  h2 {
    margin: 0 0 10px;
    font-size: 1.45rem;
    line-height: 1.08;
  }

  p {
    margin: 0;
    color: ${({ theme }) => theme?.colors?.muted || '#6b7280'};
    line-height: 1.55;
  }
`

const Section = styled.section`
  margin-top: 16px;
`

const SectionTitle = styled.h3`
  margin: 0 0 8px;
  font-size: 0.98rem;
  font-weight: 800;
  color: ${({ theme }) => theme?.colors?.text || '#1a1f2e'};
`

const BulletList = styled.ul`
  margin: 0;
  padding-left: 18px;
  color: ${({ theme }) => theme?.colors?.text || '#1a1f2e'};
`

const Bullet = styled.li`
  margin: 0 0 8px;
  line-height: 1.45;
`

const Small = styled.small`
  display: block;
  margin-top: 14px;
  color: ${({ theme }) => theme?.colors?.muted || '#6b7280'};
  font-weight: 600;
`

const guides = {
  home: {
    subtitle: 'Quick access to emergency help, support, and readiness tools.',
    actions: ['Tap the mic to speak or tap the box to type.', 'Use quick chips for common symptoms.', 'Use the menu for medical kit, wallet, and applications.'],
    walkthrough: {
      title: 'Home walkthrough',
      desc: 'See how to start triage and open the main tools quickly.',
      videoId: 'haKKUZQVu_g'
    }
  },
  chat: {
    subtitle: 'Describe symptoms and get immediate guidance.',
    actions: ['Type your concern in plain language.', 'Follow the next-step suggestions.', 'Fill your medical kit for more personalized guidance.'],
  },
  kit: {
    subtitle: 'Store your health details for faster emergency response.',
    actions: ['Add blood type, allergies, conditions, and medications.', 'Keep emergency contacts up to date.'],
  },
  wallet: {
    subtitle: 'View balance, payments, and recent activity.',
    actions: ['Fund your wallet when needed.', 'Review transaction history.'],
  },
  marketplace: {
    subtitle: 'Browse labs, medications, and wellness offers.',
    actions: ['Search or browse categories.', 'Open a listing to see details.'],
  },
  notifications: {
    subtitle: 'Your updates and reminders in one place.',
    actions: ['Review new alerts.', 'Open an item for more details.'],
  },
  profile: {
    subtitle: 'Manage your account settings and preferences.',
    actions: ['Update your profile info.', 'Enable or disable key features.'],
  },
  directory: {
    subtitle: 'People registered in the system.',
    actions: ['See who is online.', 'Review roles and recent activity time.'],
  },
}



const VideoPanel = styled.div`
  display: grid;
  gap: 10px;
  margin-top: 16px;
`

const VideoSection = styled.section`
  padding: 13px;
  border-radius: 16px;
  border: 1px solid ${({ $tone }) => ($tone === 'danger' ? 'rgba(220, 38, 38, 0.18)' : '#e2e8f0')};
  background: ${({ $tone }) => ($tone === 'danger' ? 'linear-gradient(135deg, rgba(254, 242, 242, 0.98), rgba(255, 255, 255, 0.96))' : 'rgba(255, 255, 255, 0.82)')};
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.04);
`

const VideoSectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 10px;
`

const VideoSectionTitle = styled.h3`
  margin: 0;
  font-size: 0.86rem;
  font-weight: 900;
  color: ${({ theme }) => theme?.colors?.text || '#111827'};
`

const VideoSectionMeta = styled.span`
  color: #64748b;
  font-size: 0.67rem;
  font-weight: 850;
`

const TeamList = styled.div`
  display: grid;
  gap: 7px;
`

const TeamRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 8px 9px;
  border-radius: 12px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
`

const TeamIdentity = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
`

const TeamAvatar = styled.div`
  width: 30px;
  height: 30px;
  flex: 0 0 auto;
  border-radius: 9px;
  display: grid;
  place-items: center;
  background: ${({ $self }) => ($self ? '#fee2e2' : '#e2e8f0')};
  color: ${({ $self }) => ($self ? '#b91c1c' : '#334155')};
  font-size: 0.66rem;
  font-weight: 950;
`

const TeamName = styled.div`
  min-width: 0;
  display: grid;
  gap: 2px;
`

const TeamPrimary = styled.span`
  font-size: 0.74rem;
  font-weight: 850;
  color: #0f172a;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const TeamSecondary = styled.span`
  font-size: 0.63rem;
  color: #64748b;
  font-weight: 700;
  text-transform: capitalize;
`

const TeamState = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  flex: 0 0 auto;
  color: ${({ $tone }) => ($tone === 'danger' ? '#b91c1c' : $tone === 'warning' ? '#a16207' : '#15803d')};
  font-size: 0.62rem;
  font-weight: 850;
`

const TeamDot = styled.span`
  width: 6px;
  height: 6px;
  border-radius: 999px;
  background: currentColor;
`

const EmergencySummary = styled.div`
  display: grid;
  gap: 7px;
`

const EmergencyLine = styled.div`
  display: grid;
  grid-template-columns: 24px minmax(0, 1fr);
  gap: 8px;
  color: #475569;
  font-size: 0.71rem;
  line-height: 1.42;
`

const EmergencyIcon = styled.span`
  width: 24px;
  height: 24px;
  display: grid;
  place-items: center;
  border-radius: 8px;
  background: ${({ $tone }) => ($tone === 'danger' ? '#fee2e2' : '#f1f5f9')};
  color: ${({ $tone }) => ($tone === 'danger' ? '#b91c1c' : '#475569')};
`

const LiveState = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 7px;
  border-radius: 999px;
  background: ${({ $danger, $warning }) => ($danger ? '#fef2f2' : $warning ? '#fffbeb' : '#f0fdf4')};
  color: ${({ $danger, $warning }) => ($danger ? '#b91c1c' : $warning ? '#a16207' : '#15803d')};
  font-size: 0.62rem;
  font-weight: 900;
`

const LiveDot = styled.span`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
`

const PhaseTrack = styled.div`
  display: grid;
  gap: 6px;
`

const PhaseRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: ${({ $active }) => ($active ? '#0f172a' : '#94a3b8')};
  font-size: 0.68rem;
  font-weight: ${({ $active }) => ($active ? 850 : 700)};
`

const PhaseDot = styled.span`
  width: 8px;
  height: 8px;
  flex: 0 0 auto;
  border-radius: 50%;
  background: ${({ $active }) => ($active ? '#dc2626' : '#cbd5e1')};
  box-shadow: ${({ $active }) => ($active ? '0 0 0 4px rgba(220, 38, 38, 0.1)' : 'none')};
`

const DetailGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 7px;
`

const DetailCard = styled.div`
  min-width: 0;
  padding: 8px;
  border-radius: 11px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
`

const DetailLabel = styled.div`
  color: #64748b;
  font-size: 0.58rem;
  font-weight: 850;
  text-transform: uppercase;
  letter-spacing: 0.04em;
`

const DetailValue = styled.div`
  margin-top: 3px;
  color: #0f172a;
  font-size: 0.68rem;
  font-weight: 800;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`

const VitalsGrid = styled(DetailGrid)`
  grid-template-columns: repeat(2, minmax(0, 1fr));
`

const SessionCard = styled.div`
  padding: 10px;
  border-radius: 13px;
  background: linear-gradient(135deg, rgba(220, 38, 38, 0.07), rgba(59, 130, 246, 0.05));
  border: 1px solid rgba(148, 163, 184, 0.15);
`

const SessionName = styled.div`
  color: #0f172a;
  font-size: 0.78rem;
  font-weight: 900;
`

const SessionRole = styled.div`
  margin-top: 3px;
  color: #64748b;
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: capitalize;
`

function Icon({ name }) {
  const common = { width: 14, height: 14, viewBox: '0 0 24 24', fill: 'none', 'aria-hidden': true }
  if (name === 'alert') return <svg {...common}><path d="M12 3v10M12 17.5v.5M5.1 20h13.8a2 2 0 0 0 1.73-3L13.73 4a2 2 0 0 0-3.46 0L3.37 17a2 2 0 0 0 1.73 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
  if (name === 'shield') return <svg {...common}><path d="M12 3 5 6v5c0 4.5 2.8 8.1 7 10 4.2-1.9 7-5.5 7-10V6l-7-3Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /><path d="m9 12 2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
  if (name === 'heart') return <svg {...common}><path d="M20.8 8.9c0 5.3-8.8 10.1-8.8 10.1S3.2 14.2 3.2 8.9A4.7 4.7 0 0 1 12 6.5a4.7 4.7 0 0 1 8.8 2.4Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /></svg>
  return <svg {...common}><circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="2" /></svg>
}

function initials(name) {
  return String(name || 'Participant')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'P'
}

function roleLabel(role) {
  return String(role || 'participant').replace('-', ' ')
}

function statusTone(status) {
  if (status === 'error' || status === 'disconnected') return 'danger'
  if (status === 'connecting' || status === 'reconnecting') return 'warning'
  return 'success'
}

function phaseKey(phase) {
  const value = String(phase || '').toLowerCase()
  if (value.includes('doctor')) return 'doctor'
  if (value.includes('nurse')) return 'nurse'
  if (value.includes('ambulance')) return 'ambulance'
  return 'triage'
}

function VideoCallInfo({ summary, currentUser }) {
  const fallbackName = currentUser?.fullName || currentUser?.full_name || currentUser?.name || 'Patient'
  const fallbackRole = currentUser?.role || 'patient'
  const people = Array.isArray(summary?.participants) && summary.participants.length
    ? summary.participants
    : [{ identity: currentUser?.id || 'local', name: summary?.displayName || fallbackName, role: summary?.role || fallbackRole, connected: summary?.status === 'connected' }]
  const status = summary?.status || 'connecting'
  const tone = statusTone(status)
  const statusText = status === 'connected' ? 'Live session' : status === 'reconnecting' ? 'Reconnecting' : status === 'error' ? 'Needs attention' : status === 'disconnected' ? 'Disconnected' : 'Connecting'
  const patient = people.find((person) => String(person.role || '').toLowerCase() === 'patient') || (fallbackRole === 'patient' ? { name: fallbackName, role: 'patient' } : null)
  const profile = summary?.patientProfile || {}
  const vitals = summary?.vitals || {}
  const currentPhase = phaseKey(summary?.phase)
  const phases = [
    ['triage', 'AI triage'],
    ['doctor', 'Doctor consultation'],
    ['nurse', 'Nurse support'],
    ['ambulance', 'Ambulance dispatch'],
  ]

  return (
    <VideoPanel>
      <VideoSection>
        <VideoSectionHeader>
          <VideoSectionTitle>Care team</VideoSectionTitle>
          <VideoSectionMeta>{people.length} {people.length === 1 ? 'person' : 'people'} in room</VideoSectionMeta>
        </VideoSectionHeader>
        <TeamList>
          {people.map((person, index) => {
            const personTone = person.connectionQuality === 'Poor' ? 'warning' : person.connectionQuality === 'Lost' ? 'danger' : 'success'
            return (
              <TeamRow key={person.identity || `${person.name}-${index}`}>
                <TeamIdentity>
                  <TeamAvatar $self={person.name === fallbackName}>{initials(person.name)}</TeamAvatar>
                  <TeamName>
                    <TeamPrimary>{person.name || person.identity || 'Participant'}</TeamPrimary>
                    <TeamSecondary>{person.specialty || roleLabel(person.role)}{person.specialty ? ` • ${roleLabel(person.role)}` : ''}{person.speaking ? ' • Speaking' : ''}</TeamSecondary>
                  </TeamName>
                </TeamIdentity>
                <TeamState $tone={personTone}>
                  <TeamDot />
                  {person.connectionQuality && person.connectionQuality !== 'Unknown' ? person.connectionQuality : person.connected !== false ? 'Connected' : 'Away'}
                </TeamState>
              </TeamRow>
            )
          })}
        </TeamList>
      </VideoSection>

      <VideoSection $tone="danger">
        <VideoSectionHeader>
          <VideoSectionTitle>Emergency status</VideoSectionTitle>
          <LiveState $danger={tone === 'danger'} $warning={tone === 'warning'}><LiveDot />{statusText}</LiveState>
        </VideoSectionHeader>
        <EmergencySummary>
          <EmergencyLine><EmergencyIcon $tone="danger"><Icon name="alert" /></EmergencyIcon><span><strong>Phase:</strong> {summary?.phase || 'Emergency triage'}.</span></EmergencyLine>
          <EmergencyLine><EmergencyIcon><Icon name="shield" /></EmergencyIcon><span><strong>Severity:</strong> {summary?.severity || 'Not provided in this call context'}.</span></EmergencyLine>
          <EmergencyLine><EmergencyIcon><Icon name="heart" /></EmergencyIcon><span><strong>Reason:</strong> {summary?.emergencyReason || 'Emergency consultation. Reason not provided.'}</span></EmergencyLine>
          {summary?.location ? <EmergencyLine><EmergencyIcon><Icon name="shield" /></EmergencyIcon><span><strong>Location:</strong> {summary.location}</span></EmergencyLine> : null}
        </EmergencySummary>
        <PhaseTrack style={{ marginTop: 11 }}>
          {phases.map(([key, label]) => (
            <PhaseRow key={key} $active={key === currentPhase}>
              <PhaseDot $active={key === currentPhase} />
              {label}
            </PhaseRow>
          ))}
        </PhaseTrack>
      </VideoSection>

      <VideoSection>
        <VideoSectionHeader>
          <VideoSectionTitle>Patient safety snapshot</VideoSectionTitle>
          <VideoSectionMeta>{patient?.name || 'Waiting for patient'}</VideoSectionMeta>
        </VideoSectionHeader>
        {patient ? (
          <DetailGrid>
            <DetailCard><DetailLabel>Blood type</DetailLabel><DetailValue>{profile.bloodType || 'Not provided'}</DetailValue></DetailCard>
            <DetailCard><DetailLabel>Allergies</DetailLabel><DetailValue>{profile.allergies || 'None recorded'}</DetailValue></DetailCard>
            <DetailCard><DetailLabel>Conditions</DetailLabel><DetailValue>{profile.conditions || 'Not provided'}</DetailValue></DetailCard>
            <DetailCard><DetailLabel>Medications</DetailLabel><DetailValue>{profile.medications || 'Not provided'}</DetailValue></DetailCard>
          </DetailGrid>
        ) : (
          <EmergencyLine><EmergencyIcon><Icon name="shield" /></EmergencyIcon><span>Patient information will appear when the patient joins the room.</span></EmergencyLine>
        )}
      </VideoSection>

      <VideoSection>
        <VideoSectionHeader>
          <VideoSectionTitle>Live vitals</VideoSectionTitle>
          <VideoSectionMeta>{Object.keys(vitals).length ? 'Updated' : 'Not available'}</VideoSectionMeta>
        </VideoSectionHeader>
        {Object.keys(vitals).length ? (
          <VitalsGrid>
            {Object.entries(vitals).slice(0, 4).map(([key, value]) => (
              <DetailCard key={key}><DetailLabel>{key.replace(/_/g, ' ')}</DetailLabel><DetailValue>{String(value)}</DetailValue></DetailCard>
            ))}
          </VitalsGrid>
        ) : (
          <EmergencyLine><EmergencyIcon><Icon name="heart" /></EmergencyIcon><span>No live vitals have been supplied to this call yet.</span></EmergencyLine>
        )}
      </VideoSection>

      <VideoSection>
        <VideoSectionHeader>
          <VideoSectionTitle>Session safety</VideoSectionTitle>
          <VideoSectionMeta>Production state</VideoSectionMeta>
        </VideoSectionHeader>
        <SessionCard>
          <SessionName>{patient?.name || fallbackName}</SessionName>
          <SessionRole>{patient ? 'Emergency patient' : roleLabel(fallbackRole)} • {summary?.recording?.state === 'active' && summary?.recording?.authoritative ? 'Recording active' : 'Recording inactive'}</SessionRole>
        </SessionCard>
        <Small style={{ marginTop: 8 }}>Recording status is shown as active only when an authoritative recording state is supplied by the session layer.</Small>
      </VideoSection>
    </VideoPanel>
  )
}

export function InfoPanel({ activePage, activePageLabel, videoCallSummary }) {
  const { isAuthenticated, currentUser } = useAuth()
  const { isLoading } = useWorkflowData()

  const role = currentUser?.role || 'patient'
  
  let guide = guides[activePage] || {
    subtitle: 'Main area for your tasks.',
    actions: ['Use the menu to navigate between features.'],
  }

  if (activePage === 'home') {
    if (role === 'doctor' || role === 'nurse') {
      guide = {
        subtitle: 'Live Emergency Triage Queue.',
        actions: ['Accept incoming patients to start live audio/video triage.', 'Use your EchoWallet to withdraw funds.', 'Ensure your verification documents are up to date.'],
        walkthrough: guides.home.walkthrough
      }
    } else {
      guide = guides.home
    }
  }

  const who = isAuthenticated ? 'Signed-in users' : 'Everyone'
  const signedInAs = isAuthenticated
    ? `Signed in as: ${[currentUser?.title, currentUser?.fullName].filter(Boolean).join(' ') || currentUser?.username || 'user'}${currentUser?.role ? ` (${currentUser.role})` : ''}`
    : 'You are not signed in'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', minWidth: 0 }}>
      <Panel>
        {isLoading ? (
          <>
            <Skeleton style={{ height: 26, width: '70%', borderRadius: 10 }} />
            <Skeleton style={{ height: 14, width: '90%', marginTop: 12, borderRadius: 8 }} />
          </>
        ) : (
          <>
            <h2>{activePageLabel}</h2>
            {activePage === 'video-call' ? (
              <>
                <p>{guide.subtitle}</p>
                <Section>
                  <SectionTitle>What you can do here</SectionTitle>
                  <BulletList>
                    {guide.actions.map((text) => (
                      <Bullet key={text}>{text}</Bullet>
                    ))}
                  </BulletList>
                </Section>
                <VideoCallInfo summary={videoCallSummary} currentUser={currentUser} />
                <Small>Who can use this page: {who}</Small>
                <Small>{signedInAs}</Small>
              </>
            ) : (
              <>
                <p>{guide.subtitle}</p>
                <Section>
              <SectionTitle>What you can do here</SectionTitle>
              <BulletList>
                {guide.actions.map((text) => (
                  <Bullet key={text}>{text}</Bullet>
                ))}
              </BulletList>
                </Section>
                <Small>Who can use this page: {who}</Small>
                <Small>{signedInAs}</Small>
              </>
            )}
          </>
        )}
      </Panel>

      {!isLoading && guide.walkthrough && (
        <Panel>
          <h2>{guide.walkthrough.title}</h2>
          <p style={{ marginBottom: 16 }}>{guide.walkthrough.desc}</p>
          <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: '12px', background: '#000' }}>
            <iframe 
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
              src={`https://www.youtube.com/embed/${guide.walkthrough.videoId}`} 
              title="YouTube video player" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowFullScreen
            ></iframe>
          </div>
        </Panel>
      )}
    </div>
  )
}

