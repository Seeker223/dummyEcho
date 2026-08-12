import styled from 'styled-components'
import { useNavigate } from 'react-router-dom'

const Fab = styled.button`
  position: fixed;
  right: 18px;
  bottom: 18px;
  z-index: 120;
  width: 58px;
  height: 58px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.55);
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
  color: #fff;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 18px 34px rgba(220, 38, 38, 0.28);
  --fab-x: 0px;
  --fab-y: 0px;
  transform: translate(var(--fab-x), var(--fab-y));
  transition: transform 160ms ease, box-shadow 160ms ease, filter 160ms ease;

  /* Small screens: bottom-center reads more like a web CTA than a native Android FAB. */
  @media (max-width: 640px) {
    right: auto;
    left: 50%;
    --fab-x: -50%;
    bottom: 92px;
    width: 54px;
    height: 54px;
  }

  @media (hover: hover) {
    &:hover {
      --fab-y: -2px;
      box-shadow: 0 22px 44px rgba(220, 38, 38, 0.34);
      filter: saturate(1.05);
    }
  }

  &:active {
    --fab-y: 0px;
    box-shadow: 0 18px 34px rgba(220, 38, 38, 0.26);
  }

  &:focus-visible {
    outline: 3px solid rgba(220, 38, 38, 0.26);
    outline-offset: 3px;
  }
`

function Icon() {
  return (
    <svg aria-hidden="true" width="26" height="26" viewBox="0 0 24 24">
      <path
        d="M12 3a4 4 0 0 0-4 4v4a4 4 0 1 0 8 0V7a4 4 0 0 0-4-4Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M6 11a6 6 0 0 0 12 0"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M12 17v4"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function AiAssistFab({ to = '/app/voice-ai', ariaLabel = 'AI emergency assistant' }) {
  const navigate = useNavigate()
  return (
    <Fab type="button" aria-label={ariaLabel} onClick={() => navigate(to)}>
      <Icon />
    </Fab>
  )
}
