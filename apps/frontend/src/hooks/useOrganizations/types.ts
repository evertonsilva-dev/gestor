import type { Organization } from '@/types/domain'

export interface UseOrganizationsResult {
  organizations: Organization[]
  isLoading: boolean
  error: string | null
  createOrganization: (name: string, slug: string) => Promise<void>
  updateOrganization: (id: string, update: { name?: string; active?: boolean }) => Promise<void>
  refresh: () => Promise<void>
}
