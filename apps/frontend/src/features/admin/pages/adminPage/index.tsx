import { Navigate, Route, Routes } from 'react-router-dom'
import { AdminOverviewPage } from '../adminOverviewPage'
import { MonitoringPage } from '../monitoringPage'
import { OrganizationsPage } from '../organizationsPage'

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
