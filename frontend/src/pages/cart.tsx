import { useNavigate, Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import {
  Image,
  ShoppingCart,
  CheckCircle,
  X,
  ArrowLeft,
  CreditCard,
  Banknote,
  Clock,
  Calendar,
  MapPin,
  Users,
} from 'lucide-react'
import { apiFetch, apiPost } from '../lib/api'
import { useCart } from '../hooks/use-cart'
import type { CartItem, MenuItem, Restaurant, Table } from '../lib/types'

export default function CartPage() {
  const navigate = useNavigate()
  const [isCheckingOut, setIsCheckingOut] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState<'razorpay' | 'cash'>('cash')

  // Initialize cart hook - we'll get restaurant from context or use default
  const {
    cartItems,
    cartTotal,
    cartItemCount,
    addItem,
    removeItem,
    increaseQuantity,
    decreaseQuantity,
    clearCart
  } = useCart([])

  // Restaurant data - would come from API in production
  const restaurant: Restaurant = {
    id: 1,
    name: 'Spice Route Restaurant',
    slug: 'spice-route',
    description: 'Authentic Indian cuisine with a modern twist',
    logo_url: '/images/restaurant-logo.png',
    cover_image_url: '',
    address: '123 Food Street, Mumbai',
    phone: '+91 98765 43210',
    email: 'contact@spiceroute.com',
    currency: 'INR',
    tax_rate: 5,
    service_charge_rate: 10,
    is_open: true
  }

  // Table - would come from query param in production
  const table: Table | null = null

  useEffect(() => {
    // Cart is managed by the hook, no need to load
  }, [])

  // Calculate item totals
  const itemTotals = cartItems.map(item => ({
    ...item,
    totalPrice: item.item.price * item.quantity
  }))

  const handleCheckout = async () => {
    if (cartItems.length === 0) return

    setIsCheckingOut(true)

    try {
      // Calculate subtotal, tax, and service charge
      const subtotal = cartItems.reduce((sum, item) => {
        const price = item.item.price * item.quantity
        const customizationCost = Object.values(item.customizations || {}).reduce((acc, modifier) => acc + (modifier || 0), 0)
        return sum + price + customizationCost
      }, 0)

      const taxRate = restaurant.tax_rate || 5
      const serviceChargeRate = restaurant.service_charge_rate || 10
      const tax = subtotal * (taxRate / 100)
      const serviceCharge = subtotal * (serviceChargeRate / 100)
      const total = subtotal + tax + serviceCharge

      // Create order on server
      const response = await apiPost('/api/orders', {
        restaurant_id: restaurant.id,
        table_id: 1, // Would come from actual table selection
        items: cartItems.map(item => ({
          item_id: item.item.id,
          quantity: item.quantity,
          customizations: item.customizations,
          add_ons: item.add_ons || [],
          special_instructions: item.special_instructions
        })),
        special_notes: ''
      })

      const { order_number, total: orderTotal } = response

      // Clear cart
      clearCart()

      // Navigate to order confirmation
      navigate(`/order/${order_number}`)
    } catch (error) {
      console.error('Checkout error:', error)
      alert('Failed to place order. Please try again.')
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
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Your Order</h2>

            {cartItems.length === 0 ? (
              <div className="py-12 text-center text-slate-500">
                <ShoppingCart className="h-12 w-12 mx-auto mb-4" />
                <p>Your cart is empty</p>
                <Link
                  to="/r/spice-route"
                  className="mt-4 inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-full hover:bg-indigo-700 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Continue Shopping
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {cartItems.map((item, index) => (
                  <div
                    key={item.item.id}
                    className="bg-white rounded-xl p-4 shadow-sm border border-slate-200"
                  >
                    <div className="flex items-center gap-4">
                      {item.item.image_url ? (
                        <img
                          src={item.item.image_url}
                          alt={item.item.name}
                          className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                        />
                      ) : (
                        <div
                          className="w-16 h-16 bg-slate-200 rounded-lg flex items-center justify-center"
                        >
                          <Image className="h-8 w-8 text-indigo-400" name="Utensils" />
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-slate-900 truncate">{item.item.name}</h3>
                        <p className="text-sm text-slate-500">Qty: {item.quantity}</p>

                        {item.customizations && Object.keys(item.customizations).length > 0 && (
                          <p className="text-xs text-slate-400 mt-1">
                            Custom: {Object.keys(item.customizations).length} selection(s)
                          </p>
                        )}

                        {item.add_ons && item.add_ons.length > 0 && (
                          <p className="text-xs text-slate-400 mt-1">
                            +{item.add_ons.length} add-on(s)
                          </p>
                        )}

                        <p className="text-sm font-medium text-indigo-600 mt-2">
                          ₹{item.item.price * item.quantity}
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-between mt-3">
                      <button
                        onClick={() => decreaseQuantity(item.item.id)}
                        className="px-2 py-1 text-xs text-slate-400 rounded bg-slate-100 hover:bg-slate-200 transition-colors"
                        disabled={item.quantity <= 1}
                        aria-label="Decrease quantity"
                      >
                        -
                      </button>
                      <span className="text-xs text-slate-500">{item.quantity}</span>
                      <button
                        onClick={() => increaseQuantity(item.item.id)}
                        className="px-2 py-1 text-xs text-slate-400 rounded bg-slate-100 hover:bg-slate-200 transition-colors"
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>

                    <button
                      onClick={() => removeItem(item.item.id)}
                      className="mt-2 w-full text-xs text-red-500 hover:text-red-600 transition-colors"
                      aria-label="Remove item"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sticky top-24">
            <h3 className="text-xl font-bold text-slate-900 mb-4">Order Summary</h3>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-slate-600">Subtotal</span>
                <span className="font-medium">₹{cartTotal.toFixed(2)}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-600">Tax ({(restaurant.tax_rate || 5)}%)</span>
                <span className="font-medium">₹{(cartTotal * 0.05).toFixed(2)}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-600">Service Charge ({(restaurant.service_charge_rate || 10)}%)</span>
                <span className="font-medium">₹{(cartTotal * 0.1).toFixed(2)}</span>
              </div>

              <div className="border-t pt-3">
                <div className="flex justify-between text-xl font-bold">
                  <span>Total</span>
                  <span className="text-indigo-600">₹{(cartTotal * 1.15).toFixed(2)}</span>
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
              </div>
            </div>

            {/* Checkout Button */}
            <button
              onClick={handleCheckout}
              disabled={isCheckingOut}
              className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isCheckingOut ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="h-5 w-5" />
                  Place Order
                </>
              )}
            </button>

            <p className="text-xs text-slate-500 text-center mt-4">
              By placing your order, you agree to our terms and conditions
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}