import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Image,
  Search,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { apiFetch, apiPost } from '../../lib/api'
import type { MenuItem, Category } from '../../lib/types'

export default function AdminMenu() {
  const navigate = useNavigate()
  const [categories, setCategories] = useState<Category[]>([])
  const [items, setItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [openModal, setOpenModal] = useState(false)
  const [openEditModal, setOpenEditModal] = useState(false)
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null)
  const [newItem, setNewItem] = useState<MenuItem | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('all')

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    try {
      // Load categories
      const catResponse = await apiFetch('/api/admin/categories') as any
      setCategories(catResponse.categories || [])

      // Load menu data (categories with items)
      const menuResponse = await apiFetch('/api/admin/menu') as any
      const menuCategories = menuResponse.categories || []
      // Flatten items from all categories
      const allItems: MenuItem[] = []
      for (const cat of menuCategories) {
        if (cat.items) {
          for (const item of cat.items) {
            allItems.push(item)
          }
        }
      }
      setItems(allItems)
      setCategories(menuCategories)
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredItems = items.filter(item =>
    searchQuery === '' ||
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description?.toLowerCase().includes(searchQuery.toLowerCase())
  ).filter(item =>
    activeCategoryFilter === 'all' ||
    (item.category_id && categories.some(cat => cat.id === Number(item.category_id) && cat.slug === activeCategoryFilter))
  )

  const handleAddItem = async () => {
    if (!newItem) return

    try {
      const response = await apiPost('/api/admin/menu', {
        restaurant_id: 1,
        category_id: newItem.category_id || 1,
        name: newItem.name,
        description: newItem.description || '',
        price: newItem.price,
        image_url: newItem.image_url || '',
        is_vegetarian: newItem.is_vegetarian ?? false,
        is_available: newItem.is_available ?? true,
        display_order: newItem.display_order ?? 0
      })

      setItems(prev => [...prev, response])
      setNewItem(null)
      setOpenModal(false)
      loadData()
    } catch (error) {
      console.error('Failed to add item:', error)
      alert('Failed to add menu item')
    }
  }

  const handleEditItem = async (item: MenuItem) => {
    if (!editingItem) return

    try {
      const response = await apiPost(`/api/admin/menu/${editingItem.id}`, {
        name: editingItem.name,
        description: editingItem.description || '',
        price: editingItem.price,
        image_url: editingItem.image_url || '',
        is_vegetarian: editingItem.is_vegetarian ?? false,
        is_available: editingItem.is_available ?? true,
        is_bestseller: editingItem.is_bestseller ?? false,
        is_popular: editingItem.is_popular ?? false,
        is_special: editingItem.is_special ?? false
      })

      setItems(prev =>
        prev.map(i => i.id === editingItem.id ? response : i)
      )
      setOpenEditModal(false)
      setEditingItem(null)
      loadData()
    } catch (error) {
      console.error('Failed to edit item:', error)
      alert('Failed to update menu item')
    }
  }

  const handleDeleteItem = async (itemId: number) => {
    if (!confirm('Are you sure you want to delete this menu item?')) return

    try {
      await apiPost(`/api/admin/menu/${itemId}`) // Using POST for delete as Hono doesn't have delete route set up
      setItems(prev => prev.filter(i => i.id !== itemId))
      loadData()
    } catch (error) {
      console.error('Failed to delete item:', error)
      alert('Failed to delete menu item')
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Menu Management</h1>
          <p className="text-slate-500 mt-2">Add, edit, and manage menu items</p>
        </div>

        {/* Add Item Modal */}
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 hidden items-center justify-center"
             id="add-item-modal"
             onClick={(e: any) => e.target === e.currentTarget && setOpenModal(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md border border-slate-200">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Add New Item</h2>

            <form onSubmit={(e) => {
              e.preventDefault()
              handleAddItem()
            }} className="space-y-4">

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Item Name</label>
                <input
                  type="text"
                  value={newItem?.name || ''}
                  onChange={(e) => setNewItem(prev => ({ ...prev, name: e.target.value }))}
                  required
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g., Butter Chicken"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Price (₹)</label>
                  <input
                    type="number"
                    value={newItem?.price || 0}
                    onChange={(e) => setNewItem(prev => ({ ...prev, price: Number(e.target.value) }))}
                    min="0.01"
                    required
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Category</label>
                  <select
                    value={newItem?.category_id || 1}
                    onChange={(e) => setNewItem(prev => ({ ...prev, category_id: Number(e.target.value) }))}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value={1}>All Categories</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
                <textarea
                  value={newItem?.description || ''}
                  onChange={(e) => setNewItem(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Delicious dish prepared fresh"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Price (₹)</label>
                  <input
                    type="number"
                    value={editingItem?.price || 0}
                    onChange={(e) => setEditingItem(prev => ({ ...prev, price: Number(e.target.value) }))}
                    min="0.01"
                    required
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Category</label>
                  <select
                    value={editingItem?.category_id || 1}
                    onChange={(e) => setEditingItem(prev => ({ ...prev, category_id: Number(e.target.value) }))}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value={1}>All Categories</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
                <textarea
                  value={editingItem?.description || ''}
                  onChange={(e) => setEditingItem(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Delicious dish prepared fresh"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Is Vegetarian</label>
                  <select
                    value={editingItem?.is_vegetarian ?? false}
                    onChange={(e) => setEditingItem(prev => ({ ...prev, is_vegetarian: e.target.value === 'true' }))}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Is Available</label>
                  <select
                    value={editingItem?.is_available ?? true}
                    onChange={(e) => setEditingItem(prev => ({ ...prev, is_available: e.target.value === 'true' }))}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Bestseller</label>
                  <select
                    value={editingItem?.is_bestseller ?? false}
                    onChange={(e) => setEditingItem(prev => ({ ...prev, is_bestseller: e.target.value === 'true' }))}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Popular</label>
                  <select
                    value={editingItem?.is_popular ?? false}
                    onChange={(e) => setEditingItem(prev => ({ ...prev, is_popular: e.target.value === 'true' }))}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Special</label>
                  <select
                    value={editingItem?.is_special ?? false}
                    onChange={(e) => setEditingItem(prev => ({ ...prev, is_special: e.target.value === 'true' }))}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Display Order</label>
                <input
                  type="number"
                  value={editingItem?.display_order ?? 0}
                  onChange={(e) => setEditingItem(prev => ({ ...prev, display_order: Number(e.target.value) }))}
                  min="0"
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 text-white py-3 rounded-xl font-medium hover:bg-indigo-700 transition-colors"
              >
                {editingItem ? 'Update Item' : 'Add Item'}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="mt-12">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Menu Items</h2>
              <p className="text-slate-500">Manage your restaurant's menu</p>
            </div>

            <button
              onClick={() => setOpenModal(true)}
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
            >
              + Add Item
            </button>
          </div>

          {/* Search and Filter */}
          <div className="mb-6">
            <div className="flex gap-2">
              <Search className="flex-1" />
              <select
                value={activeCategoryFilter}
                onChange={(e) => setActiveCategoryFilter(e.target.value)}
                className="px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Categories</option>
                {categories.map(cat => (
                  <option key={cat.slug} value={cat.slug}>{cat.name}</option>
                ))}
              </select>
            </div>

            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search items..."
              className="mt-4 w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Items List */}
          {loading ? (
            <div className="h-96 flex items-center justify-center text-slate-500">
              Loading...
            </div>
          ) : items.length === 0 ? (
            <div className="py-12 text-center text-slate-500">
              <Image className="h-12 w-12 mb-4" name="Utensils" />
              <p>No menu items found</p>
              <p className="mt-2 text-sm">Add your first menu item above</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredItems.map(item => (
                <motion.div
                  key={item.id}
                  layout
                  whileHover={{ scale: 1.01 }}
                  className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden group"
                >
                  <div className="relative">
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="w-full h-40 object-cover transition-transform group-hover:scale-105"
                        onError={(e) => {
                          const target = e.currentTarget as HTMLImageElement
                          target.style.display = 'none'
                        }}
                      />
                    ) : (
                      <div
                        className="w-full h-40 bg-slate-100 flex items-center justify-center"
                      >
                        <Image className="h-8 w-8 text-indigo-400" name="Utensils" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent flex items-end p-3">
                      {item.is_vegetarian && (
                        <span className="text-xs font-medium bg-green-100 text-green-800 rounded px-2 py-1">
                          Veg
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-4">
                    <h3 className="font-bold text-lg text-slate-900 mb-1">{item.name}</h3>
                    <p className="text-slate-500 text-sm mb-3 line-clamp-2">
                      {item.description || 'Delicious dish prepared fresh'}
                    </p>

                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xl text-indigo-600">₹{item.price}</span>
                      <div className="flex gap-2 text-xs">
                        {item.is_available && (
                          <span className="bg-indigo-100 text-indigo-600 rounded px-2 py-1">
                            Available
                          </span>
                        )}
                        {!item.is_available && (
                          <span className="bg-slate-100 text-slate-400 rounded px-2 py-1">
                            Unavailable
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}