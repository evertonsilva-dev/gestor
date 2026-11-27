import { useAuth } from '@/hooks/useAuth'
import { useMobileNavigation } from '@/hooks/useMobileNavigation'

export function useAppShell() {
  const { profile, signOut, authError } = useAuth()
  const mobileNavigation = useMobileNavigation()

  return {
    profile,
    authError,
    isAdmin: profile?.role === 'admin',
    mobileNavigation,
    signOut: () => { void signOut().catch(() => undefined) },
  }
}
