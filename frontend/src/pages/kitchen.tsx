import { useState, useEffect } from 'react'
import {
  ChefHat,
  CheckCircle,
  Clock,
  Utensils,
  AlertCircle,
  RefreshCw,
  TrendingUp,
  Menu,
  Users,
} from 'lucide-react'
import { apiFetch, apiPut } from '../lib/api'
import type { Order } from '../lib/types'

const statusColors: { [key: string]: string } = {
  NEW: 'bg-amber-500',
  ACCEPTED: 'bg-blue-500',
  PREPARING: 'bg-orange-500',
  READY: 'bg-emerald-500',
  COMPLETED: 'bg-green-500',
  CANCELLED: 'bg-red-500'
}

const statusLabels: { [key: string]: string } = {
  NEW: 'New',
  ACCEPTED: 'Accepted',
  PREPARING: 'Preparing',
  READY: 'Ready',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled'
}

const statusOrder = ['NEW', 'ACCEPTED', 'PREPARING', 'READY', 'COMPLETED']

export default function KitchenDisplay() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState(Date.now())
  const [socketConnected, setSocketConnected] = useState(false)

  useEffect(() => {
    loadOrders()
    const interval = setInterval(loadOrders, 3000)
    return () => clearInterval(interval)
  }, [])

  async function loadOrders() {
    setLoading(true)
    try {
      const data = await apiFetch<{ orders: Order[] }>('/api/kitchen/orders')
      setOrders(data.orders || data)
    } catch (error) {
      console.error('Failed to load orders:', error)
    } finally {
      setLoading(false)
      setLastUpdate(Date.now())
    }
  }

  async function updateOrderStatus(orderId: number, newStatus: string) {
    try {
      await apiPut(`/api/kitchen/orders/${orderId}/status`, { status: newStatus })
      loadOrders()
    } catch (error) {
      console.error('Failed to update order:', error)
    }
  }

  const getNextStatus = (current: string): string => {
    const currentIndex = statusOrder.indexOf(current)
    return currentIndex < statusOrder.length - 1 ? statusOrder[currentIndex + 1] : current
  }

  const getTimeDiff = (createdAt: string): string => {
    const created = new Date(createdAt)
    const now = new Date()
    const diff = Math.floor((now.getTime() - created.getTime()) / 60000)
    return `${diff}m`
  }

  // Calculate stats
  const stats = {
    new: orders.filter(o => o.order_status === 'NEW').length,
    accepted: orders.filter(o => o.order_status === 'ACCEPTED').length,
    preparing: orders.filter(o => o.order_status === 'PREPARING').length,
    ready: orders.filter(o => o.order_status === 'READY').length,
    completed: orders.filter(o => o.order_status === 'COMPLETED').length,
    total: orders.length
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-slate-900 text-white px-4 py-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ChefHat className="h-8 w-8" />
            <h1 className="text-2xl font-bold">Kitchen Display</h1>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <span>Last updated: {new Date(lastUpdate).toLocaleTimeString()}</span>
            <button
              onClick={loadOrders}
              className="p-2 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <RefreshCw className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Stats Bar */}
      <div className="container mx-auto px-4 py-4">
        <div className="grid grid-cols-5 gap-4">
          {['NEW', 'ACCEPTED', 'PREPARING', 'READY', 'COMPLETED'].map(status => {
            const count = orders.filter(o => o.order_status === status).length
            const isCompleted = status === 'COMPLETED'
            return (
              <div key={status} className="bg-white rounded-xl p-4 text-center shadow-sm">
                <div className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center ${statusColors[status]}`}>
                  <span className="font-bold text-white text-lg">{count}</span>
                </div>
                <p className="text-xs text-slate-500 mt-1">{statusLabels[status]}</p>
                {isCompleted && <span className="text-xs text-amber-500">✓</span>}
              </div>
            )
          })}
        </div>
      </div>

      {/* Orders */}
      <main className="container mx-auto px-4 pb-8">
        {loading ? (
          <div className="text-center py-12">
            <Clock className="h-8 w-8 text-slate-400 animate-spin" />
            <span className="text-slate-600">Loading orders...</span>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
            <Utensils className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-700 mb-2">No Active Orders</h3>
            <p className="text-slate-500">All orders are being prepared or completed</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className={`bg-white rounded-2xl shadow-sm border ${order.order_status === 'NEW' ? 'border-amber-500' : 'border-slate-200'} overflow-hidden`}
              >
                <div className="p-6">
                  {/* Order Header */}
                  <div className="flex items-center justify-between mb-6">
                    {/* Order Number and Table */}
                    <div className="flex items-center gap-4">
                      <div className="bg-slate-100 px-4 py-2 rounded-lg">
                        <span className="font-bold text-2xl text-slate-900">{order.order_number}</span>
                        <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                          <Utensils className="h-4 w-4" />
                          <span>Table {order.table_id}</span>
                          <span className="mx-2">|</span>
                          <Clock className="h-4 w-4" />
                          <span>{getTimeDiff(order.created_at)}</span>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium text-white ${statusColors[order.order_status]}`}>
                          {statusLabels[order.order_status]}
                        </span>
                        <span className="font-bold text-xl text-slate-900">₹{order.total}</span>
                      </div>
                    </div>

                    {/* Items */}
                    <div className="space-y-3 mb-6">
                      {order.items?.map((item: any) => (
                        <div key={item.id} className="bg-slate-50 rounded-lg p-4">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-slate-200 rounded-lg flex-shrink-0" />
                            <div className="flex-1">
                              <h3 className="font-medium text-slate-900">{item.item_name}</h3>
                              <p className="text-sm text-slate-500">Qty: {item.quantity}</p>
                              {item.special_instructions && (
                                <p className="text-xs text-amber-600 mt-1">
                                  ⚠️ {item.special_instructions}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Actions - only for non-completed orders */}
                    {order.order_status !== 'COMPLETED' && (
                      <div className="flex gap-3">
                        {order.order_status === 'NEW' && (
                          <button
                            onClick={() => updateOrderStatus(order.id, 'ACCEPTED')}
                            className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                          >
                            Accept
                          </button>
                        )}
                        {order.order_status === 'ACCEPTED' && (
                          <button
                            onClick={() => updateOrderStatus(order.id, 'PREPARING')}
                            className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                          >
                            Start Prep
                          </button>
                        )}
                        {order.order_status === 'PREPARING' && (
                          <button
                            onClick={() => updateOrderStatus(order.id, 'READY')}
                            className="flex-1 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
                          >
                            Mark Ready
                          </button>
                        )}
                        {order.order_status === 'READY' && (
                          <button
                            onClick={() => updateOrderStatus(order.id, 'COMPLETED')}
                            className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                          >
                            Complete
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}