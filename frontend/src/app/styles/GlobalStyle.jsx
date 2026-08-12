import { createGlobalStyle } from 'styled-components'

export const GlobalStyle = createGlobalStyle`
  * {
    box-sizing: border-box;
    scrollbar-width: none;
  }

  *::-webkit-scrollbar {
    width: 0;
    height: 0;
    display: none;
  }

  html,
  body,
  #root {
    width: 100%;
    min-height: 100%;
    overflow-x: clip;
  }

  body {
    margin: 0;
    visibility: visible;
    color: ${({ theme }) => theme.colors.text};
    font-family: "Source Sans 3", "Segoe UI", "Helvetica Neue", Arial, sans-serif;
    text-rendering: optimizeLegibility;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background:
      radial-gradient(
        circle at 10% 15%,
        ${({ theme }) =>
          theme.mode === 'dark' ? 'rgba(59, 130, 246, 0.16)' : 'rgba(255, 255, 255, 0.55)'} 0%,
        rgba(255, 255, 255, 0) 48%
      ),
      linear-gradient(140deg, ${({ theme }) => theme.colors.bgStart}, ${({ theme }) => theme.colors.bgEnd});
    position: relative;
    overflow-x: clip;
    transition: color 220ms ease, background 220ms ease;
  }

  body::before,
  body::after {
    content: "";
    position: fixed;
    z-index: -1;
    border-radius: 999px;
    pointer-events: none;
    filter: blur(72px);
    opacity: 0.45;
  }

  body::before {
    width: 260px;
    height: 260px;
    top: -70px;
    right: 6%;
    background: ${({ theme }) => theme.colors.glowRed};
  }

  body::after {
    width: 300px;
    height: 300px;
    bottom: -110px;
    left: 4%;
    background: ${({ theme }) => theme.colors.glowBlue};
  }

  button,
  input,
  select,
  textarea {
    font: inherit;
    color: inherit;
  }

  h1,
  h2,
  h3,
  h4 {
    font-weight: 700;
    letter-spacing: -0.02em;
  }
`
