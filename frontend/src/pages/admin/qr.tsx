import { useState, useEffect } from 'react'
import {
  Image,
  LayoutDashboard,
  Hash,
  QrCode,
  Plus,
  CheckCircle,
  Trash2,
  Eye,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { apiFetch, apiPost } from '../../lib/api'

export default function AdminQR() {
  const navigate = useNavigate()
  const [qrCodes, setQrCodes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [openModal, setOpenModal] = useState(false)
  const [editingQr, setEditingQr] = useState<any | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    loadQrCodes()
  }, [])

  async function loadQrCodes() {
    setLoading(true)
    try {
      const response = await apiFetch('/api/qr-code')
      // The QR API returns a URL, we'll generate our own list
      setQrCodes([])
    } catch (error) {
      console.error('Failed to load QR codes:', error)
      setQrCodes([])
    } finally {
      setLoading(false)
    }
  }

  // Generate new QR code
  const generateQrCode = (tableId: number, tableNumber: string) => {
    const restaurantId = 1 // Would come from authenticated user
    const qrData = `${restaurantId}/tables/${tableNumber}`
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrData)}`

    return {
      id: tableId,
      tableNumber,
      qrCodeUrl: qrUrl,
      createdAt: new Date().toISOString()
    }
  }

  const handleAddQr = async () => {
    if (!editingQr) return

    try {
      const qrData = `${1}/tables/${editingQr.tableNumber}`
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrData)}`

      const newQr = {
        id: editingQr.id,
        tableNumber: editingQr.tableNumber,
        qrCodeUrl: qrUrl,
        createdAt: new Date().toISOString()
      }

      setQrCodes(prev => [...prev, newQr])
      setOpenModal(false)
      setEditingQr(null)
    } catch (error) {
      console.error('Failed to generate QR code:', error)
      alert('Failed to generate QR code')
    }
  }

  const handleDeleteQr = async (qrId: number) => {
    if (!confirm('Are you sure you want to remove this QR code?')) return

    try {
      setQrCodes(prev => prev.filter(qr => qr.id !== qrId))
    } catch (error) {
      console.error('Failed to remove QR code:', error)
      alert('Failed to remove QR code')
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">QR Code Management</h1>
          <p className="text-slate-500 mt-2">Generate and manage QR codes for tables</p>
        </div>

        {/* QR Codes List */}
        <main className="mt-12">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900">QR Codes</h2>
                <p className="text-slate-500">Scan to order</p>
              </div>

              <button
                onClick={() => setOpenModal(true)}
                className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
              >
                + Generate QR Code
              </button>
            </div>

            {/* Search */}
            <div className="mb-6">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tables..."
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* QR Codes List */}
            {loading ? (
              <div className="h-96 flex items-center justify-center text-slate-500">
                Loading...
              </div>
            ) : qrCodes.length === 0 ? (
              <div className="py-12 text-center text-slate-500">
                <Image className="h-12 w-12 mb-4" name="QrCode" />
                <p>No QR codes found</p>
                <p className="mt-2 text-sm">Add tables first to generate QR codes</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {qrCodes.map(qr => (
                  <motion.div
                    key={qr.id}
                    layout
                    whileHover={{ scale: 1.01 }}
                    className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden"
                  >
                    <div className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-2xl text-indigo-600">{qr.tableNumber}</span>
                        <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
                          <Image className="h-6 w-6" name="QrCode" />
                        </div>
                      </div>

                      <h3 className="font-bold text-lg text-slate-900">{qr.tableNumber}</h3>
                      <p className="text-slate-500 text-xs">Table QR Code</p>
                    </div>

                    <div className="p-3 bg-slate-50">
                      <a
                        href={qr.qrCodeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full bg-indigo-50 text-indigo-600 px-4 py-2 rounded-lg text-sm hover:bg-indigo-100 transition-colors flex items-center justify-center"
                        download={`table-${qr.id}-qr.png`}
                      >
                        <Image className="h-4 w-4 mr-2" name="Download" />
                        Download
                      </a>
                      <span className="text-indigo-500 text-xs ml-2">View</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}