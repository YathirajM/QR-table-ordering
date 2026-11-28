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
  Users,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { apiFetch, apiPost } from '../../lib/api'
import type { Table } from '../../lib/types'

export default function AdminTables() {
  const navigate = useNavigate()
  const [tables, setTables] = useState<Table[]>([])
  const [loading, setLoading] = useState(true)
  const [openModal, setOpenModal] = useState(false)
  const [editingTable, setEditingTable] = useState<Table | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    loadTables()
  }, [])

  async function loadTables() {
    setLoading(true)
    try {
      const response = await apiFetch('/api/admin/tables')
      setTables(response.tables || [])
    } catch (error) {
      console.error('Failed to load tables:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddTable = async () => {
    if (!editingTable) return

    try {
      const response = await apiPost('/api/admin/tables', {
        restaurant_id: 1,
        table_number: editingTable.table_number,
        display_name: editingTable.display_name || `Table ${editingTable.table_number}`,
        capacity: editingTable.capacity ?? 4
      })

      setTables(prev => [...prev, response])
      setOpenModal(false)
      setEditingTable(null)
      loadTables()
    } catch (error) {
      console.error('Failed to add table:', error)
      alert('Failed to add table')
    }
  }

  const handleEditTable = async (table: Table) => {
    if (!editingTable) return

    try {
      const response = await apiPost(`/api/admin/tables/${editingTable.id}`, {
        table_number: editingTable.table_number,
        display_name: editingTable.display_name,
        capacity: editingTable.capacity
      })

      setTables(prev =>
        prev.map(t => t.id === editingTable.id ? response : t)
      )
      setOpenModal(false)
      setEditingTable(null)
      loadTables()
    } catch (error) {
      console.error('Failed to edit table:', error)
      alert('Failed to update table')
    }
  }

  const handleDeleteTable = async (tableId: number) => {
    if (!confirm('Are you sure you want to delete this table?')) return

    try {
      await apiPost(`/api/admin/tables/${tableId}`) // Using POST for delete
      setTables(prev => prev.filter(t => t.id !== tableId))
      loadTables()
    } catch (error) {
      console.error('Failed to delete table:', error)
      alert('Failed to delete table')
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Table Management</h1>
          <p className="text-slate-500 mt-2">Manage restaurant tables and QR codes</p>
        </div>

        {/* Add Table Modal */}
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 hidden items-center justify-center"
             id="add-table-modal"
             onClick={(e: any) => e.target === e.currentTarget && setOpenModal(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md border border-slate-200">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">{editingTable ? 'Edit Table' : 'Add New Table'}</h2>

            <form onSubmit={(e) => {
              e.preventDefault()
              handleAddTable()
            }} className="space-y-4">

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Table Number</label>
                <input
                  type="text"
                  value={editingTable?.table_number || ''}
                  onChange={(e) => setEditingTable(prev => ({ ...prev, table_number: e.target.value }))}
                  required
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="T01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Display Name</label>
                <input
                  type="text"
                  value={editingTable?.display_name || ''}
                  onChange={(e) => setEditingTable(prev => ({ ...prev, display_name: e.target.value }))}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Table 1"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Capacity</label>
                  <input
                    type="number"
                    value={editingTable?.capacity ?? 4}
                    onChange={(e) => setEditingTable(prev => ({ ...prev, capacity: Number(e.target.value) }))}
                    min="1"
                    required
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">QR Code</label>
                  <p className="text-sm text-slate-500">
                    Auto-generated QR code for this table
                  </p>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 text-white py-3 rounded-xl font-medium hover:bg-indigo-700 transition-colors"
              >
                {editingTable ? 'Update Table' : 'Add Table'}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Tables Table */}
      <main className="mt-12">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Tables</h2>
              <p className="text-slate-500">Manage restaurant tables</p>
            </div>

            <button
              onClick={() => setOpenModal(true)}
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
            >
              + Add Table
            </button>
          </div>

          {/* Tables List */}
          {loading ? (
            <div className="h-96 flex items-center justify-center text-slate-500">
              Loading...
            </div>
          ) : tables.length === 0 ? (
            <div className="py-12 text-center text-slate-500">
              <Image className="h-12 w-12 mb-4" name="Users" />
              <p>No tables found</p>
              <p className="mt-2 text-sm">Add your first table above</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tables.map(table => (
                <motion.div
                  key={table.id}
                  layout
                  whileHover={{ scale: 1.01 }}
                  className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden"
                >
                  <div className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-3xl text-indigo-600">{table.table_number}</span>
                      <Image className="h-6 w-6" name="QrCode" />
                    </div>
                    <h3 className="font-bold text-lg text-slate-900">{table.display_name || `Table ${table.table_number}`}</h3>
                    <p className="text-slate-500 text-sm">Capacity: {table.capacity}</p>
                    <p className="text-slate-500 text-xs mt-1">Status: {table.is_active ? 'Active' : 'Inactive'}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}