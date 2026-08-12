import styled from 'styled-components'

const Button = styled.button`
  width: 40px;
  height: 40px;
  border-radius: 999px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10px 18px rgba(15, 31, 68, 0.08);
  flex: 0 0 auto;
  
  @media (min-width: 1024px) {
    display: none;
  }

  @media (hover: hover) {
    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 14px 22px rgba(15, 31, 68, 0.12);
    }
  }
`

const Icon = styled.span`
  position: relative;
  width: 18px;
  height: 12px;
  display: inline-block;

  &::before,
  &::after,
  span {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    height: 2px;
    border-radius: 999px;
    background: currentColor;
  }

  &::before {
    top: 0;
  }

  span {
    top: 5px;
  }

  &::after {
    bottom: 0;
  }
`

export function InPageMenuButton({ ariaLabel = 'Open menu', onClick }) {
  const handleClick =
    onClick ||
    (() => {
      window.dispatchEvent(new Event('ee:open-nav'))
    })

  return (
    <Button aria-label={ariaLabel} onClick={handleClick} type="button">
      <Icon aria-hidden="true">
        <span />
      </Icon>
    </Button>
  )
}

