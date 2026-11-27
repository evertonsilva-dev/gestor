import { Navigate, Route, Routes } from 'react-router-dom'
import { AdminOverviewPage } from '@/pages/AdminOverviewPage'
import { MonitoringPage } from '@/pages/MonitoringPage'
import { OrganizationsPage } from '@/pages/OrganizationsPage'

export function AdminPage() {
  return (
    <Routes>
      <Route index element={<AdminOverviewPage />} />
      <Route path="organizations" element={<OrganizationsPage />} />
      <Route path="monitoring" element={<MonitoringPage />} />
      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  )
}
