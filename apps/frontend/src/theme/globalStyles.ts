import { createGlobalStyle } from 'styled-components'

export const GlobalStyles = createGlobalStyle`
  *, *::before, *::after {
    box-sizing: border-box;
  }

  :root {
    font-family: Inter, "Segoe UI", sans-serif;
    color: ${({ theme }) => theme.colors.ink};
    background: ${({ theme }) => theme.colors.background};
    font-synthesis: none;
    text-rendering: optimizeLegibility;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  body {
    min-width: 320px;
    min-height: 100vh;
    margin: 0;
  }

  button, input, select, textarea {
    font: inherit;
  }

  button, a {
    -webkit-tap-highlight-color: transparent;
  }

  a {
    color: inherit;
    text-decoration: none;
  }

  button {
    cursor: pointer;
  }

  button:disabled {
    cursor: not-allowed;
  }

  ::selection {
    color: ${({ theme }) => theme.colors.navy};
    background: ${({ theme }) => theme.colors.gold};
  }
`
