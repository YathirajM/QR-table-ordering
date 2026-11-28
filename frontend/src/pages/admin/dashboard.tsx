import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ShoppingCart, DollarSign, Clock, Image } from 'lucide-react'
import { apiFetch } from '../../lib/api'
import type { Order } from '../../lib/types'

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>({})
  const [recentOrders, setRecentOrders] = useState<Order[]>([])
  const [popularItems, setPopularItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    loadDashboard()
  }, [])

  async function loadDashboard() {
    setLoading(true)
    try {
      const data = await apiFetch('/api/admin/dashboard')
      setStats((data as any).stats || {})
      setRecentOrders((data as any).recentOrders || [])
      setPopularItems((data as any).popularItems || [])
    } catch (error) {
      console.error('Failed to load dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  // Check if user is admin
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'MANAGER'

  const statCards = [
    {
      title: 'Total Orders',
      value: stats.total_orders || 0,
      icon: ShoppingCart,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50'
    },
    {
      title: 'Total Revenue',
      value: `₹${(stats.revenue || 0).toLocaleString()}`,
      icon: DollarSign,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50'
    },
    {
      title: 'Pending Orders',
      value: stats.pending_orders || 0,
      icon: Clock,
      color: 'text-amber-600',
      bg: 'bg-amber-50'
    },
    {
      title: 'Avg Order Value',
      value: isAdmin ? `₹${(stats.avg_order_value || 0).toFixed(2)}` : '—',
      icon: TrendingUp,
      color: 'text-blue-600',
      bg: 'bg-blue-50'
    }
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500 mt-1">Overview of your restaurant performance</p>
        </div>
        {isAdmin && (
          <div className="flex items-center gap-2">
            <Image className="h-5 w-5" name="Users" />
            <span className="text-sm text-slate-500">Admin</span>
          </div>
        )}
      </div>

      {loading ? (
        <div className="grid md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 animate-pulse"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-slate-200" />
                <div>
                  <p className="text-slate-400 text-sm">Loading...</p>
                  <div className="h-6 bg-slate-200 rounded" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="grid md:grid-cols-4 gap-6">
          {statCards.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-sm border border-slate-200 p-6"
            >
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-full ${stat.bg} flex items-center justify-center`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-slate-500 text-sm font-medium">{stat.title}</p>
                  <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl shadow-sm border border-slate-200 p-6"
        >
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Recent Orders</h3>
          <div className="space-y-3">
            {recentOrders.slice(0, 5).map((order, index) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
                className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
              >
                <div>
                  <span className="font-medium text-slate-900">{order.order_number}</span>
                  <p className="text-sm text-slate-500">Table {order.table_id}</p>
                </div>
                <span className="font-medium text-slate-900">₹{order.total}</span>
              </motion.div>
            ))}
            {recentOrders.length === 0 && (
              <p className="text-slate-500 text-center py-4">No recent orders</p>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl shadow-sm border border-slate-200 p-6"
        >
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Popular Items</h3>
          <div className="space-y-3">
            {popularItems.slice(0, 5).map((item, index) => (
              <motion.div
                key={item.item_name}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
                className="flex items-center justify-between"
              >
                <span className="text-slate-700">{item.item_name}</span>
                <div className="text-right">
                  <span className="font-medium text-slate-900">{item.total_sold} sold</span>
                  <p className="text-sm text-slate-500">₹{item.revenue}</p>
                </div>
              </motion.div>
            ))}
            {popularItems.length === 0 && (
              <p className="text-slate-500 text-center py-4">No sales data yet</p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}