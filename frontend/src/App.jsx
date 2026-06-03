import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { SupabaseProvider } from './context/SupabaseProvider';
import PublicLayout from './layouts/PublicLayout';
import PanelLayout from './layouts/PanelLayout';
import Home from './pages/Home';
import Catalog from './pages/Catalog';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderConfirmation from './pages/OrderConfirmation';
import Login from './pages/Login';
import Dashboard from './pages/admin/Dashboard';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import AdminProducts from './pages/admin/AdminProducts';
import ProductForm from './pages/admin/ProductForm';
import AdminCategories from './pages/admin/AdminCategories';
import CategoryForm from './pages/admin/CategoryForm';
import AdminOrders from './pages/admin/AdminOrders';
import AdminOrderDetail from './pages/admin/AdminOrderDetail';

function LegacyAdminRedirect() {
  const { pathname } = useLocation();
  const target = pathname.replace(/^\/admin/, '/panel') || '/panel';
  return <Navigate to={target} replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <SupabaseProvider>
        <AuthProvider>
          <CartProvider>
            <Routes>
              <Route element={<PublicLayout />}>
                <Route index element={<Home />} />
                <Route path="productos" element={<Catalog />} />
                <Route path="producto/:slug" element={<ProductDetail />} />
                <Route path="carrito" element={<Cart />} />
                <Route path="checkout" element={<Checkout />} />
                <Route path="pedido-confirmado/:id" element={<OrderConfirmation />} />
              </Route>

              <Route path="/acceso" element={<Login />} />

              <Route path="/panel" element={<PanelLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="analiticas" element={<AdminAnalytics />} />
                <Route path="productos" element={<AdminProducts />} />
                <Route path="productos/nuevo" element={<ProductForm />} />
                <Route path="productos/:id/editar" element={<ProductForm />} />
                <Route path="categorias" element={<AdminCategories />} />
                <Route path="categorias/nueva" element={<CategoryForm />} />
                <Route path="categorias/:id/editar" element={<CategoryForm />} />
                <Route path="pedidos" element={<AdminOrders />} />
                <Route path="pedidos/:id" element={<AdminOrderDetail />} />
              </Route>

              {/* Redirecciones legacy */}
              <Route path="/admin/login" element={<Navigate to="/acceso" replace />} />
              <Route path="/admin/*" element={<LegacyAdminRedirect />} />
            </Routes>
          </CartProvider>
        </AuthProvider>
      </SupabaseProvider>
    </BrowserRouter>
  );
}
