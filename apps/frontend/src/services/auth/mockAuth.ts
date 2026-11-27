import type { UserProfile } from '@/types/domain'

export const mockCredentials = {
  email: 'demo@gestor.local',
  password: 'demo1234',
} as const

export const mockProfile: UserProfile = {
  id: 'mock-client-001',
  name: 'Cliente de demonstração',
  email: mockCredentials.email,
  role: 'client',
  organizationId: 'mock-organization-001',
  organizationName: 'Instituto Horizonte',
}

const mockSessionKey = 'gestor.mock-session'

export function authenticateMockUser(email: string, password: string): UserProfile | null {
  return email.trim().toLowerCase() === mockCredentials.email && password === mockCredentials.password
    ? mockProfile
    : null
}

export function restoreMockSession(): UserProfile | null {
  return sessionStorage.getItem(mockSessionKey) === mockProfile.id ? mockProfile : null
}

export function saveMockSession(profile: UserProfile): void {
  sessionStorage.setItem(mockSessionKey, profile.id)
}

export function clearMockSession(): void {
  sessionStorage.removeItem(mockSessionKey)
}
