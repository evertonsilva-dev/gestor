import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { LoadingScreen } from '@/components/LoadingScreen'
import { AuthenticatedRoutes } from '@/components/AuthenticatedRoutes'

const LoginPage = lazy(() =>
  import('@/pages/LoginPage').then(({ LoginPage }) => ({
    default: LoginPage,
  })),
)
const ClientLoginPage = lazy(() =>
  import('@/pages/ClientLoginPage').then(
    ({ ClientLoginPage }) => ({ default: ClientLoginPage }),
  ),
)
const ResetPasswordPage = lazy(() =>
  import('@/pages/ResetPasswordPage').then(
    ({ ResetPasswordPage }) => ({ default: ResetPasswordPage }),
  ),
)

export function AppRoutes() {
  const { isLoading, profile, authError } = useAuth()

  if (isLoading) {
    return <LoadingScreen label="Carregando plataforma" />
  }

  return (
    <Suspense fallback={<LoadingScreen label="Carregando página" />}>
      <Routes>
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route
          path="/client-login"
          element={profile ? <Navigate to="/" replace /> : <ClientLoginPage />}
        />
        <Route
          path="/login"
          element={
            profile ? (
              <Navigate to="/" replace />
            ) : (
              <LoginPage initialError={authError} />
            )
          }
        />
        <Route path="/*" element={<AuthenticatedRoutes />} />
      </Routes>
    </Suspense>
  )
}
