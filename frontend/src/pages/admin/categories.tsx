import { useState, useEffect } from 'react'
import {
  Image,
  LayoutDashboard,
  Hash,
  Plus,
  CheckCircle,
  XCircle,
  Edit2,
  Trash2,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { apiFetch, apiPost } from '../../lib/api'
import type { Category } from '../../lib/types'

export default function AdminCategories() {
  const navigate = useNavigate()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [openModal, setOpenModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    loadCategories()
  }, [])

  async function loadCategories() {
    setLoading(true)
    try {
      const response = await apiFetch('/api/admin/categories')
      setCategories(response.categories || [])
    } catch (error) {
      console.error('Failed to load categories:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddCategory = async () => {
    if (!editingCategory) return

    try {
      const response = await apiPost('/api/admin/categories', {
        restaurant_id: 1,
        name: editingCategory.name,
        slug: editingCategory.slug || editingCategory.name.toLowerCase().replace(/ /g, '-'),
        is_active: editingCategory.is_active ?? true,
        display_order: editingCategory.display_order ?? 0
      })

      setCategories(prev => [...prev, response])
      setOpenModal(false)
      setEditingCategory(null)
      loadCategories()
    } catch (error) {
      console.error('Failed to add category:', error)
      alert('Failed to add category')
    }
  }

  const handleEditCategory = async (category: Category) => {
    if (!editingCategory) return

    try {
      const response = await apiPost(`/api/admin/categories/${editingCategory.id}`, {
        name: editingCategory.name,
        slug: editingCategory.slug,
        is_active: editingCategory.is_active,
        display_order: editingCategory.display_order
      })

      setCategories(prev =>
        prev.map(c => c.id === editingCategory.id ? response : c)
      )
      setOpenModal(false)
      setEditingCategory(null)
      loadCategories()
    } catch (error) {
      console.error('Failed to edit category:', error)
      alert('Failed to update category')
    }
  }

  const handleDeleteCategory = async (categoryId: number) => {
    if (!confirm('Are you sure you want to delete this category?')) return

    try {
      await apiPost(`/api/admin/categories/${categoryId}`) // Using POST for delete
      setCategories(prev => prev.filter(c => c.id !== categoryId))
      loadCategories()
    } catch (error) {
      console.error('Failed to delete category:', error)
      alert('Failed to delete category')
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Category Management</h1>
          <p className="text-slate-500 mt-2">Organize your menu into categories</p>
        </div>

        {/* Add Category Modal */}
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 hidden items-center justify-center"
             id="add-category-modal"
             onClick={(e: any) => e.target === e.currentTarget && setOpenModal(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md border border-slate-200">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">{editingCategory ? 'Edit Category' : 'Add New Category'}</h2>

            <form onSubmit={(e) => {
              e.preventDefault()
              handleAddCategory()
            }} className="space-y-4">

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Category Name</label>
                <input
                  type="text"
                  value={editingCategory?.name || ''}
                  onChange={(e) => setEditingCategory(prev => ({ ...prev, name: e.target.value }))}
                  required
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g., Starters"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Slug (URL)</label>
                <input
                  type="text"
                  value={editingCategory?.slug || ''}
                  onChange={(e) => setEditingCategory(prev => ({ ...prev, slug: e.target.value }))}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="starters"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Is Active</label>
                  <select
                    value={editingCategory?.is_active ?? true}
                    onChange={(e) => setEditingCategory(prev => ({ ...prev, is_active: e.target.value === 'true' }))}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Display Order</label>
                  <input
                    type="number"
                    value={editingCategory?.display_order ?? 0}
                    onChange={(e) => setEditingCategory(prev => ({ ...prev, display_order: Number(e.target.value) }))}
                    min="0"
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 text-white py-3 rounded-xl font-medium hover:bg-indigo-700 transition-colors"
              >
                {editingCategory ? 'Update Category' : 'Add Category'}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Categories Table */}
      <div className="mt-12">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Categories</h2>
              <p className="text-slate-500">Organize your menu</p>
            </div>

            <button
              onClick={() => setOpenModal(true)}
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
            >
              + Add Category
            </button>
          </div>

          {/* Search */}
          <div className="mb-6">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search categories..."
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Categories List */}
          {loading ? (
            <div className="h-96 flex items-center justify-center text-slate-500">
              Loading...
            </div>
          ) : categories.length === 0 ? (
            <div className="py-12 text-center text-slate-500">
              <Image className="h-12 w-12 mb-4" name="Hash" />
              <p>No categories found</p>
              <p className="mt-2 text-sm">Add your first category above</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map(category => (
                <motion.div
                  key={category.id}
                  layout
                  whileHover={{ scale: 1.01 }}
                  className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden"
                >
                  <div className="p-4">
                    <h3 className="font-bold text-lg text-slate-900">{category.name}</h3>
                    <p className="text-slate-500 text-sm">{category.display_order > 0 ? `Order: ${category.display_order}` : 'No order set'}</p>
                    <p className="text-slate-500 text-xs mt-1">{category.is_active ? 'Active' : 'Inactive'}</p>
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