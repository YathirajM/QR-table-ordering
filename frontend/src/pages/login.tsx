import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Utensils, Lock, Mail } from 'lucide-react'
import { apiPost } from '../lib/api'

export default function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await apiPost('/auth/login', { email, password })
      const { token } = response as any

      localStorage.setItem('token', token)
      navigate('/admin')
    } catch (error) {
      console.error('Login failed:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <Link to="/" className="inline-block mb-6">
              <div className="flex items-center justify-center gap-3 mb-3">
                <Utensils className="h-10 w-10 text-indigo-600" />
                <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
                  Restaurant QR
                </h1>
              </div>
            </Link>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Welcome Back</h2>
            <p className="text-slate-500">Sign in to manage your restaurant</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  placeholder="Enter your password"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-3 rounded-xl font-medium
                         hover:bg-indigo-700 transition-colors disabled:opacity-50
                         flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                'Sign In'
              )}
            </button>

            <div className="text-center">
              <button
                type="button"
                className="text-slate-600 text-sm hover:text-slate-900 underline"
              >
                Forgot password?
              </button>
            </div>
          </form>

          <div className="mt-6">
          </div>

          <p className="mt-6 text-center text-sm text-slate-500">
            Don't have an account?{' '}
            <Link to="/register" className="text-indigo-600 hover:underline">
              Create account
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}