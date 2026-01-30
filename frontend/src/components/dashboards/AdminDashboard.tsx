import { useState, useEffect } from 'react'
import { useAuthStore } from '../../stores/authStore'
import { 
  Users, 
  Shield, 
  Activity, 
  TrendingUp,
  DollarSign,
  Package,
  BarChart3,
  AlertCircle,
  Settings,
  Database,
  Lock,
  UserPlus
} from 'lucide-react'
import { UserManagementModal } from '../modals/UserManagementModal'
import { SystemSettingsModal } from '../modals/SystemSettingsModal'

export function AdminDashboard() {
  const { user } = useAuthStore()
  const [showUserManagement, setShowUserManagement] = useState(false)
  const [showSystemSettings, setShowSystemSettings] = useState(false)
  const [systemStats, setSystemStats] = useState({
    totalUsers: 0,
    activeVendors: 0,
    totalTransactions: 0,
    systemUptime: '99.9%'
  })

  useEffect(() => {
    // Simulate fetching admin stats
    setSystemStats({
      totalUsers: 1247,
      activeVendors: 892,
      totalTransactions: 15678,
      systemUptime: '99.9%'
    })
  }, [])

  const adminStats = [
    {
      name: 'Total Users',
      value: systemStats.totalUsers.toLocaleString(),
      change: '+5.2%',
      changeType: 'positive',
      icon: Users,
      color: 'bg-blue-500'
    },
    {
      name: 'Active Vendors',
      value: systemStats.activeVendors.toLocaleString(),
      change: '+12%',
      changeType: 'positive',
      icon: Package,
      color: 'bg-green-500'
    },
    {
      name: 'Total Transactions',
      value: systemStats.totalTransactions.toLocaleString(),
      change: '+8.1%',
      changeType: 'positive',
      icon: DollarSign,
      color: 'bg-yellow-500'
    },
    {
      name: 'System Uptime',
      value: systemStats.systemUptime,
      change: 'Last 30 days',
      changeType: 'neutral',
      icon: Activity,
      color: 'bg-purple-500'
    },
  ]

  const recentAdminActivity = [
    {
      id: 1,
      type: 'user_created',
      message: 'New vendor account created: TechCorp Solutions',
      time: '5 minutes ago',
      icon: UserPlus,
      severity: 'info'
    },
    {
      id: 2,
      type: 'security',
      message: 'Failed login attempts detected from IP 192.168.1.100',
      time: '15 minutes ago',
      icon: AlertCircle,
      severity: 'warning'
    },
    {
      id: 3,
      type: 'system',
      message: 'Database backup completed successfully',
      time: '1 hour ago',
      icon: Database,
      severity: 'success'
    },
    {
      id: 4,
      type: 'security',
      message: 'MFA enabled for user: john@example.com',
      time: '2 hours ago',
      icon: Shield,
      severity: 'success'
    },
  ]

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Admin Dashboard</h1>
          <p className="mt-2 text-sm text-gray-700">
            System overview and administrative controls for {user?.email}
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
            <Shield className="w-4 h-4 mr-1" />
            Administrator
          </span>
        </div>
      </div>

      {/* Admin Stats */}
      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {adminStats.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.name} className="card p-5 hover:shadow-lg transition-shadow">
              <div className="flex items-center">
                <div className={`flex-shrink-0 p-3 rounded-lg ${stat.color}`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {stat.name}
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {stat.value}
                      </div>
                      <div
                        className={`ml-2 flex items-baseline text-sm font-semibold ${
                          stat.changeType === 'positive'
                            ? 'text-green-600'
                            : stat.changeType === 'negative'
                            ? 'text-red-600'
                            : 'text-gray-500'
                        }`}
                      >
                        {stat.change}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* System Activity */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <Activity className="w-5 h-5 mr-2" />
                System Activity
              </h3>
            </div>
            <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
              {recentAdminActivity.map((activity) => {
                const Icon = activity.icon
                return (
                  <div key={activity.id} className="px-6 py-4 hover:bg-gray-50">
                    <div className="flex items-start">
                      <div className={`flex-shrink-0 p-2 rounded-full ${
                        activity.severity === 'success' ? 'bg-green-100' :
                        activity.severity === 'warning' ? 'bg-yellow-100' :
                        activity.severity === 'error' ? 'bg-red-100' : 'bg-blue-100'
                      }`}>
                        <Icon className={`h-4 w-4 ${
                          activity.severity === 'success' ? 'text-green-600' :
                          activity.severity === 'warning' ? 'text-yellow-600' :
                          activity.severity === 'error' ? 'text-red-600' : 'text-blue-600'
                        }`} />
                      </div>
                      <div className="ml-3 flex-1">
                        <p className="text-sm text-gray-900">{activity.message}</p>
                        <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Admin Actions */}
        <div className="card">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <Settings className="w-5 h-5 mr-2" />
              Admin Actions
            </h3>
          </div>
          <div className="p-6 space-y-4">
            <button 
              onClick={() => setShowUserManagement(true)}
              className="w-full btn btn-primary text-left hover:bg-primary-700 transition-colors"
            >
              <Users className="w-4 h-4 mr-2 inline" />
              Manage Users
            </button>
            <button 
              onClick={() => setShowSystemSettings(true)}
              className="w-full btn btn-secondary text-left hover:bg-gray-300 transition-colors"
            >
              <Settings className="w-4 h-4 mr-2 inline" />
              System Settings
            </button>
            <button className="w-full btn btn-secondary text-left hover:bg-gray-300 transition-colors">
              <Shield className="w-4 h-4 mr-2 inline" />
              Security Audit
            </button>
            <button className="w-full btn btn-secondary text-left hover:bg-gray-300 transition-colors">
              <Database className="w-4 h-4 mr-2 inline" />
              Database Backup
            </button>
            <button className="w-full btn btn-secondary text-left hover:bg-gray-300 transition-colors">
              <BarChart3 className="w-4 h-4 mr-2 inline" />
              Analytics Report
            </button>
          </div>
        </div>
      </div>

      {/* System Health */}
      <div className="mt-8">
        <div className="card p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <Activity className="w-5 h-5 mr-2" />
            System Health
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">99.9%</div>
              <div className="text-sm text-gray-500">Uptime</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">45ms</div>
              <div className="text-sm text-gray-500">Avg Response</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">2.1GB</div>
              <div className="text-sm text-gray-500">Memory Usage</div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showUserManagement && (
        <UserManagementModal onClose={() => setShowUserManagement(false)} />
      )}
      {showSystemSettings && (
        <SystemSettingsModal onClose={() => setShowSystemSettings(false)} />
      )}
    </div>
  )
}