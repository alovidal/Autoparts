import React, { useState, useEffect } from 'react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, CreditCardIcon, TruckIcon } from '@heroicons/react/24/outline';
import { transbankService } from '../services/api';
import toast from 'react-hot-toast';

interface CheckoutForm {
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  direccion: string;
  comuna: string;
  ciudad: string;
  codigoPostal: string;
  metodoPago: 'transbank' | 'transferencia' | 'mercadopago';
}

const Checkout: React.FC = () => {
  const { cartItems, getCartTotal, cartId, loading } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [processing, setProcessing] = useState(false);
  const [formData, setFormData] = useState<CheckoutForm>({
    nombre: user?.nombre_completo?.split(' ')[0] || '',
    apellido: user?.nombre_completo?.split(' ').slice(1).join(' ') || '',
    email: user?.correo || '',
    telefono: '',
    direccion: '',
    comuna: '',
    ciudad: '',
    codigoPostal: '',
    metodoPago: 'transbank'
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    if (cartItems.length === 0) {
      navigate('/cart');
      return;
    }
  }, [user, cartItems, navigate]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(price);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = (): boolean => {
    const requiredFields = ['nombre', 'apellido', 'email', 'telefono', 'direccion', 'comuna', 'ciudad'];
    for (const field of requiredFields) {
      if (!formData[field as keyof CheckoutForm]) {
        toast.error(`El campo ${field} es obligatorio`);
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setProcessing(true);
    
    try {
      // Crear el pedido
      const pedidoData = {
        id_usuario: user!.id_usuario,
        id_carrito: cartId!,
        direccion: `${formData.direccion}, ${formData.comuna}, ${formData.ciudad}`,
        metodo_pago: formData.metodoPago.toUpperCase(),
        monto_total: getCartTotal()
      };

      console.log('📦 Creando pedido:', pedidoData);

      // Llamar al endpoint para crear pedido
      const response = await fetch('http://localhost:5000/pedidos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(pedidoData)
      });

      if (!response.ok) {
        throw new Error('Error al crear el pedido');
      }

      const pedidoResult = await response.json();
      console.log('✅ Pedido creado:', pedidoResult);

      // Si es Transbank, crear transacción y redirigir
      if (formData.metodoPago === 'transbank') {
        try {
          // Crear la transacción de Transbank
          const transbankData = {
            id_pedido: pedidoResult.id_pedido,
            monto: getCartTotal(),
            return_url: `${window.location.origin}/payment-success`,
            session_id: `session_${Date.now()}`,
            buy_order: `order_${pedidoResult.id_pedido}`
          };

          console.log('💳 Iniciando Transbank:', transbankData);
          
          const transbankResult = await transbankService.crearTransaccion(transbankData);
          console.log('✅ Transacción Transbank creada:', transbankResult);
          
          toast.success('Redirigiendo a Transbank...');
          
          // En producción, aquí redirigirías a la URL real de Transbank
          // Por ahora simulamos el proceso
          setTimeout(async () => {
            try {
              // Simular confirmación de pago
              await transbankService.confirmarPago({
                token: transbankResult.transaccion.token,
                id_pedido: pedidoResult.id_pedido
              });
              navigate(`/payment-success?order_id=${pedidoResult.id_pedido}`);
            } catch (error) {
              console.error('Error al confirmar pago:', error);
              toast.error('Error al confirmar el pago');
            }
          }, 2000);
          
        } catch (error) {
          console.error('❌ Error con Transbank:', error);
          toast.error('Error al procesar el pago con Transbank');
        }
        
      } else {
        // Para otros métodos de pago
        toast.success('Pedido creado exitosamente');
        navigate(`/payment-success?order_id=${pedidoResult.id_pedido}`);
      }

    } catch (error) {
      console.error('❌ Error en checkout:', error);
      toast.error('Error al procesar el pedido');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando checkout...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/cart')}
            className="flex items-center text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-1" />
            Volver al carrito
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Finalizar Compra</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Formulario de checkout */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Información personal */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Información Personal</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre *
                    </label>
                    <input
                      type="text"
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Apellido *
                    </label>
                    <input
                      type="text"
                      name="apellido"
                      value={formData.apellido}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Teléfono *
                    </label>
                    <input
                      type="tel"
                      name="telefono"
                      value={formData.telefono}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Dirección de envío */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  <TruckIcon className="h-5 w-5 inline mr-2" />
                  Dirección de Envío
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Dirección *
                    </label>
                    <input
                      type="text"
                      name="direccion"
                      value={formData.direccion}
                      onChange={handleInputChange}
                      placeholder="Calle y número"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Comuna *
                      </label>
                      <input
                        type="text"
                        name="comuna"
                        value={formData.comuna}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Ciudad *
                      </label>
                      <input
                        type="text"
                        name="ciudad"
                        value={formData.ciudad}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Código Postal
                      </label>
                      <input
                        type="text"
                        name="codigoPostal"
                        value={formData.codigoPostal}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Método de pago */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  <CreditCardIcon className="h-5 w-5 inline mr-2" />
                  Método de Pago
                </h2>
                <div className="space-y-3">
                  <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="metodoPago"
                      value="transbank"
                      checked={formData.metodoPago === 'transbank'}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-900">Transbank</div>
                      <div className="text-sm text-gray-500">Tarjetas de crédito y débito</div>
                    </div>
                  </label>
                  
                  <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="metodoPago"
                      value="transferencia"
                      checked={formData.metodoPago === 'transferencia'}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-900">Transferencia Bancaria</div>
                      <div className="text-sm text-gray-500">Transferencia directa a nuestra cuenta</div>
                    </div>
                  </label>
                  
                  <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="metodoPago"
                      value="mercadopago"
                      checked={formData.metodoPago === 'mercadopago'}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-900">MercadoPago</div>
                      <div className="text-sm text-gray-500">Pago con MercadoPago</div>
                    </div>
                  </label>
                </div>
              </div>
            </form>
          </div>

          {/* Resumen del pedido */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Resumen del Pedido</h2>
              
              <div className="space-y-3 mb-6">
                {cartItems.map((item) => (
                  <div key={item.id_producto} className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      {item.nombre} x {item.cantidad}
                    </span>
                    <span className="text-gray-900">{formatPrice(item.valor_total)}</span>
                  </div>
                ))}
              </div>
              
              <div className="border-t pt-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="text-gray-900">{formatPrice(getCartTotal())}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Envío:</span>
                  <span className="text-gray-900">Gratis</span>
                </div>
                <div className="flex justify-between text-base font-medium">
                  <span className="text-gray-900">Total:</span>
                  <span className="text-gray-900">{formatPrice(getCartTotal())}</span>
                </div>
              </div>

              <button
                onClick={handleSubmit}
                disabled={processing}
                className="w-full mt-6 bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {processing ? 'Procesando...' : 'Confirmar Pedido'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout; 