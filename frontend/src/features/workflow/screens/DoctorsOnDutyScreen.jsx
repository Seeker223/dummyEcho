import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styled, { keyframes } from 'styled-components'
import { useAuth } from '../../auth/context/useAuth'
import { Screen } from './ScreenPrimitives'
import { InPageMenuButton } from '../components/InPageMenuButton'
import { showAssistant } from '../components/AssistantCharacterOverlay'

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`

const Header = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 6px 2px 12px;
`

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
`

const TitleBlock = styled.div`
  display: grid;
  gap: 2px;
  min-width: 0;
`

const Title = styled.div`
  font-weight: 950;
  letter-spacing: -0.03em;
  font-size: 1.2rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const Sub = styled.div`
  color: ${({ theme }) => theme.colors.muted};
  font-weight: 750;
  font-size: 0.92rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const BackBtn = styled.button`
  width: 44px;
  height: 44px;
  border-radius: 999px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  cursor: pointer;
  font-weight: 900;
`

const FilterRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-top: 6px;
`

const Pill = styled.button`
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  border-radius: 999px;
  padding: 8px 12px;
  font-weight: 850;
  cursor: pointer;
`

const List = styled.div`
  margin-top: 12px;
  display: grid;
  gap: 12px;
`

const Card = styled.button`
  width: 100%;
  text-align: left;
  border-radius: 18px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  box-shadow: ${({ theme }) => theme.shadow.elevated};
  overflow: hidden;
  animation: ${fadeUp} 240ms ease both;
  cursor: pointer;

  &:focus-visible {
    outline: 3px solid ${({ theme }) => theme.colors.ring};
    outline-offset: 2px;
  }
`

const CardTop = styled.div`
  display: grid;
  grid-template-columns: 96px 1fr;
  gap: 14px;
  padding: 14px 14px 10px;
`

const Avatar = styled.div`
  width: 96px;
  height: 96px;
  border-radius: 999px;
  background: ${({ theme }) =>
    theme.mode === 'dark'
      ? 'linear-gradient(135deg, rgba(37, 99, 235, 0.25), rgba(16, 185, 129, 0.14))'
      : 'linear-gradient(135deg, rgba(37, 99, 235, 0.18), rgba(220, 38, 38, 0.10))'};
  border: 1px solid ${({ theme }) => theme.colors.border};
  display: grid;
  place-items: center;
  color: ${({ theme }) => theme.colors.text};
  font-weight: 950;
  letter-spacing: -0.02em;
`

const Name = styled.div`
  font-weight: 1000;
  letter-spacing: -0.02em;
  font-size: 1.05rem;
`

const Specialty = styled.div`
  margin-top: 4px;
  color: ${({ theme }) => theme.colors.muted};
  font-weight: 750;
  font-size: 0.92rem;
`

const MetaGrid = styled.div`
  margin-top: 10px;
  display: grid;
  gap: 6px;
  color: ${({ theme }) => theme.colors.muted};
  font-weight: 700;
  font-size: 0.92rem;
`

const MetaRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
`

const StatusPill = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border-radius: 999px;
  padding: 6px 10px;
  font-weight: 950;
  font-size: 0.78rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme, $online }) =>
    $online ? (theme.mode === 'dark' ? 'rgba(34,197,94,0.16)' : 'rgba(34,197,94,0.10)') : theme.colors.surfaceAlt};
  color: ${({ theme, $online }) =>
    $online ? (theme.mode === 'dark' ? '#86efac' : '#166534') : theme.colors.text};
`

const StatusDot = styled.span`
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: ${({ $online }) => ($online ? '#22c55e' : '#94a3b8')};
  box-shadow: ${({ $online }) => ($online ? '0 0 0 5px rgba(34,197,94,0.14)' : 'none')};
`

const Divider = styled.div`
  height: 1px;
  background: ${({ theme }) => theme.colors.border};
`

const Tags = styled.div`
  padding: 10px 14px 14px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  color: ${({ theme }) => theme.colors.muted};
  font-weight: 750;
  font-size: 0.9rem;
`

const Dot = styled.span`
  width: 4px;
  height: 4px;
  border-radius: 999px;
  background: ${({ theme }) => theme.colors.muted};
  display: inline-block;
  opacity: 0.8;
`

function formatLastSeen(iso) {
  const t = new Date(iso).getTime()
  if (!Number.isFinite(t)) return 'unknown'
  const diff = Math.max(0, Date.now() - t)
  const mins = Math.round(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins} min ago`
  const hrs = Math.round(mins / 60)
  if (hrs < 24) return `${hrs} hr ago`
  const days = Math.round(hrs / 24)
  return `${days} day ago`
}

export default function DoctorsOnDutyScreen() {
  const navigate = useNavigate()
  const { users } = useAuth()
  const [stateFilter] = useState('Rivers state')

  const doctors = useMemo(() => {
    const fromUsers = (users || [])
      .filter((u) => ['doctor', 'nurse'].includes(String(u.role || '').toLowerCase()))
      .map((u, idx) => ({
        id: u.id || u.email || `doc-${idx}`,
        name: u.fullName || u.name || `Dr. ${u.username || 'Emergency Echo'}`,
        specialty: u.specialization || (String(u.role || '').toLowerCase() === 'nurse' ? 'Nurse' : 'General Practice'),
        price: 'NGN 2,300/hr',
        consultA: '1000MED (NGN 1,500)',
        consultB: '1000MED (NGN 1,500)',
        languages: 'English & Igbo',
        online: idx % 3 !== 0,
        lastSeenAt: new Date(Date.now() - (idx % 8) * 11 * 60_000).toISOString(),
        tags: ['Great communication', 'Problem solving', 'Attention to detail'],
      }))

    if (fromUsers.length) return fromUsers

    return [
      {
        id: 'sample-1',
        name: 'Nrs. Oluwapelumi',
        specialty: 'Cardiologist',
        price: 'NGN 2,300/hr',
        consultA: '1000MED (NGN 1,500)',
        consultB: '1000MED (NGN 1,500)',
        languages: 'English & Igbo',
        online: true,
        lastSeenAt: new Date(Date.now() - 4 * 60_000).toISOString(),
        tags: ['Great communication', 'Problem solving', 'Attention to detail'],
      },
      {
        id: 'sample-2',
        name: 'Nrs. Oluwapelumi',
        specialty: 'Gynecologist',
        price: 'NGN 2,300/hr',
        consultA: '1000MED (NGN 1,500)',
        consultB: '1000MED (NGN 1,500)',
        languages: 'English & Igbo',
        online: false,
        lastSeenAt: new Date(Date.now() - 2 * 60 * 60_000).toISOString(),
        tags: ['Great communication', 'Problem solving', 'Attention to detail'],
      },
    ]
  }, [users])

  return (
    <Screen>
      <Header>
        <HeaderLeft>
          <InPageMenuButton />
          <BackBtn type="button" onClick={() => navigate(-1)} aria-label="Back">
            {'<'}
          </BackBtn>
          <TitleBlock>
            <Title>{stateFilter} • Doctors</Title>
            <Sub>Doctor • {stateFilter}</Sub>
          </TitleBlock>
        </HeaderLeft>
        <div style={{ width: 44 }} />
      </Header>

      <FilterRow>
        <Pill type="button" aria-label="State filter">
          {stateFilter}
        </Pill>
        <Pill type="button" onClick={() => {
          try { showAssistant({ title: 'EchoAI Triage', message: 'All live sessions require AI triage first.', avatar: 'nurse', durationMs: 4000 }) } catch {}
          navigate('/app/voice-ai')
        }} aria-label="Start a session">
          Start session
        </Pill>
      </FilterRow>

      <List aria-label="Doctors list">
        {doctors.map((doc) => {
          const initials = String(doc.name || 'Doctor')
            .split(' ')
            .filter(Boolean)
            .slice(0, 2)
            .map((w) => w[0])
            .join('')
            .toUpperCase()

          return (
            <Card key={doc.id} onClick={() => navigate('/app/doctor-profile', { state: { doctor: doc } })} type="button">
              <CardTop>
                <Avatar aria-hidden="true">{initials || 'DR'}</Avatar>
                <div>
                  <Name>{doc.name}</Name>
                  <Specialty>{doc.specialty}</Specialty>
                  <MetaGrid>
                    <MetaRow>
                      <StatusPill $online={Boolean(doc.online)}>
                        <StatusDot aria-hidden="true" $online={Boolean(doc.online)} />
                        {doc.online ? 'Online' : 'Offline'}
                      </StatusPill>
                      <span>{doc.online ? `Updated ${formatLastSeen(doc.lastSeenAt)}` : `Last seen ${formatLastSeen(doc.lastSeenAt)}`}</span>
                    </MetaRow>
                    <MetaRow>{doc.languages}</MetaRow>
                  </MetaGrid>
                </div>
              </CardTop>
              <Divider />
              <Tags>
                {doc.tags.map((t, idx) => (
                  <span key={`${doc.id}-t-${idx}`}>
                    {idx ? <Dot aria-hidden="true" /> : null} {t}
                  </span>
                ))}
              </Tags>
            </Card>
          )
        })}
      </List>
    </Screen>
  )
}
