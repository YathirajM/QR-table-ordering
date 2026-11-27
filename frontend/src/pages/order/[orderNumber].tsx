import { useParams, Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { Utensils, ChefHat, CheckCircle, Clock, ArrowLeft } from 'lucide-react'
import { apiFetch } from '../../lib/api'
import type { Order } from '../../lib/types'

const statusSteps = [
  { status: 'NEW', label: 'Order Placed', icon: Clock },
  { status: 'ACCEPTED', label: 'Accepted', icon: ChefHat },
  { status: 'PREPARING', label: 'Preparing', icon: ChefHat },
  { status: 'READY', label: 'Ready', icon: CheckCircle },
  { status: 'COMPLETED', label: 'Completed', icon: CheckCircle }
]

export default function OrderTracking() {
  const params = useParams()
  const orderNumber = params.orderNumber as string
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadOrder()
    const interval = setInterval(loadOrder, 5000)
    return () => clearInterval(interval)
  }, [orderNumber])

  async function loadOrder() {
    try {
      const data = await apiFetch<{ order: Order }>(`/orders/${orderNumber}`)
      setOrder(data.order || data)
    } catch (error) {
      console.error('Failed to load order:', error)
    } finally {
      setLoading(false)
    }
  }

  const currentStepIndex = order ? statusSteps.findIndex(s => s.status === order.order_status) : -1

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
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
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold text-slate-900">Order #{order.order_number}</h1>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColorClass(order.order_status)}`}>
                  {order.order_status}
                </div>
              </div>

              <div className="text-center py-4 bg-slate-50 rounded-xl">
                <p className="text-slate-600">Estimated Time</p>
                <p className="text-3xl font-bold text-slate-900">
                  {getEstimatedTime(order.order_status)}
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Order Progress</h2>
              <div className="flex items-center">
                {statusSteps.map((step, index) => {
                  const Icon = step.icon
                  const isActive = index === currentStepIndex
                  const isCompleted = index < currentStepIndex
                  const progressColor = isCompleted ? 'bg-indigo-600' : 'bg-slate-200'

                  return (
                    <React.Fragment key={step.status}>
                      <div className="flex flex-col items-center text-center flex-1">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          isCompleted
                            ? 'bg-emerald-500 text-white'
                            : isActive
                              ? 'bg-indigo-600 text-white'
                              : 'bg-slate-200 text-slate-500'
                        }`}>
                          <Icon className="h-6 w-6" />
                        </div>
                        <span className={`text-xs mt-2 font-medium ${
                          isActive ? 'text-indigo-600' : 'text-slate-500'
                        }`}>
                          {step.label}
                        </span>
                      </div>
                      {index < statusSteps.length - 1 && (
                        <div className="flex-1 h-1 bg-slate-200 mx-2">
                          <div className={`h-full ${progressColor}`} style={{
                            width: isCompleted ? '100%' : isActive ? '50%' : '0%'
                          }} />
                        </div>
                      )}
                    </React.Fragment>
                  )
                })}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Your Order</h2>
              <div className="space-y-3">
                {order.items?.map((item: any) => (
                  <div key={item.id} className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl">
                    <div className="w-12 h-12 bg-slate-200 rounded-lg flex-shrink-0" />
                    <div className="flex-1">
                      <h3 className="font-medium text-slate-900">{item.item_name}</h3>
                      <p className="text-sm text-slate-500">Qty: {item.quantity}</p>
                      {item.special_instructions && (
                        <p className="text-xs text-slate-400">Note: {item.special_instructions}</p>
                      )}
                    </div>
                    <span className="font-medium text-slate-900">₹{item.total_price}</span>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 mt-4">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-lg">Total</span>
                  <span className="text-2xl font-bold text-indigo-600">₹{order.total}</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-2xl">
            <Utensils className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-700 mb-2">Order Not Found</h3>
            <p className="text-slate-500 mb-6">Unable to retrieve your order details</p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-full hover:bg-indigo-700 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              Back to Menu
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

function getStatusColorClass(status: string) {
  const colors: { [key: string]: string } = {
    NEW: 'bg-amber-100 text-amber-800',
    ACCEPTED: 'bg-blue-100 text-blue-800',
    PREPARING: 'bg-orange-100 text-orange-800',
    READY: 'bg-emerald-100 text-emerald-800',
    COMPLETED: 'bg-green-100 text-green-800',
    CANCELLED: 'bg-red-100 text-red-800'
  }
  return colors[status] || 'bg-slate-100 text-slate-800'
}

function getEstimatedTime(status: string) {
  const times: { [key: string]: string } = {
    NEW: '5-7 min',
    ACCEPTED: '5-7 min',
    PREPARING: '8-12 min',
    READY: 'Ready!',
    COMPLETED: 'Completed'
  }
  return times[status] || 'Calculating...'
}

import React from 'react'