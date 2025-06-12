import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types/auth';

interface ProtectedRouteProps {
    children: React.ReactNode;
    roles?: UserRole[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, roles }) => {
    const { isAuthenticated, user } = useAuth();
    const location = useLocation();

    if (!isAuthenticated) {
        // Redirigir a login y guardar la ubicación actual
        return <Navigate to="/login" state={{ returnTo: location.pathname }} replace />;
    }

    // Si se requieren roles específicos y el usuario no tiene ninguno de ellos
    if (roles && (!user || !roles.includes(user.rol))) {
        // Redirigir a la página principal con un mensaje de error
        return <Navigate to="/" replace state={{ 
            error: "No tienes permisos para acceder a esta página"
        }} />;
    }

    return <>{children}</>;
};

export default ProtectedRoute;