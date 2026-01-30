import { useState } from 'react'
import { X, Search, TrendingUp, DollarSign } from 'lucide-react'
import toast from 'react-hot-toast'

interface PriceDiscoveryModalProps {
  onClose: () => void
}

export function PriceDiscoveryModal({ onClose }: PriceDiscoveryModalProps) {
  const [searchQuery, setSearchQuery] = useState({
    productName: '',
    category: '',
    quantity: '',
    targetPrice: '',
    description: ''
  })
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any[]>([])
  const [showResults, setShowResults] = useState(false)

  const handleSearch = async () => {
    if (!searchQuery.productName.trim()) {
      toast.error('Please enter a product name')
      return
    }

    setLoading(true)
    try {
      // Simulate API call for price discovery
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const mockResults = [
        {
          id: 1,
          supplier: 'TechSupply Co.',
          price: '$89.99',
          quantity: '100+ units',
          rating: 4.8,
          location: 'California, USA',
          deliveryTime: '3-5 days',
          verified: true,
          aiScore: 92,
          priceHistory: 'Stable for 30 days',
          marketPosition: 'Competitive',
          riskLevel: 'Low'
        },
        {
          id: 2,
          supplier: 'Global Electronics',
          price: '$92.50',
          quantity: '50+ units',
          rating: 4.6,
          location: 'Texas, USA',
          deliveryTime: '5-7 days',
          verified: true,
          aiScore: 87,
          priceHistory: 'Increased 3% last week',
          marketPosition: 'Premium',
          riskLevel: 'Medium'
        },
        {
          id: 3,
          supplier: 'Budget Parts Inc.',
          price: '$78.99',
          quantity: '25+ units',
          rating: 4.2,
          location: 'Florida, USA',
          deliveryTime: '7-10 days',
          verified: false,
          aiScore: 73,
          priceHistory: 'Volatile pricing',
          marketPosition: 'Budget',
          riskLevel: 'High'
        },
        {
          id: 4,
          supplier: 'AI Recommended: PremiumTech',
          price: '$91.25',
          quantity: '200+ units',
          rating: 4.9,
          location: 'New York, USA',
          deliveryTime: '2-4 days',
          verified: true,
          aiScore: 96,
          priceHistory: 'Consistent pricing',
          marketPosition: 'Optimal',
          riskLevel: 'Very Low',
          aiRecommended: true
        }
      ]
      
      setResults(mockResults)
      setShowResults(true)
      toast.success('Price discovery completed!')
    } catch (error) {
      toast.error('Failed to discover prices')
    } finally {
      setLoading(false)
    }
  }

  const handleContactSupplier = (supplierId: number) => {
    toast.success('Contact request sent to supplier!')
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Price Discovery</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {!showResults ? (
            <div>
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Find the Best Prices</h3>
                <p className="text-sm text-gray-500">
                  Enter your product details to discover competitive prices from verified suppliers
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    value={searchQuery.productName}
                    onChange={(e) => setSearchQuery(prev => ({ ...prev, productName: e.target.value }))}
                    className="input"
                    placeholder="e.g., Wireless Bluetooth Headphones"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    value={searchQuery.category}
                    onChange={(e) => setSearchQuery(prev => ({ ...prev, category: e.target.value }))}
                    className="input"
                  >
                    <option value="">Select Category</option>
                    <option value="electronics">Electronics</option>
                    <option value="furniture">Furniture</option>
                    <option value="supplies">Office Supplies</option>
                    <option value="industrial">Industrial Equipment</option>
                    <option value="automotive">Automotive</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quantity Needed
                  </label>
                  <input
                    type="number"
                    value={searchQuery.quantity}
                    onChange={(e) => setSearchQuery(prev => ({ ...prev, quantity: e.target.value }))}
                    className="input"
                    placeholder="e.g., 100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Target Price (per unit)
                  </label>
                  <input
                    type="text"
                    value={searchQuery.targetPrice}
                    onChange={(e) => setSearchQuery(prev => ({ ...prev, targetPrice: e.target.value }))}
                    className="input"
                    placeholder="e.g., $50.00"
                  />
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Additional Requirements
                </label>
                <textarea
                  value={searchQuery.description}
                  onChange={(e) => setSearchQuery(prev => ({ ...prev, description: e.target.value }))}
                  className="input"
                  rows={3}
                  placeholder="Describe any specific requirements, quality standards, or preferences..."
                />
              </div>

              <div className="flex justify-end mt-6">
                <button
                  onClick={handleSearch}
                  disabled={loading}
                  className="btn btn-primary disabled:opacity-50"
                >
                  <Search className="w-4 h-4 mr-2" />
                  {loading ? 'Discovering Prices...' : 'Discover Prices'}
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Price Discovery Results for "{searchQuery.productName}"
                </h3>
                <p className="text-sm text-gray-500">
                  Found {results.length} suppliers with competitive pricing
                </p>
              </div>

              <div className="space-y-4">
                {results.map((result) => (
                  <div key={result.id} className={`border rounded-lg p-4 hover:shadow-md transition-shadow ${
                    result.aiRecommended ? 'border-green-300 bg-green-50' : ''
                  }`}>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <h4 className="text-lg font-medium text-gray-900">{result.supplier}</h4>
                          {result.verified && (
                            <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Verified
                            </span>
                          )}
                          {result.aiRecommended && (
                            <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              🤖 AI Recommended
                            </span>
                          )}
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm mb-3">
                          <div>
                            <span className="text-gray-500">Price:</span>
                            <div className="font-semibold text-green-600">{result.price}</div>
                          </div>
                          <div>
                            <span className="text-gray-500">Quantity:</span>
                            <div className="font-medium">{result.quantity}</div>
                          </div>
                          <div>
                            <span className="text-gray-500">Rating:</span>
                            <div className="font-medium">⭐ {result.rating}</div>
                          </div>
                          <div>
                            <span className="text-gray-500">Delivery:</span>
                            <div className="font-medium">{result.deliveryTime}</div>
                          </div>
                          <div>
                            <span className="text-gray-500">AI Score:</span>
                            <div className={`font-medium ${
                              result.aiScore >= 90 ? 'text-green-600' : 
                              result.aiScore >= 80 ? 'text-yellow-600' : 'text-red-600'
                            }`}>
                              {result.aiScore}/100
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs text-gray-600">
                          <div>📍 {result.location}</div>
                          <div>📈 {result.priceHistory}</div>
                          <div>🎯 {result.marketPosition}</div>
                        </div>
                        <div className="mt-2">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            result.riskLevel === 'Very Low' || result.riskLevel === 'Low' ? 'bg-green-100 text-green-800' :
                            result.riskLevel === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                          }`}>
                            Risk: {result.riskLevel}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4 space-y-2">
                        <button
                          onClick={() => handleContactSupplier(result.id)}
                          className="btn btn-primary text-sm"
                        >
                          Contact Supplier
                        </button>
                        <button className="btn btn-secondary text-sm w-full">
                          <TrendingUp className="w-4 h-4 mr-1" />
                          Negotiate
                        </button>
                        {result.aiRecommended && (
                          <button className="btn btn-secondary text-sm w-full bg-blue-50 text-blue-700 border-blue-200">
                            🤖 AI Analysis
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-between mt-6">
                <button
                  onClick={() => setShowResults(false)}
                  className="btn btn-secondary"
                >
                  New Search
                </button>
                <button
                  onClick={onClose}
                  className="btn btn-primary"
                >
                  Save Results
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}