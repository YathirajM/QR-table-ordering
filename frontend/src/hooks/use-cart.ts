export interface CartItem {
  item: {
    id: number
    name: string
    price: number
    image_url: string
    is_vegetarian: number
  }
  quantity: number
  customizations?: Record<string, number>
  add_ons?: number[]
  special_instructions: string
}

export interface CartState {
  items: CartItem[]
  total: number
  itemCount: number
  addItem: (item: MenuItem, quantity?: number, customizations?: Record<string, number>, add_ons?: number[], special_instructions?: string) => void
  removeItem: (itemId: number) => void
  increaseQuantity: (itemId: number) => void
  decreaseQuantity: (itemId: number) => void
  clearCart: () => void
}

const CART_KEY = 'restaurant_cart'

export function useCart(initialItems: CartItem[] = []) {
  // Get stored cart from localStorage
  const getStoredCart = (): CartItem[] => {
    try {
      const stored = localStorage.getItem(CART_KEY)
      return stored ? JSON.parse(stored) : initialItems
    } catch {
      return initialItems
    }
  }

  // Initialize cart state
  const [cartItems, setCartItems] = (window as any).React ? (
    (window as any).React.useState(getStoredCart())
  )[0] : getStoredCart()

  const setStoredCart = (items: CartItem[]) => {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(items))
    } catch {
      // Ignore localStorage errors
    }
  }

  // Calculate cart total
  const cartTotal = cartItems.reduce((sum, item) => {
    const price = item.item.price * item.quantity
    const customizationCost = Object.values(item.customizations || {}).reduce((acc, modifier) => acc + (modifier || 0), 0)
    return sum + price + customizationCost
  }, 0)

  const cartItemCount = cartItems.reduce((count, item) => count + item.quantity, 0)

  // Add item to cart
  const addItem = (item: MenuItem, quantity = 1, customizations: Record<string, number> = {}, add_ons: number[] = [], special_instructions = '') => {
    const existingIndex = cartItems.findIndex(
      (citem) => citem.item.id === item.id && JSON.stringify(citem.customizations) === JSON.stringify(customizations)
    )

    if (existingIndex >= 0) {
      const newQuantity = cartItems[existingIndex].quantity + quantity
      const newItems = [...cartItems]
      newItems[existingIndex].quantity = Math.max(newQuantity, 1)
      setCartItems(newItems)
      setStoredCart(newItems)
    } else {
      const newItem: CartItem = {
        item: {
          id: item.id,
          name: item.name,
          price: item.price,
          image_url: item.image_url,
          is_vegetarian: item.is_vegetarian
        },
        quantity,
        customizations,
        add_ons,
        special_instructions
      }
      setCartItems([...cartItems, newItem])
      setStoredCart([...cartItems, newItem])
    }
  }

  // Remove item from cart
  const removeItem = (itemId: number) => {
    const newItems = cartItems.filter(item => item.item.id !== itemId)
    setCartItems(newItems)
    setStoredCart(newItems)
  }

  // Increase quantity
  const increaseQuantity = (itemId: number) => {
    const index = cartItems.findIndex(item => item.item.id === itemId)
    if (index >= 0) {
      const newItems = [...cartItems]
      newItems[index].quantity += 1
      setCartItems(newItems)
      setStoredCart(newItems)
    }
  }

  // Decrease quantity
  const decreaseQuantity = (itemId: number) => {
    const newItems = cartItems.map(item =>
      item.item.id === itemId && item.quantity > 1
        ? { ...item, quantity: item.quantity - 1 }
        : item
    )
    setCartItems(newItems)
    setStoredCart(newItems)
  }

  // Clear cart
  const clearCart = () => {
    setCartItems([])
    setStoredCart([])
  }

  return {
    cartItems,
    cartTotal,
    cartItemCount,
    addItem,
    removeItem,
    increaseQuantity,
    decreaseQuantity,
    clearCart
  }
}