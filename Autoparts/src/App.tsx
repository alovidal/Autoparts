import * as React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/login';
import Register from './pages/register';
import UserList from './pages/UserList';
import HomePage from './pages/home';
import CatalogoPage from './pages/catalogo';
import DetalleProducto from './pages/detalleProducto';
import PerfilPage from './pages/perfil';
import ConfiguracionPage from './pages/configuracion';
import AdminUsuariosPage from './pages/admin/usuarios';
import BodegaProductosPage from './pages/bodega/productos';
import BodegaPedidosPage from './pages/bodega/pedidos';
import DistribuidorPedidosPage from './pages/distribuidor/pedidos';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/footer';
import ProtectedRoute from './components/ProtectedRoute';
import { UserRole } from './types/auth';

const PublicLayout: React.FC<{ children: React.ReactNode }> = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            {children}
            <Footer />
        </div>
    );
};

const AuthLayout: React.FC<{ children: React.ReactNode }> = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="min-h-screen bg-gray-50">
            {children}
        </div>
    );
};

const PrivateLayout: React.FC<{ children: React.ReactNode }> = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <main>{children}</main>
            <Footer />
        </div>
    );
};

const App: React.FC = () => {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    {/* Rutas de autenticación (sin navbar) */}
                    <Route 
                        path="/login" 
                        element={
                            <AuthLayout>
                                <LoginPage />
                            </AuthLayout>
                        } 
                    />
                    <Route 
                        path="/register" 
                        element={
                            <AuthLayout>
                                <Register />
                            </AuthLayout>
                        } 
                    />

                    {/* Rutas públicas con navbar */}
                    <Route 
                        path="/" 
                        element={
                            <PublicLayout>
                                <HomePage />
                            </PublicLayout>
                        } 
                    />
                    <Route 
                        path="/catalogo" 
                        element={
                            <PublicLayout>
                                <CatalogoPage />
                            </PublicLayout>
                        } 
                    />
                    <Route 
                        path="/producto/:id" 
                        element={
                            <PublicLayout>
                                <DetalleProducto />
                            </PublicLayout>
                        } 
                    />

                    {/* Rutas protegidas */}
                    <Route 
                        path="/perfil" 
                        element={
                            <ProtectedRoute>
                                <PrivateLayout>
                                    <PerfilPage />
                                </PrivateLayout>
                            </ProtectedRoute>
                        } 
                    />
                    <Route 
                        path="/configuracion" 
                        element={
                            <ProtectedRoute>
                                <PrivateLayout>
                                    <ConfiguracionPage />
                                </PrivateLayout>
                            </ProtectedRoute>
                        } 
                    />
                    <Route 
                        path="/users" 
                        element={
                            <ProtectedRoute roles={[UserRole.ADMIN]}>
                                <PrivateLayout>
                                    <UserList />
                                </PrivateLayout>
                            </ProtectedRoute>
                        } 
                    />

                    {/* Rutas de Admin */}
                    <Route 
                        path="/admin/usuarios" 
                        element={
                            <ProtectedRoute roles={[UserRole.ADMIN]}>
                                <PrivateLayout>
                                    <AdminUsuariosPage />
                                </PrivateLayout>
                            </ProtectedRoute>
                        } 
                    />

                    {/* Rutas de Bodeguero */}
                    <Route 
                        path="/bodega/productos" 
                        element={
                            <ProtectedRoute roles={[UserRole.BODEGUERO, UserRole.ADMIN]}>
                                <PrivateLayout>
                                    <BodegaProductosPage />
                                </PrivateLayout>
                            </ProtectedRoute>
                        } 
                    />
                    <Route 
                        path="/bodega/pedidos" 
                        element={
                            <ProtectedRoute roles={[UserRole.BODEGUERO, UserRole.ADMIN]}>
                                <PrivateLayout>
                                    <BodegaPedidosPage />
                                </PrivateLayout>
                            </ProtectedRoute>
                        } 
                    />

                    {/* Rutas de Distribuidor */}
                    <Route 
                        path="/distribuidor/pedidos" 
                        element={
                            <ProtectedRoute roles={[UserRole.DISTRIBUIDOR, UserRole.ADMIN]}>
                                <PrivateLayout>
                                    <DistribuidorPedidosPage />
                                </PrivateLayout>
                            </ProtectedRoute>
                        } 
                    />

                    {/* Ruta por defecto */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
};

export default App;