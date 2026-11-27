import { Outlet, NavLink, Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  ShoppingBag,
  Menu,
  Hash,
  QrCode,
  CreditCard,
  BarChart3,
  Settings,
  ChefHat,
  LogOut,
  User,
  Home
} from 'lucide-react'
import { useState } from 'react'

const navigation = [
  { name: 'Overview', href: '/admin', icon: LayoutDashboard },
  { name: 'Orders', href: '/admin/orders', icon: ShoppingBag },
  { name: 'Menu', href: '/admin/menu', icon: Menu },
  { name: 'Categories', href: '/admin/categories', icon: Hash },
  { name: 'Tables', href: '/admin/tables', icon: Hash },
  { name: 'QR Codes', href: '/admin/qr', icon: QrCode },
  { name: 'Payments', href: '/admin/payments', icon: CreditCard },
  { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
]

export default function AdminLayout() {
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile sidebar */}
      <div className="fixed inset-0 z-40 lg:hidden">
        <div className="fixed inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
        <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl">
          <SidebarContent />
        </aside>
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:gap-x-0 lg:overflow-y-auto lg:bg-white">
        <SidebarContent />
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="bg-white border-b border-slate-200">
          <div className="flex items-center justify-between px-4 py-3 lg:px-6">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden rounded-lg p-2 text-slate-600 hover:bg-slate-100"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-4">
              <Link
                to="/"
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
              >
                <Home className="h-4 w-4" />
                Restaurant Portal
              </Link>

              <div className="hidden md:block text-sm text-slate-500">
                / {location.pathname.split('/').filter(Boolean).pop() || 'Dashboard'}
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="py-6 px-4 lg:px-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

function SidebarContent() {
  return (
    <div className="h-full flex flex-col">
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-4 lg:py-6 border-b border-slate-200">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Utensils className="h-5 w-5 text-white" />
          </div>
          <span className="font-bold text-xl text-slate-900">Restaurant QR</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-1">
        {navigation.map(item => (
          < NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors
               ${isActive
                 ? 'bg-indigo-50 text-indigo-600'
                 : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
               }`
            }
          >
            <item.icon className="h-5 w-5" />
            {item.name}
          </NavLink>
        ))}
      </nav>

      {/* User menu */}
      <div className="border-t border-slate-200 p-4">
        <NavLink
          to="/login"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
        >
          <LogOut className="h-5 w-5" />
          Sign Out
        </NavLink>
      </div>
    </div>
  )
}

import { Utensils } from 'lucide-react'