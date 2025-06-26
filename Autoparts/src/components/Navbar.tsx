import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { ShoppingCartIcon, UserIcon, Bars3Icon, XMarkIcon, BriefcaseIcon, WrenchScrewdriverIcon, TruckIcon } from '@heroicons/react/24/outline';

const Navbar: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { getCartItemCount } = useCart();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAdminMenuOpen, setIsAdminMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isMenuOpen) {
      setIsAdminMenuOpen(false);
      return;
    }
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const cartItemCount = getCartItemCount();

  return (
    <nav className="bg-white shadow-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo y navegación principal */}
          <div className="flex items-center gap-6">
            <Link to="/" className="flex-shrink-0 flex items-center group">
              <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center mr-2">
                <span className="text-white font-bold text-lg">A</span>
              </div>
              <span className="text-lg font-bold text-gray-800 tracking-wide">AutoParts</span>
            </Link>
            {/* Navegación desktop */}
            <div className="hidden md:flex md:space-x-2 ml-6">
              <Link
                to="/"
                className="px-3 py-2 text-blue-700 font-medium hover:underline underline-offset-8 transition"
              >
                Inicio
              </Link>
              <Link
                to="/productos"
                className="px-3 py-2 text-blue-700 font-medium hover:underline underline-offset-8 transition"
              >
                Productos
              </Link>
              <Link
                to="/categorias"
                className="px-3 py-2 text-blue-700 font-medium hover:underline underline-offset-8 transition"
              >
                Categorías
              </Link>
              {isAuthenticated && (
                <Link
                  to="/mis-pedidos"
                  className="px-3 py-2 text-blue-700 font-medium hover:underline underline-offset-8 transition"
                >
                  Mis Pedidos
                </Link>
              )}
              {isAuthenticated && (user?.rol === 'ADMIN' || user?.rol === 'BODEGUERO' || user?.rol === 'DISTRIBUIDOR') && (
                <div className="relative">
                  <button
                    onClick={() => setIsAdminMenuOpen(!isAdminMenuOpen)}
                    className="px-3 py-2 text-blue-700 font-medium hover:underline underline-offset-8 transition flex items-center gap-1"
                  >
                    <span className="inline-flex items-center gap-1">
                      {user?.rol === 'ADMIN' && <BriefcaseIcon className="w-5 h-5 text-blue-700" />}
                      {user?.rol === 'BODEGUERO' && <WrenchScrewdriverIcon className="w-5 h-5 text-yellow-600" />}
                      {user?.rol === 'DISTRIBUIDOR' && <TruckIcon className="w-5 h-5 text-green-700" />}
                      Admin
                    </span>
                    <svg className={`w-4 h-4 transition-transform ${isAdminMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                  </button>
                  {isAdminMenuOpen && (
                    <div className="absolute left-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-100 z-50 animate-fade-in">
                      {user?.rol === 'ADMIN' && (
                        <>
                          <div className="flex items-center gap-2 px-4 py-2 border-b border-gray-100 text-blue-700 font-bold"><BriefcaseIcon className="w-5 h-5" /> Administrador</div>
                          <Link to="/admin" className="block px-4 py-2 text-blue-700 hover:bg-blue-50 rounded transition" onClick={() => setIsAdminMenuOpen(false)}>Dashboard</Link>
                          <Link to="/admin/usuarios" className="block px-4 py-2 text-blue-700 hover:bg-blue-50 rounded transition" onClick={() => setIsAdminMenuOpen(false)}>Usuarios</Link>
                          <Link to="/admin/sucursales" className="block px-4 py-2 text-blue-700 hover:bg-blue-50 rounded transition" onClick={() => setIsAdminMenuOpen(false)}>Sucursales</Link>
                          <Link to="/admin/pedidos" className="block px-4 py-2 text-blue-700 hover:bg-blue-50 rounded transition" onClick={() => setIsAdminMenuOpen(false)}>Pedidos</Link>
                          <Link to="/admin/pagos" className="block px-4 py-2 text-blue-700 hover:bg-blue-50 rounded transition" onClick={() => setIsAdminMenuOpen(false)}>Pagos</Link>
                          <Link to="/admin/bitacora" className="block px-4 py-2 text-blue-700 hover:bg-blue-50 rounded transition" onClick={() => setIsAdminMenuOpen(false)}>Bitácora</Link>
                          <div className="border-t my-2" />
                          <div className="px-4 py-1 text-xs text-gray-500">Gestión de productos</div>
                          <Link to="/admin/productos" className="block px-4 py-2 text-blue-700 hover:bg-blue-50 rounded transition" onClick={() => setIsAdminMenuOpen(false)}>Productos</Link>
                          <Link to="/admin/categorias" className="block px-4 py-2 text-blue-700 hover:bg-blue-50 rounded transition" onClick={() => setIsAdminMenuOpen(false)}>Categorías</Link>
                          <Link to="/admin/inventario" className="block px-4 py-2 text-blue-700 hover:bg-blue-50 rounded transition" onClick={() => setIsAdminMenuOpen(false)}>Inventario</Link>
                          <Link to="/admin/subcategorias" className="block px-4 py-2 text-blue-700 hover:bg-blue-50 rounded transition" onClick={() => setIsAdminMenuOpen(false)}>Subcategorías</Link>
                        </>
                      )}
                      {user?.rol === 'BODEGUERO' && (
                        <>
                          <div className="flex items-center gap-2 px-4 py-2 border-b border-gray-100 text-yellow-700 font-bold"><WrenchScrewdriverIcon className="w-5 h-5" /> Bodeguero</div>
                          <div className="px-4 py-1 text-xs text-gray-500">Gestión de productos</div>
                          <Link to="/admin/productos" className="block px-4 py-2 text-yellow-700 hover:bg-yellow-50 rounded transition" onClick={() => setIsAdminMenuOpen(false)}>Productos</Link>
                          <Link to="/admin/categorias" className="block px-4 py-2 text-yellow-700 hover:bg-yellow-50 rounded transition" onClick={() => setIsAdminMenuOpen(false)}>Categorías</Link>
                          <Link to="/admin/inventario" className="block px-4 py-2 text-yellow-700 hover:bg-yellow-50 rounded transition" onClick={() => setIsAdminMenuOpen(false)}>Inventario</Link>
                          <Link to="/admin/subcategorias" className="block px-4 py-2 text-yellow-700 hover:bg-yellow-50 rounded transition" onClick={() => setIsAdminMenuOpen(false)}>Subcategorías</Link>
                        </>
                      )}
                      {user?.rol === 'DISTRIBUIDOR' && (
                        <>
                          <div className="flex items-center gap-2 px-4 py-2 border-b border-gray-100 text-green-700 font-bold"><TruckIcon className="w-5 h-5" /> Distribuidor</div>
                          <Link to="/admin/pedidos" className="block px-4 py-2 text-green-700 hover:bg-green-50 rounded transition" onClick={() => setIsAdminMenuOpen(false)}>Pedidos</Link>
                        </>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          {/* Acciones del usuario */}
          <div className="flex items-center gap-3">
            {/* Carrito */}
            <Link
              to="/carrito"
              className="relative p-2 text-blue-700 hover:bg-blue-50 rounded-full transition"
              title="Ver carrito"
            >
              <ShoppingCartIcon className="h-6 w-6" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center border-2 border-white">
                  {cartItemCount}
                </span>
              )}
            </Link>
            {/* Usuario */}
            {isAuthenticated ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="flex items-center gap-2 text-blue-700 hover:bg-blue-50 px-2 py-1 rounded-full transition"
                >
                  <span className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold text-base">
                    {user?.nombre_completo?.charAt(0) || <UserIcon className="h-5 w-5" />}
                  </span>
                  <span className="hidden md:block text-sm font-semibold">
                    {user?.nombre_completo}
                  </span>
                </button>
                {/* Menú desplegable */}
                {isMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50 border border-gray-100 animate-fade-in">
                    <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-100">
                      <p className="font-semibold text-blue-700">{user?.nombre_completo}</p>
                      <p className="text-gray-500">{user?.correo}</p>
                    </div>
                    <Link
                      to="/perfil"
                      className="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded transition"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Mi Perfil
                    </Link>
                    <Link
                      to="/mis-pedidos"
                      className="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded transition"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Mis Pedidos
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMenuOpen(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded transition"
                    >
                      Cerrar Sesión
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="text-blue-700 hover:underline underline-offset-8 px-3 py-2 font-medium transition"
                >
                  Iniciar Sesión
                </Link>
                <Link
                  to="/registro"
                  className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-full font-bold shadow-sm transition"
                >
                  Registrarse
                </Link>
              </div>
            )}
            {/* Botón móvil */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-blue-700 hover:bg-blue-50 rounded-full transition"
            >
              {isMenuOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
        {/* Menú móvil */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-100 py-4 bg-white rounded-b-xl shadow-xl animate-fade-in">
            <div className="space-y-1">
              <Link
                to="/"
                className="block px-4 py-2 text-blue-700 hover:bg-blue-50 rounded text-base font-semibold"
                onClick={() => setIsMenuOpen(false)}
              >
                Inicio
              </Link>
              <Link
                to="/productos"
                className="block px-4 py-2 text-blue-700 hover:bg-blue-50 rounded text-base font-semibold"
                onClick={() => setIsMenuOpen(false)}
              >
                Productos
              </Link>
              <Link
                to="/categorias"
                className="block px-4 py-2 text-blue-700 hover:bg-blue-50 rounded text-base font-semibold"
                onClick={() => setIsMenuOpen(false)}
              >
                Categorías
              </Link>
              {isAuthenticated && (
                <>
                  <Link
                    to="/mis-pedidos"
                    className="block px-4 py-2 text-blue-700 hover:bg-blue-50 rounded text-base font-semibold"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Mis Pedidos
                  </Link>
                  <Link
                    to="/perfil"
                    className="block px-4 py-2 text-blue-700 hover:bg-blue-50 rounded text-base font-semibold"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Mi Perfil
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-blue-700 hover:bg-blue-50 rounded text-base font-semibold"
                  >
                    Cerrar Sesión
                  </button>
                </>
              )}
              {!isAuthenticated && (
                <>
                  <Link
                    to="/login"
                    className="block px-4 py-2 text-blue-700 hover:bg-blue-50 rounded text-base font-semibold"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Iniciar Sesión
                  </Link>
                  <Link
                    to="/registro"
                    className="block px-4 py-2 text-blue-700 hover:bg-blue-50 rounded text-base font-semibold"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Registrarse
                  </Link>
                </>
              )}
              {isAuthenticated && (user?.rol === 'ADMIN' || user?.rol === 'BODEGUERO' || user?.rol === 'DISTRIBUIDOR') && (
                <Link
                  to="/admin"
                  className="block px-4 py-2 text-blue-700 hover:bg-blue-50 rounded text-base font-semibold"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dashboard
                </Link>
              )}
            </div>
          </div>
        )}
        {/* Menú móvil admin */}
        {isAuthenticated && (user?.rol === 'ADMIN' || user?.rol === 'BODEGUERO' || user?.rol === 'DISTRIBUIDOR') && isMenuOpen && (
          <div className="border-t border-gray-100 py-2">
            <div className="font-bold text-blue-700 px-4 py-1">Admin</div>
            {user?.rol === 'ADMIN' && (
              <>
                <Link to="/admin" className="block px-4 py-2 text-blue-700 hover:bg-blue-50 rounded text-base font-semibold" onClick={() => setIsMenuOpen(false)}>Dashboard</Link>
                <Link to="/admin/usuarios" className="block px-4 py-2 text-blue-700 hover:bg-blue-50 rounded text-base font-semibold" onClick={() => setIsMenuOpen(false)}>Usuarios</Link>
                <Link to="/admin/sucursales" className="block px-4 py-2 text-blue-700 hover:bg-blue-50 rounded text-base font-semibold" onClick={() => setIsMenuOpen(false)}>Sucursales</Link>
                <Link to="/admin/pedidos" className="block px-4 py-2 text-blue-700 hover:bg-blue-50 rounded text-base font-semibold" onClick={() => setIsMenuOpen(false)}>Pedidos</Link>
                <Link to="/admin/pagos" className="block px-4 py-2 text-blue-700 hover:bg-blue-50 rounded text-base font-semibold" onClick={() => setIsMenuOpen(false)}>Pagos</Link>
                <Link to="/admin/bitacora" className="block px-4 py-2 text-blue-700 hover:bg-blue-50 rounded text-base font-semibold" onClick={() => setIsMenuOpen(false)}>Bitácora</Link>
              </>
            )}
            {/* Opciones comunes para ADMIN y BODEGUERO */}
            {(user?.rol === 'ADMIN' || user?.rol === 'BODEGUERO') && (
              <>
                <Link to="/admin/productos" className="block px-4 py-2 text-blue-700 hover:bg-blue-50 rounded text-base font-semibold" onClick={() => setIsMenuOpen(false)}>Productos</Link>
                <Link to="/admin/categorias" className="block px-4 py-2 text-blue-700 hover:bg-blue-50 rounded text-base font-semibold" onClick={() => setIsMenuOpen(false)}>Categorías</Link>
                <Link to="/admin/inventario" className="block px-4 py-2 text-blue-700 hover:bg-blue-50 rounded text-base font-semibold" onClick={() => setIsMenuOpen(false)}>Inventario</Link>
                <Link to="/admin/subcategorias" className="block px-4 py-2 text-blue-700 hover:bg-blue-50 rounded text-base font-semibold" onClick={() => setIsMenuOpen(false)}>Subcategorías</Link>
              </>
            )}
            {/* Solo para distribuidor */}
            {user?.rol === 'DISTRIBUIDOR' && (
              <Link to="/admin/pedidos" className="block px-4 py-2 text-blue-700 hover:bg-blue-50 rounded text-base font-semibold" onClick={() => setIsMenuOpen(false)}>Pedidos</Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar; 