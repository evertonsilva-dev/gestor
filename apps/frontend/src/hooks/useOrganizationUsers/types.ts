export interface OrganizationUser {
  authUserId: string
  email: string
  name: string | null
  role: 'client'
  active: boolean
}

export interface UseOrganizationUsersResult {
  users: OrganizationUser[]
  error: string | null
  isLoading: boolean
  refresh: () => Promise<void>
  setUserActive: (authUserId: string, active: boolean) => Promise<void>
}
