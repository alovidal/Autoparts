import React from 'react';
import { Link } from 'react-router-dom';
import CartButton from './CartButton';
import { useAuth } from '../context/AuthContext';

const Navbar: React.FC = () => {
    const { isAuthenticated, user, logout } = useAuth();

    return (
        <nav className="bg-white shadow-lg">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex">
                        <Link to="/" className="flex-shrink-0 flex items-center">
                            <img
                                className="h-8 w-auto"
                                src="/logo.png"
                                alt="AutoParts"
                            />
                            <span className="ml-2 text-xl font-bold text-gray-900">AutoParts</span>
                        </Link>
                        <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                            <Link
                                to="/"
                                className="text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-gray-300"
                            >
                                Inicio
                            </Link>
                            <Link
                                to="/catalogo"
                                className="text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-gray-300"
                            >
                                Catálogo
                            </Link>
                            {isAuthenticated && (
                                <Link
                                    to="/mis-pedidos"
                                    className="text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-gray-300"
                                >
                                    Mis Pedidos
                                </Link>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center">
                        <CartButton />
                        <div className="ml-4">
                            {isAuthenticated ? (
                                <div className="flex items-center space-x-4">
                                    <span className="text-gray-700">
                                        {user?.nombre || 'Usuario'}
                                    </span>
                                    <button
                                        onClick={logout}
                                        className="text-gray-700 hover:text-gray-900"
                                    >
                                        Cerrar sesión
                                    </button>
                                </div>
                            ) : (
                                <Link
                                    to="/login"
                                    className="text-gray-700 hover:text-gray-900"
                                >
                                    Iniciar sesión
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar; 