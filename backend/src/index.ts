import { Hono } from 'hono'
import { jwt, type JwtPayload, set } from 'hono/jwt'
import { serveStatic } from 'hono/cf-pages'
import { z } from 'zod'
import { randomUUID } from 'crypto'

type Bindings = {
  DB: D1Database
  R2_BUCKET: R2Bucket
  JWT_SECRET: string
  RAZORPAY_KEY_ID: string
  RAZORPAY_KEY_SECRET: string
}

const app = new Hono<{ Bindings: Bindings }>()

// Database helper
const db = {
  async query(sql: string, params: any[] = []): Promise<any[]> {
    const results = await DB.prepare(sql).bind(...params).all()
    return results.results || []
  },

  async run(sql: string, params: any[] = []): Promise<any> {
    const stmt = DB.prepare(sql).bind(...params)
    return stmt.run()
  }
}

// Validation schemas
const schemas = {
  login: z.object({
    email: z.string().email(),
    password: z.string().min(6)
  }),

  createRestaurant: z.object({
    name: z.string().min(2),
    slug: z.string().min(2),
    description: z.string().optional(),
    logo_url: z.string().url().optional(),
    cover_image_url: z.string().url().optional()
  }),

  createTable: z.object({
    restaurant_id: z.number().int(),
    table_number: z.string().min(1),
    display_name: z.string().optional(),
    capacity: z.number().int().min(1).max(20)
  }),

  createCategory: z.object({
    restaurant_id: z.number().int(),
    name: z.string().min(1),
    slug: z.string().min(1),
    display_order: z.number().int().min(0).optional()
  }),

  createItem: z.object({
    restaurant_id: z.number().int(),
    category_id: z.number().int(),
    name: z.string().min(1),
    description: z.string().optional(),
    price: z.number().min(0.01),
    image_url: z.string().url().optional(),
    is_vegetarian: z.boolean().optional(),
    display_order: z.number().int().min(0).optional()
  }),

  createOrder: z.object({
    restaurant_id: z.number().int(),
    table_id: z.number().int(),
    items: z.array(z.object({
      item_id: z.number().int(),
      quantity: z.number().int().min(1),
      customizations: z.any().optional(),
      add_ons: z.array(z.number()).optional(),
      special_instructions: z.string().optional()
    }))
  })
}

// Helper to generate JWT
async function signJWT(payload: any, secret: string): Promise<string> {
  const header = { alg: 'HS256', typ: 'JWT' }
  const now = Math.floor(Date.now() / 1000)
  const fullPayload = { ...payload, iat: now, exp: now + 86400 }

  const base64Encode = (str: string) => btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
  const headerB64 = base64Encode(JSON.stringify(header))
  const payloadB64 = base64Encode(JSON.stringify(fullPayload))

  const cryptoSubtle = globalThis.crypto?.subtle || require('crypto').webcrypto?.subtle
  if (!cryptoSubtle) {
    throw new Error('Crypto not available')
  }

  const key = await cryptoSubtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )

  const signature = await cryptoSubtle.sign('HMAC', key, new TextEncoder().encode(`${headerB64}.${payloadB64}`))
  const sigB64 = base64Encode(String.fromCharCode(...new Uint8Array(signature)))

  return `${headerB64}.${payloadB64}.${sigB64}`
}

// Auth middleware
async function requireAuth(c: any, next: () => Promise<void>) {
  const auth = c.req.header('Authorization')
  if (!auth || !auth.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  try {
    const token = auth.substring(7)
    const payload = await verifyJWT(token, c.env.JWT_SECRET)
    if (!payload) {
      return c.json({ error: 'Invalid token' }, 401)
    }
    c.set('user', payload)
    await next()
  } catch (e) {
    return c.json({ error: 'Invalid token' }, 401)
  }
}

async function verifyJWT(token: string, secret: string): Promise<JwtPayload | null> {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null

    const [headerB64, payloadB64, sigB64] = parts

    // Verify signature
    const base64Decode = (str: string) => atob(str.replace(/-/g, '+').replace(/_/g, '/'))

    const cryptoSubtle = globalThis.crypto?.subtle || require('crypto').webcrypto?.subtle
    if (!cryptoSubtle) return null

    const key = await cryptoSubtle.importKey(
      'raw',
      new TextEncoder().encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    )

    const expectedSig = new Uint8Array(atob(sigB64).split('').map(c => c.charCodeAt(0)))
    const data = new TextEncoder().encode(`${headerB64}.${payloadB64}`)

    const isValid = await cryptoSubtle.verify('HMAC', key, expectedSig, data)
    if (!isValid) return null

    const payloadJson = JSON.parse(base64Decode(payloadB64))
    return payloadJson
  } catch (e) {
    return null
  }
}

// Generate QR code URL helper
const generateQRCodeURL = (text: string): string => {
  return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(text)}`
}

// Health check
app.get('/health', c => c.json({ status: 'ok' }))

// Auth routes
app.post('/api/auth/login', async c => {
  const body = await c.req.json()
  const parsed = schemas.login.safeParse(body)

  if (!parsed.success) {
    return c.json({ error: 'Invalid input' }, 400)
  }

  const users = await db.query(
    'SELECT * FROM users WHERE email = ?',
    [parsed.data.email]
  )

  if (users.length === 0) {
    return c.json({ error: 'Invalid credentials' }, 401)
  }

  const user = users[0]

  // Validate password (placeholder - implement bcrypt in production)
  const valid = true

  if (!valid) {
    return c.json({ error: 'Invalid credentials' }, 401)
  }

  const token = await signJWT({
    sub: user.id,
    restaurant_id: user.restaurant_id,
    role: user.role,
    email: user.email
  }, c.env.JWT_SECRET)

  return c.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      role: user.role,
      restaurant_id: user.restaurant_id
    }
  })
})

// Restaurant routes
app.post('/api/restaurants', async c => {
  const body = await c.req.json()
  const parsed = schemas.createRestaurant.safeParse(body)

  if (!parsed.success) {
    return c.json({ error: 'Invalid input' }, 400)
  }

  const result = await db.run(
    'INSERT INTO restaurants (name, slug, description, logo_url, cover_image_url) VALUES (?, ?, ?, ?, ?)',
    [
      parsed.data.name,
      parsed.data.slug,
      parsed.data.description || '',
      parsed.data.logo_url || '',
      parsed.data.cover_image_url || ''
    ]
  )

  return c.json({
    id: result.last_row_id,
    success: true
  })
})

// Table routes
app.post('/api/tables', async c => {
  const body = await c.req.json()
  const parsed = schemas.createTable.safeParse(body)

  if (!parsed.success) {
    return c.json({ error: 'Invalid input' }, 400)
  }

  const result = await db.run(
    'INSERT INTO restaurant_tables (restaurant_id, table_number, display_name, capacity) VALUES (?, ?, ?, ?)',
    [
      parsed.data.restaurant_id,
      parsed.data.table_number,
      parsed.data.display_name || '',
      parsed.data.capacity
    ]
  )

  const qrData = `${parsed.data.restaurant_id}/tables/${parsed.data.table_number}`

  return c.json({
    id: result.last_row_id,
    qr_code_url: generateQRCodeURL(qrData)
  })
})

// Customer menu endpoint
app.get('/r/:restaurantSlug', async c => {
  const restaurantSlug = c.req.param('restaurantSlug')
  const tableParam = c.req.query('table')

  const restaurants = await db.query(
    'SELECT * FROM restaurants WHERE slug = ?',
    [restaurantSlug]
  )

  if (restaurants.length === 0) {
    return c.json({ error: 'Restaurant not found' }, 404)
  }

  const restaurant = restaurants[0]

  let table = null
  if (tableParam) {
    const tables = await db.query(
      'SELECT * FROM restaurant_tables WHERE restaurant_id = ? AND table_number = ?',
      [restaurant.id, tableParam]
    )
    table = tables[0] || null
  }

  const categories = await db.query(
    `SELECT * FROM categories
     WHERE restaurant_id = ? AND is_active = 1
     ORDER BY display_order`,
    [restaurant.id]
  )

  for (const cat of categories) {
    const items = await db.query(
      `SELECT * FROM menu_items
       WHERE category_id = ? AND is_available = 1
       ORDER BY display_order`,
      [cat.id]
    )
    cat.items = items
  }

  return c.json({
    restaurant,
    table,
    categories
  })
})

// Public restaurant endpoint for demo
app.get('/restaurants/:slug', async c => {
  const slug = c.req.param('slug')

  const restaurants = await db.query(
    'SELECT * FROM restaurants WHERE slug = ?',
    [slug]
  )

  if (restaurants.length === 0) {
    return c.json({ error: 'Restaurant not found' }, 404)
  }

  const restaurant = restaurants[0]

  const categories = await db.query(
    `SELECT * FROM categories
     WHERE restaurant_id = ? AND is_active = 1
     ORDER BY display_order`,
    [restaurant.id]
  )

  for (const cat of categories) {
    const items = await db.query(
      `SELECT * FROM menu_items
       WHERE category_id = ? AND is_available = 1
       ORDER BY display_order`,
      [cat.id]
    )
    cat.items = items
  }

  return c.json({
    restaurant,
    categories
  })
})

// Create order
app.post('/api/orders', async c => {
  const body = await c.req.json()

  if (!body.restaurant_id || !body.table_id || !body.items) {
    return c.json({ error: 'Missing required fields' }, 400)
  }

  // Validate table
  const tables = await db.query(
    'SELECT * FROM restaurant_tables WHERE id = ? AND restaurant_id = ?',
    [body.table_id, body.restaurant_id]
  )

  if (tables.length === 0) {
    return c.json({ error: 'Invalid table' }, 400)
  }

  // Check menu items and calculate prices
  let subtotal = 0
  const itemDetails = []

  for (const item of body.items) {
    const menuItems = await db.query(
      'SELECT * FROM menu_items WHERE id = ?',
      [item.item_id]
    )

    if (menuItems.length === 0) {
      return c.json({ error: `Item ${item.item_id} not found` }, 400)
    }

    const menuItem = menuItems[0]

    if (!menuItem.is_available) {
      return c.json({ error: `${menuItem.name} is not available` }, 400)
    }

    let price = menuItem.price * item.quantity

    // Add customization prices
    if (item.customizations) {
      for (const [groupId, optionId] of Object.entries(item.customizations)) {
        if (optionId) {
          const options = await db.query(
            'SELECT * FROM customization_options WHERE id = ?',
            [optionId]
          )
          if (options.length > 0) {
            price += options[0].price_modifier * item.quantity
          }
        }
      }
    }

    // Add add-on prices
    if (item.add_ons && item.add_ons.length > 0) {
      for (const addOnId of item.add_ons) {
        const addOns = await db.query(
          'SELECT * FROM add_ons WHERE id = ?',
          [addOnId]
        )
        if (addOns.length > 0) {
          price += addOns[0].price * item.quantity
        }
      }
    }

    subtotal += price

    itemDetails.push({
      item_id: item.item_id,
      name: menuItem.name,
      quantity: item.quantity,
      unit_price: price / item.quantity,
      total_price: price,
      customizations: item.customizations || {},
      add_ons: item.add_ons || [],
      special_instructions: item.special_instructions || ''
    })
  }

  // Get restaurant settings
  const settings = await db.query(
    'SELECT * FROM restaurant_settings WHERE restaurant_id = ?',
    [body.restaurant_id]
  )

  const restaurant = await db.query(
    'SELECT * FROM restaurants WHERE id = ?',
    [body.restaurant_id]
  )

  const taxRate = settings[0]?.tax_rate || 5
  const serviceChargeRate = settings[0]?.service_charge_rate || 10

  const tax = subtotal * (taxRate / 100)
  const serviceCharge = subtotal * (serviceChargeRate / 100)
  const total = subtotal + tax + serviceCharge

  const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`

  const result = await db.run(
    `INSERT INTO orders
     (restaurant_id, table_id, order_number, subtotal, tax, service_charge, total, special_notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      body.restaurant_id,
      body.table_id,
      orderNumber,
      subtotal,
      tax,
      serviceCharge,
      total,
      body.special_notes || ''
    ]
  )

  const orderId = result.last_row_id

  for (const detail of itemDetails) {
    await db.run(
      `INSERT INTO order_items
       (order_id, item_name, quantity, unit_price, total_price, customizations, add_ons, special_instructions)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        orderId,
        detail.name,
        detail.quantity,
        detail.unit_price,
        detail.total_price,
        JSON.stringify(detail.customizations),
        JSON.stringify(detail.add_ons),
        detail.special_instructions
      ]
    )
  }

  return c.json({
    order_id: orderId,
    order_number: orderNumber,
    total,
    subtotal,
    tax,
    service_charge: serviceCharge
  })
})

// Create payment
app.post('/api/payments/create', async c => {
  const body = await c.req.json()

  const orders = await db.query(
    'SELECT * FROM orders WHERE id = ?',
    [body.order_id]
  )

  if (orders.length === 0) {
    return c.json({ error: 'Order not found' }, 404)
  }

  const order = orders[0]

  if (order.total !== body.amount) {
    return c.json({ error: 'Invalid amount' }, 400)
  }

  const razorpayOrder = {
    id: `rzp_${Date.now()}_${Math.floor(Math.random() * 1000000)}`,
    amount: order.total * 100,
    currency: 'INR',
    receipt: order.order_number,
    notes: {
      order_id: order.id.toString(),
      restaurant_id: order.restaurant_id.toString(),
      table_id: order.table_id.toString()
    }
  }

  return c.json({
    order: razorpayOrder,
    key_id: c.env.RAZORPAY_KEY_ID
  })
})

// Verify payment
app.post('/api/payments/verify', async c => {
  const body = await c.req.json()

  const payment = body.payment

  await db.run(
    'UPDATE orders SET payment_status = ? WHERE id = ?',
    [payment.status === 'paid' ? 'COMPLETED' : payment.status, body.order_id]
  )

  await db.run(
    'INSERT INTO payments (order_id, payment_id, amount, currency, status, method) VALUES (?, ?, ?, ?, ?, ?)',
    [
      body.order_id,
      payment.id,
      payment.amount / 100,
      payment.currency,
      payment.status,
      body.method || 'razorpay'
    ]
  )

  return c.json({ success: true })
})

// Kitchen orders
app.get('/api/kitchen/orders', async c => {
  const orders = await db.query(
    `SELECT o.*, t.table_number, r.name as restaurant_name
     FROM orders o
     JOIN restaurant_tables t ON o.table_id = t.id
     JOIN restaurants r ON o.restaurant_id = r.id
     WHERE o.order_status IN ('NEW', 'ACCEPTED', 'PREPARING')
     ORDER BY o.created_at ASC`
  )

  for (const order of orders) {
    const items = await db.query(
      'SELECT * FROM order_items WHERE order_id = ?',
      [order.id]
    )
    order.items = items
  }

  return c.json({ orders })
})

// Update order status
app.put('/api/kitchen/orders/:orderId/status', async c => {
  const orderId = c.req.param('orderId')
  const body = await c.req.json()

  const validStatuses = ['NEW', 'ACCEPTED', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED']
  if (!validStatuses.includes(body.status)) {
    return c.json({ error: 'Invalid status' }, 400)
  }

  await db.run(
    'UPDATE orders SET order_status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [body.status, orderId]
  )

  return c.json({ success: true })
})

// Order tracking
app.get('/api/orders/:orderNumber', async c => {
  const orderNumber = c.req.param('orderNumber')

  const orders = await db.query(
    `SELECT o.*, t.table_number, r.name as restaurant_name
     FROM orders o
     JOIN restaurant_tables t ON o.table_id = t.id
     JOIN restaurants r ON o.restaurant_id = r.id
     WHERE o.order_number = ?`,
    [orderNumber]
  )

  if (orders.length === 0) {
    return c.json({ error: 'Order not found' }, 404)
  }

  const order = orders[0]

  const items = await db.query(
    'SELECT * FROM order_items WHERE order_id = ?',
    [order.id]
  )

  return c.json({
    order: {
      ...order,
      items,
      status: order.order_status,
      payment_status: order.payment_status,
      progress: getStatusProgress(order.order_status)
    }
  })
})

// Admin dashboard
app.get('/api/admin/dashboard', async c => {
  const userId = c.get('user')?.sub
  if (!userId) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  const user = await db.query('SELECT * FROM users WHERE id = ?', [userId])
  const restaurantId = user[0]?.restaurant_id

  const stats = await db.query(
    `SELECT
      COUNT(*) as total_orders,
      SUM(CASE WHEN order_status = 'COMPLETED' THEN 1 ELSE 0 END) as completed_orders,
      SUM(CASE WHEN order_status IN ('NEW', 'ACCEPTED', 'PREPARING') THEN 1 ELSE 0 END) as pending_orders,
      SUM(total) as revenue,
      AVG(total) as avg_order_value
     FROM orders WHERE restaurant_id = ? AND created_at >= date('now', '-30 day')`,
    [restaurantId]
  )

  const recentOrders = await db.query(
    `SELECT o.*, t.table_number,
     (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as item_count
     FROM orders o
     JOIN restaurant_tables t ON o.table_id = t.id
     WHERE o.restaurant_id = ?
     ORDER BY o.created_at DESC
     LIMIT 10`,
    [restaurantId]
  )

  const popularItems = await db.query(
    `SELECT item_name, SUM(quantity) as total_sold, SUM(total_price) as revenue
     FROM order_items
     WHERE order_id IN (SELECT id FROM orders WHERE restaurant_id = ? AND order_status = 'COMPLETED')
     GROUP BY item_name
     ORDER BY total_sold DESC
     LIMIT 10`,
    [restaurantId]
  )

  return c.json({
    stats: stats[0] || {},
    recentOrders,
    popularItems
  })
})

function getStatusProgress(status: string): number {
  const progress: { [key: string]: number } = {
    NEW: 10,
    ACCEPTED: 30,
    PREPARING: 50,
    READY: 80,
    COMPLETED: 100,
    CANCELLED: 0
  }
  return progress[status] || 0
}

// Pages fallback - serve frontend
app.use('*', serveStatic({
  root: './frontend/dist',
  rewrite: (path) => path
}))

export default app