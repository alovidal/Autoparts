import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import HomePage from '../pages/home';
import CatalogoPage from '../pages/catalogo';
import DetalleProducto from '../pages/detalleProducto';
import MisPedidos from '../pages/misPedidos';
import Login from '../pages/login';
import { useAuth } from '../context/AuthContext';

const AppRoutes: React.FC = () => {
    const { isAuthenticated } = useAuth();

    return (
        <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/catalogo" element={<CatalogoPage />} />
            <Route path="/producto/:id" element={<DetalleProducto />} />
            <Route path="/login" element={<Login />} />
            <Route
                path="/mis-pedidos"
                element={
                    isAuthenticated ? (
                        <MisPedidos />
                    ) : (
                        <Navigate to="/login" replace />
                    )
                }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
};

export default AppRoutes; 