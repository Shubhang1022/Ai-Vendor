import { useState, useEffect } from 'react'
import { X, Plus, Edit, Trash2, Shield, User } from 'lucide-react'
import { authApi } from '../../services/api'
import toast from 'react-hot-toast'

interface User {
  id: string
  email: string
  roles: string[]
  mfaEnabled: boolean
  isActive: boolean
  createdAt: string
}

interface UserManagementModalProps {
  onClose: () => void
}

export function UserManagementModal({ onClose }: UserManagementModalProps) {
  const [users, setUsers] = useState<User[]>([])
  const [showAddUser, setShowAddUser] = useState(false)
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    roles: ['vendor'] as string[]
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Simulate fetching users
    setUsers([
      {
        id: '1',
        email: 'admin@vendorplatform.com',
        roles: ['admin'],
        mfaEnabled: false,
        isActive: true,
        createdAt: '2024-01-15'
      },
      {
        id: '2',
        email: 'vendor@example.com',
        roles: ['vendor'],
        mfaEnabled: false,
        isActive: true,
        createdAt: '2024-01-20'
      },
      {
        id: '3',
        email: 'john@techcorp.com',
        roles: ['vendor'],
        mfaEnabled: true,
        isActive: true,
        createdAt: '2024-01-25'
      }
    ])
  }, [])

  const handleAddUser = async () => {
    if (newUser.password !== newUser.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    setLoading(true)
    try {
      await authApi.register({
        email: newUser.email,
        password: newUser.password,
        confirmPassword: newUser.confirmPassword,
        roles: newUser.roles
      })
      
      toast.success('User created successfully!')
      setShowAddUser(false)
      setNewUser({ email: '', password: '', confirmPassword: '', roles: ['vendor'] })
      
      // Add to local state (in real app, refetch from server)
      const newUserData: User = {
        id: Date.now().toString(),
        email: newUser.email,
        roles: newUser.roles,
        mfaEnabled: false,
        isActive: true,
        createdAt: new Date().toISOString().split('T')[0]
      }
      setUsers(prev => [...prev, newUserData])
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Failed to create user')
    } finally {
      setLoading(false)
    }
  }

  const toggleUserStatus = (userId: string) => {
    setUsers(prev => prev.map(user => 
      user.id === userId 
        ? { ...user, isActive: !user.isActive }
        : user
    ))
    toast.success('User status updated')
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">User Management</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900">System Users</h3>
              <p className="text-sm text-gray-500">Manage user accounts and permissions</p>
            </div>
            <button
              onClick={() => setShowAddUser(true)}
              className="btn btn-primary"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add User
            </button>
          </div>

          {showAddUser && (
            <div className="mb-6 p-4 border rounded-lg bg-gray-50">
              <h4 className="text-md font-medium text-gray-900 mb-4">Add New User</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                    className="input"
                    placeholder="user@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role
                  </label>
                  <select
                    value={newUser.roles[0]}
                    onChange={(e) => setNewUser(prev => ({ ...prev, roles: [e.target.value] }))}
                    className="input"
                  >
                    <option value="vendor">Vendor</option>
                    <option value="admin">Admin</option>
                    <option value="readonly">Read Only</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser(prev => ({ ...prev, password: e.target.value }))}
                    className="input"
                    placeholder="Password"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    value={newUser.confirmPassword}
                    onChange={(e) => setNewUser(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    className="input"
                    placeholder="Confirm Password"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-4">
                <button
                  onClick={() => setShowAddUser(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddUser}
                  disabled={loading}
                  className="btn btn-primary disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Create User'}
                </button>
              </div>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    MFA
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8">
                          <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                            <User className="h-4 w-4 text-gray-500" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.roles.includes('admin') 
                          ? 'bg-red-100 text-red-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {user.roles[0]}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Shield className={`h-4 w-4 mr-1 ${
                          user.mfaEnabled ? 'text-green-500' : 'text-gray-400'
                        }`} />
                        <span className="text-sm text-gray-500">
                          {user.mfaEnabled ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.isActive 
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.createdAt}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button className="text-primary-600 hover:text-primary-900">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => toggleUserStatus(user.id)}
                        className="text-gray-600 hover:text-gray-900"
                      >
                        {user.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}