import styled, { keyframes } from 'styled-components'

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`

const riseIn = keyframes`
  from { transform: translateY(18px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
`

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 2200;
  background: rgba(0, 0, 0, 0.34);
  backdrop-filter: blur(8px);
  display: grid;
  place-items: center;
  padding: 16px;
  animation: ${fadeIn} 180ms ease both;
`

const Sheet = styled.div`
  width: min(520px, 100%);
  border-radius: 20px;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  box-shadow: 0 24px 70px rgba(0, 0, 0, 0.24);
  padding: 16px;
  animation: ${riseIn} 220ms ease both;

  @media (max-width: 640px) {
    width: 100%;
    border-radius: 18px 18px 0 0;
    padding-bottom: calc(16px + env(safe-area-inset-bottom));
    place-self: end stretch;
  }
`

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`

const Avatar = styled.img`
  width: 54px;
  height: 54px;
  border-radius: 999px;
  object-fit: cover;
  border: 2px solid ${({ theme }) => theme.colors.surface};
  box-shadow: 0 12px 22px rgba(15, 31, 68, 0.16);
`

const HeaderText = styled.div`
  min-width: 0;
  display: grid;
  gap: 2px;
`

const Title = styled.h3`
  margin: 0;
  font-size: 1.12rem;
  font-weight: 1000;
  letter-spacing: -0.02em;
`

const Text = styled.p`
  margin: 8px 0 0;
  color: ${({ theme }) => theme.colors.muted};
  line-height: 1.55;
  font-weight: 650;
`

const Actions = styled.div`
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
  font-weight: 950;
  border: 1px solid ${({ $tone, theme }) => ($tone === 'primary' ? theme.colors.primary : theme.colors.border)};
  background: ${({ $tone, theme }) => ($tone === 'primary' ? theme.colors.primary : theme.colors.surface)};
  color: ${({ $tone, theme }) => ($tone === 'primary' ? '#fff' : theme.colors.text)};
  transition: transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease;

  @media (hover: hover) {
    &:hover {
      transform: translateY(-1px);
      border-color: ${({ theme }) => theme.colors.primary};
      box-shadow: ${({ $tone }) =>
        $tone === 'primary' ? '0 14px 28px rgba(220, 38, 38, 0.26)' : '0 12px 20px rgba(15, 31, 68, 0.12)'};
    }
  }
`

export function BrandedSheetModal({
  isOpen,
  title,
  message,
  avatarSrc,
  primaryLabel = 'Continue',
  secondaryLabel = 'Not now',
  onPrimary,
  onClose,
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
      <Sheet
        onClick={(e) => {
          e.stopPropagation()
        }}
      >
        <Header>
          {avatarSrc ? <Avatar alt="" src={avatarSrc} /> : null}
          <HeaderText>
            <Title>{title}</Title>
          </HeaderText>
        </Header>
        <Text>{message}</Text>

        <Actions>
          <Button
            type="button"
            $tone="primary"
            onClick={() => {
              onPrimary?.()
            }}
          >
            {primaryLabel}
          </Button>
          <Button
            type="button"
            onClick={() => {
              onClose?.()
            }}
          >
            {secondaryLabel}
          </Button>
        </Actions>
      </Sheet>
    </Overlay>
  )
}

