import { useState } from 'react'
import { X, MessageCircle, DollarSign, Clock, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'

interface NegotiationModalProps {
  onClose: () => void
}

interface Negotiation {
  id: number
  product: string
  supplier: string
  originalPrice: string
  currentOffer: string
  yourOffer: string
  status: 'pending' | 'accepted' | 'rejected' | 'counter'
  lastMessage: string
  timestamp: string
}

export function NegotiationModal({ onClose }: NegotiationModalProps) {
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active')
  const [selectedNegotiation, setSelectedNegotiation] = useState<number | null>(null)
  const [newOffer, setNewOffer] = useState('')
  const [message, setMessage] = useState('')
  const [negotiations, setNegotiations] = useState<Negotiation[]>([
    {
      id: 1,
      product: 'Office Chairs - Ergonomic (Qty: 50)',
      supplier: 'FurniturePro Inc.',
      originalPrice: '$125.00',
      currentOffer: '$110.00',
      yourOffer: '$105.00',
      status: 'counter',
      lastMessage: 'We can do $110 per unit for 50+ chairs',
      timestamp: '2 hours ago'
    },
    {
      id: 2,
      product: 'Laptop Accessories Bundle (Qty: 25)',
      supplier: 'TechSupply Co.',
      originalPrice: '$89.99',
      currentOffer: '$85.00',
      yourOffer: '$80.00',
      status: 'pending',
      lastMessage: 'Waiting for supplier response',
      timestamp: '1 day ago'
    },
    {
      id: 3,
      product: 'Industrial Cleaning Supplies (Qty: 100)',
      supplier: 'CleanCorp Solutions',
      originalPrice: '$245.00',
      currentOffer: '$220.00',
      yourOffer: '$210.00',
      status: 'accepted',
      lastMessage: 'Great! We accept your offer of $210 per unit',
      timestamp: '3 days ago'
    }
  ])

  const activeNegotiations = negotiations.filter(n => n.status !== 'accepted' && n.status !== 'rejected')
  const completedNegotiations = negotiations.filter(n => n.status === 'accepted' || n.status === 'rejected')

  const handleSendOffer = () => {
    if (!newOffer || !selectedNegotiation) {
      toast.error('Please enter an offer amount')
      return
    }
    
    const offerAmount = parseFloat(newOffer.replace('$', ''))
    if (isNaN(offerAmount) || offerAmount <= 0) {
      toast.error('Please enter a valid offer amount')
      return
    }

    // Update the negotiation with new offer
    setNegotiations(prev => prev.map(neg => {
      if (neg.id === selectedNegotiation) {
        return {
          ...neg,
          yourOffer: `$${offerAmount.toFixed(2)}`,
          status: 'pending' as const,
          lastMessage: message || `New offer: $${offerAmount.toFixed(2)}`,
          timestamp: 'Just now'
        }
      }
      return neg
    }))
    
    toast.success('Counter-offer sent successfully!')
    setNewOffer('')
    setMessage('')
  }

  const acceptOffer = (negotiationId: number) => {
    setNegotiations(prev => prev.map(neg => {
      if (neg.id === negotiationId) {
        return {
          ...neg,
          status: 'accepted' as const,
          lastMessage: 'Offer accepted!',
          timestamp: 'Just now'
        }
      }
      return neg
    }))
    
    toast.success('Offer accepted!')
  }

  const rejectOffer = (negotiationId: number) => {
    setNegotiations(prev => prev.map(neg => {
      if (neg.id === negotiationId) {
        return {
          ...neg,
          status: 'rejected' as const,
          lastMessage: 'Offer rejected',
          timestamp: 'Just now'
        }
      }
      return neg
    }))
    
    toast.success('Offer rejected')
  }

  const startNewNegotiation = () => {
    const newId = Math.max(...negotiations.map(n => n.id)) + 1
    const newNegotiation: Negotiation = {
      id: newId,
      product: 'New Product Negotiation',
      supplier: 'New Supplier',
      originalPrice: '$0.00',
      currentOffer: '$0.00',
      yourOffer: '$0.00',
      status: 'pending',
      lastMessage: 'Negotiation started',
      timestamp: 'Just now'
    }
    
    setNegotiations(prev => [newNegotiation, ...prev])
    setSelectedNegotiation(newId)
    toast.success('New negotiation started!')
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'accepted': return 'bg-green-100 text-green-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      case 'counter': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />
      case 'accepted': return <CheckCircle className="w-4 h-4" />
      case 'rejected': return <X className="w-4 h-4" />
      case 'counter': return <MessageCircle className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Negotiations</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex h-[calc(90vh-140px)]">
          {/* Negotiations List */}
          <div className="w-1/2 border-r">
            <div className="p-4 border-b">
              <div className="flex items-center justify-between mb-2">
                <div className="flex space-x-1">
                  <button
                    onClick={() => setActiveTab('active')}
                    className={`px-4 py-2 text-sm font-medium rounded-lg ${
                      activeTab === 'active'
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Active ({activeNegotiations.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('completed')}
                    className={`px-4 py-2 text-sm font-medium rounded-lg ${
                      activeTab === 'completed'
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Completed ({completedNegotiations.length})
                  </button>
                </div>
                
                <button
                  onClick={startNewNegotiation}
                  className="px-3 py-1 bg-primary-600 text-white rounded text-sm hover:bg-primary-700"
                >
                  + New
                </button>
              </div>
            </div>

            <div className="overflow-y-auto h-full">
              {(activeTab === 'active' ? activeNegotiations : completedNegotiations).map((negotiation) => (
                <div
                  key={negotiation.id}
                  onClick={() => setSelectedNegotiation(negotiation.id)}
                  className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${
                    selectedNegotiation === negotiation.id ? 'bg-blue-50 border-blue-200' : ''
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="text-sm font-medium text-gray-900 line-clamp-2">
                      {negotiation.product}
                    </h4>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(negotiation.status)}`}>
                      {getStatusIcon(negotiation.status)}
                      <span className="ml-1 capitalize">{negotiation.status}</span>
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 mb-2">
                    {negotiation.supplier}
                  </div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-500">Original: {negotiation.originalPrice}</span>
                    <span className="text-green-600 font-medium">Current: {negotiation.currentOffer}</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    {negotiation.lastMessage}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {negotiation.timestamp}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Negotiation Details */}
          <div className="w-1/2 flex flex-col">
            {selectedNegotiation ? (
              <>
                {(() => {
                  const negotiation = negotiations.find(n => n.id === selectedNegotiation)!
                  return (
                    <>
                      <div className="p-6 border-b">
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          {negotiation.product}
                        </h3>
                        <div className="text-sm text-gray-600 mb-4">
                          Supplier: {negotiation.supplier}
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4 mb-4">
                          <div className="text-center p-3 bg-gray-50 rounded-lg">
                            <div className="text-sm text-gray-500">Original Price</div>
                            <div className="text-lg font-semibold">{negotiation.originalPrice}</div>
                          </div>
                          <div className="text-center p-3 bg-blue-50 rounded-lg">
                            <div className="text-sm text-gray-500">Current Offer</div>
                            <div className="text-lg font-semibold text-blue-600">{negotiation.currentOffer}</div>
                          </div>
                          <div className="text-center p-3 bg-green-50 rounded-lg">
                            <div className="text-sm text-gray-500">Your Offer</div>
                            <div className="text-lg font-semibold text-green-600">{negotiation.yourOffer}</div>
                          </div>
                        </div>
                      </div>

                      <div className="flex-1 p-6 overflow-y-auto">
                        <h4 className="text-md font-medium text-gray-900 mb-4">Negotiation History</h4>
                        <div className="space-y-4">
                          <div className="flex items-start">
                            <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <MessageCircle className="w-4 h-4 text-blue-600" />
                            </div>
                            <div className="ml-3 flex-1">
                              <div className="text-sm font-medium text-gray-900">Supplier Response</div>
                              <div className="text-sm text-gray-600 mt-1">{negotiation.lastMessage}</div>
                              <div className="text-xs text-gray-400 mt-1">{negotiation.timestamp}</div>
                            </div>
                          </div>
                          
                          <div className="flex items-start">
                            <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                              <DollarSign className="w-4 h-4 text-green-600" />
                            </div>
                            <div className="ml-3 flex-1">
                              <div className="text-sm font-medium text-gray-900">Your Offer</div>
                              <div className="text-sm text-gray-600 mt-1">Offered {negotiation.yourOffer} per unit</div>
                              <div className="text-xs text-gray-400 mt-1">2 days ago</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {negotiation.status !== 'accepted' && negotiation.status !== 'rejected' && (
                        <>
                          {/* Quick Actions */}
                          <div className="p-4 border-t bg-gray-100">
                            <h4 className="text-sm font-medium text-gray-900 mb-3">Quick Actions</h4>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => acceptOffer(negotiation.id)}
                                className="flex-1 px-3 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                              >
                                Accept Current Offer
                              </button>
                              <button
                                onClick={() => rejectOffer(negotiation.id)}
                                className="flex-1 px-3 py-2 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                              >
                                Reject Offer
                              </button>
                            </div>
                          </div>
                          
                          <div className="p-6 border-t bg-gray-50">
                            <h4 className="text-md font-medium text-gray-900 mb-4">Send Counter-Offer</h4>
                            <div className="space-y-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Your Offer (per unit)
                                </label>
                                <input
                                  type="text"
                                  value={newOffer}
                                  onChange={(e) => setNewOffer(e.target.value)}
                                  className="input"
                                  placeholder="e.g., $108.00"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Message (optional)
                                </label>
                                <textarea
                                  value={message}
                                  onChange={(e) => setMessage(e.target.value)}
                                  className="input"
                                  rows={3}
                                  placeholder="Add a message to your offer..."
                                />
                              </div>
                              <button
                                onClick={handleSendOffer}
                                className="btn btn-primary w-full"
                                disabled={!newOffer}
                              >
                                Send Counter-Offer
                              </button>
                            </div>
                          </div>
                        </>
                      )}
                    </>
                  )
                })()}
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>Select a negotiation to view details</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}