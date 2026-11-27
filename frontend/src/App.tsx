import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Portal from './pages/index'
import LoginPage from './pages/login'
import CustomerMenu from './pages/r/[restaurantSlug]'
import Cart from './pages/cart'
import OrderTracking from './pages/order/[orderNumber]'
import KitchenDisplay from './pages/kitchen'
import AdminDashboard from './pages/admin/dashboard'
import AdminLayout from './pages/admin'
import './styles/tailwind.css'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Portal />} />

        <Route path="/login" element={<LoginPage />} />

        <Route path="/r/:restaurantSlug" element={<CustomerMenu />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/order/:orderNumber" element={<OrderTracking />} />

        <Route path="/kitchen" element={<KitchenDisplay />} />

        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="orders" element={<div className="text-2xl font-bold p-8">Orders Management</div>} />
          <Route path="menu" element={<div className="text-2xl font-bold p-8">Menu Management</div>} />
          <Route path="categories" element={<div className="text-2xl font-bold p-8">Categories Management</div>} />
          <Route path="tables" element={<div className="text-2xl font-bold p-8">Tables Management</div>} />
          <Route path="qr" element={<div className="text-2xl font-bold p-8">QR Code Management</div>} />
          <Route path="payments" element={<div className="text-2xl font-bold p-8">Payments Management</div>} />
          <Route path="analytics" element={<div className="text-2xl font-bold p-8">Analytics Dashboard</div>} />
          <Route path="settings" element={<div className="text-2xl font-bold p-8">Restaurant Settings</div>} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App