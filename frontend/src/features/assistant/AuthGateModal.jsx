import styled from 'styled-components'

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 2000;
  background: rgba(0, 0, 0, 0.34);
  backdrop-filter: blur(8px);
  display: grid;
  place-items: center;
  padding: 18px;
`

const Modal = styled.div`
  width: min(520px, 100%);
  border-radius: 18px;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  box-shadow: 0 24px 70px rgba(0, 0, 0, 0.24);
  padding: 18px;
`

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`

const Avatar = styled.img`
  width: 48px;
  height: 48px;
  border-radius: 999px;
  object-fit: cover;
  box-shadow: 0 12px 22px rgba(15, 31, 68, 0.16);
  border: 2px solid ${({ theme }) => theme.colors.surface};
`

const Title = styled.h3`
  margin: 0;
  font-size: 1.2rem;
  font-weight: 900;
  letter-spacing: -0.02em;
`

const Text = styled.p`
  margin: 8px 0 0;
  color: ${({ theme }) => theme.colors.muted};
  line-height: 1.55;
`

const Row = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-top: 16px;

  @media (max-width: 520px) {
    grid-template-columns: 1fr;
  }
`

const Button = styled.button`
  border-radius: 999px;
  padding: 12px 14px;
  cursor: pointer;
  font-weight: 900;
  border: 1px solid ${({ $tone, theme }) => ($tone === 'primary' ? theme.colors.primary : theme.colors.border)};
  background: ${({ $tone, theme }) => ($tone === 'primary' ? theme.colors.primary : theme.colors.surface)};
  color: ${({ $tone, theme }) => ($tone === 'primary' ? '#fff' : theme.colors.text)};
  transition: transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease;

  @media (hover: hover) {
    &:hover {
      transform: translateY(-1px);
      border-color: ${({ theme }) => theme.colors.primary};
      box-shadow: ${({ $tone }) => ($tone === 'primary' ? '0 14px 28px rgba(220, 38, 38, 0.26)' : '0 12px 20px rgba(15, 31, 68, 0.12)')};
    }
  }
`

const CloseRow = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 12px;
`

const CloseBtn = styled.button`
  border: 0;
  background: transparent;
  color: ${({ theme }) => theme.colors.muted};
  cursor: pointer;
  font-weight: 800;

  @media (hover: hover) {
    &:hover {
      color: ${({ theme }) => theme.colors.primary};
    }
  }
`

export function AuthGateModal({
  isOpen,
  message,
  nextPage = 'voice',
  onClose,
  onLogin,
  onSignup,
  title = 'Create a free account to continue',
  avatarSrc,
}) {
  if (!isOpen) return null

  return (
    <Overlay
      role="dialog"
      aria-modal="true"
      onClick={() => {
        onClose?.()
      }}
    >
      <Modal
        onClick={(e) => {
          e.stopPropagation()
        }}
      >
        <Header>
          {avatarSrc ? <Avatar alt="" src={avatarSrc} /> : null}
          <Title>{title}</Title>
        </Header>
        <Text>{message}</Text>

        <Row>
          <Button
            type="button"
            onClick={() => {
              onSignup?.(nextPage)
            }}
            $tone="primary"
          >
            Create account
          </Button>
          <Button
            type="button"
            onClick={() => {
              onLogin?.(nextPage)
            }}
          >
            Log in
          </Button>
        </Row>
        <CloseRow>
          <CloseBtn type="button" onClick={onClose}>
            Not now
          </CloseBtn>
        </CloseRow>
      </Modal>
    </Overlay>
  )
}
