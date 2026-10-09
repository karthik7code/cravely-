export type UserRole = 'customer' | 'rider' | 'admin';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatar: string;
  defaultAddressId?: string;
}

export interface Address {
  id: string;
  userId: string;
  label: 'Home' | 'Work' | 'Other';
  street: string;
  apartment?: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  lat: number;
  lng: number;
  isDefault?: boolean;
}

export type ProductCategory = 
  | 'Vegetables & Fruits'
  | 'Dairy & Bread'
  | 'Atta, Rice & Dals'
  | 'Oils & Ghee'
  | 'Masalas & Spices'
  | 'Snacks & Beverages'
  | 'Meat & Eggs';

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  unit: string; // e.g., '500 g', '1 kg', '200 g pack'
  price: number; // in INR
  originalPrice?: number;
  discountPercent?: number;
  image: string;
  description: string;
  stock: number;
  isAvailable: boolean;
  storeId: string;
  tags?: string[];
  substitutes?: string[]; // array of Product IDs
}

export interface RecipeIngredient {
  id: string;
  name: string;
  originalQuantity: number;
  unit: string; // e.g. 'g', 'kg', 'ml', 'tbsp', 'tsp', 'pieces'
  matchedProductId?: string; // Links directly to inventory Product
  notes?: string;
  isOptional?: boolean;
  substituteSuggestion?: string;
}

export interface RecipeStep {
  stepNumber: number;
  instruction: string;
  durationMinutes?: number;
  tip?: string;
}

export interface Recipe {
  id: string;
  title: string;
  tagline: string;
  description: string;
  thumbnail: string;
  youtubeId: string;
  youtubeUrl: string;
  cuisine: string;
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  originalServings: number;
  difficulty: 'Easy' | 'Medium' | 'Chef Special';
  caloriesPerServing: number;
  dietaryTags: ('Vegetarian' | 'Vegan' | 'Gluten-Free' | 'High-Protein' | 'Non-Vegetarian')[];
  ingredients: RecipeIngredient[];
  instructions: RecipeStep[];
  viewsCount: number;
  likesCount: number;
  chefName: string;
  chefAvatar: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  recipeSource?: {
    recipeId: string;
    recipeTitle: string;
    servingsScaled: number;
  };
}

export type OrderStatus = 
  | 'placed'
  | 'confirmed'
  | 'preparing'
  | 'ready_for_pickup'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled';

export interface OrderItem {
  productId: string;
  productName: string;
  unit: string;
  price: number;
  quantity: number;
  image: string;
  recipeSourceTitle?: string;
}

export interface DarkStore {
  id: string;
  name: string;
  code: string;
  address: string;
  lat: number;
  lng: number;
  phone: string;
  operatingRadiusKm: number;
  isOpen: boolean;
  activeOrdersCount: number;
}

export interface Rider {
  id: string;
  name: string;
  phone: string;
  avatar: string;
  vehicleType: 'EV Scooter' | 'Bike' | 'E-Cycle';
  vehiclePlate: string;
  isOnline: boolean;
  rating: number;
  currentLat: number;
  currentLng: number;
  activeOrderId?: string;
  completedDeliveriesToday: number;
  todayEarnings: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: Address;
  storeId: string;
  storeName: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  platformFee: number;
  taxes: number;
  discount: number;
  couponCode?: string;
  total: number;
  status: OrderStatus;
  paymentMethod: 'UPI' | 'Card' | 'Cash on Delivery';
  paymentStatus: 'paid' | 'pending' | 'failed';
  assignedRiderId?: string;
  assignedRider?: Rider;
  estimatedDeliveryMinutes: number;
  createdAt: string;
  statusTimestamps: {
    placed: string;
    confirmed?: string;
    preparing?: string;
    ready_for_pickup?: string;
    out_for_delivery?: string;
    delivered?: string;
    cancelled?: string;
  };
  deliveryNotes?: string;
}

export interface NotificationItem {
  id: string;
  targetRole: UserRole | 'all';
  userId?: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'order' | 'inventory' | 'rider' | 'system';
  isRead: boolean;
  relatedOrderId?: string;
}

export interface Coupon {
  code: string;
  discountPercent?: number;
  flatDiscount?: number;
  minOrderValue: number;
  description: string;
}
