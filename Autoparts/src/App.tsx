import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import UserList from './pages/UserList';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import { UserRole } from './types/auth';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './pages/home';
import CatalogoPage from './pages/catalogo';
import DetalleProducto from './pages/detalleProducto';
import AdminUsuariosPage from './pages/admin/usuarios';
import BodegaProductosPage from './pages/bodega/productos';
import BodegaPedidosPage from './pages/bodega/pedidos';
import DistribuidorPedidosPage from './pages/distribuidor/pedidos';
import PerfilPage from './pages/perfil';
import ConfiguracionPage from './pages/configuracion';

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    return user ? (
        <>
            <Navbar />
            {children}
        </>
    ) : (
        <Navigate to="/login" />
    );
};

const App: React.FC = () => {
    return (
        <AuthProvider>
            <Router>
                <div className="min-h-screen bg-gray-100">
                    <Routes>
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route
                            path="/users"
                            element={
                                <PrivateRoute>
                                    <UserList />
                                </PrivateRoute>
                            }
                        />
                        <Route path="/" element={<Navigate to="/users" />} />
                    </Routes>
                </div>
            </Router>
        </AuthProvider>
    );
};

export default App;