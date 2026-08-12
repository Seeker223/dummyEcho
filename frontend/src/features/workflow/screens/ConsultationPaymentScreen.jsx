import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import { Button, Card, Screen } from '../screens/ScreenPrimitives'
import { showAssistant } from '../components/AssistantCharacterOverlay'

const Header = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
`

const HeaderTitle = styled.h2`
  margin: 0;
  font-size: 1.5rem;
`

const Content = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  text-align: center;
  padding: 20px 0;
`

const AmountDisplay = styled.div`
  font-size: 2.5rem;
  font-weight: 900;
  color: ${({ theme }) => theme.colors.success};
`

const Subtext = styled.p`
  color: ${({ theme }) => theme.colors.muted};
  font-size: 1rem;
  line-height: 1.5;
`

const Actions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 24px;
`

const CancelBtn = styled(Button)`
  background: transparent;
  color: ${({ theme }) => theme.colors.muted};
  border: 1px solid ${({ theme }) => theme.colors.border};
`

export default function ConsultationPaymentScreen() {
  const navigate = useNavigate()

  const onProceed = () => {
    navigate('/app/consultation-mode')
  }

  const onCancel = () => {
    navigate('/app')
  }

  return (
    <Screen>
      <Header>
        <HeaderTitle>Consultation Authorization</HeaderTitle>
      </Header>

      <Card>
        <Content>
          <div>
            <AmountDisplay>Free</AmountDisplay>
            <Subtext>Your first minute is free! (Once per week)</Subtext>
          </div>
          
          <Subtext>
            No amount will be deducted from your personal wallet for this session. The consultation fee is covered.
          </Subtext>
        </Content>

        <Actions>
          <Button onClick={onProceed}>Proceed to Consultation</Button>
          <CancelBtn onClick={onCancel}>Cancel</CancelBtn>
        </Actions>
      </Card>
    </Screen>
  )
}
