import { useState } from 'react'
import { X, Save, Shield, Database, Bell, Globe } from 'lucide-react'
import toast from 'react-hot-toast'

interface SystemSettingsModalProps {
  onClose: () => void
}

export function SystemSettingsModal({ onClose }: SystemSettingsModalProps) {
  const [settings, setSettings] = useState({
    security: {
      jwtExpirationMinutes: 15,
      refreshTokenDays: 7,
      maxLoginAttempts: 5,
      lockoutDurationMinutes: 15,
      requireMFA: false,
      passwordMinLength: 8
    },
    system: {
      maintenanceMode: false,
      allowRegistration: true,
      defaultUserRole: 'vendor',
      sessionTimeoutMinutes: 30
    },
    notifications: {
      emailNotifications: true,
      securityAlerts: true,
      systemUpdates: false,
      marketingEmails: false
    }
  })

  const [loading, setLoading] = useState(false)

  const handleSave = async () => {
    setLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success('Settings saved successfully!')
      onClose()
    } catch (error) {
      toast.error('Failed to save settings')
    } finally {
      setLoading(false)
    }
  }

  const updateSetting = (category: keyof typeof settings, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }))
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">System Settings</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Security Settings */}
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <Shield className="w-5 h-5 mr-2 text-red-500" />
              <h3 className="text-lg font-medium text-gray-900">Security Settings</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  JWT Token Expiration (minutes)
                </label>
                <input
                  type="number"
                  value={settings.security.jwtExpirationMinutes}
                  onChange={(e) => updateSetting('security', 'jwtExpirationMinutes', parseInt(e.target.value))}
                  className="input"
                  min="5"
                  max="1440"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Refresh Token Expiration (days)
                </label>
                <input
                  type="number"
                  value={settings.security.refreshTokenDays}
                  onChange={(e) => updateSetting('security', 'refreshTokenDays', parseInt(e.target.value))}
                  className="input"
                  min="1"
                  max="30"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Login Attempts
                </label>
                <input
                  type="number"
                  value={settings.security.maxLoginAttempts}
                  onChange={(e) => updateSetting('security', 'maxLoginAttempts', parseInt(e.target.value))}
                  className="input"
                  min="3"
                  max="10"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lockout Duration (minutes)
                </label>
                <input
                  type="number"
                  value={settings.security.lockoutDurationMinutes}
                  onChange={(e) => updateSetting('security', 'lockoutDurationMinutes', parseInt(e.target.value))}
                  className="input"
                  min="5"
                  max="60"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Minimum Password Length
                </label>
                <input
                  type="number"
                  value={settings.security.passwordMinLength}
                  onChange={(e) => updateSetting('security', 'passwordMinLength', parseInt(e.target.value))}
                  className="input"
                  min="6"
                  max="20"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="requireMFA"
                  checked={settings.security.requireMFA}
                  onChange={(e) => updateSetting('security', 'requireMFA', e.target.checked)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="requireMFA" className="ml-2 block text-sm text-gray-900">
                  Require MFA for all users
                </label>
              </div>
            </div>
          </div>

          {/* System Settings */}
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <Database className="w-5 h-5 mr-2 text-blue-500" />
              <h3 className="text-lg font-medium text-gray-900">System Settings</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Default User Role
                </label>
                <select
                  value={settings.system.defaultUserRole}
                  onChange={(e) => updateSetting('system', 'defaultUserRole', e.target.value)}
                  className="input"
                >
                  <option value="vendor">Vendor</option>
                  <option value="readonly">Read Only</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Session Timeout (minutes)
                </label>
                <input
                  type="number"
                  value={settings.system.sessionTimeoutMinutes}
                  onChange={(e) => updateSetting('system', 'sessionTimeoutMinutes', parseInt(e.target.value))}
                  className="input"
                  min="15"
                  max="480"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="maintenanceMode"
                  checked={settings.system.maintenanceMode}
                  onChange={(e) => updateSetting('system', 'maintenanceMode', e.target.checked)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="maintenanceMode" className="ml-2 block text-sm text-gray-900">
                  Maintenance Mode
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="allowRegistration"
                  checked={settings.system.allowRegistration}
                  onChange={(e) => updateSetting('system', 'allowRegistration', e.target.checked)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="allowRegistration" className="ml-2 block text-sm text-gray-900">
                  Allow User Registration
                </label>
              </div>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <Bell className="w-5 h-5 mr-2 text-yellow-500" />
              <h3 className="text-lg font-medium text-gray-900">Notification Settings</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="emailNotifications"
                  checked={settings.notifications.emailNotifications}
                  onChange={(e) => updateSetting('notifications', 'emailNotifications', e.target.checked)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="emailNotifications" className="ml-2 block text-sm text-gray-900">
                  Email Notifications
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="securityAlerts"
                  checked={settings.notifications.securityAlerts}
                  onChange={(e) => updateSetting('notifications', 'securityAlerts', e.target.checked)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="securityAlerts" className="ml-2 block text-sm text-gray-900">
                  Security Alerts
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="systemUpdates"
                  checked={settings.notifications.systemUpdates}
                  onChange={(e) => updateSetting('notifications', 'systemUpdates', e.target.checked)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="systemUpdates" className="ml-2 block text-sm text-gray-900">
                  System Update Notifications
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3 p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="btn btn-secondary"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="btn btn-primary disabled:opacity-50"
          >
            <Save className="w-4 h-4 mr-2" />
            {loading ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  )
}