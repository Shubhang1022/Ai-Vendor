import axios from 'axios'
import { useAuthStore } from '../stores/authStore'

const API_BASE_URL = '/api'

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      
      // Avoid infinite loop by not retrying refresh token requests
      if (originalRequest.url?.includes('/auth/refresh')) {
        useAuthStore.getState().logout()
        return Promise.reject(error)
      }
      
      const refreshed = await useAuthStore.getState().refreshTokens()
      if (refreshed) {
        const token = useAuthStore.getState().accessToken
        originalRequest.headers.Authorization = `Bearer ${token}`
        return api(originalRequest)
      }
    }
    
    return Promise.reject(error)
  }
)

// API Response types
interface ApiResponse<T = any> {
  success: boolean
  data: T
  timestamp: string
}

interface ApiError {
  error: {
    code: string
    message: string
    timestamp: string
    requestId: string
  }
}

// Auth API
export const authApi = {
  login: (credentials: { email: string; password: string; totpCode?: string }) =>
    api.post<ApiResponse<{
      accessToken: string
      refreshToken: string
      expiresIn: number
      tokenType: string
    }>>('/auth/login', credentials).then(res => res.data),

  logout: () =>
    api.post('/auth/logout').then(res => res.data),

  refreshToken: (refreshToken: string) =>
    api.post<ApiResponse<{
      accessToken: string
      refreshToken: string
      expiresIn: number
      tokenType: string
    }>>('/auth/refresh', { refreshToken }).then(res => res.data),

  getProfile: () =>
    api.get<ApiResponse<{
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
    }>>('/auth/profile').then(res => res.data),

  changePassword: (data: {
    currentPassword: string
    newPassword: string
    confirmNewPassword: string
  }) =>
    api.post<ApiResponse>('/auth/change-password', data).then(res => res.data),

  register: (data: {
    email: string
    password: string
    confirmPassword: string
    roles?: string[]
  }) =>
    api.post<ApiResponse>('/auth/register', data).then(res => res.data),
}

// MFA API
export const mfaApi = {
  setup: () =>
    api.post<ApiResponse<{
      secret: string
      qrCodeUrl: string
      backupCodes: string[]
    }>>('/mfa/setup').then(res => res.data),

  enable: (totpCode: string) =>
    api.post<ApiResponse>('/mfa/enable', { totpCode }).then(res => res.data),

  disable: (totpCode: string) =>
    api.post<ApiResponse>('/mfa/disable', { totpCode }).then(res => res.data),

  getStatus: () =>
    api.get<ApiResponse<{
      mfaEnabled: boolean
      mfaConfigured: boolean
    }>>('/mfa/status').then(res => res.data),
}

// AI API
export const aiApi = {
  optimizePricing: (productData: {
    name: string
    currentPrice: number
    category: string
    salesHistory: Array<{ date: Date; quantity: number; price: number }>
    competitorPrices: number[]
    marketTrend: string
  }) =>
    api.post<ApiResponse<{
      suggestedPrice: number
      confidence: number
      reasoning: string
      priceElasticity: number
    }>>('/ai/pricing/optimize', { productData }).then(res => res.data),

  forecastDemand: (inventoryItem: {
    id: string
    name: string
    category: string
    currentStock: number
    salesHistory: Array<{ date: Date; quantity: number; price: number }>
  }) =>
    api.post<ApiResponse<{
      predictedDemand: number
      confidence: number
      reorderRecommendation: string
      riskLevel: 'low' | 'medium' | 'high'
    }>>('/ai/inventory/forecast', { inventoryItem }).then(res => res.data),

  getCompetitorPrices: (productName: string) =>
    api.get<ApiResponse<Array<{
      supplier: string
      price: number
      rating: number
      availability: string
      source: string
      aiScore: number
    }>>>(`/ai/pricing/competitors/${encodeURIComponent(productName)}`).then(res => res.data),

  analyzeMarketSentiment: (category: string) =>
    api.get<ApiResponse<{
      sentiment: 'positive' | 'negative' | 'neutral'
      confidence: number
      insights: string[]
      marketTrend: 'up' | 'down' | 'stable'
    }>>(`/ai/market/sentiment/${encodeURIComponent(category)}`).then(res => res.data),

  // Admin AI endpoints
  performSecurityAudit: () =>
    api.post<ApiResponse<{
      securityScore: number
      totalIssues: number
      criticalIssues: number
      aiAnalysis: string
      timestamp: string
    }>>('/ai/admin/security-audit').then(res => res.data),

  generateAnalyticsReport: (period: string, reportType: string) =>
    api.post<ApiResponse<{
      period: string
      reportType: string
      userGrowth: number
      revenueGrowth: number
      aiInsights: string[]
      generatedAt: string
    }>>('/ai/admin/analytics-report', { period, reportType }).then(res => res.data),

  performDatabaseBackup: (backupType: string) =>
    api.post<ApiResponse<{
      backupId: string
      type: string
      size: string
      duration: string
      status: string
      aiOptimized: boolean
      compressionRatio: number
      timestamp: string
    }>>('/ai/admin/database-backup', { backupType }).then(res => res.data),

  // Vendor AI endpoints
  optimizeListing: (listingData: {
    title: string
    category: string
    description: string
    price: number
  }) =>
    api.post<ApiResponse<{
      optimizedTitle: string
      suggestedPrice: number
      priceConfidence: number
      marketDemand: string
      suggestedTags: string[]
      aiAnalysis: string
      timestamp: string
    }>>('/ai/vendor/listing-optimization', { listingData }).then(res => res.data),
}

export default api