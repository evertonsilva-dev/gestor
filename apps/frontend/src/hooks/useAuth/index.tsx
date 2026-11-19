import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { ApiError, apiRequest } from '@/lib/api'
import type { UserProfile } from '@/types/domain'
import {
  authConfigurationError,
  getAuthClient,
  hasAuthConfiguration,
} from '@/features/auth/services/authClient'
import type { AuthContextValue, AuthProviderProps } from './types'

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: AuthProviderProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [authError, setAuthError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setIsLoading(true)
    setAuthError(null)

    if (import.meta.env.DEV && import.meta.env.VITE_MOCK_AUTH === 'true') {
      const { restoreMockSession } = await import('@/features/auth/services/mockAuth')
      setProfile(restoreMockSession())
      setIsLoading(false)
      return
    }

    try {
      try {
        setProfile(await apiRequest<UserProfile>('/api/client/me'))
        return
      } catch (error) {
        if (!(error instanceof ApiError) || error.status !== 401) {
          throw error
        }
      }

      if (!hasAuthConfiguration()) {
        setProfile(null)
        setAuthError(authConfigurationError)
        return
      }

      const session = await getAuthClient().getSession()

      if (session.error) {
        throw new Error(session.error.message)
      }

      if (!session.data) {
        setProfile(null)
        return
      }

      setProfile(await apiRequest<UserProfile>('/api/me'))
    } catch (error) {
      setProfile(null)

      if (error instanceof ApiError && error.status === 401) {
        return
      }

      setAuthError(error instanceof Error ? error.message : 'Falha ao validar a sessão.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const signIn = useCallback(async (email: string, password: string) => {
    setAuthError(null)

    if (import.meta.env.DEV && import.meta.env.VITE_MOCK_AUTH === 'true') {
      const { authenticateMockUser, saveMockSession } = await import('@/features/auth/services/mockAuth')
      const mockProfile = authenticateMockUser(email, password)
      if (!mockProfile) throw new Error('Credenciais de demonstração inválidas.')
      saveMockSession(mockProfile)
      setProfile(mockProfile)
      return
    }

    const result = await getAuthClient().signIn.email({ email, password })

    if (result.error) {
      throw new Error(result.error.message)
    }

    await refresh()
  }, [refresh])

  const signInWithKey = useCallback(async (accessKey: string) => {
    setAuthError(null)
    const clientProfile = await apiRequest<UserProfile>('/api/client/login', {
      method: 'POST',
      body: JSON.stringify({ accessKey }),
    })
    setProfile(clientProfile)
  }, [])

  const signOut = useCallback(async () => {
    if (import.meta.env.DEV && import.meta.env.VITE_MOCK_AUTH === 'true') {
      const { clearMockSession } = await import('@/features/auth/services/mockAuth')
      clearMockSession()
      setProfile(null)
      setAuthError(null)
      return
    }

    try {
      if (profile?.role === 'client') {
        await apiRequest('/api/client/logout', { method: 'POST' })
        setProfile(null)
        setAuthError(null)
        return
      }

      const result = await getAuthClient().signOut()

      if (result.error) {
        throw new Error(result.error.message)
      }

      setProfile(null)
      setAuthError(null)
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Não foi possível encerrar a sessão.')
      throw error
    }
  }, [profile])

  const value = useMemo(
    () => ({ profile, isLoading, authError, signIn, signInWithKey, signOut, refresh }),
    [profile, isLoading, authError, signIn, signInWithKey, signOut, refresh],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider.')
  }

  return context
}
