export interface Restaurant {
  id: number
  name: string
  slug: string
  description: string
  logo_url: string
  cover_image_url: string
  address: string
  phone: string
  email: string
  currency: string
  tax_rate: number
  service_charge_rate: number
  is_open: boolean
}

export interface Category {
  id: number
  restaurant_id: number
  name: string
  slug: string
  display_order: number
  is_active: number
  items?: MenuItem[]
}

export interface MenuItem {
  id: number
  restaurant_id: number
  category_id: number
  name: string
  slug: string
  description: string
  price: number
  image_url: string
  is_vegetarian: number
  is_available: number
  display_order: number
  is_bestseller: number
  is_popular: number
  is_special: number
}

export interface CustomizationGroup {
  id: number
  restaurant_id: number
  name: string
  is_required: number
  min_selections: number
  max_selections: number
  display_order: number
  options?: CustomizationOption[]
}

export interface CustomizationOption {
  id: number
  group_id: number
  name: string
  price_modifier: number
  is_default: number
  display_order: number
}

export interface AddOn {
  id: number
  restaurant_id: number
  name: string
  price: number
  is_available: number
  display_order: number
}

export interface Table {
  id: number
  restaurant_id: number
  table_number: string
  display_name: string
  capacity: number
  is_active: number
}

export interface Order {
  id: number
  restaurant_id: number
  table_id: number
  order_number: string
  subtotal: number
  tax: number
  service_charge: number
  total: number
  payment_method: string
  payment_status: string
  order_status: string
  special_notes: string
  created_at: string
  updated_at: string
  items?: OrderItem[]
}

export interface OrderItem {
  id: number
  order_id: number
  item_name: string
  quantity: number
  unit_price: number
  total_price: number
  customizations: string
  add_ons: string
  special_instructions: string
}

export interface CartItem {
  item: MenuItem
  quantity: number
  customizations: Record<string, number>
  addOns: number[]
  specialInstructions: string
}

export interface User {
  id: number
  email: string
  full_name: string
  role: string
  restaurant_id: number
}

export interface OrderProgress {
  order: {
    id: number
    order_number: string
    restaurant_id: number
    table_id: number
    total: number
    payment_status: string
    order_status: string
    created_at: string
    updated_at: string
    items: OrderItem[]
  }
  progress: number
  status: string
}