import styled from 'styled-components'
import { Button, Card, Screen, Subtitle, Title } from '../screens/ScreenPrimitives'
import { InPageMenuButton } from './InPageMenuButton'

const TopBar = styled.header`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
`

const BackButton = styled.button`
  width: 38px;
  height: 38px;
  border-radius: 999px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surfaceAlt};
  color: #334155;
  cursor: pointer;
  font-size: 1rem;
`

const HeaderTitle = styled(Title)`
  margin: 0;
  font-size: 1.45rem;
  line-height: 1.2;
`

const SessionCard = styled(Card)`
  padding: 16px;
`

const SectionHeading = styled.h3`
  margin: 0 0 12px;
  font-size: 1.45rem;
  letter-spacing: -0.01em;
`

const PatientRow = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 12px;
`

const PatientName = styled.h4`
  margin: 0;
  font-size: 1.1rem;
`

const Muted = styled.p`
  margin: 4px 0 0;
  color: ${({ theme }) => theme.colors.muted};
`

const PriorityWrap = styled.div`
  text-align: right;
`

const Condition = styled.p`
  margin: 0;
  font-weight: 600;
`

const Priority = styled.p`
  margin: 4px 0 0;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.primary};
`

const SubTitle = styled.h4`
  margin: 14px 0 6px;
  font-size: 1.05rem;
`

const SubText = styled(Muted)`
  margin-top: 0;
`

const VitalsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
`

const VitalTile = styled.div`
  border-radius: 12px;
  padding: 14px;
  text-align: center;
  background: ${({ $bg }) => $bg};
`

const VitalValue = styled.p`
  margin: 0;
  font-size: 2rem;
  line-height: 1.1;
  font-weight: 700;
  color: ${({ $color }) => $color};
`

const VitalLabel = styled.p`
  margin: 8px 0 0;
`

const HistoryCard = styled.div`
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  padding: 12px;
  margin-bottom: 10px;
`

const StickyAction = styled.div`
  position: sticky;
  bottom: 12px;
  margin-top: 8px;
`

const PrimaryAction = styled(Button)`
  border-radius: 12px;
`

export function EmergencySessionView({
  title = 'Emergency Session',
  subtitle = '',
  session,
  showBack = false,
  onBack,
  onAccept,
  acceptLabel = 'Accept Request',
}) {
  return (
    <Screen>
      <TopBar>
        <InPageMenuButton />
        {showBack ? <BackButton onClick={onBack}>{'<'}</BackButton> : null}
        <HeaderTitle>{title}</HeaderTitle>
      </TopBar>
      {subtitle ? <Subtitle>{subtitle}</Subtitle> : null}

      <SessionCard>
        <SectionHeading>Patient Information</SectionHeading>
        <PatientRow>
          <div>
            <PatientName>{session.patient.name}</PatientName>
            <Muted>Age: {session.patient.age}</Muted>
            <Muted>{session.patient.distanceKm} km</Muted>
          </div>
          <PriorityWrap>
            <Condition>{session.patient.condition}</Condition>
            <Priority>{session.patient.priorityLabel}</Priority>
          </PriorityWrap>
        </PatientRow>
        <SubTitle>Symptoms</SubTitle>
        <SubText>{session.patient.symptoms}</SubText>
      </SessionCard>

      <SessionCard>
        <SectionHeading>Vital Signs</SectionHeading>
        <VitalsGrid>
          {session.vitals.map((vital) => (
            <VitalTile key={vital.label} $bg={vital.bg}>
              <VitalValue $color={vital.color}>{vital.value}</VitalValue>
              <VitalLabel>{vital.label}</VitalLabel>
            </VitalTile>
          ))}
        </VitalsGrid>
      </SessionCard>

      <SessionCard>
        <SectionHeading>Medical History</SectionHeading>
        <HistoryCard>
          <SubTitle>History</SubTitle>
          <SubText>{session.history.summary}</SubText>
        </HistoryCard>
        <HistoryCard>
          <SubTitle>Medication</SubTitle>
          <SubText>{session.history.medication}</SubText>
        </HistoryCard>
      </SessionCard>

      <StickyAction>
        <PrimaryAction type="button" onClick={onAccept}>
          {acceptLabel}
        </PrimaryAction>
      </StickyAction>
    </Screen>
  )
}
