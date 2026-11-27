# Restaurant QR Ordering Platform

A premium, cloud-native restaurant QR ordering and management platform built for Cloudflare.

## Features

- **Customer Ordering**: Mobile-first menu browsing and ordering via QR codes
- **Kitchen Display**: Real-time order processing for kitchen staff
- **Admin Dashboard**: Complete restaurant management system
- **QR Code Generation**: Automatic QR codes for each table
- **Payment Integration**: Razorpay integration for online payments
- **Real-time Updates**: Order status synchronization across all clients

## Technology Stack

- **Runtime**: Cloudflare Workers (Hono framework)
- **Frontend**: React + TypeScript + Tailwind CSS
- **Database**: Cloudflare D1 (SQLite)
- **Storage**: Cloudflare R2 for images
- **Payments**: Razorpay
- **Deployment**: Wrangler CLI

## Project Structure

```
restaurant-qr-ordering-platform/
├── backend/
│   ├── src/
│   │   └── index.ts          # API routes and server
│   └── migrations/
│       └── migration.sql     # Database schema
├── frontend/
│   ├── src/
│   │   ├── App.tsx           # Main application
│   │   ├── pages/
│   │   │   ├── index.tsx     # Portal page
│   │   │   ├── login.tsx     # Login page
│   │   │   ├── r/[restaurantSlug].tsx  # Customer menu
│   │   │   ├── cart.tsx      # Shopping cart
│   │   │   ├── order/[orderNumber].tsx # Order tracking
│   │   │   └── kitchen.tsx   # Kitchen display
│   │   ├── lib/
│   │   │   ├── api.ts        # API client
│   │   │   └── types.ts      # TypeScript types
│   │   └── styles/
│   │       └── tailwind.css  # Tailwind imports
│   ├── index.html
│   ├── vite.config.ts
│   └── tailwind.config.js
├── package.json
├── wrangler.toml
└── README.md
```

## Development

```bash
# Install dependencies
npm install

# Install wrangler globally
npm install -g wrangler

# Create D1 database
wrangler d1 create restaurant_db

# Run migrations
wrangler d1 migrate restaurant_db --local

# Start development server
wrangler dev
```

## Deployment

```bash
# Deploy to Cloudflare
wrangler deploy
```

## Environment Variables

The following environment variables must be configured in Cloudflare:

- `JWT_SECRET` - Secret for signing JWT tokens
- `RAZORPAY_KEY_ID` - Razorpay public key
- `RAZORPAY_KEY_SECRET` - Razorpay secret key

## Database

The application uses Cloudflare D1 with SQLite. Migrations are defined in `backend/migrations/migration.sql`.

## API Routes

- `POST /api/auth/login` - User authentication
- `POST /api/restaurants` - Create restaurant
- `POST /api/tables` - Create table (requires auth)
- `GET /r/:restaurantSlug` - Customer menu endpoint
- `POST /api/orders` - Create order
- `GET /api/kitchen/orders` - Get active orders (requires auth)
- `PUT /api/kitchen/orders/:orderId/status` - Update order status
- `GET /api/orders/:orderNumber` - Track order
- `POST /api/payments/create` - Create Razorpay order
- `POST /api/payments/verify` - Verify payment webhook
- `GET /api/admin/dashboard` - Admin dashboard data

## Pages

- `/` - System portal (admin/kitchen/customer access)
- `/login` - Admin login
- `/admin` - Admin dashboard
- `/admin/orders` - Order management
- `/admin/menu` - Menu management
- `/admin/categories` - Category management
- `/admin/tables` - Table management
- `/admin/qr` - QR code management
- `/admin/payments` - Payment management
- `/admin/analytics` - Analytics dashboard
- `/admin/settings` - Restaurant settings
- `/kitchen` - Kitchen display
- `/r/:restaurantSlug` - Customer menu (from QR code)
- `/cart` - Shopping cart
- `/order/:orderNumber` - Order tracking

## License

MIT