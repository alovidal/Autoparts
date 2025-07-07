import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Products from './pages/Products';
import Cart from './pages/Cart';
import Categorias from './pages/Categorias';
import MisPedidos from './pages/MisPedidos';
import Perfil from './pages/Perfil';
import Checkout from './pages/Checkout';
import PaymentSuccess from './pages/PaymentSuccess';
import TransbankSimulator from './pages/TransbankSimulator';
import TransbankDashboard from './pages/TransbankDashboard';
import AdminUsuarios from './pages/AdminUsuarios';
import AdminProductos from './pages/AdminProductos';
import AdminCategorias from './pages/AdminCategorias';
import AdminSucursales from './pages/AdminSucursales';
import AdminInventario from './pages/AdminInventario';
import AdminPedidos from './pages/AdminPedidos';
import AdminPagos from './pages/AdminPagos';
import AdminBitacora from './pages/AdminBitacora';
import AdminDashboard from './pages/AdminDashboard';
import './index.css';
import React from 'react';

const ProtectedRoute = ({ allowedRoles, children }: { allowedRoles: string[]; children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-8 text-center">Cargando...</div>;
  if (!user || !allowedRoles.includes(user.rol)) {
    return <div className="p-8 text-center text-red-600 font-bold">Acceso denegado</div>;
  }
  return <>{children}</>;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/registro" element={<Register />} />
                <Route path="/productos" element={<Products />} />
                <Route path="/carrito" element={<Cart />} />
                <Route path="/categorias" element={<Categorias />} />
                <Route path="/mis-pedidos" element={<MisPedidos />} />
                <Route path="/perfil" element={<Perfil />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/payment-success" element={<PaymentSuccess />} />
                <Route path="/transbank-simulator" element={<TransbankSimulator />} />
                <Route path="/transbank-dashboard" element={<TransbankDashboard />} />
                <Route path="/admin/usuarios" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminUsuarios /></ProtectedRoute>} />
                <Route path="/admin/productos" element={<ProtectedRoute allowedRoles={['ADMIN','BODEGUERO']}><AdminProductos /></ProtectedRoute>} />
                <Route path="/admin/categorias" element={<ProtectedRoute allowedRoles={['ADMIN','BODEGUERO']}><AdminCategorias /></ProtectedRoute>} />
                <Route path="/admin/sucursales" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminSucursales /></ProtectedRoute>} />
                <Route path="/admin/inventario" element={<ProtectedRoute allowedRoles={['ADMIN','BODEGUERO']}><AdminInventario /></ProtectedRoute>} />
                <Route path="/admin/pedidos" element={<ProtectedRoute allowedRoles={['ADMIN','DISTRIBUIDOR']}><AdminPedidos /></ProtectedRoute>} />
                <Route path="/admin/pagos" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminPagos /></ProtectedRoute>} />
                <Route path="/admin/bitacora" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminBitacora /></ProtectedRoute>} />
                <Route path="/admin" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminDashboard /></ProtectedRoute>} />
                <Route path="*" element={<div className="p-8 text-center">Página no encontrada</div>} />
              </Routes>
            </main>
            <Footer />
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
                success: {
                  duration: 3000,
                  iconTheme: {
                    primary: '#10B981',
                    secondary: '#fff',
                  },
                },
                error: {
                  duration: 4000,
                  iconTheme: {
                    primary: '#EF4444',
                    secondary: '#fff',
                  },
                },
              }}
            />
          </div>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App; 