import { Link, useNavigate } from 'react-router-dom'
import { Image } from 'lucide-react'
import { motion } from 'framer-motion'

export default function Portal() {
  const navigate = useNavigate()

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-500 to-pink-500 dark:from-indigo-900 dark:via-slate-900 dark:to-slate-950 overflow-hidden"
    >
      {/* Background pattern */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/80 to-purple-600/80" />
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 w-full h-full bg-[url('/images/background-pattern.png')] bg-cover bg-center opacity-20" />
        </div>
      </div>

      {/* Food imagery overlay */}
      <div className="relative">
        {/* Abstract food elements */}
        <div className="absolute top-1/4 left-1/4 w-48 h-48 bg-orange-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-1/4 right-1/4 w-44 h-44 bg-green-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      </div>

      {/* Hero section */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="inline-block"
        >
          {/* Restaurant logo */}
          {navigate() || ''}

          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
              <Image className="h-8 w-8 text-white" name="Restaurant" />
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-white to-slate-900 bg-clip-text text-transparent">
              Spice Route
            </h1>
          </div>

          <p className="text-xl text-slate-200 dark:text-slate-400 max-w-2xl mx-auto mb-8 leading-relaxed">
            Authentic Indian cuisine with a modern twist. Dine in, take out, or order from our beautiful menu.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/r/spice-route"
              className="relative w-full sm:w-auto bg-white text-indigo-600 px-8 py-4 rounded-2xl font-medium hover:bg-indigo-50 transition-colors flex items-center gap-3"
            >
              <Image className="h-6 w-6" name="ShoppingBag" />
              <span>Browse Menu</span>
            </Link>

            <Link
              to="/r/spice-route?table=T01"
              className="relative w-full sm:w-auto bg-indigo-600 text-white px-8 py-4 rounded-2xl font-medium hover:bg-indigo-700 transition-colors flex items-center gap-3"
            >
              <Image className="h-6 w-6" name="Table" />
              <span>Order Now</span>
            </Link>
          </div>

          {/* Feature highlights */}
          <div className="mt-10 grid grid-cols-3 gap-6 px-4 pb-4">
            <div className="bg-white/30 rounded-2xl p-6 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                  <Image className="h-6 w-6 text-indigo-300" name="Clock" />
                </div>
                <div>
                  <p className="text-slate-100 font-medium">20+</p>
                  <p className="text-slate-400 text-sm">Categories</p>
                </div>
              </div>
            </div>

            <div className="bg-white/30 rounded-2xl p-6 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                  <Image className="h-6 w-6 text-emerald-300" name="Star" />
                </div>
                <div>
                  <p className="text-slate-100 font-medium">4.8</p>
                  <p className="text-slate-400 text-sm">Rating</p>
                </div>
              </div>
            </div>

            <div className="bg-white/30 rounded-2xl p-6 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-rose-500/20 flex items-center justify-center">
                  <Image className="h-6 w-6 text-rose-300" name="Users" />
                </div>
                <div>
                  <p className="text-slate-100 font-medium">150K</p>
                  <p className="text-slate-400 text-sm">Customers</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Reveal animation for mobile */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="flex flex-col items-center gap-3 text-sm"
        >
          <p className="text-slate-300">Scan to order</p>
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center border-2 border-indigo-500">
            <Image className="h-6 w-6 text-indigo-600" name="QrCode" />
          </div>
        </motion.div>
      </div>

      {/* QR showcase */}
      <div className="absolute top-0 right-0 md:bottom-0 md:right-0 w-64 h-64 bg-white rounded-2xl shadow-2xl overflow-hidden md:w-80 md:h-80 opacity-90">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-purple-600" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Image className="h-32 w-32" name="QrCode" />
        </div>
      </div>

      {/* Credits - minimal */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        className="fixed bottom-6 left-6 text-xs text-slate-300"
      >
        Built with care for restaurant excellence
      </motion.div>
    </motion.div>
  )
}