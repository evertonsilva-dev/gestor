import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { AppShell } from '@/components/AppShell'
import { LoadingScreen } from '@/components/LoadingScreen'

const AdminPage = lazy(() =>
  import('@/pages/AdminPage').then(({ AdminPage }) => ({
    default: AdminPage,
  })),
)
const DashboardPage = lazy(() =>
  import('@/pages/DashboardPage').then(
    ({ DashboardPage }) => ({ default: DashboardPage }),
  ),
)

export function AuthenticatedRoutes() {
  const { isLoading, profile } = useAuth()

  if (isLoading) {
    return <LoadingScreen label="Verificando acesso" />
  }

  if (!profile) {
    return <Navigate to="/login" replace />
  }

  return (
    <AppShell>
      <Suspense fallback={<LoadingScreen label="Carregando página" />}>
        <Routes>
          <Route
            path="/"
            element={
              profile.role === 'admin' ? <AdminPage /> : <DashboardPage />
            }
          />
          <Route
            path="/dashboard"
            element={
              profile.role === 'client' ? (
                <DashboardPage />
              ) : (
                <Navigate to="/admin" replace />
              )
            }
          />
          <Route
            path="/admin/*"
            element={
              profile.role === 'admin' ? (
                <AdminPage />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </AppShell>
  )
}
