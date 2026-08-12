import styled from 'styled-components'

const Bar = styled.nav`
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 115;
  padding: 10px 12px calc(10px + env(safe-area-inset-bottom));
  background: ${({ theme }) => (theme.mode === 'dark' ? 'rgba(17, 24, 39, 0.92)' : 'rgba(255, 255, 255, 0.92)')};
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  box-shadow: 0 -18px 44px rgba(15, 31, 68, 0.12);
  color-scheme: ${({ theme }) => (theme.mode === 'dark' ? 'dark' : 'light')};

  @media (min-width: 1024px) {
    display: none;
  }
`

const Row = styled.div`
  max-width: 560px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 6px;
`

const Item = styled.button`
  border: 0;
  background: transparent;
  cursor: pointer;
  padding: 8px 6px;
  border-radius: 14px;
  display: grid;
  justify-items: center;
  gap: 4px;
  color: ${({ $active, theme }) => ($active ? theme.colors.primary : (theme.mode === 'dark' ? '#000000' : theme.colors.muted))};
  transition: transform 160ms ease, background 160ms ease, color 160ms ease;

  @media (hover: hover) {
    &:hover {
      background: ${({ theme }) => (theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(15, 31, 68, 0.04)')};
      transform: translateY(-1px);
    }
  }

  &:active {
    transform: translateY(0);
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 2px;
  }
`

const Icon = styled.span`
  width: clamp(24px, 6vw, 28px);
  height: clamp(24px, 6vw, 28px);
  display: grid;
  place-items: center;
  color: inherit;

  svg {
    width: clamp(20px, 5vw, 24px);
    height: clamp(20px, 5vw, 24px);
  }
`

const Label = styled.span`
  font-size: clamp(0.68rem, 2vw, 0.76rem);
  font-weight: 700;
  letter-spacing: -0.01em;
  color: inherit;
`

function HomeIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 10.5L12 3l9 7.5V21a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1v-10.5Z" />
    </svg>
  )
}

function ChatIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15a4 4 0 0 1-4 4H7l-4 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v8Z" />
    </svg>
  )
}

function KitIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 3h6l1 3h4v15a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6h4l1-3Z" />
      <path d="M12 9v6M9 12h6" strokeLinecap="round" />
    </svg>
  )
}

function MarketIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M6 7h15l-1.5 9H7.5L6 7Z" />
      <path d="M6 7 5 3H2" strokeLinecap="round" />
      <path d="M9 21a1 1 0 1 0 0-2 1 1 0 0 0 0 2ZM18 21a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" />
    </svg>
  )
}

function MenuIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 6h16" strokeLinecap="round" />
      <path d="M4 12h16" strokeLinecap="round" />
      <path d="M4 18h16" strokeLinecap="round" />
    </svg>
  )
}

export function MobileBottomNav({ activePage, onNavigate, onOpenMenu, homePageId = 'home', homeLabel = 'Home' }) {
  const activeTab = [homePageId, 'chat', 'kit', 'marketplace'].includes(activePage) ? activePage : 'more'

  const nav = (pageId) => {
    if (onNavigate) onNavigate(pageId)
  }

  const openMenu = () => {
    if (onOpenMenu) onOpenMenu()
    else window.dispatchEvent(new Event('ee:open-nav'))
  }

  return (
    <Bar aria-label="Primary navigation">
      <Row>
        <Item $active={activeTab === homePageId} onClick={() => nav(homePageId)} type="button">
          <Icon aria-hidden="true">
            <HomeIcon />
          </Icon>
          <Label>{homeLabel}</Label>
        </Item>
        <Item $active={activeTab === 'chat'} onClick={() => nav('chat')} type="button">
          <Icon aria-hidden="true">
            <ChatIcon />
          </Icon>
          <Label>Chat</Label>
        </Item>
        <Item $active={activeTab === 'kit'} onClick={() => nav('kit')} type="button">
          <Icon aria-hidden="true">
            <KitIcon />
          </Icon>
          <Label>My Kit</Label>
        </Item>
        <Item $active={activeTab === 'marketplace'} onClick={() => nav('marketplace')} type="button">
          <Icon aria-hidden="true">
            <MarketIcon />
          </Icon>
          <Label>Market</Label>
        </Item>
        <Item $active={activeTab === 'more'} onClick={openMenu} type="button">
          <Icon aria-hidden="true">
            <MenuIcon />
          </Icon>
          <Label>More</Label>
        </Item>
      </Row>
    </Bar>
  )
}
