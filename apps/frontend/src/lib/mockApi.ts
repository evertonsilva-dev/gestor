import { mockProfile } from '@/features/auth/services/mockAuth'
import { mockDashboardData } from '@/features/dashboard/services/mockDashboard'

export async function mockApiRequest<T>(path: string): Promise<T> {
  const pathname = new URL(path, window.location.origin).pathname

  if (pathname === '/api/me') {
    return mockProfile as T
  }

  if (pathname === '/api/dashboard') {
    return mockDashboardData as T
  }

  throw new Error('Esta rota não está disponível no modo de demonstração.')
}
