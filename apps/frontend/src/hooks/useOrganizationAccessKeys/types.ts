export interface ClientAccessKey {
  id: string
  label: string
  keyPrefix: string
  createdAt: string
  revokedAt: string | null
}

export interface CreatedClientAccessKey extends ClientAccessKey {
  accessKey: string
}

export interface UseOrganizationAccessKeysResult {
  keys: ClientAccessKey[]
  isLoading: boolean
  error: string | null
  refresh: () => Promise<void>
  createAccessKey: (label: string) => Promise<CreatedClientAccessKey>
  revokeAccessKey: (id: string) => Promise<void>
}
