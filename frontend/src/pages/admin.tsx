import { useEffect, useState } from 'react'
import {
  LayoutDashboard,
  ShoppingBag,
  Menu,
  Hash,
  QrCode,
  CreditCard,
  BarChart3,
  Settings,
  LogOut,
  Home,
  Lock,
  Utensils,
} from 'lucide-react'
import { useNavigate, useLocation, Outlet, Link } from 'react-router-dom'
import { apiFetch, apiPost } from '../lib/api'

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
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState<any>(null)

  // Check auth on mount
  useEffect(() => {
    checkAuth()
  }, [])

  async function checkAuth() {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        setIsLoggedIn(false)
        return
      }

      // Verify token with API
      const response = await apiFetch('/api/auth/verify', {
        method: 'POST',
        body: JSON.stringify({ token })
      })

      if (response.success) {
        setUser(response.user)
        setIsLoggedIn(true)
      } else {
        setIsLoggedIn(false)
        localStorage.removeItem('token')
        navigate('/login')
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      setIsLoggedIn(false)
      localStorage.removeItem('token')
      navigate('/login')
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    const form = e.target as HTMLFormElement
    const email = (form.elements.namedItem('email') as HTMLInputElement).value
    const password = (form.elements.namedItem('password') as HTMLInputElement).value

    try {
      const response = await apiPost('/api/auth/login', { email, password })
      localStorage.setItem('token', response.token)
      setUser(response.user)
      setIsLoggedIn(true)
      navigate('/admin')
    } catch (error) {
      console.error('Login failed:', error)
      alert('Login failed. Please check your credentials.')
    }
  }

  async function handleLogout() {
    localStorage.removeItem('token')
    setIsLoggedIn(false)
    setUser(null)
    navigate('/login')
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-100 to-purple-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 text-center">
          <Lock className="h-12 w-12 text-indigo-600 mb-6" />
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Restaurant QR Ordering</h2>
          <p className="text-slate-500 mb-8">Please log in to access the Admin Panel</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
              <input
                type="email"
                name="email"
                required
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
              <input
                type="password"
                name="password"
                required
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-3 rounded-xl font-medium hover:bg-indigo-700 transition-colors"
            >
              Sign In
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile sidebar */}
      <div className="fixed inset-0 z-40 lg:hidden">
        <div className="fixed inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
        <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl">
          <SidebarContent sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} onLogout={handleLogout} user={user} />
        </aside>
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:gap-x-0 lg:overflow-y-auto lg:bg-white">
        <SidebarContent sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} onLogout={handleLogout} user={user} />
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

            {user && (
              <div className="flex items-center gap-4">
                <span className="text-sm text-slate-500">
                  Welcome, {user.full_name || user.email}
                </span>
                <button
                  onClick={handleLogout}
                  className="text-sm text-slate-500 hover:text-slate-900 underline"
                >
                  Sign Out
                </button>
              </div>
            )}
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

function SidebarContent({ sidebarOpen, setSidebarOpen, onLogout, user }: any) {
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
          <Link
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
          </Link>
        ))}
      </nav>

      {/* User menu */}
      <div className="border-t border-slate-200 p-4">
        {user ? (
          <Link
            to="/admin/settings"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
          >
            <Settings className="h-5 w-5" />
            Settings
          </Link>
        ) : (
          <Link
            to="/login"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
          >
            <LogOut className="h-5 w-5" />
            Sign In
          </Link>
        )}
      </div>
    </div>
  )
}