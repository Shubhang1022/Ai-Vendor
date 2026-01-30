import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { mfaApi } from '../services/api'
import { useAuthStore } from '../stores/authStore'
import { Shield, Copy, Check, AlertTriangle, Smartphone } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import toast from 'react-hot-toast'

const mfaSchema = z.object({
  totpCode: z.string().length(6, 'TOTP code must be 6 digits').regex(/^\d+$/, 'TOTP code must contain only numbers'),
})

type MFAForm = z.infer<typeof mfaSchema>

interface MFASetupData {
  secret: string
  qrCodeUrl: string
  backupCodes: string[]
}

export function MFASetupPage() {
  const { user, fetchProfile } = useAuthStore()
  const [mfaSetup, setMfaSetup] = useState<MFASetupData | null>(null)
  const [mfaStatus, setMfaStatus] = useState({ mfaEnabled: false, mfaConfigured: false })
  const [isLoading, setIsLoading] = useState(false)
  const [isSetupLoading, setIsSetupLoading] = useState(false)
  const [copiedCodes, setCopiedCodes] = useState<Set<string>>(new Set())
  const [step, setStep] = useState<'status' | 'setup' | 'verify' | 'complete'>('status')

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<MFAForm>({
    resolver: zodResolver(mfaSchema),
  })

  useEffect(() => {
    fetchMFAStatus()
  }, [])

  const fetchMFAStatus = async () => {
    try {
      const response = await mfaApi.getStatus()
      setMfaStatus(response.data)
    } catch (error) {
      console.error('Failed to fetch MFA status:', error)
    }
  }

  const startMFASetup = async () => {
    setIsSetupLoading(true)
    try {
      const response = await mfaApi.setup()
      setMfaSetup(response.data)
      setStep('setup')
    } catch (error: any) {
      const errorMessage = error.response?.data?.error?.message || 'Failed to setup MFA'
      toast.error(errorMessage)
    } finally {
      setIsSetupLoading(false)
    }
  }

  const enableMFA = async (data: MFAForm) => {
    setIsLoading(true)
    try {
      await mfaApi.enable(data.totpCode)
      toast.success('MFA enabled successfully!')
      setStep('complete')
      await fetchProfile()
      await fetchMFAStatus()
      reset()
    } catch (error: any) {
      const errorMessage = error.response?.data?.error?.message || 'Failed to enable MFA'
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const disableMFA = async (data: MFAForm) => {
    setIsLoading(true)
    try {
      await mfaApi.disable(data.totpCode)
      toast.success('MFA disabled successfully!')
      setStep('status')
      setMfaSetup(null)
      await fetchProfile()
      await fetchMFAStatus()
      reset()
    } catch (error: any) {
      const errorMessage = error.response?.data?.error?.message || 'Failed to disable MFA'
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedCodes(prev => new Set(prev).add(text))
      toast.success('Copied to clipboard!')
      setTimeout(() => {
        setCopiedCodes(prev => {
          const newSet = new Set(prev)
          newSet.delete(text)
          return newSet
        })
      }, 2000)
    } catch (error) {
      toast.error('Failed to copy to clipboard')
    }
  }

  const renderStatusStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <Shield className={`mx-auto h-12 w-12 ${user?.mfaEnabled ? 'text-green-500' : 'text-gray-400'}`} />
        <h3 className="mt-2 text-lg font-medium text-gray-900">
          Multi-Factor Authentication
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          {user?.mfaEnabled 
            ? 'MFA is currently enabled for your account'
            : 'Add an extra layer of security to your account'
          }
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex">
          <Smartphone className="h-5 w-5 text-blue-400 mt-0.5" />
          <div className="ml-3">
            <h4 className="text-sm font-medium text-blue-800">
              What is Multi-Factor Authentication?
            </h4>
            <p className="mt-1 text-sm text-blue-700">
              MFA adds an extra layer of security by requiring a second form of authentication 
              in addition to your password. We use TOTP (Time-based One-Time Password) which 
              works with apps like Google Authenticator, Authy, or 1Password.
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-center space-x-4">
        {!user?.mfaEnabled ? (
          <button
            onClick={startMFASetup}
            disabled={isSetupLoading}
            className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSetupLoading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Setting up...
              </div>
            ) : (
              'Enable MFA'
            )}
          </button>
        ) : (
          <div className="space-y-4 w-full max-w-md">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-4">
                To disable MFA, please enter a code from your authenticator app:
              </p>
            </div>
            <form onSubmit={handleSubmit(disableMFA)} className="space-y-4">
              <div>
                <input
                  {...register('totpCode')}
                  type="text"
                  maxLength={6}
                  className="input text-center text-lg tracking-widest"
                  placeholder="000000"
                />
                {errors.totpCode && (
                  <p className="mt-1 text-sm text-red-600">{errors.totpCode.message}</p>
                )}
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="btn btn-secondary w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                    Disabling MFA...
                  </div>
                ) : (
                  'Disable MFA'
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  )

  const renderSetupStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-medium text-gray-900">
          Scan QR Code
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          Use your authenticator app to scan this QR code
        </p>
      </div>

      {mfaSetup && (
        <div className="space-y-6">
          <div className="flex justify-center">
            <div className="bg-white p-4 rounded-lg border-2 border-gray-200">
              <QRCodeSVG 
                value={mfaSetup.qrCodeUrl} 
                size={200}
                level="M"
                includeMargin={true}
              />
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">
              Manual Entry (if you can't scan the QR code)
            </h4>
            <div className="flex items-center space-x-2">
              <code className="flex-1 text-sm bg-white px-3 py-2 rounded border font-mono">
                {mfaSetup.secret}
              </code>
              <button
                onClick={() => copyToClipboard(mfaSetup.secret)}
                className="btn btn-secondary p-2"
              >
                {copiedCodes.has(mfaSetup.secret) ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex">
              <AlertTriangle className="h-5 w-5 text-yellow-400 mt-0.5" />
              <div className="ml-3">
                <h4 className="text-sm font-medium text-yellow-800">
                  Backup Codes
                </h4>
                <p className="mt-1 text-sm text-yellow-700 mb-3">
                  Save these backup codes in a secure location. You can use them to access 
                  your account if you lose access to your authenticator app.
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {mfaSetup.backupCodes.map((code, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <code className="flex-1 text-xs bg-white px-2 py-1 rounded border font-mono">
                        {code}
                      </code>
                      <button
                        onClick={() => copyToClipboard(code)}
                        className="p-1 text-yellow-600 hover:text-yellow-800"
                      >
                        {copiedCodes.has(code) ? (
                          <Check className="h-3 w-3" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-center space-x-4">
            <button
              onClick={() => setStep('verify')}
              className="btn btn-primary"
            >
              I've Added the Account
            </button>
            <button
              onClick={() => setStep('status')}
              className="btn btn-secondary"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )

  const renderVerifyStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-medium text-gray-900">
          Verify Setup
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          Enter the 6-digit code from your authenticator app to complete setup
        </p>
      </div>

      <form onSubmit={handleSubmit(enableMFA)} className="space-y-6">
        <div>
          <label htmlFor="totpCode" className="block text-sm font-medium text-gray-700 text-center">
            Verification Code
          </label>
          <div className="mt-1">
            <input
              {...register('totpCode')}
              type="text"
              maxLength={6}
              className="input text-center text-lg tracking-widest"
              placeholder="000000"
            />
          </div>
          {errors.totpCode && (
            <p className="mt-1 text-sm text-red-600 text-center">{errors.totpCode.message}</p>
          )}
        </div>

        <div className="flex justify-center space-x-4">
          <button
            type="submit"
            disabled={isLoading}
            className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Verifying...
              </div>
            ) : (
              'Enable MFA'
            )}
          </button>
          <button
            type="button"
            onClick={() => setStep('setup')}
            className="btn btn-secondary"
          >
            Back
          </button>
        </div>
      </form>
    </div>
  )

  const renderCompleteStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
          <Check className="h-6 w-6 text-green-600" />
        </div>
        <h3 className="mt-2 text-lg font-medium text-gray-900">
          MFA Enabled Successfully!
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          Your account is now protected with multi-factor authentication
        </p>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex">
          <Shield className="h-5 w-5 text-green-400 mt-0.5" />
          <div className="ml-3">
            <h4 className="text-sm font-medium text-green-800">
              What's Next?
            </h4>
            <ul className="mt-1 text-sm text-green-700 list-disc list-inside space-y-1">
              <li>Keep your backup codes in a secure location</li>
              <li>You'll now need to enter a code when logging in</li>
              <li>You can disable MFA anytime from this page</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="flex justify-center">
        <button
          onClick={() => setStep('status')}
          className="btn btn-primary"
        >
          Done
        </button>
      </div>
    </div>
  )

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">MFA Setup</h1>
          <p className="mt-2 text-sm text-gray-700">
            Configure multi-factor authentication for enhanced account security.
          </p>
        </div>
      </div>

      <div className="mt-8 max-w-2xl mx-auto">
        <div className="card p-8">
          {step === 'status' && renderStatusStep()}
          {step === 'setup' && renderSetupStep()}
          {step === 'verify' && renderVerifyStep()}
          {step === 'complete' && renderCompleteStep()}
        </div>
      </div>
    </div>
  )
}