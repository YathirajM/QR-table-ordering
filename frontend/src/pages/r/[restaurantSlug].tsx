import { useParams, useSearchParams, Link, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import {
  Image,
  Search,
  Filter,
  ChefHat,
  ShoppingCart,
  CheckCircle,
  X,
  ArrowDown,
  Utensils,
  Fire
} from 'lucide-react'
import { apiFetch, apiPost } from '../../lib/api'
import type { Restaurant, Category, MenuItem } from '../../lib/types'
import { useCart } from '../../hooks/use-cart'

export default function CustomerMenu() {
  const params = useParams()
  const [searchParams] = useSearchParams()
  const restaurantSlug = params.restaurantSlug as string
  const tableParam = searchParams.get('table')
  const navigate = useNavigate()

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [table, setTable] = useState<Table | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [cart, setCart] = useState<any[]>([])
  const [openModal, setOpenModal] = useState(false)
  const [openDetailModal, setOpenDetailModal] = useState(false)
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null)

  const { addToCart, removeFromCart, increaseQuantity, decreaseQuantity, updateCartItem } = useCart(setCart)

  useEffect(() => {
    loadRestaurant()
  }, [restaurantSlug, tableParam])

  async function loadRestaurant() {
    setLoading(true)
    try {
      const data = await apiFetch<{ restaurant: Restaurant; table: Table | null; categories: Category[] }>(
        `/restaurants/${restaurantSlug}?table=${tableParam || ''}`
      )

      const restaurantData = data.restaurant || data
      const tableData = data.table || null
      const categoriesData = data.categories || []

      setRestaurant(restaurantData)
      setTable(tableData)
      setCategories(categoriesData)
    } catch (error) {
      console.error('Failed to load restaurant:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredItems = categories.flatMap(cat =>
    cat.items?.filter(item =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase())
    ) || []
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <motion.div className="text-center">
          <div className="relative inline-block mb-6">
            <Utensils className="h-16 w-16 text-indigo-600 animate-bounce" />
            <div className="absolute inset-0 border-2 border-indigo-200 rounded-full animate-pulse" />
          </div>
          <h3 className="text-xl font-semibold text-slate-700">Loading menu...</h3>
        </motion.div>
      </div>
    )
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center p-6">
          <Utensils className="h-16 w-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-600 mb-2">Restaurant Not Found</h3>
          <p className="text-slate-500">The requested restaurant could not be found.</p>
        </div>
      </div>
    )
  }

  // Calculate cart total
  const cartTotal = cart.reduce((sum, item) => sum + item.totalPrice, 0)
  const cartItemCount = cart.reduce((count, item) => count + item.quantity, 0)

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white sticky top-0 z-50 shadow-xl border-b border-slate-200">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {restaurant.logo_url ? (
                <img
                  src={restaurant.logo_url}
                  alt={restaurant.name}
                  className="h-10 w-10 rounded-full object-cover"
                  onError={(e) => { e.currentTarget.style.display = 'none' }}
                />
              ) : (
                <div className="h-10 w-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                  <Utensils className="h-6 w-6 text-white" />
                </div>
              )}
              <div>
                <h1 className="font-bold text-lg text-slate-900">{restaurant.name}</h1>
                {table && (
                  <p className="text-sm text-slate-500">Table: {table.table_number}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link
                to="/cart"
                className="relative p-2 rounded-lg hover:bg-indigo-50 transition-colors"
                onClick={() => navigate('/cart')}
              >
                <ShoppingCart className="h-6 w-6 text-slate-600" />
                <span className="absolute -top-1 -right-1 bg-indigo-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                  {cartItemCount}
                </span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Search & Filter */}
      <div className="container mx-auto px-4 py-4">
        <div className="relative max-w-md mx-auto mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search dishes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Categories */}
        <div className="container mx-auto px-4 mb-6">
          <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-hide">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-4 py-2 rounded-full font-medium transition-all ${
                activeCategory === 'all'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-slate-600 hover:bg-slate-100'
              }`}
            >
              All
            </button>

            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.slug)}
                className={`px-4 py-2 rounded-full font-medium transition-all ${
                  activeCategory === category.slug
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-slate-600 hover:bg-slate-100'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Menu Items */}
        <main className="container mx-auto px-4 pb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {categories
              .filter(cat => activeCategory === 'all' || cat.slug === activeCategory)
              .flatMap(cat => cat.items || [])
              .filter(item =>
                searchQuery === '' ||
                item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.description?.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .map(item => (
                <motion.div
                  key={item.id}
                  layout
                  whileHover={{ scale: 1.02 }}
                  className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden group"
                >
                  <div className="relative">
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="w-full h-64 object-cover transition-transform group-hover:scale-105"
                        onError={(e) => {
                          const target = e.currentTarget as HTMLImageElement
                          target.style.display = 'none'
                        }}
                      />
                    ) : null}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent flex items-end p-4">
                      <span className="text-xs font-medium text-indigo-200 {item.is_vegetarian && 'bg-green-100 text-green-800 rounded px-2 py-1'}">
                        {item.is_vegetarian ? 'Veg' : 'Non-Veg'}
                      </span>
                    </div>
                  </div>

                  <div className="p-4">
                    <h3 className="font-bold text-lg text-slate-900 mb-1">{item.name}</h3>
                    <p className="text-slate-500 text-sm mb-3 line-clamp-2">
                      {item.description || 'Delicious dish prepared fresh'}
                    </p>

                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xl text-indigo-600">₹{item.price}</span>
                      <button
                        onClick={() => openDetailModal && setOpenDetailModal(item)}
                        className={`px-3 py-1.5 rounded-full font-medium transition-all ${
                          item.is_available
                            ? 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200'
                            : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        }`}
                        disabled={!item.is_available}
                        aria-label={item.is_available ? 'Add to cart' : 'Item unavailable'}
                      >
                        {item.is_available ? 'Add' : 'Unavailable'}
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
          </div>

          {/* Cart sticky bar - visible when cart has items */}
          {cart.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white rounded-2xl shadow-2xl p-4 max-w-md w-full z-50 border border-slate-200"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="font-medium text-slate-900">Cart</span>
                <button
                  onClick={() => navigate('/cart')}
                  className="text-sm text-indigo-600 hover:text-indigo-800"
                >
                  View Cart
                </button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">₹{cartTotal.toFixed(2)}</span>
                <button
                  onClick={() => navigate('/cart')}
                  className="text-xs font-medium text-indigo-600 hover:text-indigo-800"
                >
                  Checkout
                </button>
              </div>
            </motion.div>
          )}
        </main>
      </div>
    </div>
  )
}