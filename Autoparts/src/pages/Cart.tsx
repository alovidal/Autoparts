import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { TrashIcon, PlusIcon, MinusIcon, ArrowLeftIcon, ShoppingBagIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const Cart: React.FC = () => {
  const { cartItems, loading, removeFromCart, getCartTotal, getCartItemCount, refreshCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [updating, setUpdating] = useState<number | null>(null);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(price);
  };

  const handleRemoveItem = async (productId: number) => {
    setUpdating(productId);
    try {
      await removeFromCart(productId);
      toast.success('Producto eliminado del carrito');
    } catch (error) {
      toast.error('Error al eliminar el producto');
    } finally {
      setUpdating(null);
    }
  };

  const handleCheckout = () => {
    if (!user) {
      toast.error('Debes iniciar sesión para continuar');
      navigate('/login');
      return;
    }
    
    if (cartItems.length === 0) {
      toast.error('Tu carrito está vacío');
      return;
    }

    navigate('/checkout');
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Carrito de Compras</h1>
          <p className="text-gray-600">
            {getCartItemCount()} producto{getCartItemCount() !== 1 ? 's' : ''} en tu carrito
          </p>
        </div>

        {cartItems.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingBagIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Tu carrito está vacío</h3>
            <p className="mt-1 text-sm text-gray-500">
              Comienza a agregar productos para continuar.
            </p>
            <div className="mt-6">
              <button
                onClick={() => navigate('/productos')}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Ver productos
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Lista de productos */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm">
                <div className="p-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Productos</h2>
                  <div className="space-y-4">
                    {cartItems.map((item) => (
                      <div key={item.id_producto} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                        {/* Imagen */}
                        <div className="flex-shrink-0">
                          <img
                            src={item.imagen}
                            alt={item.nombre}
                            className="w-16 h-16 object-cover rounded-md"
                            onError={e => { e.currentTarget.src = '/img/productos/default.jpg'; }}
                          />
                        </div>

                        {/* Información del producto */}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-medium text-gray-900 truncate">
                            {item.nombre}
                          </h3>
                          <p className="text-sm text-gray-500">{item.marca}</p>
                          <p className="text-sm text-gray-500">Sucursal: {item.sucursal_nombre}</p>
                        </div>

                        {/* Cantidad y precio */}
                        <div className="flex items-center space-x-4">
                          <div className="text-sm text-gray-900">
                            <span className="font-medium">Cantidad: {item.cantidad}</span>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-gray-900">
                              {formatPrice(item.valor_unitario)}
                            </p>
                            <p className="text-sm text-gray-500">
                              Total: {formatPrice(item.valor_total)}
                            </p>
                          </div>
                        </div>

                        {/* Botón eliminar */}
                        <button
                          onClick={() => handleRemoveItem(item.id_producto)}
                          disabled={updating === item.id_producto}
                          className="flex-shrink-0 p-2 text-gray-400 hover:text-red-500 focus:outline-none focus:ring-2 focus:ring-red-500 rounded-md disabled:opacity-50"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Resumen del pedido */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Resumen del Pedido</h2>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="text-gray-900">{formatPrice(getCartTotal())}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Envío:</span>
                    <span className="text-gray-900">Gratis</span>
                  </div>
                  <div className="border-t pt-3">
                    <div className="flex justify-between text-base font-medium">
                      <span className="text-gray-900">Total:</span>
                      <span className="text-gray-900">{formatPrice(getCartTotal())}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  disabled={loading || cartItems.length === 0}
                  className="w-full mt-6 bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  Proceder al Pago
                </button>

                <button
                  onClick={() => navigate('/productos')}
                  className="w-full mt-3 bg-gray-100 text-gray-700 py-3 px-4 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 font-medium"
                >
                  Continuar Comprando
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart; 