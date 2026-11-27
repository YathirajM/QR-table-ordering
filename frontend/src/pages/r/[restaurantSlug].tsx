import { useParams, useSearchParams, Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { Utensils, Search, Filter, ChefHat, ShoppingCart } from 'lucide-react'
import { apiFetch } from '../../lib/api'
import type { Restaurant, Category, MenuItem, Table } from '../../lib/types'

export default function CustomerMenu() {
  const params = useParams()
  const [searchParams] = useSearchParams()
  const restaurantSlug = params.restaurantSlug as string
  const tableParam = searchParams.get('table')

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [table, setTable] = useState<Table | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [cart, setCart] = useState<MenuItem[]>([])

  useEffect(() => {
    loadRestaurant()
  }, [restaurantSlug, tableParam])

  async function loadRestaurant() {
    setLoading(true)
    try {
      const data = await apiFetch<{ restaurant: Restaurant; table: Table | null; categories: Category[] }>(
        `/restaurants/${restaurantSlug}?table=${tableParam || ''}`
      )

      // Handle both API response formats
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

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white sticky top-0 z-50 shadow-sm border-b border-slate-200">
        <div className="container mx-auto px-4 py-4">
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
          </div>
        </div>
      </header>

      {/* Search & Filter */}
      <div className="container mx-auto px-4 py-4">
        <div className="relative max-w-md mx-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search dishes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="container mx-auto px-4">
        <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-hide">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveCategory('all')}
            className={`px-4 py-2 rounded-full font-medium transition-all ${
              activeCategory === 'all'
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-slate-600 hover:bg-slate-100'
            }`}
          >
            All
          </motion.button>

          {categories.map(category => (
            <motion.button
              key={category.id}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveCategory(category.slug)}
              className={`px-4 py-2 rounded-full font-medium transition-all ${
                activeCategory === category.slug
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-slate-600 hover:bg-slate-100'
              }`}
            >
              {category.name}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Menu Items */}
      <main className="container mx-auto px-4 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden"
              >
                <div className="relative">
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        const target = e.currentTarget as HTMLImageElement
                        target.style.display = 'none'
                      }}
                    />
                  ) : null}
                  <div className="absolute inset-0 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                    <Utensils className="h-12 w-12 text-slate-400" />
                  </div>
                  {item.is_vegetarian && (
                    <span className="absolute top-3 right-3 bg-green-100 text-green-700 text-xs font-medium px-2 py-1 rounded-full">
                      Veg
                    </span>
                  )}
                </div>

                <div className="p-4">
                  <h3 className="font-bold text-lg text-slate-900 mb-2">{item.name}</h3>
                  <p className="text-slate-600 text-sm mb-3 line-clamp-2">
                    {item.description || 'Delicious dish prepared fresh'}
                  </p>

                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xl text-indigo-600">₹{item.price}</span>
                    <button
                      disabled={!item.is_available}
                      onClick={() => {
                        if (item.is_available) {
                          setCart([...cart, item])
                        }
                      }}
                      className={`px-4 py-2 rounded-full font-medium transition-all ${
                        item.is_available
                          ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                          : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      {item.is_available ? 'Add' : 'Unavailable'}
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
        </div>

        {cart.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-24 md:bottom-6 left-1/2 -translate-x-1/2 md:translate-x-0 md:left-6"
          >
            <Link
              to="/cart"
              className="bg-indigo-600 text-white p-4 rounded-2xl shadow-2xl flex items-center gap-3 md:flex-row hover:shadow-xl transition-shadow"
            >
              <ShoppingCart className="h-6 w-6" />
              <div>
                <span className="font-bold text-2xl">{cart.length}</span>
                <p className="text-sm opacity-90">items in cart</p>
              </div>
            </Link>
          </motion.div>
        )}
      </main>
    </div>
  )
}

function motion() {
  return {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
    span: ({ children, ...props }: any) => <span {...props}>{children}</span>
  }
}