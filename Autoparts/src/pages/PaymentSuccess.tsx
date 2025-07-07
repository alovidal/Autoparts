import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircleIcon, HomeIcon, ShoppingBagIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface OrderDetails {
  id_pedido: number;
  fecha_pedido: string;
  estado: string;
  total: number;
  productos: Array<{
    nombre: string;
    cantidad: number;
    valor_total: number;
  }>;
}

const PaymentSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  
  const orderId = searchParams.get('order_id');

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails();
    } else {
      setLoading(false);
    }
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      const response = await fetch(`http://localhost:5000/pedidos/${orderId}`);
      if (response.ok) {
        const data = await response.json();
        setOrderDetails(data);
      } else {
        toast.error('Error al cargar los detalles del pedido');
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
      toast.error('Error al cargar los detalles del pedido');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando detalles del pedido...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header de éxito */}
        <div className="text-center mb-8">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
            <CheckCircleIcon className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            ¡Pago Exitoso!
          </h1>
          <p className="text-lg text-gray-600">
            Tu pedido ha sido procesado correctamente
          </p>
          {orderId && (
            <p className="text-sm text-gray-500 mt-2">
              Número de pedido: #{orderId}
            </p>
          )}
        </div>

        {/* Detalles del pedido */}
        {orderDetails && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              <ShoppingBagIcon className="h-5 w-5 inline mr-2" />
              Detalles del Pedido
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Información del Pedido</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Número de pedido:</span>
                    <span className="font-medium">#{orderDetails.id_pedido}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Fecha:</span>
                    <span className="font-medium">{formatDate(orderDetails.fecha_pedido)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Estado:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      orderDetails.estado === 'PENDIENTE' ? 'bg-yellow-100 text-yellow-800' :
                      orderDetails.estado === 'CONFIRMADO' ? 'bg-blue-100 text-blue-800' :
                      orderDetails.estado === 'ENVIADO' ? 'bg-purple-100 text-purple-800' :
                      orderDetails.estado === 'ENTREGADO' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {orderDetails.estado}
                    </span>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Resumen de Pago</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-medium">{formatPrice(orderDetails.total)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Envío:</span>
                    <span className="font-medium text-green-600">Gratis</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="text-gray-900 font-semibold">Total:</span>
                    <span className="text-gray-900 font-semibold">{formatPrice(orderDetails.total)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Productos del pedido */}
            {orderDetails.productos && orderDetails.productos.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-3">Productos</h3>
                <div className="space-y-2">
                  {orderDetails.productos.map((producto, index) => (
                    <div key={index} className="flex justify-between py-2 border-b border-gray-100 last:border-b-0">
                      <span className="text-gray-900">{producto.nombre} x {producto.cantidad}</span>
                      <span className="font-medium">{formatPrice(producto.valor_total)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Información adicional */}
        <div className="bg-blue-50 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-medium text-blue-900 mb-3">¿Qué sigue?</h3>
          <div className="space-y-3 text-sm text-blue-800">
            <div className="flex items-start">
              <div className="flex-shrink-0 w-2 h-2 bg-blue-400 rounded-full mt-2 mr-3"></div>
              <p>Recibirás un email de confirmación con los detalles de tu pedido</p>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 w-2 h-2 bg-blue-400 rounded-full mt-2 mr-3"></div>
              <p>Te notificaremos cuando tu pedido esté listo para envío</p>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 w-2 h-2 bg-blue-400 rounded-full mt-2 mr-3"></div>
              <p>Puedes rastrear tu pedido desde tu cuenta de usuario</p>
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate('/')}
            className="flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <HomeIcon className="h-5 w-5 mr-2" />
            Volver al Inicio
          </button>
          
          <button
            onClick={() => navigate('/productos')}
            className="flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <ShoppingBagIcon className="h-5 w-5 mr-2" />
            Seguir Comprando
          </button>
        </div>

        {/* Información de contacto */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>¿Tienes alguna pregunta sobre tu pedido?</p>
          <p className="mt-1">
            Contáctanos en{' '}
            <a href="mailto:soporte@autoparts.com" className="text-blue-600 hover:text-blue-700">
              soporte@autoparts.com
            </a>
            {' '}o llama al{' '}
            <a href="tel:+56912345678" className="text-blue-600 hover:text-blue-700">
              +56 9 1234 5678
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess; 