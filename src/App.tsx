import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { RoleSwitcher } from './components/common/RoleSwitcher';
import { Header } from './components/common/Header';
import { ToastContainer } from './components/common/ToastContainer';
import { NotificationDrawer } from './components/common/NotificationDrawer';
import { CustomerHome } from './components/customer/CustomerHome';
import { RecipeList } from './components/customer/RecipeList';
import { RecipeDetail } from './components/customer/RecipeDetail';
import { ProductCatalogue } from './components/customer/ProductCatalogue';
import { ProductDetailModal } from './components/customer/ProductDetailModal';
import { CartDrawer } from './components/customer/CartDrawer';
import { CheckoutModal } from './components/customer/CheckoutModal';
import { OrderTracking } from './components/customer/OrderTracking';
import { CustomerOrders } from './components/customer/CustomerOrders';
import { CustomerProfile } from './components/customer/CustomerProfile';
import { ChefAIAssistant } from './components/customer/ChefAIAssistant';
import { RiderApp } from './components/rider/RiderApp';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { Recipe, Product, Order } from './types';

const MainApp: React.FC = () => {
  const { role, activeOrder, setActiveOrder, orders } = useApp();

  // Navigation tabs for Customer app
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [trackedOrder, setTrackedOrder] = useState<Order | null>(null);

  // Search query
  const [searchQuery, setSearchQuery] = useState('');

  // Modals & Drawers
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  const handleSelectRecipe = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setCurrentTab('recipe-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectOrder = (order: Order) => {
    setTrackedOrder(order);
    setActiveOrder(order);
    setCurrentTab('order-track');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOrderSuccess = (orderId: string) => {
    const newlyPlaced = orders.find((o) => o.id === orderId);
    if (newlyPlaced) {
      setTrackedOrder(newlyPlaced);
      setActiveOrder(newlyPlaced);
    }
    setCurrentTab('order-track');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F0FFF6]/30 text-[#172033]">
      {/* Universal CYPHER 4.0 Demo Role Switcher Bar */}
      <RoleSwitcher />

      {/* RIDER APPLICATION ROLE */}
      {role === 'rider' && (
        <main className="flex-1">
          <RiderApp />
        </main>
      )}

      {/* ADMIN OPERATIONS HUB ROLE */}
      {role === 'admin' && (
        <main className="flex-1 bg-slate-50">
          <AdminDashboard />
        </main>
      )}

      {/* CUSTOMER APPLICATION ROLE ("Reels to Meals") */}
      {role === 'customer' && (
        <>
          <Header
            onOpenCart={() => setIsCartOpen(true)}
            onOpenNotifications={() => setIsNotificationOpen(true)}
            onNavigateTab={(tab) => {
              setCurrentTab(tab);
              setSelectedRecipe(null);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            currentTab={currentTab}
            searchQuery={searchQuery}
            setSearchQuery={(q) => {
              setSearchQuery(q);
              if (q.trim() && currentTab !== 'products' && currentTab !== 'recipes') {
                setCurrentTab('products');
              }
            }}
          />

          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 pt-6">
            {/* View router */}
            {currentTab === 'home' && (
              <CustomerHome
                onNavigateTab={(tab) => {
                  setCurrentTab(tab);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onSelectRecipe={handleSelectRecipe}
                onSelectProduct={(p) => setSelectedProduct(p)}
              />
            )}

            {currentTab === 'recipes' && (
              <RecipeList
                onSelectRecipe={handleSelectRecipe}
                searchFilter={searchQuery}
              />
            )}

            {currentTab === 'recipe-detail' && selectedRecipe && (
              <RecipeDetail
                recipe={selectedRecipe}
                onBack={() => setCurrentTab('recipes')}
                onOpenCart={() => setIsCartOpen(true)}
              />
            )}

            {currentTab === 'products' && (
              <ProductCatalogue
                onSelectProduct={(p) => setSelectedProduct(p)}
                searchFilter={searchQuery}
              />
            )}

            {currentTab === 'orders' && (
              <CustomerOrders
                onSelectOrder={handleSelectOrder}
                onExploreRecipes={() => setCurrentTab('recipes')}
              />
            )}

            {currentTab === 'order-track' && (
              <OrderTracking
                order={
                  (trackedOrder ? orders.find((o) => o.id === trackedOrder.id) : null) ||
                  activeOrder ||
                  ordersFallback
                }
                onBack={() => setCurrentTab('orders')}
              />
            )}

            {currentTab === 'profile' && <CustomerProfile />}
          </main>

          {/* Floating Chef AI Assistant (Gemini) */}
          <ChefAIAssistant />

          {/* Cart Drawer */}
          <CartDrawer
            isOpen={isCartOpen}
            onClose={() => setIsCartOpen(false)}
            onProceedToCheckout={() => setIsCheckoutOpen(true)}
          />

          {/* Checkout Modal */}
          <CheckoutModal
            isOpen={isCheckoutOpen}
            onClose={() => setIsCheckoutOpen(false)}
            onOrderSuccess={handleOrderSuccess}
          />

          {/* Product Detail Modal */}
          <ProductDetailModal
            product={selectedProduct}
            onClose={() => setSelectedProduct(null)}
          />
        </>
      )}

      {/* Notifications Drawer */}
      <NotificationDrawer
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
      />

      {/* Global Toast Container */}
      <ToastContainer />
    </div>
  );
};

// Fallback safety order if no orders exist yet
const ordersFallback: Order = {
  id: 'ord-temp',
  orderNumber: 'CRV-10001',
  customerId: 'cust-1',
  customerName: 'Aarav Sharma',
  customerPhone: '+91 98451 23456',
  deliveryAddress: {
    id: 'addr-temp',
    userId: 'cust-1',
    label: 'Home',
    street: 'Sony Signal, Koramangala 4th Block, Bengaluru',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560034',
    lat: 12.9328,
    lng: 77.6295,
  },
  storeId: 'store-blr-01',
  storeName: 'Cravely Dark Store — Koramangala',
  items: [],
  subtotal: 100,
  deliveryFee: 0,
  platformFee: 5,
  taxes: 5,
  discount: 0,
  total: 110,
  status: 'placed',
  paymentMethod: 'UPI',
  paymentStatus: 'paid',
  estimatedDeliveryMinutes: 10,
  createdAt: new Date().toISOString(),
  statusTimestamps: { placed: new Date().toISOString() },
};

export default function App() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}
