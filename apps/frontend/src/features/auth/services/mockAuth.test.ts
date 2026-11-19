import { describe, expect, it } from 'vitest'
import { authenticateMockUser, mockCredentials } from './mockAuth'

describe('authenticateMockUser', () => {
  it('accepts the documented local demo credentials', () => {
    expect(authenticateMockUser(mockCredentials.email, mockCredentials.password)?.role).toBe('client')
  })

  it('rejects invalid passwords', () => {
    expect(authenticateMockUser(mockCredentials.email, 'wrong-password')).toBeNull()
  })
})
