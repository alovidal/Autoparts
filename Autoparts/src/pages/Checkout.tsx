import React, { useState, useEffect } from 'react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, CreditCardIcon, TruckIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface CheckoutForm {
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  direccion: string;
  comuna: string;
  ciudad: string;
  metodoPago: 'transbank' | 'transferencia';
}

const Checkout: React.FC = () => {
  const { cartItems, getCartTotal, cartId } = useCart();
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

  const crearPedido = async () => {
    try {
      console.log('📦 Creando pedido...');
      
      const pedidoData = {
        id_usuario: user!.id_usuario,
        id_carrito: cartId!,
        direccion: `${formData.direccion}, ${formData.comuna}, ${formData.ciudad}`,
        metodo_pago: 'TRANSBANK',
        monto_total: getCartTotal()
      };

      const response = await fetch('http://localhost:5000/pedidos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pedidoData)
      });

      if (!response.ok) {
        throw new Error('Error al crear el pedido');
      }

      const result = await response.json();
      console.log('✅ Pedido creado:', result);
      return result.id_pedido;
      
    } catch (error) {
      console.error('❌ Error creando pedido:', error);
      throw error;
    }
  };

  const procesarTransbankReal = async (idPedido: number) => {
    try {
      console.log('💳 Iniciando proceso Transbank REAL...');
      
      // Crear transacción REAL con Transbank
      const transactionResponse = await fetch('http://localhost:5001/transbank/crear-transaccion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_pedido: idPedido,
          monto: getCartTotal()
        })
      });

      if (!transactionResponse.ok) {
        throw new Error('Error al crear transacción Transbank');
      }

      const transactionResult = await transactionResponse.json();
      console.log('✅ Transacción Transbank REAL creada:', transactionResult);

      // Mostrar mensaje y redirigir a Transbank REAL
      toast.success('Redirigiendo a Transbank...');
      
      // Redirigir a la URL REAL de Transbank
      window.location.href = `${transactionResult.url}?token_ws=${transactionResult.token}`;
      
    } catch (error) {
      console.error('❌ Error con Transbank:', error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setProcessing(true);
    
    try {
      // 1. Crear pedido
      const idPedido = await crearPedido();
      
      // 2. Procesar según método de pago
      if (formData.metodoPago === 'transbank') {
        await procesarTransbankReal(idPedido);
      } else {
        // Para transferencia, ir directo a página de éxito
        toast.success('Pedido creado exitosamente');
        navigate(`/payment-success?order_id=${idPedido}`);
      }

    } catch (error) {
      console.error('❌ Error en checkout:', error);
      toast.error('Error al procesar el pedido');
      setProcessing(false);
    }
    // No ponemos finally aquí porque queremos mantener processing=true mientras redirige
  };

  if (!user || cartItems.length === 0) {
    return <div className="p-8 text-center">Cargando...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Formulario */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Información Personal */}
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">Información Personal</h2>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    name="nombre"
                    placeholder="Nombre *"
                    value={formData.nombre}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <input
                    type="text"
                    name="apellido"
                    placeholder="Apellido *"
                    value={formData.apellido}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <input
                    type="email"
                    name="email"
                    placeholder="Email *"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <input
                    type="tel"
                    name="telefono"
                    placeholder="Teléfono *"
                    value={formData.telefono}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              {/* Dirección */}
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  <TruckIcon className="h-5 w-5 inline mr-2" />
                  Dirección de Envío
                </h2>
                <div className="space-y-4">
                  <input
                    type="text"
                    name="direccion"
                    placeholder="Dirección *"
                    value={formData.direccion}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      name="comuna"
                      placeholder="Comuna *"
                      value={formData.comuna}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    <input
                      type="text"
                      name="ciudad"
                      placeholder="Ciudad *"
                      value={formData.ciudad}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Método de Pago */}
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  <CreditCardIcon className="h-5 w-5 inline mr-2" />
                  Método de Pago
                </h2>
                <div className="space-y-3">
                  <label className="flex items-center p-4 border-2 border-blue-200 rounded-lg cursor-pointer hover:bg-blue-50">
                    <input
                      type="radio"
                      name="metodoPago"
                      value="transbank"
                      checked={formData.metodoPago === 'transbank'}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-900">💳 Transbank WebPay Plus</div>
                      <div className="text-sm text-gray-500">Pago seguro con tarjeta de crédito o débito</div>
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
                      <div className="text-sm font-medium text-gray-900">🏦 Transferencia Bancaria</div>
                      <div className="text-sm text-gray-500">Transferencia directa a nuestra cuenta</div>
                    </div>
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={processing}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {processing ? '🔄 Redirigiendo a Transbank...' : '✅ Pagar con Transbank'}
              </button>
            </form>
          </div>

          {/* Resumen */}
          <div className="bg-white rounded-lg shadow-sm p-6 h-fit">
            <h2 className="text-lg font-medium text-gray-900 mb-6">Resumen del Pedido</h2>
            
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
                <span className="text-green-600">Gratis</span>
              </div>
              <div className="flex justify-between text-lg font-semibold">
                <span className="text-gray-900">Total:</span>
                <span className="text-gray-900">{formatPrice(getCartTotal())}</span>
              </div>
            </div>

            {/* Información de seguridad */}
            <div className="mt-6 p-4 bg-green-50 rounded-md border border-green-200">
              <h3 className="text-sm font-medium text-green-900">🔒 Pago 100% Seguro</h3>
              <p className="text-sm text-green-800 mt-1">
                Tu información está protegida con encriptación SSL de 256 bits.
                Transbank es la plataforma de pagos más segura de Chile.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;