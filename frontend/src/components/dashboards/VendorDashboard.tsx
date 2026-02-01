import { useState, useEffect } from 'react'
import { useAuthStore } from '../../stores/authStore'
import { 
  DollarSign,
  TrendingUp,
  Package,
  ShoppingCart,
  Target,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
  Eye,
  Edit,
  BarChart3
} from 'lucide-react'
import { PriceDiscoveryModal } from '../modals/PriceDiscoveryModal'
import { NegotiationModal } from '../modals/NegotiationModal'
import { InventoryManagementModal } from '../modals/InventoryManagementModal'
import { PricingAnalyticsModal } from '../modals/PricingAnalyticsModal'
import { AddListingModal } from '../modals/AddListingModal'

export function VendorDashboard() {
  const { user } = useAuthStore()
  const [showPriceDiscovery, setShowPriceDiscovery] = useState(false)
  const [showNegotiation, setShowNegotiation] = useState(false)
  const [showInventoryManagement, setShowInventoryManagement] = useState(false)
  const [showPricingAnalytics, setShowPricingAnalytics] = useState(false)
  const [showAddListing, setShowAddListing] = useState(false)
  const [vendorStats, setVendorStats] = useState({
    totalListings: 0,
    activeNegotiations: 0,
    completedDeals: 0,
    monthlyRevenue: 0
  })

  useEffect(() => {
    // Simulate fetching vendor-specific stats
    setVendorStats({
      totalListings: 24,
      activeNegotiations: 7,
      completedDeals: 156,
      monthlyRevenue: 45670
    })
  }, [])

  const vendorStats_display = [
    {
      name: 'My Listings',
      value: vendorStats.totalListings.toString(),
      change: '+3 this week',
      changeType: 'positive',
      icon: Package,
      color: 'bg-blue-500'
    },
    {
      name: 'Active Negotiations',
      value: vendorStats.activeNegotiations.toString(),
      change: '2 pending response',
      changeType: 'neutral',
      icon: TrendingUp,
      color: 'bg-orange-500'
    },
    {
      name: 'Completed Deals',
      value: vendorStats.completedDeals.toString(),
      change: '+12 this month',
      changeType: 'positive',
      icon: CheckCircle,
      color: 'bg-green-500'
    },
    {
      name: 'Monthly Revenue',
      value: `$${vendorStats.monthlyRevenue.toLocaleString()}`,
      change: '+18.2%',
      changeType: 'positive',
      icon: DollarSign,
      color: 'bg-purple-500'
    },
  ]

  const recentActivity = [
    {
      id: 1,
      type: 'negotiation',
      message: 'New offer received for Office Chairs (Qty: 50)',
      time: '10 minutes ago',
      icon: TrendingUp,
      action: 'View Offer',
      severity: 'info'
    },
    {
      id: 2,
      type: 'deal',
      message: 'Deal completed: Electronics Bundle - $2,450',
      time: '2 hours ago',
      icon: CheckCircle,
      action: 'View Details',
      severity: 'success'
    },
    {
      id: 3,
      type: 'price_alert',
      message: 'Price alert: Competitor lowered price on similar item',
      time: '4 hours ago',
      icon: AlertCircle,
      action: 'Adjust Price',
      severity: 'warning'
    },
    {
      id: 4,
      type: 'inquiry',
      message: 'New inquiry for Laptop Accessories',
      time: '6 hours ago',
      icon: Target,
      action: 'Respond',
      severity: 'info'
    },
  ]

  const activeListings = [
    {
      id: 1,
      name: 'Office Chairs - Ergonomic',
      category: 'Furniture',
      price: '$125.00',
      stock: 45,
      status: 'active',
      inquiries: 3
    },
    {
      id: 2,
      name: 'Laptop Accessories Bundle',
      category: 'Electronics',
      price: '$89.99',
      stock: 12,
      status: 'negotiating',
      inquiries: 7
    },
    {
      id: 3,
      name: 'Industrial Cleaning Supplies',
      category: 'Supplies',
      price: '$245.00',
      stock: 8,
      status: 'active',
      inquiries: 1
    }
  ]

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Vendor Dashboard</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage your listings and track your business performance, {user?.email?.split('@')[0]}
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
            <Package className="w-4 h-4 mr-1" />
            Vendor
          </span>
        </div>
      </div>

      {/* Vendor Stats */}
      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {vendorStats_display.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.name} className="card p-5 hover:shadow-lg transition-shadow cursor-pointer">
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
                    </dd>
                    <dd className={`text-sm font-medium ${
                      stat.changeType === 'positive'
                        ? 'text-green-600'
                        : stat.changeType === 'negative'
                        ? 'text-red-600'
                        : 'text-gray-500'
                    }`}>
                      {stat.change}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <Clock className="w-5 h-5 mr-2" />
                Recent Activity
              </h3>
            </div>
            <div className="divide-y divide-gray-200">
              {recentActivity.map((activity) => {
                const Icon = activity.icon
                return (
                  <div key={activity.id} className="px-6 py-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
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
                      <button className="btn btn-secondary text-xs px-3 py-1">
                        {activity.action}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <Target className="w-5 h-5 mr-2" />
              Quick Actions
            </h3>
          </div>
          <div className="p-6 space-y-4">
            <button 
              onClick={() => setShowPriceDiscovery(true)}
              className="w-full btn btn-primary text-left hover:bg-primary-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2 inline" />
              New Price Discovery
            </button>
            <button 
              onClick={() => setShowAddListing(true)}
              className="w-full btn btn-secondary text-left hover:bg-gray-300 transition-colors"
            >
              <Package className="w-4 h-4 mr-2 inline" />
              Add New Listing
            </button>
            <button 
              onClick={() => setShowNegotiation(true)}
              className="w-full btn btn-secondary text-left hover:bg-gray-300 transition-colors"
            >
              <TrendingUp className="w-4 h-4 mr-2 inline" />
              View Negotiations
            </button>
            <button 
              onClick={() => setShowInventoryManagement(true)}
              className="w-full btn btn-secondary text-left hover:bg-gray-300 transition-colors"
            >
              <ShoppingCart className="w-4 h-4 mr-2 inline" />
              Manage Inventory
            </button>
            <button 
              onClick={() => setShowPricingAnalytics(true)}
              className="w-full btn btn-secondary text-left hover:bg-gray-300 transition-colors"
            >
              <BarChart3 className="w-4 h-4 mr-2 inline" />
              Pricing Analytics
            </button>
          </div>
        </div>
      </div>

      {/* Active Listings */}
      <div className="mt-8">
        <div className="card">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <Package className="w-5 h-5 mr-2" />
                Active Listings
              </h3>
              <button 
                onClick={() => setShowAddListing(true)}
                className="btn btn-primary text-sm"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Listing
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Inquiries
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {activeListings.map((listing) => (
                  <tr key={listing.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{listing.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{listing.category}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{listing.price}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{listing.stock} units</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        listing.status === 'active' 
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {listing.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{listing.inquiries} new</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button className="text-primary-600 hover:text-primary-900">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="text-gray-600 hover:text-gray-900">
                        <Edit className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showPriceDiscovery && (
        <PriceDiscoveryModal onClose={() => setShowPriceDiscovery(false)} />
      )}
      {showNegotiation && (
        <NegotiationModal onClose={() => setShowNegotiation(false)} />
      )}
      {showInventoryManagement && (
        <InventoryManagementModal onClose={() => setShowInventoryManagement(false)} />
      )}
      {showPricingAnalytics && (
        <PricingAnalyticsModal onClose={() => setShowPricingAnalytics(false)} />
      )}
      {showAddListing && (
        <AddListingModal onClose={() => setShowAddListing(false)} />
      )}
    </div>
  )
}