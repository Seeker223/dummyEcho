import styled from 'styled-components'
import emergencyLogo from '../assets/emergencyecho.png'
import { imageSource } from '../shared/utils/imageSource'

const emergencyLogoSrc = imageSource(emergencyLogo)

const Page = styled.main`
  min-height: 100vh;
  background: ${({ theme }) => (theme.mode === 'dark' ? theme.colors.bgEnd : '#ffffff')};
  color: ${({ theme }) => theme.colors.text};
`

const Topbar = styled.header`
  position: sticky;
  top: 0;
  z-index: 50;
  background: ${({ theme }) => (theme.mode === 'dark' ? 'rgba(15, 23, 42, 0.9)' : 'rgba(255, 255, 255, 0.9)')};
  backdrop-filter: blur(14px);
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`

const TopbarInner = styled.div`
  width: min(1100px, 94vw);
  margin: 0 auto;
  padding: 14px 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`

const Brand = styled.button`
  border: 0;
  background: transparent;
  padding: 0;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font: inherit;
  min-width: 0;

  img {
    width: 34px;
    height: 34px;
  }

  span {
    font-weight: 900;
    letter-spacing: -0.02em;
    white-space: nowrap;
  }
`

const BackButton = styled.button`
  width: 42px;
  height: 42px;
  border-radius: 999px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.text};
  box-shadow: 0 10px 18px rgba(15, 31, 68, 0.08);
  transition: transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease;

  @media (hover: hover) {
    &:hover {
      transform: translateY(-1px);
      border-color: ${({ theme }) => theme.colors.primary};
      box-shadow: 0 14px 22px rgba(15, 31, 68, 0.12);
    }
  }
`

const HeaderLeft = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
`

const HeaderMeta = styled.div`
  display: grid;
  gap: 2px;
  min-width: 0;
`

const HeaderTitle = styled.p`
  margin: 0;
  font-weight: 900;
  letter-spacing: -0.02em;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`

const HeaderHint = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.muted};
  font-size: 0.9rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`

const Actions = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 10px;
  flex: 0 0 auto;
`

const ActionBtn = styled.button`
  border-radius: 999px;
  padding: 10px 16px;
  cursor: pointer;
  font-weight: 800;
  border: 1px solid ${({ $tone, theme }) => ($tone === 'primary' ? theme.colors.primary : theme.colors.border)};
  background: ${({ $tone, theme }) => ($tone === 'primary' ? theme.colors.primary : theme.colors.surface)};
  color: ${({ $tone, theme }) => ($tone === 'primary' ? '#fff' : theme.colors.text)};
  box-shadow: ${({ $tone }) => ($tone === 'primary' ? '0 10px 22px rgba(220, 38, 38, 0.22)' : 'none')};
  transition: transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease;

  @media (hover: hover) {
    &:hover {
      transform: translateY(-1px);
      box-shadow: ${({ $tone }) => ($tone === 'primary' ? '0 14px 28px rgba(220, 38, 38, 0.28)' : '0 12px 20px rgba(15, 31, 68, 0.1)')};
      border-color: ${({ theme }) => theme.colors.primary};
    }
  }
`

const Content = styled.div`
  width: min(980px, 94vw);
  margin: 0 auto;
  padding: 18px 0 34px;
`

export function AssistantShell({ actions, children, onBack, onLogoClick, title }) {
  return (
    <Page>
      <Topbar>
        <TopbarInner>
          <HeaderLeft>
            {onBack ? (
              <BackButton aria-label="Back" type="button" onClick={onBack}>
                {'<'}
              </BackButton>
            ) : null}
            <Brand onClick={onLogoClick} type="button" aria-label="Emergency Echo home">
              <img alt="Emergency Echo" src={emergencyLogoSrc} />
              <span>EmergencyEcho</span>
            </Brand>
            <HeaderMeta>
              <HeaderTitle>{title}</HeaderTitle>
            </HeaderMeta>
          </HeaderLeft>

          <Actions>
            {actions?.secondary ? (
              <ActionBtn type="button" onClick={actions.secondary.onClick}>
                {actions.secondary.label}
              </ActionBtn>
            ) : null}
            {actions?.primary ? (
              <ActionBtn $tone="primary" type="button" onClick={actions.primary.onClick}>
                {actions.primary.label}
              </ActionBtn>
            ) : null}
          </Actions>
        </TopbarInner>
      </Topbar>

      <Content>{children}</Content>
    </Page>
  )
}

