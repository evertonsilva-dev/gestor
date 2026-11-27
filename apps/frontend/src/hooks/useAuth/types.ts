import type { UserProfile } from '@/types/domain'

export interface AuthContextValue {
  profile: UserProfile | null
  isLoading: boolean
  authError: string | null
  signIn: (email: string, password: string) => Promise<void>
  signInWithKey: (accessKey: string) => Promise<void>
  signOut: () => Promise<void>
  refresh: () => Promise<void>
}
