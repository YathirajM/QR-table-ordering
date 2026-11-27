import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { MotionValue, motion, AnimatePresence } from 'framer-motion'
import { Utensils, ChefHat, CreditCard, Banknote, ArrowLeft, CheckCircle } from 'lucide-react'
import { apiPost } from '../lib/api'
import type { CartItem, Restaurant, Table } from '../lib/types'

export default function CartPage() {
  const navigate = useNavigate()
  const [isCheckingOut, setIsCheckingOut] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState<'razorpay' | 'cash'>('razorpay')

  const restaurant: Restaurant = {
    id: 1,
    name: 'Demo Restaurant',
    slug: 'demo',
    description: 'A premium dining experience',
    logo_url: '',
    cover_image_url: '',
    address: '',
    phone: '',
    email: '',
    currency: 'INR',
    tax_rate: 5,
    service_charge_rate: 10,
    is_open: true
  }

  const table: Table | null = null

  const cartItems: CartItem[] = []
  const subtotal = 0
  const tax = 0
  const serviceCharge = 0
  const total = 0

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center p-8 bg-white rounded-2xl shadow-sm"
        >
          <Utensils className="h-16 w-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-700 mb-2">Your cart is empty</h3>
          <p className="text-slate-500 mb-6">Add items from the menu to continue</p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-full hover:bg-indigo-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Continue Shopping
          </Link>
        </motion.div>
      </div>
    )
  }

  const handleCheckout = async () => {
    setIsCheckingOut(true)

    try {
      const response = await apiPost('/payments/create', {
        order_id: 1,
        amount: total
      })

      const { order, key_id } = response as any

      // Open Razorpay Checkout
      const options = {
        key: key_id,
        amount: order.amount,
        currency: order.currency,
        name: restaurant.name,
        description: `Order #${order.receipt}`,
        order_id: order.id,
        handler: async (response: any) => {
          await apiPost('/payments/verify', {
            order_id: 1,
            payment: response,
            method: 'razorpay'
          })
          navigate(`/order/${order.receipt}`)
        },
        prefill: {
          name: 'Customer',
          email: 'customer@example.com',
          contact: '9999999999'
        },
        theme: {
          color: '#6366f1'
        }
      }

      // @ts-ignore - Razorpay SDK
      const razorpay = new window.Razorpay(options)
      razorpay.open()
    } catch (error) {
      console.error('Checkout error:', error)
    } finally {
      setIsCheckingOut(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white sticky top-0 z-40 shadow-sm border-b border-slate-200">
        <div className="container mx-auto px-4 py-4">
          <Link
            to="/"
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Menu</span>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 pb-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Your Order</h2>

            <div className="space-y-4">
              {cartItems.map((item, index) => (
                <motion.div
                  key={`${item.item.id}-${item.quantity}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-xl p-4 shadow-sm border border-slate-200"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-slate-200 rounded-lg flex-shrink-0" />
                    <div className="flex-1">
                      <h3 className="font-medium text-slate-900">{item.item.name}</h3>
                      <p className="text-sm text-slate-500">Qty: {item.quantity}</p>
                      {item.customizations && Object.keys(item.customizations).length > 0 && (
                        <p className="text-xs text-slate-400">Custom: Selected options</p>
                      )}
                      <p className="text-sm font-medium text-indigo-600">
                        ₹{(item.item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div>
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sticky top-24">
              <h3 className="text-xl font-bold text-slate-900 mb-4">Order Summary</h3>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-slate-600">Subtotal</span>
                  <span className="font-medium">₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Tax ({(restaurant.tax_rate || 5)}%)</span>
                  <span className="font-medium">₹{tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Service Charge ({(restaurant.service_charge_rate || 10)}%)</span>
                  <span className="font-medium">₹{serviceCharge.toFixed(2)}</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between text-xl font-bold">
                    <span>Total</span>
                    <span className="text-indigo-600">₹{total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="mb-6">
                <h4 className="font-medium text-slate-900 mb-3">Payment Method</h4>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-slate-50">
                    <input
                      type="radio"
                      name="payment"
                      value="razorpay"
                      checked={selectedPayment === 'razorpay'}
                      onChange={() => setSelectedPayment('razorpay')}
                      className="h-4 w-4 text-indigo-600"
                    />
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5 text-slate-600" />
                      <span>Razorpay</span>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-slate-50">
                    <input
                      type="radio"
                      name="payment"
                      value="cash"
                      checked={selectedPayment === 'cash'}
                      onChange={() => setSelectedPayment('cash')}
                      className="h-4 w-4 text-indigo-600"
                    />
                    <div className="flex items-center gap-2">
                      <Banknote className="h-5 w-5 text-slate-600" />
                      <span>Cash at Restaurant</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={handleCheckout}
                disabled={isCheckingOut}
                className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold text-lg
                           hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed
                           flex items-center justify-center gap-2"
              >
                {isCheckingOut ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <ChefHat className="h-5 w-5" />
                    Place Order
                  </>
                )}
              </button>

              <p className="text-xs text-slate-500 text-center mt-4">
                By placing your order, you agree to our terms and conditions
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}