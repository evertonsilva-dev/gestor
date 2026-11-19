import { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { AppShell } from "@/components/appShell";
import { LoadingScreen } from "@/components/loadingScreen";
import { GlobalStyles } from "@/theme/globalStyles";
import { theme } from "@/theme";
import { ThemeProvider } from "styled-components";

const AdminPage = lazy(() =>
  import("@/features/admin/pages/adminPage").then(({ AdminPage }) => ({
    default: AdminPage,
  })),
);
const LoginPage = lazy(() =>
  import("@/features/auth/pages/loginPage").then(({ LoginPage }) => ({
    default: LoginPage,
  })),
);
const ClientLoginPage = lazy(() =>
  import("@/features/auth/pages/clientLoginPage").then(
    ({ ClientLoginPage }) => ({ default: ClientLoginPage }),
  ),
);
const ResetPasswordPage = lazy(() =>
  import("@/features/auth/pages/resetPasswordPage").then(
    ({ ResetPasswordPage }) => ({ default: ResetPasswordPage }),
  ),
);
const DashboardPage = lazy(() =>
  import("@/features/dashboard/pages/dashboardPage").then(
    ({ DashboardPage }) => ({ default: DashboardPage }),
  ),
);

function AuthenticatedRoutes() {
  const { isLoading, profile } = useAuth();

  if (isLoading) {
    return <LoadingScreen label="Verificando acesso" />;
  }

  if (!profile) {
    return <Navigate to="/login" replace />;
  }

  return (
    <AppShell>
      <Suspense fallback={<LoadingScreen label="Carregando página" />}>
        <Routes>
          <Route
            path="/"
            element={
              profile.role === "admin" ? <AdminPage /> : <DashboardPage />
            }
          />
          <Route
            path="/dashboard"
            element={
              profile.role === "client" ? (
                <DashboardPage />
              ) : (
                <Navigate to="/admin" replace />
              )
            }
          />
          <Route
            path="/admin/*"
            element={
              profile.role === "admin" ? (
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
  );
}

function AppRoutes() {
  const { isLoading, profile, authError } = useAuth();

  if (isLoading) {
    return <LoadingScreen label="Carregando plataforma" />;
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
  );
}

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
  );
}

export default App;
