import type { PropsWithChildren } from 'react'
import { AuthContext } from '@/hooks/useAuth'
import { useAuthProvider } from '@/hooks/useAuthProvider'

export function AuthProvider({ children }: PropsWithChildren) {
  const value = useAuthProvider()

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
