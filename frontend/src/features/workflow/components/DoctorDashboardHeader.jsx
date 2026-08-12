import styled from 'styled-components'
import { InPageMenuButton } from './InPageMenuButton'
import { AiStarButton } from './AiStarButton'

const Wrapper = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 2px 10px;
  gap: 12px;
`

const Greeting = styled.h2`
  margin: 0;
  font-size: 1.8rem;
  line-height: 1.15;
`

const SubText = styled.p`
  margin: 6px 0 0;
  color: ${({ theme }) => theme?.colors?.muted || '#6b7280'};
`

const Right = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`

const Avatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 999px;
  background: ${({ theme }) => theme.colors.primaryDeep};
  color: #fff;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
`

const Notification = styled.button`
  width: 44px;
  height: 44px;
  border: 1.5px solid ${({ theme }) => theme.colors.primary};
  border-radius: 12px;
  background: transparent;
  color: ${({ theme }) => theme.colors.primary};
  cursor: pointer;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.4rem;
  transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);
  
  @media (hover: hover) {
    &:hover {
      background: ${({ theme }) => theme.mode === 'dark' ? 'rgba(220, 38, 38, 0.1)' : 'rgba(220, 38, 38, 0.05)'};
      transform: scale(1.08);
    }
  }
`

const Dot = styled.span`
  position: absolute;
  top: 6px;
  right: 6px;
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: ${({ theme }) => theme.colors.primary};
  border: 2px solid ${({ theme }) => theme.colors.surface};
`

export function DoctorDashboardHeader({ doctorName, title, subtitle = 'How are you doing today?', onNotify, onAiClick }) {
  const firstName = doctorName?.split(' ')[0] || 'Doc'
  const greetingName = title ? `${title} ${firstName}` : firstName
  const initials = doctorName
    ?.split(' ')
    .map((item) => item[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <Wrapper>
      <InPageMenuButton />
      <div>
        <Greeting>Hello {greetingName}</Greeting>
        <SubText>{subtitle}</SubText>
      </div>
      <Right>
        <AiStarButton onClick={onAiClick} />
        <Avatar>{initials || 'DR'}</Avatar>
        <Notification aria-label="Open notifications" onClick={onNotify} type="button" title="Notifications">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          <Dot />
        </Notification>
      </Right>
    </Wrapper>
  )
}
