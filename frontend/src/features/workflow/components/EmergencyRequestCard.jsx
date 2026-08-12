import { useState } from 'react'
import styled, { keyframes } from 'styled-components'
import { Button } from '../screens/ScreenPrimitives'

const shimmer = keyframes`
  0% { transform: translateX(-120%); opacity: 0.0; }
  15% { opacity: 0.55; }
  60% { opacity: 0.55; }
  100% { transform: translateX(120%); opacity: 0.0; }
`

const Card = styled.details`
  background: ${({ theme }) => theme.colors.surface};
  border-radius: 16px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  margin-bottom: 12px;
  overflow: hidden;

  summary::-webkit-details-marker {
    display: none;
  }

  summary {
    list-style: none;
  }

  &[open] summary {
    border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  }

  &[open] summary .chevron {
    transform: rotate(180deg);
  }
`

const Summary = styled.summary`
  padding: 16px;
  cursor: pointer;
  display: block;
  user-select: none;
`

const TopRow = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: flex-start;
`

const Name = styled.h4`
  margin: 0;
  font-size: 1.08rem;
`

const Meta = styled.p`
  margin: 4px 0 0;
  color: ${({ theme }) => theme.colors.muted};
`

const Right = styled.div`
  text-align: right;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6px;
`

const Priority = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.primary};
  font-size: 0.9rem;
  font-weight: 800;
`

const Vitals = styled.p`
  margin: 10px 0 0;
  color: #16a34a;
  font-size: 0.9rem;
  font-weight: 700;
`

const Chevron = styled.span`
  width: 38px;
  height: 38px;
  border-radius: 999px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.text};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  transition: transform 180ms ease, background 180ms ease;
  background: ${({ theme }) => (theme.mode === 'dark' ? '#172336' : '#f8fafc')};

  svg {
    width: 18px;
    height: 18px;
  }
`

const Body = styled.div`
  padding: 14px 16px 16px;
`

const AcceptButton = styled(Button)`
  margin-top: 14px;
  border-radius: 12px;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: -20%;
    bottom: -20%;
    left: 0;
    width: 46%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.75), transparent);
    transform: translateX(-120%);
    animation: ${shimmer} 1600ms ease-in-out infinite;
    pointer-events: none;
  }

  &:disabled::before {
    display: none;
  }

  @media (prefers-reduced-motion: reduce) {
    &::before {
      animation: none;
      display: none;
    }
  }
`

function ChevronIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function EmergencyRequestCard({ request, onAccept, defaultOpen = false }) {
  const [accepted, setAccepted] = useState(false)

  const handleAccept = () => {
    if (accepted) return
    setAccepted(true)
    onAccept?.(request)
  }

  return (
    <Card open={defaultOpen}>
      <Summary>
        <TopRow>
          <div>
            <Name>{request.name}</Name>
            <Meta>{request.condition}</Meta>
          </div>
          <Right>
            <Priority>{request.priority}</Priority>
            <Chevron className="chevron" aria-hidden="true">
              <ChevronIcon />
            </Chevron>
          </Right>
        </TopRow>
      </Summary>

      <Body>
        <Meta>Age: {request.age}</Meta>
        <Meta>
          {request.timeAgo} | {request.distanceKm} km away
        </Meta>
        <Vitals>
          BP: {request.bp}, HR: {request.hr}
        </Vitals>

        <AcceptButton disabled={accepted} onClick={handleAccept} type="button">
          {accepted ? 'Accepted' : 'Accept Request'}
        </AcceptButton>
      </Body>
    </Card>
  )
}

