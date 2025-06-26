import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { TrashIcon, PlusIcon, MinusIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const Cart: React.FC = () => {
  const { cartItems, removeFromCart, clearCart, getCartTotal, loading } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [updatingItem, setUpdatingItem] = useState<number | null>(null);

  const handleRemoveItem = async (productId: number) => {
    setUpdatingItem(productId);
    try {
      await removeFromCart(productId);
    } finally {
      setUpdatingItem(null);
    }
  };

  const handleClearCart = async () => {
    if (window.confirm('¿Estás seguro de que quieres vaciar el carrito?')) {
      await clearCart();
    }
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      toast.error('Debes iniciar sesión para continuar');
      navigate('/login');
      return;
    }
    navigate('/checkout');
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(price);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando carrito...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Link
              to="/productos"
              className="flex items-center text-blue-600 hover:text-blue-700 mr-4"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-1" />
              Volver a productos
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Carrito de Compras</h1>
        </div>

        {cartItems.length === 0 ? (
          /* Carrito vacío */
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Tu carrito está vacío</h2>
            <p className="text-gray-600 mb-6">
              Agrega algunos productos para comenzar tu compra
            </p>
            <Link
              to="/productos"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Ver productos
            </Link>
          </div>
        ) : (
          /* Carrito con productos */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Lista de productos */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">
                      Productos ({cartItems.length})
                    </h2>
                    <button
                      onClick={handleClearCart}
                      className="text-sm text-red-600 hover:text-red-700 font-medium"
                    >
                      Vaciar carrito
                    </button>
                  </div>
                </div>

                <div className="divide-y divide-gray-200">
                  {cartItems.map((item) => (
                    <div key={item.id_producto} className="p-6">
                      <div className="flex items-center">
                        {/* Imagen del producto */}
                        <div className="flex-shrink-0 w-20 h-20">
                          <img
                            src={item.imagen || 'https://via.placeholder.com/80x80?text=Sin+Imagen'}
                            alt={item.nombre || 'Producto'}
                            className="w-full h-full object-cover rounded-md"
                            onError={(e) => {
                              e.currentTarget.src = 'https://via.placeholder.com/80x80?text=Sin+Imagen';
                            }}
                          />
                        </div>

                        {/* Información del producto */}
                        <div className="ml-4 flex-1">
                          <div className="flex justify-between">
                            <div>
                              <h3 className="text-lg font-medium text-gray-900">
                                {item.nombre || `Producto ${item.id_producto}`}
                              </h3>
                              <p className="text-sm text-gray-500">
                                {item.marca || 'Sin marca'}
                              </p>
                              <p className="text-sm text-gray-500">
                                Código: {item.id_producto}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-semibold text-gray-900">
                                {formatPrice(item.valor_unitario)}
                              </p>
                              <p className="text-sm text-gray-500">
                                por unidad
                              </p>
                            </div>
                          </div>

                          {/* Cantidad y acciones */}
                          <div className="flex items-center justify-between mt-4">
                            <div className="flex items-center">
                              <span className="text-sm text-gray-500 mr-3">Cantidad:</span>
                              <div className="flex items-center border border-gray-300 rounded-md">
                                <button
                                  className="p-1 hover:bg-gray-100"
                                  disabled={item.cantidad <= 1}
                                >
                                  <MinusIcon className="h-4 w-4 text-gray-500" />
                                </button>
                                <span className="px-3 py-1 text-sm font-medium">
                                  {item.cantidad}
                                </span>
                                <button
                                  className="p-1 hover:bg-gray-100"
                                >
                                  <PlusIcon className="h-4 w-4 text-gray-500" />
                                </button>
                              </div>
                            </div>

                            <div className="flex items-center space-x-4">
                              <div className="text-right">
                                <p className="text-lg font-semibold text-gray-900">
                                  {formatPrice(item.valor_total)}
                                </p>
                                <p className="text-sm text-gray-500">
                                  Total
                                </p>
                              </div>
                              <button
                                onClick={() => handleRemoveItem(item.id_producto)}
                                disabled={updatingItem === item.id_producto}
                                className="text-red-600 hover:text-red-700 p-1"
                              >
                                <TrashIcon className="h-5 w-5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Resumen del pedido */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Resumen del pedido
                </h2>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-medium">{formatPrice(getCartTotal())}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Envío:</span>
                    <span className="font-medium text-green-600">Gratis</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">IVA:</span>
                    <span className="font-medium">{formatPrice(getCartTotal() * 0.19)}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between text-lg font-semibold">
                      <span>Total:</span>
                      <span>{formatPrice(getCartTotal() * 1.19)}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  disabled={cartItems.length === 0}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Proceder al pago
                </button>

                {!isAuthenticated && (
                  <p className="text-sm text-gray-500 mt-2 text-center">
                    <Link to="/login" className="text-blue-600 hover:text-blue-700">
                      Inicia sesión
                    </Link>{' '}
                    para continuar
                  </p>
                )}

                <div className="mt-6 p-4 bg-gray-50 rounded-md">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">
                    Beneficios de tu compra:
                  </h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Envío gratis en pedidos superiores a $50.000</li>
                    <li>• Garantía de fábrica en todos los productos</li>
                    <li>• Soporte técnico especializado</li>
                    <li>• Devolución gratuita en 30 días</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart; 