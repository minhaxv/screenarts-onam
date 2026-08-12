import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { ProductProvider } from './context/ProductContext';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import MobileBottomNav from './components/layout/MobileBottomNav';
import CartDrawer from './components/cart/CartDrawer';
import UserLoginModal from './components/auth/UserLoginModal';
import HomePage from './pages/HomePage';
import ShopPage from './pages/ShopPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CustomizePage from './pages/CustomizePage';
import DesignGalleryPage from './pages/DesignGalleryPage';
import BulkOrdersPage from './pages/BulkOrdersPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrdersPage from './pages/OrdersPage';
import ContactPage from './pages/ContactPage';
import AdminPage from './pages/AdminPage';
import DiagnosticsPage from './pages/DiagnosticsPage';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function AppContent() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <>
      <ScrollToTop />
      {!isAdmin && <Header />}
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/shop/:slug" element={<ProductDetailPage />} />
          <Route path="/product/:slug" element={<ProductDetailPage />} />
          <Route path="/customize" element={<CustomizePage />} />
          <Route path="/designs" element={<DesignGalleryPage />} />
          <Route path="/bulk-orders" element={<BulkOrdersPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/diagnostics" element={<DiagnosticsPage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </main>
      {!isAdmin && <Footer />}
      {!isAdmin && <MobileBottomNav />}
      {!isAdmin && <CartDrawer />}
      <UserLoginModal />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ProductProvider>
          <CartProvider>
            <AppContent />
          </CartProvider>
        </ProductProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
