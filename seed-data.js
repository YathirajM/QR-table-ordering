// Seed data for restaurant QR ordering platform
// Run with: node seed-data.js

const restaurants = [
  {
    name: 'Spice Route',
    slug: 'spice-route',
    description: 'Authentic Indian cuisine with a modern twist',
    logo_url: '/images/spice-route-logo.png',
    cover_image_url: '/images/spice-route-cover.jpg',
    address: '123 Food Street, Mumbai',
    phone: '+91 98765 43210',
    email: 'contact@spiceroute.com',
    currency: 'INR',
    tax_rate: 5,
    service_charge_rate: 10,
  },
  {
    name: 'Pizza & Co',
    slug: 'pizza-co',
    description: 'Artisan pizzas and Italian favorites',
    logo_url: '/images/pizza-co-logo.png',
    cover_image_url: '/images/pizza-co-cover.jpg',
    address: '456 Italian Avenue, Delhi',
    phone: '+91 98765 12345',
    email: 'hello@pizza.co',
    currency: 'INR',
    tax_rate: 5,
    service_charge_rate: 10,
  },
  {
    name: 'Burger House',
    slug: 'burger-house',
    description: 'Juicy burgers and American classics',
    logo_url: '/images/burger-house-logo.png',
    cover_image_url: '/images/burger-house-cover.jpg',
    address: '789 Burger Boulevard, Bangalore',
    phone: '+91 98765 67890',
    email: 'info@burgerhouse.com',
    currency: 'INR',
    tax_rate: 5,
    service_charge_rate: 10,
  }
];

const categories = [
  // Spice Route categories
  { restaurant_id: 1, name: 'Starters', slug: 'starters', display_order: 1 },
  { restaurant_id: 1, name: 'Burgers', slug: 'burgers', display_order: 2 },
  { restaurant_id: 1, name: 'Pizza', slug: 'pizza', display_order: 3 },
  { restaurant_id: 1, name: 'Main Course', slug: 'main-course', display_order: 4 },
  { restaurant_id: 1, name: 'Indian Dishes', slug: 'indian-dishes', display_order: 5 },
  { restaurant_id: 1, name: 'Snacks', slug: 'snacks', display_order: 6 },
  { restaurant_id: 1, name: 'Desserts', slug: 'desserts', display_order: 7 },
  { restaurant_id: 1, name: 'Drinks', slug: 'drinks', display_order: 8 },

  // Pizza & Co categories
  { restaurant_id: 2, name: 'Pizza', slug: 'pizza', display_order: 1 },
  { restaurant_id: 2, name: 'Pasta', slug: 'pasta', display_order: 2 },
  { restaurant_id: 2, name: 'Sides', slug: 'sides', display_order: 3 },
  { restaurant_id: 2, name: 'Desserts', slug: 'desserts', display_order: 4 },
  { restaurant_id: 2, name: 'Drinks', slug: 'drinks', display_order: 5 },

  // Burger House categories
  { restaurant_id: 3, name: 'Burgers', slug: 'burgers', display_order: 1 },
  { restaurant_id: 3, name: 'Sides', slug: 'sides', display_order: 2 },
  { restaurant_id: 3, name: 'Shakes', slug: 'shakes', display_order: 3 },
  { restaurant_id: 3, name: 'Drinks', slug: 'drinks', display_order: 4 },
];

// 20+ food items with images (using placeholder URLs that will be replaced with actual photos)
const menuItems = [
  // Spice Route - Starters
  { restaurant_id: 1, category_id: 1, name: 'Spring Rolls', slug: 'spring-rolls', description: 'Crispy vegetable spring rolls with sweet chili sauce', price: 180, image_url: '/images/spring-rolls.jpg', is_vegetarian: true, is_available: true, display_order: 1, is_bestseller: true, is_popular: true },
  { restaurant_id: 1, category_id: 1, name: 'Grilled Paneer Tikka', slug: 'grilled-paneer-tikka', description: 'Cottage cheese marinated in spices and grilled to perfection', price: 220, image_url: '/images/grilled-paneer-tikka.jpg', is_vegetarian: true, is_available: true, display_order: 2, is_bestseller: true },
  { restaurant_id: 1, category_id: 1, name: 'Chicken Seekh Kabab', slug: 'chicken-seekh-kabab', description: 'Minced chicken skewers with herbs and spices', price: 250, image_url: '/images/chicken-seekh-kabab.jpg', is_vegetarian: false, is_available: true, display_order: 3 },

  // Spice Route - Burgers
  { restaurant_id: 1, category_id: 2, name: 'Classic Cheeseburger', slug: 'classic-cheeseburger', description: '100% beef patty with cheese, lettuce, tomato and special sauce', price: 320, image_url: '/images/classic-cheeseburger.jpg', is_vegetarian: false, is_available: true, display_order: 1, is_bestseller: true },
  { restaurant_id: 1, category_id: 2, name: 'Veggie Delight Burger', slug: 'veggie-delight-burger', description: 'Plant-based patty with fresh vegetables and special sauce', price: 280, image_url: '/images/veggie-delight-burger.jpg', is_vegetarian: true, is_available: true, display_order: 2 },

  // Spice Route - Pizza
  { restaurant_id: 1, category_id: 3, name: 'Margherita Pizza', slug: 'margherita-pizza', description: 'Fresh tomato sauce, mozzarella cheese and basil on crispy crust', price: 350, image_url: '/images/margherita-pizza.jpg', is_vegetarian: true, is_available: true, display_order: 1, is_bestseller: true },
  { restaurant_id: 1, category_id: 3, name: 'Spicy Chicken Pizza', slug: 'spicy-chicken-pizza', description: 'Grilled chicken with spicy sauce and vegetables', price: 420, image_url: '/images/spicy-chicken-pizza.jpg', is_vegetarian: false, is_available: true, display_order: 2 },

  // Spice Route - Main Course
  { restaurant_id: 1, category_id: 4, name: 'Butter Chicken', slug: 'butter-chicken', description: 'Tender chicken in creamy butter tomato sauce', price: 450, image_url: '/images/butter-chicken.jpg', is_vegetarian: false, is_available: true, display_order: 1, is_bestseller: true },
  { restaurant_id: 1, category_id: 4, name: 'Dal Makhani', slug: 'dal-makhani', description: 'Black lentils slow-cooked with cream and butter', price: 320, image_url: '/images/dal-makhani.jpg', is_vegetarian: true, is_available: true, display_order: 2 },
  { restaurant_id: 1, category_id: 4, name: 'Garlic Naan', slug: 'garlic-naan', description: 'Fresh baked bread with garlic and butter', price: 80, image_url: '/images/garlic-naan.jpg', is_vegetarian: true, is_available: true, display_order: 3 },

  // Spice Route - Indian Dishes
  { restaurant_id: 1, category_id: 5, name: 'Chicken Curry', slug: 'chicken-curry', description: 'Traditional chicken curry with aromatic spices', price: 400, image_url: '/images/chicken-curry.jpg', is_vegetarian: false, is_available: true, display_order: 1 },
  { restaurant_id: 1, category_id: 5, name: 'Palak Paneer', slug: 'palak-paneer', description: 'Fresh spinach with cottage cheese in creamy gravy', price: 350, image_url: '/images/palak-paneer.jpg', is_vegetarian: true, is_available: true, display_order: 2 },
  { restaurant_id: 1, category_id: 5, name: 'Biryani', slug: 'biryani', description: 'Fragrant basmati rice with meat and spices', price: 450, image_url: '/images/biryani.jpg', is_vegetarian: false, is_available: true, display_order: 3 },

  // Spice Route - Snacks
  { restaurant_id: 1, category_id: 6, name: 'Samosa', slug: 'samosa', description: 'Spiced potato filling in crispy pastry', price: 60, image_url: '/images/samosa.jpg', is_vegetarian: true, is_available: true, display_order: 1 },
  { restaurant_id: 1, category_id: 6, name: 'Onion Bhaji', slug: 'onion-bhaji', description: 'Spiced onion fritters', price: 70, image_url: '/images/onion-bhaji.jpg', is_vegetarian: true, is_available: true, display_order: 2 },

  // Spice Route - Desserts
  { restaurant_id: 1, category_id: 7, name: 'Gulab Jamun', slug: 'gulab-jamun', description: 'Sweet dumplings in sugar syrup', price: 100, image_url: '/images/gulab-jamun.jpg', is_vegetarian: true, is_available: true, display_order: 1 },
  { restaurant_id: 1, category_id: 7, name: 'Ice Cream', slug: 'ice-cream', description: 'Assorted ice cream flavors', price: 120, image_url: '/images/ice-cream.jpg', is_vegetarian: true, is_available: true, display_order: 2 },

  // Spice Route - Drinks
  { restaurant_id: 1, category_id: 8, name: 'Mango Lassi', slug: 'mango-lassi', description: 'Yogurt-based mango smoothie', price: 100, image_url: '/images/mango-lassi.jpg', is_vegetarian: true, is_available: true, display_order: 1 },
  { restaurant_id: 1, category_id: 8, name: 'Masala Chai', slug: 'masala-chai', description: 'Spiced tea with milk', price: 40, image_url: '/images/masala-chai.jpg', is_vegetarian: true, is_available: true, display_order: 2 },

  // Pizza & Co items
  { restaurant_id: 2, category_id: 1, name: 'Margherita Pizza', slug: 'margherita-pizza-2', description: 'Fresh tomato sauce, mozzarella cheese and basil', price: 380, image_url: '/images/margherita-pizza-2.jpg', is_vegetarian: true, is_available: true, display_order: 1, is_bestseller: true },
  { restaurant_id: 2, category_id: 1, name: 'Pepperoni Pizza', slug: 'pepperoni-pizza', description: 'Pepperoni slices with mozzarella cheese', price: 450, image_url: '/images/pepperoni-pizza.jpg', is_vegetarian: false, is_available: true, display_order: 2 },
  { restaurant_id: 2, category_id: 2, name: 'Spaghetti Carbonara', slug: 'spaghetti-carbonara', description: 'Pasta with egg, cheese, and bacon', price: 350, image_url: '/images/spaghetti-carbonara.jpg', is_vegetarian: false, is_available: true, display_order: 1 },
  { restaurant_id: 2, category_id: 3, name: 'Garlic Bread', slug: 'garlic-bread', description: 'Bread with garlic butter and herbs', price: 150, image_url: '/images/garlic-bread.jpg', is_vegetarian: true, is_available: true, display_order: 1 },
  { restaurant_id: 2, category_id: 4, name: 'Tiramisu', slug: 'tiramisu', description: 'Italian coffee-flavored dessert', price: 180, image_url: '/images/tiramisu.jpg', is_vegetarian: true, is_available: true, display_order: 1, is_bestseller: true },
  { restaurant_id: 2, category_id: 5, name: 'Fresh lime soda', slug: 'fresh-lime-soda', description: 'Refreshing lime soda with salt', price: 60, image_url: '/images/fresh-lime-soda.jpg', is_vegetarian: true, is_available: true, display_order: 1 },

  // Burger House items
  { restaurant_id: 3, category_id: 1, name: 'Classic Cheeseburger', slug: 'classic-cheeseburger-2', description: '100% beef patty with cheese, lettuce, tomato and special sauce', price: 300, image_url: '/images/classic-cheeseburger-2.jpg', is_vegetarian: false, is_available: true, display_order: 1, is_bestseller: true },
  { restaurant_id: 3, category_id: 1, name: 'Chicken Burger', slug: 'chicken-burger', description: 'Grilled chicken patty with lettuce and mayo', price: 280, image_url: '/images/chicken-burger.jpg', is_vegetarian: false, is_available: true, display_order: 2 },
  { restaurant_id: 3, category_id: 2, name: 'French Fries', slug: 'french-fries', description: 'Crispy golden french fries', price: 120, image_url: '/images/french-fries.jpg', is_vegetarian: true, is_available: true, display_order: 1 },
  { restaurant_id: 3, category_id: 3, name: 'Chocolate Shake', slug: 'chocolate-shake', description: 'Rich chocolate milkshake', price: 150, image_url: '/images/chocolate-shake.jpg', is_vegetarian: true, is_available: true, display_order: 1, is_bestseller: true },
  { restaurant_id: 3, category_id: 4, name: 'Soft Drink', slug: 'soft-drink', description: 'Assorted soft drinks', price: 80, image_url: '/images/soft-drink.jpg', is_vegetarian: true, is_available: true, display_order: 2 },
];

console.log('Seed data prepared successfully!');
console.log(`Restaurants: ${restaurants.length}`);
console.log(`Categories: ${categories.length}`);
console.log(`Menu Items: ${menuItems.length}`);