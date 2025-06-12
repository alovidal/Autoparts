import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types/auth';

interface UserMenuProps {
    onClose: () => void;
}

const UserMenu: React.FC<UserMenuProps> = ({ onClose }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose]);

    const handleLogout = () => {
        logout();
        onClose();
        navigate('/');
    };

    return (
        <div 
            ref={menuRef}
            className="absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 z-50"
        >
            {/* Encabezado del menú */}
            <div className="px-4 py-3">
                <p className="text-sm">Conectado como</p>
                <p className="text-sm font-medium text-gray-900 truncate">
                    {user?.nombre_completo}
                </p>
                <p className="text-xs text-gray-500">
                    {user?.correo}
                </p>
            </div>

            <div className="border-t border-gray-100">
                {/* Menú para todos los usuarios */}
                <Link
                    to="/perfil"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={onClose}
                >
                    Mi Perfil
                </Link>
                <Link
                    to="/pedidos"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={onClose}
                >
                    Mis Pedidos
                </Link>
                <Link
                    to="/configuracion"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={onClose}
                >
                    Configuración
                </Link>

                {/* Menú específico para roles */}
                {user?.rol === UserRole.ADMIN && (
                    <>
                        <div className="border-t border-gray-100"></div>
                        <Link
                            to="/admin/usuarios"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={onClose}
                        >
                            Administrar Usuarios
                        </Link>
                        <Link
                            to="/admin/productos"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={onClose}
                        >
                            Administrar Productos
                        </Link>
                    </>
                )}

                {user?.rol === UserRole.BODEGUERO && (
                    <>
                        <div className="border-t border-gray-100"></div>
                        <Link
                            to="/bodega/inventario"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={onClose}
                        >
                            Gestionar Inventario
                        </Link>
                        <Link
                            to="/bodega/pedidos"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={onClose}
                        >
                            Gestionar Pedidos
                        </Link>
                    </>
                )}

                {user?.rol === UserRole.DISTRIBUIDOR && (
                    <>
                        <div className="border-t border-gray-100"></div>
                        <Link
                            to="/distribuidor/pedidos"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={onClose}
                        >
                            Gestionar Entregas
                        </Link>
                        <Link
                            to="/distribuidor/rutas"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={onClose}
                        >
                            Planificar Rutas
                        </Link>
                    </>
                )}

                {/* Botón de cerrar sesión */}
                <div className="border-t border-gray-100"></div>
                <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                >
                    Cerrar Sesión
                </button>
            </div>
        </div>
    );
};

export default UserMenu;