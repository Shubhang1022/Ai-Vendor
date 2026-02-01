import { useState, useEffect } from 'react'
import { X, Database, Download, Upload, Clock, CheckCircle, AlertTriangle, Play, Pause } from 'lucide-react'
import toast from 'react-hot-toast'
import { aiApi } from '../../services/api'

interface DatabaseBackupModalProps {
  onClose: () => void
}

interface BackupRecord {
  id: string
  name: string
  size: string
  type: 'full' | 'incremental' | 'differential'
  status: 'completed' | 'running' | 'failed' | 'scheduled'
  createdAt: string
  duration: string
  aiOptimized: boolean
  compressionRatio: number
}

export function DatabaseBackupModal({ onClose }: DatabaseBackupModalProps) {
  const [loading, setLoading] = useState(false)
  const [backups, setBackups] = useState<BackupRecord[]>([])
  const [backupStats, setBackupStats] = useState<any>(null)
  const [selectedBackup, setSelectedBackup] = useState<BackupRecord | null>(null)
  const [autoBackupEnabled, setAutoBackupEnabled] = useState(true)

  useEffect(() => {
    loadBackupData()
  }, [])

  const loadBackupData = async () => {
    setLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      const mockBackups: BackupRecord[] = [
        {
          id: '1',
          name: 'Daily_Full_Backup_2024-01-30',
          size: '2.4 GB',
          type: 'full',
          status: 'completed',
          createdAt: new Date().toISOString(),
          duration: '12m 34s',
          aiOptimized: true,
          compressionRatio: 0.68
        },
        {
          id: '2',
          name: 'Incremental_Backup_2024-01-30_14:00',
          size: '156 MB',
          type: 'incremental',
          status: 'completed',
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          duration: '2m 15s',
          aiOptimized: true,
          compressionRatio: 0.72
        },
        {
          id: '3',
          name: 'Weekly_Full_Backup_2024-01-28',
          size: '2.3 GB',
          type: 'full',
          status: 'completed',
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          duration: '11m 58s',
          aiOptimized: true,
          compressionRatio: 0.65
        },
        {
          id: '4',
          name: 'Emergency_Backup_2024-01-29',
          size: '2.4 GB',
          type: 'full',
          status: 'running',
          createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          duration: '8m 45s',
          aiOptimized: true,
          compressionRatio: 0.70
        }
      ]

      setBackups(mockBackups)
      
      const stats = {
        totalBackups: mockBackups.length,
        totalSize: '7.2 GB',
        lastBackup: mockBackups[0].createdAt,
        successRate: 98.5,
        avgCompressionRatio: 0.69,
        aiOptimizationSavings: '2.1 GB',
        nextScheduledBackup: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
        retentionPeriod: '30 days',
        aiRecommendations: [
          'Current backup frequency is optimal for your data change rate',
          'AI compression is saving 31% storage space',
          'Consider enabling geo-redundant backups for critical data',
          'Backup performance is 23% faster with AI optimization'
        ]
      }
      
      setBackupStats(stats)
    } catch (error) {
      toast.error('Failed to load backup data')
    } finally {
      setLoading(false)
    }
  }

  const createBackup = async (type: 'full' | 'incremental') => {
    setLoading(true)
    try {
      // Call real AI-powered database backup
      const backupResult = await aiApi.performDatabaseBackup(type)
      
      const newBackup: BackupRecord = {
        id: backupResult.data.backupId,
        name: `${type === 'full' ? 'Manual_Full' : 'Manual_Incremental'}_Backup_${new Date().toISOString().split('T')[0]}`,
        size: backupResult.data.size,
        type,
        status: backupResult.data.status === 'completed' ? 'completed' : 'running',
        createdAt: backupResult.data.timestamp,
        duration: backupResult.data.duration || '0m 0s',
        aiOptimized: backupResult.data.aiOptimized,
        compressionRatio: backupResult.data.compressionRatio
      }
      
      setBackups(prev => [newBackup, ...prev])
      toast.success(`${type === 'full' ? 'Full' : 'Incremental'} backup ${backupResult.data.status} with AI optimization`)
      
    } catch (error) {
      console.error('Backup creation error:', error)
      toast.error('Failed to create backup')
    } finally {
      setLoading(false)
    }
  }

  const restoreBackup = (backupId: string) => {
    const backup = backups.find(b => b.id === backupId)
    if (!backup) return
    
    toast.success(`Restore initiated for ${backup.name}`)
  }

  const downloadBackup = (backupId: string) => {
    const backup = backups.find(b => b.id === backupId)
    if (!backup) return
    
    toast.success(`Download started for ${backup.name}`)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'running': return 'bg-blue-100 text-blue-800'
      case 'failed': return 'bg-red-100 text-red-800'
      case 'scheduled': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4" />
      case 'running': return <Clock className="w-4 h-4 animate-spin" />
      case 'failed': return <AlertTriangle className="w-4 h-4" />
      case 'scheduled': return <Clock className="w-4 h-4" />
      default: return <Database className="w-4 h-4" />
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-7xl w-full mx-4 max-h-[95vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center">
            <Database className="w-6 h-6 text-blue-600 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">AI-Optimized Database Backup</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex h-[calc(95vh-140px)]">
          {/* Main Content */}
          <div className="flex-1 flex flex-col">
            {/* Controls */}
            <div className="p-6 border-b bg-gray-50">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Backup Management</h3>
                  <p className="text-sm text-gray-500">AI-optimized backup and recovery system</p>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={() => createBackup('incremental')}
                    disabled={loading}
                    className="btn btn-secondary"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Incremental Backup
                  </button>
                  <button
                    onClick={() => createBackup('full')}
                    disabled={loading}
                    className="btn btn-primary"
                  >
                    <Database className="w-4 h-4 mr-2" />
                    Full Backup
                  </button>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-sm text-gray-500 mt-4">AI optimizing backup process...</p>
                </div>
              </div>
            ) : (
              <div className="flex-1 overflow-auto">
                {/* Backup Stats */}
                {backupStats && (
                  <div className="p-6 border-b">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{backupStats.totalBackups}</div>
                        <div className="text-sm text-gray-500">Total Backups</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{backupStats.totalSize}</div>
                        <div className="text-sm text-gray-500">Total Size</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">{backupStats.successRate}%</div>
                        <div className="text-sm text-gray-500">Success Rate</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">{backupStats.aiOptimizationSavings}</div>
                        <div className="text-sm text-gray-500">AI Savings</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Auto Backup Settings */}
                <div className="p-6 border-b">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-lg font-medium text-gray-900">Automated Backups</h4>
                      <p className="text-sm text-gray-500">AI-scheduled backup automation</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="text-sm text-gray-600">
                        Next backup: {backupStats && new Date(backupStats.nextScheduledBackup).toLocaleString()}
                      </span>
                      <button
                        onClick={() => setAutoBackupEnabled(!autoBackupEnabled)}
                        className={`flex items-center px-3 py-1 rounded text-sm ${
                          autoBackupEnabled 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {autoBackupEnabled ? <Play className="w-4 h-4 mr-1" /> : <Pause className="w-4 h-4 mr-1" />}
                        {autoBackupEnabled ? 'Enabled' : 'Disabled'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Backup List */}
                <div className="p-6">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Backup History</h4>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">AI Optimized</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {backups.map((backup) => (
                          <tr key={backup.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4">
                              <div className="text-sm font-medium text-gray-900">{backup.name}</div>
                              <div className="text-xs text-gray-500">{new Date(backup.createdAt).toLocaleString()}</div>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-1 text-xs font-medium rounded ${
                                backup.type === 'full' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                              }`}>
                                {backup.type}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-900">{backup.size}</div>
                              <div className="text-xs text-gray-500">
                                {Math.round((1 - backup.compressionRatio) * 100)}% compressed
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getStatusColor(backup.status)}`}>
                                {getStatusIcon(backup.status)}
                                <span className="ml-1">{backup.status}</span>
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900">{backup.duration}</td>
                            <td className="px-6 py-4">
                              {backup.aiOptimized && (
                                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-800">
                                  AI Optimized
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-sm space-x-2">
                              {backup.status === 'completed' && (
                                <>
                                  <button
                                    onClick={() => downloadBackup(backup.id)}
                                    className="text-blue-600 hover:text-blue-900"
                                    title="Download"
                                  >
                                    <Download className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => restoreBackup(backup.id)}
                                    className="text-green-600 hover:text-green-900"
                                    title="Restore"
                                  >
                                    <Upload className="w-4 h-4" />
                                  </button>
                                </>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* AI Insights Panel */}
          <div className="w-80 border-l bg-gray-50 overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">AI Backup Insights</h3>
              
              {backupStats && (
                <div className="space-y-4">
                  <div className="bg-white p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">AI Recommendations</h4>
                    <div className="space-y-2">
                      {backupStats.aiRecommendations.map((rec: string, index: number) => (
                        <div key={index} className="text-xs text-gray-600 bg-blue-50 p-2 rounded">
                          {rec}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Optimization Stats</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Avg Compression:</span>
                        <span>{Math.round((1 - backupStats.avgCompressionRatio) * 100)}%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Storage Saved:</span>
                        <span>{backupStats.aiOptimizationSavings}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Retention Period:</span>
                        <span>{backupStats.retentionPeriod}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Quick Actions</h4>
                    <div className="space-y-2">
                      <button className="w-full btn btn-primary text-sm">
                        Configure AI Schedule
                      </button>
                      <button className="w-full btn btn-secondary text-sm">
                        Test Restore Process
                      </button>
                      <button className="w-full btn btn-secondary text-sm">
                        Export Backup Report
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}