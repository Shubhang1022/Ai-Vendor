import { useState, useEffect } from 'react'
import { X, TrendingUp, TrendingDown, DollarSign, Target, BarChart3, Zap, Brain, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'

interface PricingAnalyticsModalProps {
  onClose: () => void
}

interface PriceAnalysis {
  productId: number
  productName: string
  currentPrice: number
  suggestedPrice: number
  competitorAverage: number
  marketTrend: 'up' | 'down' | 'stable'
  demandLevel: 'high' | 'medium' | 'low'
  priceElasticity: number
  profitMargin: number
  salesVolume: number
  aiConfidence: number
  recommendations: string[]
}

export function PricingAnalyticsModal({ onClose }: PricingAnalyticsModalProps) {
  const [analytics, setAnalytics] = useState<PriceAnalysis[]>([])
  const [selectedProduct, setSelectedProduct] = useState<PriceAnalysis | null>(null)
  const [loading, setLoading] = useState(false)
  const [aiInsights, setAiInsights] = useState<any>(null)
  const [timeRange, setTimeRange] = useState('30d')

  useEffect(() => {
    loadPricingAnalytics()
    generateAIInsights()
  }, [timeRange])

  const loadPricingAnalytics = async () => {
    setLoading(true)
    try {
      // Simulate AI-powered pricing analysis
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const mockAnalytics: PriceAnalysis[] = [
        {
          productId: 1,
          productName: 'Wireless Bluetooth Headphones',
          currentPrice: 89.99,
          suggestedPrice: 94.99,
          competitorAverage: 92.50,
          marketTrend: 'up',
          demandLevel: 'high',
          priceElasticity: -1.2,
          profitMargin: 35.5,
          salesVolume: 156,
          aiConfidence: 87,
          recommendations: [
            'Increase price by 5.6% - demand is inelastic',
            'Market trend shows 8% growth in premium audio',
            'Competitor analysis suggests room for price increase'
          ]
        },
        {
          productId: 2,
          productName: 'Office Ergonomic Chairs',
          currentPrice: 125.00,
          suggestedPrice: 119.99,
          competitorAverage: 118.75,
          marketTrend: 'down',
          demandLevel: 'medium',
          priceElasticity: -2.1,
          profitMargin: 28.2,
          salesVolume: 89,
          aiConfidence: 92,
          recommendations: [
            'Reduce price by 4% to match market conditions',
            'High price elasticity - small decrease will boost sales',
            'Consider promotional bundle with accessories'
          ]
        },
        {
          productId: 3,
          productName: 'Industrial Cleaning Supplies',
          currentPrice: 245.00,
          suggestedPrice: 255.00,
          competitorAverage: 248.30,
          marketTrend: 'up',
          demandLevel: 'high',
          priceElasticity: -0.8,
          profitMargin: 42.1,
          salesVolume: 234,
          aiConfidence: 95,
          recommendations: [
            'Premium positioning opportunity - increase by 4.1%',
            'Supply chain constraints driving market prices up',
            'Low elasticity indicates customers are price-insensitive'
          ]
        },
        {
          productId: 4,
          productName: 'Laptop Accessories Bundle',
          currentPrice: 89.99,
          suggestedPrice: 84.99,
          competitorAverage: 86.25,
          marketTrend: 'stable',
          demandLevel: 'low',
          priceElasticity: -1.8,
          profitMargin: 31.7,
          salesVolume: 67,
          aiConfidence: 78,
          recommendations: [
            'Competitive pricing needed - reduce by 5.6%',
            'Bundle with popular items to increase perceived value',
            'Consider seasonal promotions to boost demand'
          ]
        }
      ]
      
      setAnalytics(mockAnalytics)
      setSelectedProduct(mockAnalytics[0])
    } catch (error) {
      toast.error('Failed to load pricing analytics')
    } finally {
      setLoading(false)
    }
  }

  const generateAIInsights = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      const insights = {
        totalRevenue: 45670,
        revenueChange: 12.5,
        avgMargin: 34.4,
        marginChange: 2.1,
        priceOptimizationOpportunity: 8750,
        marketPosition: 'competitive',
        aiRecommendations: [
          'Overall pricing strategy is 85% optimized',
          '3 products have immediate optimization opportunities',
          'Market conditions favor premium positioning for 2 categories',
          'Seasonal adjustments recommended for Q2'
        ],
        competitorInsights: [
          'TechSupply Co. increased prices by 3% this month',
          'FurniturePro running 15% discount campaign',
          'New competitor entered electronics segment'
        ]
      }
      
      setAiInsights(insights)
    } catch (error) {
      console.error('Failed to generate AI insights')
    }
  }

  const applyPriceSuggestion = (productId: number, newPrice: number) => {
    setAnalytics(prev => prev.map(item => 
      item.productId === productId 
        ? { ...item, currentPrice: newPrice }
        : item
    ))
    toast.success('Price updated successfully!')
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-500" />
      case 'down': return <TrendingDown className="w-4 h-4 text-red-500" />
      default: return <BarChart3 className="w-4 h-4 text-gray-500" />
    }
  }

  const getDemandColor = (level: string) => {
    switch (level) {
      case 'high': return 'text-green-600 bg-green-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'low': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-green-600'
    if (confidence >= 75) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-7xl w-full mx-4 max-h-[95vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center">
            <Brain className="w-6 h-6 text-primary-600 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">AI-Powered Pricing Analytics</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex h-[calc(95vh-140px)]">
          {/* Main Analytics */}
          <div className="flex-1 flex flex-col">
            {/* Controls */}
            <div className="p-6 border-b bg-gray-50">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Pricing Optimization Dashboard</h3>
                  <p className="text-sm text-gray-500">AI-driven pricing recommendations based on market analysis</p>
                </div>
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="input"
                >
                  <option value="7d">Last 7 days</option>
                  <option value="30d">Last 30 days</option>
                  <option value="90d">Last 90 days</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                  <p className="text-sm text-gray-500 mt-4">AI analyzing market data...</p>
                </div>
              </div>
            ) : (
              <div className="flex-1 overflow-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Price</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">AI Suggested</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Market Trend</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Demand</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Margin</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">AI Confidence</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {analytics.map((item) => (
                      <tr 
                        key={item.productId} 
                        className={`hover:bg-gray-50 cursor-pointer ${selectedProduct?.productId === item.productId ? 'bg-blue-50' : ''}`}
                        onClick={() => setSelectedProduct(item)}
                      >
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">{item.productName}</div>
                          <div className="text-sm text-gray-500">Sales: {item.salesVolume} units</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium">${item.currentPrice.toFixed(2)}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <span className="text-sm font-medium">${item.suggestedPrice.toFixed(2)}</span>
                            {item.suggestedPrice > item.currentPrice ? (
                              <TrendingUp className="w-4 h-4 text-green-500 ml-1" />
                            ) : item.suggestedPrice < item.currentPrice ? (
                              <TrendingDown className="w-4 h-4 text-red-500 ml-1" />
                            ) : null}
                          </div>
                          <div className="text-xs text-gray-500">
                            {((item.suggestedPrice - item.currentPrice) / item.currentPrice * 100).toFixed(1)}% change
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            {getTrendIcon(item.marketTrend)}
                            <span className="ml-1 text-sm capitalize">{item.marketTrend}</span>
                          </div>
                          <div className="text-xs text-gray-500">${item.competitorAverage.toFixed(2)} avg</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getDemandColor(item.demandLevel)}`}>
                            {item.demandLevel}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium">{item.profitMargin.toFixed(1)}%</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className={`text-sm font-medium ${getConfidenceColor(item.aiConfidence)}`}>
                            {item.aiConfidence}%
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              applyPriceSuggestion(item.productId, item.suggestedPrice)
                            }}
                            className="btn btn-primary text-xs"
                            disabled={Math.abs(item.suggestedPrice - item.currentPrice) < 0.01}
                          >
                            Apply
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* AI Insights Panel */}
          <div className="w-96 border-l bg-gray-50 overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <Zap className="w-5 h-5 text-yellow-500 mr-2" />
                <h3 className="text-lg font-medium text-gray-900">AI Insights</h3>
              </div>
              
              {aiInsights && (
                <div className="space-y-6">
                  {/* Revenue Metrics */}
                  <div className="bg-white p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-3">Revenue Impact</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Current Revenue:</span>
                        <span className="text-sm font-medium">${aiInsights.totalRevenue.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Growth:</span>
                        <span className="text-sm font-medium text-green-600">+{aiInsights.revenueChange}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Avg Margin:</span>
                        <span className="text-sm font-medium">{aiInsights.avgMargin}%</span>
                      </div>
                      <div className="pt-2 border-t">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-blue-600">Optimization Opportunity:</span>
                          <span className="text-sm font-bold text-blue-600">${aiInsights.priceOptimizationOpportunity.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Selected Product Details */}
                  {selectedProduct && (
                    <div className="bg-white p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-3">{selectedProduct.productName}</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Price Elasticity:</span>
                          <span className="text-sm font-medium">{selectedProduct.priceElasticity.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Market Position:</span>
                          <span className="text-sm font-medium capitalize">{aiInsights.marketPosition}</span>
                        </div>
                        <div className="pt-2 border-t">
                          <h5 className="text-sm font-medium text-gray-900 mb-2">AI Recommendations:</h5>
                          <div className="space-y-1">
                            {selectedProduct.recommendations.map((rec, index) => (
                              <div key={index} className="text-xs text-gray-600 bg-blue-50 p-2 rounded">
                                {rec}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Market Intelligence */}
                  <div className="bg-white p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-3">Market Intelligence</h4>
                    <div className="space-y-2">
                      {aiInsights.competitorInsights.map((insight: string, index: number) => (
                        <div key={index} className="text-xs text-gray-600 bg-yellow-50 p-2 rounded flex items-start">
                          <AlertCircle className="w-3 h-3 text-yellow-500 mr-1 mt-0.5 flex-shrink-0" />
                          {insight}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* AI Strategy Recommendations */}
                  <div className="bg-white p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-3">Strategic Recommendations</h4>
                    <div className="space-y-2">
                      {aiInsights.aiRecommendations.map((rec: string, index: number) => (
                        <div key={index} className="text-xs text-gray-600 bg-green-50 p-2 rounded flex items-start">
                          <Brain className="w-3 h-3 text-green-500 mr-1 mt-0.5 flex-shrink-0" />
                          {rec}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Price Optimization Actions */}
                  <div className="bg-white p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-3">Quick Actions</h4>
                    <div className="space-y-2">
                      <button className="w-full btn btn-primary text-sm">
                        Apply All AI Suggestions
                      </button>
                      <button className="w-full btn btn-secondary text-sm">
                        Export Analysis Report
                      </button>
                      <button className="w-full btn btn-secondary text-sm">
                        Schedule Price Review
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