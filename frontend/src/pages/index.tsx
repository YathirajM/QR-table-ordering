import { Link } from 'react-router-dom'
import { ChefHat, LayoutDashboard, ShoppingCart, Utensils } from 'lucide-react'
import { motion } from 'framer-motion'

export default function Portal() {
  const experiences = [
    {
      title: 'Admin Dashboard',
      description: 'Manage your restaurant, menu, and orders from a comprehensive control panel.',
      icon: LayoutDashboard,
      href: '/login',
      color: 'from-blue-500 to-indigo-600',
      action: 'Login to Admin'
    },
    {
      title: 'Kitchen Display',
      description: 'Streamlined kitchen workflow with real-time order updates and status tracking.',
      icon: ChefHat,
      href: '/kitchen',
      color: 'from-emerald-500 to-teal-600',
      action: 'Open Kitchen'
    },
    {
      title: 'Customer Menu',
      description: 'Experience our elegant mobile-first ordering interface.',
      icon: ShoppingCart,
      href: '/demo',
      color: 'from-purple-500 to-pink-600',
      action: 'Preview Demo Menu'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-950 dark:to-indigo-950">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300/30 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute -top-60 -left-60 w-96 h-96 bg-blue-300/20 rounded-full blur-3xl"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-20">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-3 mb-6">
            <motion.div
              whileHover={{ rotate: 360, scale: 1.1 }}
              transition={{ duration: 0.7, type: 'spring' }}
            >
              <Utensils className="h-12 w-12 text-indigo-600" />
            </motion.div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
              Restaurant QR Ordering
            </h1>
          </div>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            A premium cloud-native ordering platform built for Cloudflare
          </p>
        </motion.div>

        {/* Experience Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {experiences.map((exp, index) => (
            <motion.div
              key={exp.title}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -5, shadow: '0px 25px -12px -5px rgba(0,0,0,0.1)' }}
              className="group"
            >
              <Link
                to={exp.href}
                className="block bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-200 dark:border-slate-800
                           shadow-xl hover:shadow-2xl transition-all duration-300
                           bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-950
                           group-hover:scale-[1.02]"
              >
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r ${exp.color} mb-6`}>
                  <exp.icon className="h-8 w-8 text-white" />
                </div>

                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-3">
                  {exp.title}
                </h2>

                <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
                  {exp.description}
                </p>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500 dark:text-slate-500">
                    {exp.title.includes('Login') ? 'Secure access' : 'Access now'}
                  </span>
                  <motion.span
                    whileHover={{ x: 5 }}
                    className="text-indigo-600 dark:text-indigo-400 font-medium text-sm"
                  >
                    {exp.action}
                  </motion.span>
                </div>

                <motion.div
                  initial={{ opacity: 0, scaleX: 0 }}
                  whileHover={{ opacity: 1, scaleX: 1 }}
                  transition={{ duration: 0.3 }}
                  className="h-1 w-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full mt-4 origin-left"
                />
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-20 text-center"
        >
          <div className="inline-flex items-center gap-6 px-6 py-3 bg-white/50 dark:bg-slate-900/50 rounded-full backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-sm text-slate-600 dark:text-slate-400">Cloudflare Durable</span>
            </div>
            <div className="w-px h-6 bg-slate-200 dark:bg-slate-700" />
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              <span className="text-sm text-slate-600 dark:text-slate-400">Real-time Updates</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}