import { useState, useEffect } from 'react'
import { X, Plus, Edit, Trash2, Package, TrendingUp, AlertTriangle, Search, Filter } from 'lucide-react'
import toast from 'react-hot-toast'

interface InventoryItem {
  id: number
  name: string
  sku: string
  category: string
  currentStock: number
  minStock: number
  maxStock: number
  unitPrice: number
  totalValue: number
  supplier: string
  lastRestocked: string
  status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'overstocked'
  aiRecommendation?: string
}

interface InventoryManagementModalProps {
  onClose: () => void
}

export function InventoryManagementModal({ onClose }: InventoryManagementModalProps) {
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [filteredInventory, setFilteredInventory] = useState<InventoryItem[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [showAddItem, setShowAddItem] = useState(false)
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null)
  const [loading, setLoading] = useState(false)
  const [aiInsights, setAiInsights] = useState<any>(null)

  const [newItem, setNewItem] = useState({
    name: '',
    sku: '',
    category: '',
    currentStock: 0,
    minStock: 0,
    maxStock: 0,
    unitPrice: 0,
    supplier: ''
  })

  useEffect(() => {
    loadInventoryData()
    generateAIInsights()
  }, [])

  useEffect(() => {
    filterInventory()
  }, [inventory, searchTerm, filterStatus])

  const loadInventoryData = () => {
    // Simulate loading inventory data with AI recommendations
    const mockInventory: InventoryItem[] = [
      {
        id: 1,
        name: 'Wireless Bluetooth Headphones',
        sku: 'WBH-001',
        category: 'Electronics',
        currentStock: 45,
        minStock: 20,
        maxStock: 100,
        unitPrice: 89.99,
        totalValue: 4049.55,
        supplier: 'TechSupply Co.',
        lastRestocked: '2024-01-25',
        status: 'in_stock',
        aiRecommendation: 'Demand trending up 15%. Consider increasing stock by 30 units.'
      },
      {
        id: 2,
        name: 'Office Ergonomic Chairs',
        sku: 'OEC-002',
        category: 'Furniture',
        currentStock: 8,
        minStock: 15,
        maxStock: 50,
        unitPrice: 125.00,
        totalValue: 1000.00,
        supplier: 'FurniturePro Inc.',
        lastRestocked: '2024-01-20',
        status: 'low_stock',
        aiRecommendation: 'Critical: Restock immediately. Predicted stockout in 3 days.'
      },
      {
        id: 3,
        name: 'Industrial Cleaning Supplies',
        sku: 'ICS-003',
        category: 'Supplies',
        currentStock: 0,
        minStock: 25,
        maxStock: 200,
        unitPrice: 245.00,
        totalValue: 0,
        supplier: 'CleanCorp Solutions',
        lastRestocked: '2024-01-10',
        status: 'out_of_stock',
        aiRecommendation: 'Out of stock for 5 days. Lost sales estimated at $2,450.'
      },
      {
        id: 4,
        name: 'Laptop Accessories Bundle',
        sku: 'LAB-004',
        category: 'Electronics',
        currentStock: 75,
        minStock: 30,
        maxStock: 60,
        unitPrice: 89.99,
        totalValue: 6749.25,
        supplier: 'TechSupply Co.',
        lastRestocked: '2024-01-28',
        status: 'overstocked',
        aiRecommendation: 'Overstocked by 15 units. Consider promotional pricing.'
      }
    ]
    setInventory(mockInventory)
  }

  const generateAIInsights = async () => {
    setLoading(true)
    try {
      // Simulate AI analysis
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      const insights = {
        totalValue: 11798.80,
        lowStockItems: 2,
        overstockedItems: 1,
        reorderRecommendations: 3,
        predictedSales: {
          nextWeek: 15420,
          nextMonth: 62800
        },
        topPerformers: ['Wireless Bluetooth Headphones', 'Office Ergonomic Chairs'],
        aiRecommendations: [
          'Restock Office Ergonomic Chairs immediately - high demand detected',
          'Consider bundle pricing for overstocked Laptop Accessories',
          'Electronics category showing 15% growth trend - increase allocation'
        ]
      }
      
      setAiInsights(insights)
    } catch (error) {
      toast.error('Failed to generate AI insights')
    } finally {
      setLoading(false)
    }
  }

  const filterInventory = () => {
    let filtered = inventory

    if (searchTerm) {
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(item => item.status === filterStatus)
    }

    setFilteredInventory(filtered)
  }

  const handleAddItem = () => {
    const item: InventoryItem = {
      id: Date.now(),
      ...newItem,
      totalValue: newItem.currentStock * newItem.unitPrice,
      lastRestocked: new Date().toISOString().split('T')[0],
      status: newItem.currentStock <= newItem.minStock ? 'low_stock' : 'in_stock'
    }

    setInventory(prev => [...prev, item])
    setNewItem({
      name: '', sku: '', category: '', currentStock: 0, minStock: 0, maxStock: 0, unitPrice: 0, supplier: ''
    })
    setShowAddItem(false)
    toast.success('Item added successfully!')
  }

  const handleUpdateStock = (id: number, newStock: number) => {
    setInventory(prev => prev.map(item => {
      if (item.id === id) {
        const status = newStock === 0 ? 'out_of_stock' :
                      newStock <= item.minStock ? 'low_stock' :
                      newStock >= item.maxStock ? 'overstocked' : 'in_stock'
        
        return {
          ...item,
          currentStock: newStock,
          totalValue: newStock * item.unitPrice,
          status
        }
      }
      return item
    }))
    toast.success('Stock updated successfully!')
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_stock': return 'bg-green-100 text-green-800'
      case 'low_stock': return 'bg-yellow-100 text-yellow-800'
      case 'out_of_stock': return 'bg-red-100 text-red-800'
      case 'overstocked': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'in_stock': return <Package className="w-4 h-4" />
      case 'low_stock': return <AlertTriangle className="w-4 h-4" />
      case 'out_of_stock': return <X className="w-4 h-4" />
      case 'overstocked': return <TrendingUp className="w-4 h-4" />
      default: return <Package className="w-4 h-4" />
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-7xl w-full mx-4 max-h-[95vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Inventory Management</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex h-[calc(95vh-140px)]">
          {/* Main Inventory */}
          <div className="flex-1 flex flex-col">
            {/* Controls */}
            <div className="p-6 border-b bg-gray-50">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="flex flex-1 gap-4">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search inventory..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="input pl-10"
                    />
                  </div>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="input"
                  >
                    <option value="all">All Status</option>
                    <option value="in_stock">In Stock</option>
                    <option value="low_stock">Low Stock</option>
                    <option value="out_of_stock">Out of Stock</option>
                    <option value="overstocked">Overstocked</option>
                  </select>
                </div>
                <button
                  onClick={() => setShowAddItem(true)}
                  className="btn btn-primary"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Item
                </button>
              </div>
            </div>

            {/* Inventory Table */}
            <div className="flex-1 overflow-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">AI Recommendation</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredInventory.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{item.name}</div>
                          <div className="text-sm text-gray-500">SKU: {item.sku}</div>
                          <div className="text-xs text-gray-400">{item.category}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <div className="font-medium">{item.currentStock} units</div>
                          <div className="text-gray-500">Min: {item.minStock} | Max: {item.maxStock}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium">${item.unitPrice.toFixed(2)}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium">${item.totalValue.toFixed(2)}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                          {getStatusIcon(item.status)}
                          <span className="ml-1 capitalize">{item.status.replace('_', ' ')}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {item.aiRecommendation && (
                          <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
                            {item.aiRecommendation}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm space-x-2">
                        <button
                          onClick={() => setEditingItem(item)}
                          className="text-primary-600 hover:text-primary-900"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <input
                          type="number"
                          defaultValue={item.currentStock}
                          onBlur={(e) => handleUpdateStock(item.id, parseInt(e.target.value) || 0)}
                          className="w-16 px-2 py-1 border rounded text-xs"
                          min="0"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* AI Insights Panel */}
          <div className="w-80 border-l bg-gray-50 overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">AI Insights</h3>
              
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                  <p className="text-sm text-gray-500 mt-2">Analyzing inventory...</p>
                </div>
              ) : aiInsights && (
                <div className="space-y-6">
                  {/* Summary Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-3 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">${aiInsights.totalValue.toLocaleString()}</div>
                      <div className="text-xs text-gray-500">Total Value</div>
                    </div>
                    <div className="bg-white p-3 rounded-lg">
                      <div className="text-2xl font-bold text-yellow-600">{aiInsights.lowStockItems}</div>
                      <div className="text-xs text-gray-500">Low Stock</div>
                    </div>
                  </div>

                  {/* Predictions */}
                  <div className="bg-white p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Sales Forecast</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Next Week:</span>
                        <span className="text-sm font-medium">${aiInsights.predictedSales.nextWeek.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Next Month:</span>
                        <span className="text-sm font-medium">${aiInsights.predictedSales.nextMonth.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* AI Recommendations */}
                  <div className="bg-white p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">AI Recommendations</h4>
                    <div className="space-y-2">
                      {aiInsights.aiRecommendations.map((rec: string, index: number) => (
                        <div key={index} className="text-xs text-gray-600 bg-blue-50 p-2 rounded">
                          {rec}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Top Performers */}
                  <div className="bg-white p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Top Performers</h4>
                    <div className="space-y-1">
                      {aiInsights.topPerformers.map((item: string, index: number) => (
                        <div key={index} className="text-xs text-gray-600">
                          {index + 1}. {item}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Add Item Modal */}
        {showAddItem && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-medium mb-4">Add New Item</h3>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Product Name"
                  value={newItem.name}
                  onChange={(e) => setNewItem(prev => ({ ...prev, name: e.target.value }))}
                  className="input"
                />
                <input
                  type="text"
                  placeholder="SKU"
                  value={newItem.sku}
                  onChange={(e) => setNewItem(prev => ({ ...prev, sku: e.target.value }))}
                  className="input"
                />
                <select
                  value={newItem.category}
                  onChange={(e) => setNewItem(prev => ({ ...prev, category: e.target.value }))}
                  className="input"
                >
                  <option value="">Select Category</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Furniture">Furniture</option>
                  <option value="Supplies">Supplies</option>
                </select>
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="number"
                    placeholder="Current Stock"
                    value={newItem.currentStock}
                    onChange={(e) => setNewItem(prev => ({ ...prev, currentStock: parseInt(e.target.value) || 0 }))}
                    className="input"
                  />
                  <input
                    type="number"
                    placeholder="Min Stock"
                    value={newItem.minStock}
                    onChange={(e) => setNewItem(prev => ({ ...prev, minStock: parseInt(e.target.value) || 0 }))}
                    className="input"
                  />
                  <input
                    type="number"
                    placeholder="Max Stock"
                    value={newItem.maxStock}
                    onChange={(e) => setNewItem(prev => ({ ...prev, maxStock: parseInt(e.target.value) || 0 }))}
                    className="input"
                  />
                </div>
                <input
                  type="number"
                  step="0.01"
                  placeholder="Unit Price"
                  value={newItem.unitPrice}
                  onChange={(e) => setNewItem(prev => ({ ...prev, unitPrice: parseFloat(e.target.value) || 0 }))}
                  className="input"
                />
                <input
                  type="text"
                  placeholder="Supplier"
                  value={newItem.supplier}
                  onChange={(e) => setNewItem(prev => ({ ...prev, supplier: e.target.value }))}
                  className="input"
                />
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button onClick={() => setShowAddItem(false)} className="btn btn-secondary">Cancel</button>
                <button onClick={handleAddItem} className="btn btn-primary">Add Item</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}