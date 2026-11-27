import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '@/components/AuthProvider'
import { AppRoutes } from '@/components/AppRoutes'
import { GlobalStyles } from '@/theme/globalStyles'
import { theme } from '@/theme'
import { ThemeProvider } from 'styled-components'

function App() {
  return (
    <AuthProvider>
      <ThemeProvider theme={theme}>
        <GlobalStyles />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </ThemeProvider>
    </AuthProvider>
  )
}

export default App
