import { createGlobalStyle } from 'styled-components'

export const GlobalStyles = createGlobalStyle`
  *, *::before, *::after {
    box-sizing: border-box;
  }

  :root {
    font-family: Geometria, "Avenir Next", Inter, "Segoe UI", sans-serif;
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

  #root {
    min-width: 0;
    min-height: 100vh;
  }

  img, svg {
    max-width: 100%;
  }

  h1, h2, h3, p {
    overflow-wrap: anywhere;
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
