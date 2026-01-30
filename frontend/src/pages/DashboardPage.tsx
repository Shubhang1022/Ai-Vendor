import { useAuthStore } from '../stores/authStore'
import { AdminDashboard } from '../components/dashboards/AdminDashboard'
import { VendorDashboard } from '../components/dashboards/VendorDashboard'

export function DashboardPage() {
  const { user } = useAuthStore()

  // Determine user role
  const isAdmin = user?.roles.some(role => role.name === 'admin')
  const isVendor = user?.roles.some(role => role.name === 'vendor')

  // Render appropriate dashboard based on role
  if (isAdmin) {
    return <AdminDashboard />
  } else if (isVendor) {
    return <VendorDashboard />
  } else {
    // Default dashboard for other roles
    return (
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="text-center py-12">
          <h1 className="text-2xl font-semibold text-gray-900">Welcome</h1>
          <p className="mt-2 text-sm text-gray-700">
            Your dashboard is being prepared. Please contact an administrator for access.
          </p>
        </div>
      </div>
    )
  }
}