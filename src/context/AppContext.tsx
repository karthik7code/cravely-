import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  UserRole,
  UserProfile,
  Product,
  Recipe,
  CartItem,
  Order,
  OrderStatus,
  DarkStore,
  Rider,
  Address,
  NotificationItem,
  Coupon,
  RecipeIngredient,
} from '../types';
import {
  DEMO_PRODUCTS,
  DEMO_RECIPES,
  DEMO_STORES,
  DEMO_RIDERS,
  DEMO_USERS,
  DEMO_ADDRESSES,
  DEMO_COUPONS,
} from '../data/mockData';
import { calculateDistanceKm, calculateDeliveryETA } from '../services/mapsService';

export interface ScaledIngredientResult {
  ingredient: RecipeIngredient;
  scaledQuantity: number;
  unit: string;
  matchedProduct?: Product;
  packsNeeded: number;
  isAvailable: boolean;
  substituteProduct?: Product;
  priceEstimate: number;
}

export interface ToastMessage {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
}

interface AppContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  currentUser: UserProfile;
  setCurrentUser: (user: UserProfile) => void;
  
  stores: DarkStore[];
  selectedStore: DarkStore;
  setSelectedStoreId: (storeId: string) => void;

  products: Product[];
  recipes: Recipe[];
  
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number, recipeSource?: { recipeId: string; recipeTitle: string; servingsScaled: number }) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  cartTotal: number;
  cartItemCount: number;

  // Recipe to Cart Engine
  scaleRecipeIngredients: (recipe: Recipe, requestedServings: number) => ScaledIngredientResult[];
  addRecipeIngredientsToCart: (
    recipe: Recipe,
    requestedServings: number,
    selectedItems: { productId: string; quantity: number }[]
  ) => void;

  // Orders
  orders: Order[];
  activeOrder: Order | null;
  setActiveOrder: (order: Order | null) => void;
  placeOrder: (options: {
    paymentMethod: 'UPI' | 'Card' | 'Cash on Delivery';
    couponCode?: string;
    deliveryNotes?: string;
  }) => Promise<Order>;
  cancelOrder: (orderId: string) => void;

  // Rider Fleet & Actions
  riders: Rider[];
  currentRider: Rider;
  toggleRiderOnline: (riderId: string) => void;
  riderAcceptOrder: (orderId: string, riderId: string) => boolean;
  riderUpdateOrderStatus: (orderId: string, newStatus: OrderStatus) => void;

  // Addresses
  addresses: Address[];
  selectedAddress: Address;
  setSelectedAddress: (address: Address) => void;
  addAddress: (address: Omit<Address, 'id' | 'userId'>) => void;

  // Admin Mutations
  updateProductStock: (productId: string, newStock: number) => void;
  updateProductPrice: (productId: string, newPrice: number) => void;
  toggleProductAvailability: (productId: string) => void;
  addNewProduct: (product: Omit<Product, 'id'>) => void;

  // Notifications & Toasts
  notifications: NotificationItem[];
  markNotificationAsRead: (id: string) => void;
  clearNotifications: () => void;
  toasts: ToastMessage[];
  addToast: (title: string, message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
  removeToast: (id: string) => void;

  // Coupons
  coupons: Coupon[];
  appliedCoupon: Coupon | null;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;

  // Quick Demo Simulator
  simulateOrderProgression: (orderId: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY_PRODUCTS = 'cravely_products_v5';
const STORAGE_KEY_ORDERS = 'cravely_orders_v4';
const STORAGE_KEY_CART = 'cravely_cart_v4';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRoleState] = useState<UserRole>('customer');
  const [currentUser, setCurrentUser] = useState<UserProfile>(DEMO_USERS.customer);

  const [stores] = useState<DarkStore[]>(DEMO_STORES);
  const [selectedStoreId, setSelectedStoreId] = useState<string>(DEMO_STORES[0].id);

  // Products with local storage persistence and authentic photo synchronization
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PRODUCTS);
      if (saved) {
        const parsed: Product[] = JSON.parse(saved);
        // Synchronize all demo product images with the verified local asset paths
        const demoImgMap = new Map(DEMO_PRODUCTS.map((dp) => [dp.id, dp.image]));
        const cleaned = parsed.map((p) => {
          const verifiedImg = demoImgMap.get(p.id);
          return verifiedImg ? { ...p, image: verifiedImg } : p;
        });
        return cleaned;
      }
      return DEMO_PRODUCTS;
    } catch {
      return DEMO_PRODUCTS;
    }
  });

  const [recipes] = useState<Recipe[]>(DEMO_RECIPES);
  
  // Cart
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CART);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Orders
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ORDERS);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    // Seed initial completed demo order for realism
    const initialOrder: Order = {
      id: 'ord-101',
      orderNumber: 'CRV-89421',
      customerId: DEMO_USERS.customer.id,
      customerName: DEMO_USERS.customer.name,
      customerPhone: DEMO_USERS.customer.phone,
      deliveryAddress: DEMO_ADDRESSES[0],
      storeId: DEMO_STORES[0].id,
      storeName: DEMO_STORES[0].name,
      items: [
        {
          productId: 'prod-paneer-malai',
          productName: 'Fresh Malai Paneer Block',
          unit: '200 g pack',
          price: 88,
          quantity: 2,
          image: DEMO_PRODUCTS[9].image,
          recipeSourceTitle: 'Restaurant Style Paneer Butter Masala',
        },
        {
          productId: 'prod-tomato-hybrid',
          productName: 'Fresh Hybrid Tomatoes',
          unit: '500 g',
          price: 24,
          quantity: 1,
          image: DEMO_PRODUCTS[0].image,
          recipeSourceTitle: 'Restaurant Style Paneer Butter Masala',
        },
      ],
      subtotal: 200,
      deliveryFee: 0,
      platformFee: 5,
      taxes: 10,
      discount: 50,
      couponCode: 'FIRST50',
      total: 165,
      status: 'delivered',
      paymentMethod: 'UPI',
      paymentStatus: 'paid',
      assignedRiderId: 'rider-01',
      assignedRider: DEMO_RIDERS[0],
      estimatedDeliveryMinutes: 0,
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      statusTimestamps: {
        placed: new Date(Date.now() - 3600000 * 2).toISOString(),
        confirmed: new Date(Date.now() - 3600000 * 1.9).toISOString(),
        preparing: new Date(Date.now() - 3600000 * 1.8).toISOString(),
        ready_for_pickup: new Date(Date.now() - 3600000 * 1.6).toISOString(),
        out_for_delivery: new Date(Date.now() - 3600000 * 1.5).toISOString(),
        delivered: new Date(Date.now() - 3600000 * 1.3).toISOString(),
      },
    };
    return [initialOrder];
  });

  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);

  // Riders
  const [riders, setRiders] = useState<Rider[]>(DEMO_RIDERS);

  // Addresses
  const [addresses, setAddresses] = useState<Address[]>(DEMO_ADDRESSES);
  const [selectedAddress, setSelectedAddress] = useState<Address>(DEMO_ADDRESSES[0]);

  // Notifications
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'notif-1',
      targetRole: 'all',
      title: 'Welcome to Cravely!',
      message: 'Watch recipe reels and get fresh ingredients delivered to your doorstep in 10 minutes.',
      timestamp: new Date().toISOString(),
      type: 'system',
      isRead: false,
    },
  ]);

  // Coupons
  const [coupons] = useState<Coupon[]>(DEMO_COUPONS);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Sync products to local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(products));
    } catch {
      // storage error
    }
  }, [products]);

  // Sync cart to local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_CART, JSON.stringify(cart));
    } catch {
      // storage error
    }
  }, [cart]);

  // Sync orders to local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify(orders));
    } catch {
      // storage error
    }
  }, [orders]);

  const addToast = useCallback((title: string, message: string, type: ToastMessage['type'] = 'info') => {
    const id = 'toast-' + Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const setRole = useCallback((newRole: UserRole) => {
    setRoleState(newRole);
    setCurrentUser(DEMO_USERS[newRole]);
    addToast('Role Switched', `Now viewing as ${newRole.toUpperCase()}`, 'info');
  }, [addToast]);

  const selectedStore = useMemo(() => {
    return stores.find((s) => s.id === selectedStoreId) || stores[0];
  }, [stores, selectedStoreId]);

  // Current Rider for Rider role view
  const currentRider = useMemo(() => {
    return riders.find((r) => r.id === 'rider-01') || riders[0];
  }, [riders]);

  // Cart helper functions
  const addToCart = useCallback(
    (product: Product, quantity = 1, recipeSource?: { recipeId: string; recipeTitle: string; servingsScaled: number }) => {
      setCart((prev) => {
        const existingIdx = prev.findIndex((item) => item.product.id === product.id);
        if (existingIdx > -1) {
          const updated = [...prev];
          const newQty = updated[existingIdx].quantity + quantity;
          if (newQty > product.stock) {
            addToast('Stock Limit Reached', `Only ${product.stock} units available in dark store`, 'warning');
            return prev;
          }
          updated[existingIdx] = {
            ...updated[existingIdx],
            quantity: newQty,
            recipeSource: recipeSource || updated[existingIdx].recipeSource,
          };
          addToast('Cart Updated', `Increased quantity of ${product.name}`, 'success');
          return updated;
        } else {
          if (quantity > product.stock) {
            addToast('Insufficient Stock', `Only ${product.stock} units available`, 'error');
            return prev;
          }
          addToast('Added to Cart', `${product.name} added to your basket`, 'success');
          return [...prev, { product, quantity, recipeSource }];
        }
      });
    },
    [addToast]
  );

  const updateCartQuantity = useCallback((productId: string, quantity: number) => {
    setCart((prev) => {
      if (quantity <= 0) {
        return prev.filter((item) => item.product.id !== productId);
      }
      return prev.map((item) => {
        if (item.product.id === productId) {
          if (quantity > item.product.stock) {
            return { ...item, quantity: item.product.stock };
          }
          return { ...item, quantity };
        }
        return item;
      });
    });
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
    addToast('Item Removed', 'Product removed from cart', 'info');
  }, [addToast]);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const cartTotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  }, [cart]);

  const cartItemCount = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart]);

  // Signature Recipe-to-Cart Engine
  // scaled quantity = original quantity * requested servings / original servings
  const scaleRecipeIngredients = useCallback(
    (recipe: Recipe, requestedServings: number): ScaledIngredientResult[] => {
      const scaleMultiplier = requestedServings / recipe.originalServings;

      return recipe.ingredients.map((ing) => {
        const scaledQty = Math.round(ing.originalQuantity * scaleMultiplier * 10) / 10;
        const matched = products.find((p) => p.id === ing.matchedProductId);
        
        let substitute: Product | undefined;
        if (matched?.substitutes && matched.substitutes.length > 0) {
          substitute = products.find((p) => p.id === matched.substitutes![0]);
        }

        const isAvailable = !!matched && matched.isAvailable && matched.stock > 0;
        
        // Approximate how many pack units are needed based on weight/pack
        // For instance, if unit is 200g pack and scaledQty is 350g, needs 2 packs
        let packsNeeded = 1;
        if (matched) {
          const matchUnitNumbers = matched.unit.match(/\d+/);
          const packSize = matchUnitNumbers ? parseInt(matchUnitNumbers[0], 10) : 100;
          if (ing.unit === 'g' || ing.unit === 'ml') {
            packsNeeded = Math.max(1, Math.ceil(scaledQty / packSize));
          }
        }

        const priceEst = matched ? matched.price * packsNeeded : 0;

        return {
          ingredient: ing,
          scaledQuantity: scaledQty,
          unit: ing.unit,
          matchedProduct: matched,
          packsNeeded,
          isAvailable,
          substituteProduct: substitute,
          priceEstimate: priceEst,
        };
      });
    },
    [products]
  );

  const addRecipeIngredientsToCart = useCallback(
    (
      recipe: Recipe,
      requestedServings: number,
      selectedItems: { productId: string; quantity: number }[]
    ) => {
      let countAdded = 0;
      selectedItems.forEach(({ productId, quantity }) => {
        const product = products.find((p) => p.id === productId);
        if (product && product.isAvailable && product.stock >= quantity) {
          addToCart(product, quantity, {
            recipeId: recipe.id,
            recipeTitle: recipe.title,
            servingsScaled: requestedServings,
          });
          countAdded++;
        }
      });

      if (countAdded > 0) {
        addToast(
          'Reels to Meals! 🥘',
          `Added ${countAdded} ingredients for ${requestedServings} servings of ${recipe.title}`,
          'success'
        );
      } else {
        addToast('No items selected', 'Please select at least one available ingredient to add', 'warning');
      }
    },
    [products, addToCart, addToast]
  );

  // Coupons
  const applyCoupon = useCallback(
    (code: string): { success: boolean; message: string } => {
      const found = coupons.find((c) => c.code.toUpperCase() === code.trim().toUpperCase());
      if (!found) {
        return { success: false, message: 'Invalid coupon code. Try FIRST50 or CHEF20.' };
      }
      if (cartTotal < found.minOrderValue) {
        return {
          success: false,
          message: `Minimum order value for ${found.code} is ₹${found.minOrderValue}. Add items worth ₹${found.minOrderValue - cartTotal} more.`,
        };
      }
      setAppliedCoupon(found);
      addToast('Coupon Applied! 🎉', `Applied ${found.code} successfully!`, 'success');
      return { success: true, message: 'Coupon applied successfully!' };
    },
    [coupons, cartTotal, addToast]
  );

  const removeCoupon = useCallback(() => {
    setAppliedCoupon(null);
    addToast('Coupon Removed', 'Coupon code has been detached.', 'info');
  }, [addToast]);

  // Order Placement
  const placeOrder = useCallback(
    async (options: {
      paymentMethod: 'UPI' | 'Card' | 'Cash on Delivery';
      couponCode?: string;
      deliveryNotes?: string;
    }): Promise<Order> => {
      if (cart.length === 0) {
        throw new Error('Your cart is empty');
      }

      // Check stock validity
      for (const item of cart) {
        const productInDb = products.find((p) => p.id === item.product.id);
        if (!productInDb || productInDb.stock < item.quantity) {
          throw new Error(`Insufficient stock for ${item.product.name}. Available: ${productInDb?.stock || 0}`);
        }
      }

      // Calculations
      const subtotal = cartTotal;
      let discount = 0;
      if (appliedCoupon) {
        if (appliedCoupon.flatDiscount) {
          discount = appliedCoupon.flatDiscount;
        } else if (appliedCoupon.discountPercent) {
          discount = Math.round((subtotal * appliedCoupon.discountPercent) / 100);
        }
      }

      const deliveryFee = subtotal > 199 ? 0 : 25;
      const platformFee = 5;
      const taxes = Math.round(subtotal * 0.05); // 5% GST
      const total = Math.max(0, subtotal - discount + deliveryFee + platformFee + taxes);

      const orderNumber = 'CRV-' + Math.floor(10000 + Math.random() * 90000);
      const orderId = 'ord-' + Date.now();

      const orderItems = cart.map((item) => ({
        productId: item.product.id,
        productName: item.product.name,
        unit: item.product.unit,
        price: item.product.price,
        quantity: item.quantity,
        image: item.product.image,
        recipeSourceTitle: item.recipeSource?.recipeTitle,
      }));

      // Deduct inventory
      setProducts((prev) =>
        prev.map((prod) => {
          const cartItem = cart.find((ci) => ci.product.id === prod.id);
          if (cartItem) {
            const remaining = Math.max(0, prod.stock - cartItem.quantity);
            return {
              ...prod,
              stock: remaining,
              isAvailable: remaining > 0,
            };
          }
          return prod;
        })
      );

      // Distances & ETA
      const distance = calculateDistanceKm(
        { lat: selectedAddress.lat, lng: selectedAddress.lng },
        { lat: selectedStore.lat, lng: selectedStore.lng }
      );
      const { etaMinutes } = calculateDeliveryETA(distance, 'placed');

      const nowIso = new Date().toISOString();
      const newOrder: Order = {
        id: orderId,
        orderNumber,
        customerId: currentUser.id,
        customerName: currentUser.name,
        customerPhone: currentUser.phone,
        deliveryAddress: selectedAddress,
        storeId: selectedStore.id,
        storeName: selectedStore.name,
        items: orderItems,
        subtotal,
        deliveryFee,
        platformFee,
        taxes,
        discount,
        couponCode: appliedCoupon?.code,
        total,
        status: 'placed',
        paymentMethod: options.paymentMethod,
        paymentStatus: 'paid',
        estimatedDeliveryMinutes: etaMinutes,
        createdAt: nowIso,
        statusTimestamps: {
          placed: nowIso,
        },
        deliveryNotes: options.deliveryNotes,
      };

      setOrders((prev) => [newOrder, ...prev]);
      setActiveOrderId(newOrder.id);
      setCart([]);
      setAppliedCoupon(null);

      // Create notifications for Customer, Rider and Admin
      const notifCustomer: NotificationItem = {
        id: 'notif-cust-' + Date.now(),
        targetRole: 'customer',
        userId: currentUser.id,
        title: 'Order Placed! 🚀',
        message: `Order #${orderNumber} received! Dark store is packing your fresh ingredients.`,
        timestamp: nowIso,
        type: 'order',
        isRead: false,
        relatedOrderId: orderId,
      };

      const notifRider: NotificationItem = {
        id: 'notif-rider-' + Date.now(),
        targetRole: 'rider',
        title: 'New Delivery Request! 🛵',
        message: `Pickup at ${selectedStore.name} — payout ₹45. Order #${orderNumber}.`,
        timestamp: nowIso,
        type: 'rider',
        isRead: false,
        relatedOrderId: orderId,
      };

      const notifAdmin: NotificationItem = {
        id: 'notif-adm-' + Date.now(),
        targetRole: 'admin',
        title: 'New Quick Commerce Order',
        message: `Order #${orderNumber} for ₹${total} placed at ${selectedStore.name}.`,
        timestamp: nowIso,
        type: 'order',
        isRead: false,
        relatedOrderId: orderId,
      };

      setNotifications((prev) => [notifCustomer, notifRider, notifAdmin, ...prev]);
      addToast('Order Placed Successfully! 🎉', `Order #${orderNumber} confirmed. 10-min delivery on track!`, 'success');

      return newOrder;
    },
    [
      cart,
      products,
      cartTotal,
      appliedCoupon,
      selectedAddress,
      selectedStore,
      currentUser,
      addToast,
    ]
  );

  const cancelOrder = useCallback((orderId: string) => {
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          return {
            ...ord,
            status: 'cancelled',
            statusTimestamps: {
              ...ord.statusTimestamps,
              cancelled: new Date().toISOString(),
            },
          };
        }
        return ord;
      })
    );
    addToast('Order Cancelled', 'Your order was cancelled successfully', 'info');
  }, [addToast]);

  // Active Order getter
  const activeOrder = useMemo(() => {
    if (activeOrderId) {
      const found = orders.find((o) => o.id === activeOrderId);
      if (found) return found;
    }
    // Default to the most recent non-delivered/non-cancelled order or the first order
    const inProgress = orders.find((o) => o.status !== 'delivered' && o.status !== 'cancelled');
    return inProgress || orders[0] || null;
  }, [orders, activeOrderId]);

  const setActiveOrder = useCallback((ord: Order | null) => {
    setActiveOrderId(ord ? ord.id : null);
  }, []);

  // Rider Actions
  const toggleRiderOnline = useCallback((riderId: string) => {
    setRiders((prev) =>
      prev.map((r) => {
        if (r.id === riderId) {
          const next = !r.isOnline;
          addToast('Rider Status Changed', `You are now ${next ? 'ONLINE and accepting orders' : 'OFFLINE'}`, 'info');
          return { ...r, isOnline: next };
        }
        return r;
      })
    );
  }, [addToast]);

  const riderAcceptOrder = useCallback(
    (orderId: string, riderId: string): boolean => {
      const order = orders.find((o) => o.id === orderId);
      if (!order) return false;
      if (order.assignedRiderId) {
        addToast('Order Already Assigned', 'Another rider just accepted this order.', 'warning');
        return false;
      }

      const assignedRider = riders.find((r) => r.id === riderId) || DEMO_RIDERS[0];
      const now = new Date().toISOString();

      setOrders((prev) =>
        prev.map((o) => {
          if (o.id === orderId) {
            return {
              ...o,
              assignedRiderId: riderId,
              assignedRider,
              status: 'confirmed',
              statusTimestamps: {
                ...o.statusTimestamps,
                confirmed: now,
              },
            };
          }
          return o;
        })
      );

      setRiders((prev) =>
        prev.map((r) => (r.id === riderId ? { ...r, activeOrderId: orderId } : r))
      );

      addToast('Assignment Confirmed! 🛵', `You accepted Order #${order.orderNumber}. Head to ${order.storeName}`, 'success');
      return true;
    },
    [orders, riders, addToast]
  );

  const riderUpdateOrderStatus = useCallback(
    (orderId: string, newStatus: OrderStatus) => {
      const now = new Date().toISOString();
      setOrders((prev) =>
        prev.map((o) => {
          if (o.id === orderId) {
            const updatedTimestamps = {
              ...o.statusTimestamps,
              [newStatus]: now,
            };
            return {
              ...o,
              status: newStatus,
              statusTimestamps: updatedTimestamps,
            };
          }
          return o;
        })
      );

      // If delivered, update rider earnings & free active order
      if (newStatus === 'delivered') {
        const order = orders.find((o) => o.id === orderId);
        if (order?.assignedRiderId) {
          setRiders((prev) =>
            prev.map((r) => {
              if (r.id === order.assignedRiderId) {
                return {
                  ...r,
                  activeOrderId: undefined,
                  completedDeliveriesToday: r.completedDeliveriesToday + 1,
                  todayEarnings: r.todayEarnings + 45,
                };
              }
              return r;
            })
          );
        }
      }

      const statusLabels: Record<OrderStatus, string> = {
        placed: 'Placed',
        confirmed: 'Order Confirmed',
        preparing: 'Packing at Dark Store',
        ready_for_pickup: 'Ready for Pickup',
        out_for_delivery: 'Out for Delivery 🛵',
        delivered: 'Delivered to Doorstep 🎉',
        cancelled: 'Order Cancelled',
      };

      addToast('Status Updated', `Order transitioned to ${statusLabels[newStatus]}`, 'success');
    },
    [orders, addToast]
  );

  // Address
  const addAddress = useCallback(
    (newAddr: Omit<Address, 'id' | 'userId'>) => {
      const id = 'addr-' + Date.now();
      const created: Address = {
        ...newAddr,
        id,
        userId: currentUser.id,
      };
      setAddresses((prev) => [created, ...prev]);
      setSelectedAddress(created);
      addToast('Address Saved', 'New delivery location added', 'success');
    },
    [currentUser.id, addToast]
  );

  // Admin Mutations
  const updateProductStock = useCallback(
    (productId: string, newStock: number) => {
      setProducts((prev) =>
        prev.map((p) => {
          if (p.id === productId) {
            return {
              ...p,
              stock: Math.max(0, newStock),
              isAvailable: newStock > 0,
            };
          }
          return p;
        })
      );
      addToast('Inventory Updated', `Stock updated to ${newStock} units`, 'info');
    },
    [addToast]
  );

  const updateProductPrice = useCallback(
    (productId: string, newPrice: number) => {
      setProducts((prev) =>
        prev.map((p) => {
          if (p.id === productId) {
            return {
              ...p,
              price: Math.max(1, newPrice),
            };
          }
          return p;
        })
      );
      addToast('Price Updated', `Price updated to ₹${newPrice}`, 'info');
    },
    [addToast]
  );

  const toggleProductAvailability = useCallback(
    (productId: string) => {
      setProducts((prev) =>
        prev.map((p) => {
          if (p.id === productId) {
            const next = !p.isAvailable;
            return {
              ...p,
              isAvailable: next,
            };
          }
          return p;
        })
      );
      addToast('Product Status Changed', 'Product availability toggled', 'info');
    },
    [addToast]
  );

  const addNewProduct = useCallback(
    (newProd: Omit<Product, 'id'>) => {
      const id = 'prod-custom-' + Date.now();
      const product: Product = {
        ...newProd,
        id,
      };
      setProducts((prev) => [product, ...prev]);
      addToast('Product Created', `${product.name} added to catalog`, 'success');
    },
    [addToast]
  );

  // Notifications
  const markNotificationAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Demo Order Simulator
  const simulateOrderProgression = useCallback(
    (orderId: string) => {
      const statuses: OrderStatus[] = [
        'confirmed',
        'preparing',
        'ready_for_pickup',
        'out_for_delivery',
        'delivered',
      ];
      
      const order = orders.find((o) => o.id === orderId);
      if (!order) return;
      
      const currentIdx = statuses.indexOf(order.status as OrderStatus);
      const nextStatus = currentIdx === -1 ? 'confirmed' : statuses[Math.min(statuses.length - 1, currentIdx + 1)];
      
      if (!order.assignedRiderId && nextStatus !== 'placed') {
        riderAcceptOrder(orderId, 'rider-01');
      }
      
      riderUpdateOrderStatus(orderId, nextStatus);
    },
    [orders, riderAcceptOrder, riderUpdateOrderStatus]
  );

  return (
    <AppContext.Provider
      value={{
        role,
        setRole,
        currentUser,
        setCurrentUser,
        stores,
        selectedStore,
        setSelectedStoreId,
        products,
        recipes,
        cart,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        cartTotal,
        cartItemCount,
        scaleRecipeIngredients,
        addRecipeIngredientsToCart,
        orders,
        activeOrder,
        setActiveOrder,
        placeOrder,
        cancelOrder,
        riders,
        currentRider,
        toggleRiderOnline,
        riderAcceptOrder,
        riderUpdateOrderStatus,
        addresses,
        selectedAddress,
        setSelectedAddress,
        addAddress,
        updateProductStock,
        updateProductPrice,
        toggleProductAvailability,
        addNewProduct,
        notifications,
        markNotificationAsRead,
        clearNotifications,
        toasts,
        addToast,
        removeToast,
        coupons,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
        simulateOrderProgression,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
