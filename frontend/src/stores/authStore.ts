import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authApi } from '../services/api'
import toast from 'react-hot-toast'

export interface User {
  id: string
  email: string
  roles: Array<{
    id: string
    name: string
    permissions: Array<{
      id: string
      resource: string
      action: string
    }>
  }>
  mfaEnabled: boolean
}

interface AuthState {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string, totpCode?: string) => Promise<boolean>
  logout: () => Promise<void>
  refreshTokens: () => Promise<boolean>
  fetchProfile: () => Promise<void>
  initialize: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: true,

      login: async (email: string, password: string, totpCode?: string) => {
        try {
          const response = await authApi.login({ email, password, totpCode })
          
          if (response.success) {
            set({
              accessToken: response.data.accessToken,
              refreshToken: response.data.refreshToken,
              isAuthenticated: true,
            })
            
            // Fetch user profile
            await get().fetchProfile()
            
            toast.success('Login successful!')
            return true
          }
          return false
        } catch (error: any) {
          const errorMessage = error.response?.data?.error?.message || 'Login failed'
          toast.error(errorMessage)
          
          if (error.response?.data?.error?.code === 'MFA_REQUIRED') {
            throw new Error('MFA_REQUIRED')
          }
          
          return false
        }
      },

      logout: async () => {
        try {
          await authApi.logout()
        } catch (error) {
          console.error('Logout error:', error)
        } finally {
          set({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
          })
          toast.success('Logged out successfully')
        }
      },

      refreshTokens: async () => {
        try {
          const currentRefreshToken = get().refreshToken
          if (!currentRefreshToken) {
            get().logout()
            return false
          }

          const response = await authApi.refreshToken(currentRefreshToken)
          
          if (response.success) {
            set({
              accessToken: response.data.accessToken,
              refreshToken: response.data.refreshToken,
              isAuthenticated: true,
            })
            return true
          }
          
          // Refresh failed, logout user
          get().logout()
          return false
        } catch (error) {
          get().logout()
          return false
        }
      },

      fetchProfile: async () => {
        try {
          const response = await authApi.getProfile()
          
          if (response.success) {
            set({ user: response.data })
          }
        } catch (error) {
          console.error('Failed to fetch profile:', error)
        }
      },

      initialize: async () => {
        const { accessToken } = get()
        
        if (accessToken) {
          // Try to fetch profile to validate token
          try {
            await get().fetchProfile()
            set({ isAuthenticated: true })
          } catch (error) {
            // Token is invalid, try to refresh
            const refreshed = await get().refreshTokens()
            if (!refreshed) {
              set({
                user: null,
                accessToken: null,
                refreshToken: null,
                isAuthenticated: false,
              })
            }
          }
        }
        
        set({ isLoading: false })
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
    }
  )
)