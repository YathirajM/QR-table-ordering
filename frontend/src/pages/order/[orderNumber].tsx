import { useParams, Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Utensils,
  ChefHat,
  CheckCircle,
  Clock,
  ArrowLeft,
  AlertCircle,
  MessageCircle,
  X,
  Image,
  RefreshCw,
} from 'lucide-react'
import { apiFetch } from '../../lib/api'
import type { Order } from '../../lib/types'

const statusSteps = [
  { status: 'NEW', label: 'Order Placed', icon: Clock },
  { status: 'ACCEPTED', label: 'Accepted', icon: ChefHat },
  { status: 'PREPARING', label: 'Preparing', icon: ChefHat },
  { status: 'READY', label: 'Ready', icon: CheckCircle },
  { status: 'COMPLETED', label: 'Completed', icon: CheckCircle },
  { status: 'CANCELLED', label: 'Cancelled', icon: X },
]

const stepColors: { [key: string]: string } = {
  NEW: 'bg-amber-500',
  ACCEPTED: 'bg-blue-500',
  PREPARING: 'bg-orange-500',
  READY: 'bg-emerald-500',
  COMPLETED: 'bg-green-500',
  CANCELLED: 'bg-red-500'
}

const statusLabels: { [key: string]: string } = {
  NEW: 'Order Placed',
  ACCEPTED: 'Accepted by Kitchen',
  PREPARING: 'Preparing',
  READY: 'Ready for Service',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled'
}

export default function OrderTracking() {
  const params = useParams()
  const orderNumber = params.orderNumber as string
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [kitchenStatus, setKitchenStatus] = useState<string>('NEW')

  useEffect(() => {
    loadOrder()
    const interval = setInterval(loadOrder, 5000)
    return () => clearInterval(interval)
  }, [orderNumber])

  async function loadOrder() {
    try {
      const data = await apiFetch<{ order: Order }>(`/api/orders/${orderNumber}`)
      setOrder(data.order || data)
    } catch (error) {
      console.error('Failed to load order:', error)
    } finally {
      setLoading(false)
    }
  }

  const currentStepIndex = order ? statusSteps.findIndex(s => s.status === order.order_status) : -1

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-100 to-purple-100">
      <div className="container mx-auto px-4 py-8">
        <Link
          to="/"
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-8"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back to Menu</span>
        </Link>

        {loading ? (
          <div className="text-center py-12">
            <Utensils className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-700 mb-2">Loading order...</h3>
          </div>
        ) : order ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold text-slate-900">Order #{order.order_number}</h1>
                <div
                  className={`px-3 py-1 rounded-full text-sm font-medium ${stepColors[order.order_status] || 'bg-slate-500'}`}
                >
                  {order.order_status}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm text-slate-500">
                <div>
                  <p>Table {order.table_id || 'N/A'}</p>
                  <p>Order Time: {new Date(order.created_at).toLocaleTimeString()}</p>
                </div>
                <div>
                  <p>Customer: {order.special_notes || 'Walk-in'}</p>
                  <p>Status: {kitchenStatus}</p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-200">
                <p className="font-medium text-slate-600">Total</p>
                <p className="text-3xl font-bold text-indigo-600">₹{order.total}</p>
              </div>

              {order.payment_status && (
                <div
                  className={`mt-3 p-3 rounded-lg ${
                    order.payment_status === 'COMPLETED'
                      ? 'bg-emerald-100 text-emerald-700'
                      : order.payment_status === 'PENDING'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-red-100 text-red-700'
                  }`}
                >
                  <p className="text-xs font-medium">
                    {order.payment_status === 'COMPLETED' ? 'Payment' : 'Payment Pending'}
                  </p>
                  <p className="text-xs">{order.payment_status}</p>
                </div>
              )}
            </div>

            <div>
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Order Progress</h2>
              <div className="flex items-center justify-between gap-2">
                {statusSteps.map((step, index) => {
                  const Icon = step.icon
                  const isActive = index === currentStepIndex
                  const isCompleted = index < currentStepIndex

                  return (
                    <motion.div
                      key={step.status}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex-1 text-center"
                    >
                      <div
                        className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center ${
                          isCompleted
                            ? 'bg-emerald-500 text-white'
                            : isActive
                              ? 'bg-indigo-600 text-white'
                              : 'bg-slate-200 text-slate-400'
                        }`}
                      >
                        <Icon className="h-6 w-6" />
                      </div>
                      <span
                        className={`text-xs mt-2 font-medium ${
                          isActive ? 'text-indigo-600' : 'text-slate-400'
                        }`}
                      >
                        {step.label}
                      </span>
                    </motion.div>
                  )
                })}
              </div>
              <div className="mt-2 h-2 rounded-full bg-slate-200 overflow-hidden">
                <motion.div
                  initial={{ width: '0%' }}
                  animate={{ width: `${(currentStepIndex + 1) / statusSteps.length * 100}%` }}
                  transition={{ duration: 0.5 }}
                  className="h-full rounded-full bg-indigo-600"
                />
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Your Order</h2>
              <div className="space-y-3">
                {order.items?.map((item: any) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl"
                  >
                    <div className="w-14 h-14 bg-slate-200 rounded-lg flex-shrink-0">
                      {item.item_image_url ? (
                        <img
                          src={item.item_image_url}
                          alt={item.item_name}
                          className="w-full h-full object-cover rounded"
                        />
                      ) : (
                        <Image className="h-8 w-8 text-indigo-400" name="Utensils" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-slate-900">{item.item_name}</h3>
                      <p className="text-sm text-slate-500">Qty: {item.quantity}</p>
                      {item.special_instructions && (
                        <p className="text-xs text-amber-600 mt-1">
                          Note: {item.special_instructions}
                        </p>
                      )}
                    </div>
                    <span className="font-medium text-slate-900">₹{item.total_price}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-700 mb-2">Order Not Found</h3>
            <p className="text-slate-500 mb-4">The requested order could not be found</p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-full hover:bg-indigo-700 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Menu
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}