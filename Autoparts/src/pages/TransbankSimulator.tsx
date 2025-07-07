import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { transbankService } from '../services/api';
import { 
  CreditCardIcon, 
  CheckCircleIcon, 
  XCircleIcon, 
  ExclamationTriangleIcon,
  ArrowLeftIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface TransbankSimulatorProps {
  orderId?: string;
  amount?: number;
  returnUrl?: string;
}

const TransbankSimulator: React.FC<TransbankSimulatorProps> = ({ 
  orderId, 
  amount, 
  returnUrl 
}) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cartItems, getCartTotal } = useCart();
  
  const [loading, setLoading] = useState(false);
  const [simulationStep, setSimulationStep] = useState<'init' | 'processing' | 'success' | 'failed' | 'pending'>('init');
  const [paymentMethod, setPaymentMethod] = useState<'credit' | 'debit' | 'webpay'>('credit');
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [installments, setInstallments] = useState(1);
  
  // Obtener parámetros de la URL
  const urlOrderId = searchParams.get('order_id') || orderId;
  const urlAmount = searchParams.get('amount') || amount;
  const urlReturnUrl = searchParams.get('return_url') || returnUrl;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(price);
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!urlOrderId) {
      toast.error('ID de pedido no encontrado');
      return;
    }

    setLoading(true);
    setSimulationStep('processing');

    try {
      // Simular procesamiento de pago
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Simular diferentes escenarios de pago
      const successRate = Math.random();
      
      if (successRate > 0.8) {
        // 20% probabilidad de fallo
        setSimulationStep('failed');
        toast.error('Pago rechazado por el banco');
      } else if (successRate > 0.6) {
        // 20% probabilidad de pendiente
        setSimulationStep('pending');
        toast.warning('Pago en revisión');
      } else {
        // 60% probabilidad de éxito
        setSimulationStep('success');
        
        // Confirmar pago en el backend
        await transbankService.confirmarPago({
          token: `token_${Date.now()}`,
          id_pedido: parseInt(urlOrderId)
        });
        
        toast.success('Pago procesado exitosamente');
        
        // Redirigir después de 2 segundos
        setTimeout(() => {
          if (urlReturnUrl) {
            window.location.href = `${urlReturnUrl}?order_id=${urlOrderId}`;
          } else {
            navigate(`/payment-success?order_id=${urlOrderId}`);
          }
        }, 2000);
      }
    } catch (error) {
      console.error('Error en simulación:', error);
      setSimulationStep('failed');
      toast.error('Error al procesar el pago');
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setSimulationStep('init');
    setCardNumber('');
    setCardHolder('');
    setExpiryDate('');
    setCvv('');
  };

  const handleCancel = () => {
    navigate('/cart');
  };

  if (simulationStep === 'processing') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Procesando Pago</h2>
          <p className="text-gray-600">Conectando con Transbank...</p>
        </div>
      </div>
    );
  }

  if (simulationStep === 'success') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
            <CheckCircleIcon className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">¡Pago Exitoso!</h2>
          <p className="text-gray-600 mb-4">Redirigiendo a la página de confirmación...</p>
          <div className="animate-pulse">
            <div className="h-2 bg-blue-200 rounded w-48 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  if (simulationStep === 'failed') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
            <XCircleIcon className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Pago Rechazado</h2>
          <p className="text-gray-600 mb-6">
            El pago no pudo ser procesado. Verifica los datos de tu tarjeta e intenta nuevamente.
          </p>
          <div className="space-y-3">
            <button
              onClick={handleRetry}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Intentar Nuevamente
            </button>
            <button
              onClick={handleCancel}
              className="w-full bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Volver al Carrito
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (simulationStep === 'pending') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-yellow-100 mb-4">
            <ExclamationTriangleIcon className="h-8 w-8 text-yellow-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Pago en Revisión</h2>
          <p className="text-gray-600 mb-6">
            Tu pago está siendo revisado por el banco. Te notificaremos cuando se confirme.
          </p>
          <button
            onClick={handleCancel}
            className="w-full bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Volver al Carrito
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <button
              onClick={() => navigate('/cart')}
              className="flex items-center text-blue-600 hover:text-blue-700"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-1" />
              Volver al carrito
            </button>
            <button
              onClick={() => navigate('/transbank-dashboard')}
              className="flex items-center text-green-600 hover:text-green-700"
            >
              <ChartBarIcon className="h-5 w-5 mr-1" />
              Ver Dashboard
            </button>
          </div>
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 mb-4">
              <CreditCardIcon className="h-8 w-8 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Simulador Transbank
            </h1>
            <p className="text-lg text-gray-600">
              Ambiente de pruebas para simular pagos con Transbank
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Formulario de Pago */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Datos de Pago
            </h2>
            
            <form onSubmit={handlePaymentSubmit} className="space-y-4">
              {/* Método de Pago */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Método de Pago
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="credit"
                      checked={paymentMethod === 'credit'}
                      onChange={(e) => setPaymentMethod(e.target.value as any)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Tarjeta de Crédito</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="debit"
                      checked={paymentMethod === 'debit'}
                      onChange={(e) => setPaymentMethod(e.target.value as any)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Tarjeta de Débito</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="webpay"
                      checked={paymentMethod === 'webpay'}
                      onChange={(e) => setPaymentMethod(e.target.value as any)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">WebPay Plus</span>
                  </label>
                </div>
              </div>

              {/* Número de Tarjeta */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Número de Tarjeta
                </label>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  placeholder="1234 5678 9012 3456"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Titular */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Titular de la Tarjeta
                </label>
                <input
                  type="text"
                  value={cardHolder}
                  onChange={(e) => setCardHolder(e.target.value)}
                  placeholder="NOMBRE APELLIDO"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Fecha de Expiración y CVV */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha de Expiración
                  </label>
                  <input
                    type="text"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    placeholder="MM/AA"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    CVV
                  </label>
                  <input
                    type="text"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value)}
                    placeholder="123"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              {/* Cuotas (solo para crédito) */}
              {paymentMethod === 'credit' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cuotas
                  </label>
                  <select
                    value={installments}
                    onChange={(e) => setInstallments(parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={1}>1 cuota sin interés</option>
                    <option value={3}>3 cuotas sin interés</option>
                    <option value={6}>6 cuotas sin interés</option>
                    <option value={12}>12 cuotas sin interés</option>
                  </select>
                </div>
              )}

              {/* Botón de Pago */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {loading ? 'Procesando...' : 'Pagar Ahora'}
              </button>
            </form>
          </div>

          {/* Resumen del Pedido */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Resumen del Pedido
            </h2>
            
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">ID de Pedido:</span>
                <span className="font-medium">#{urlOrderId || 'N/A'}</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Método de Pago:</span>
                <span className="font-medium capitalize">{paymentMethod}</span>
              </div>

              {paymentMethod === 'credit' && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Cuotas:</span>
                  <span className="font-medium">{installments} cuota{installments > 1 ? 's' : ''}</span>
                </div>
              )}

              <div className="border-t pt-4">
                <div className="flex justify-between text-base font-semibold">
                  <span className="text-gray-900">Total a Pagar:</span>
                  <span className="text-gray-900">
                    {formatPrice(parseFloat(urlAmount || getCartTotal().toString()))}
                  </span>
                </div>
              </div>
            </div>

            {/* Información de Prueba */}
            <div className="mt-6 p-4 bg-blue-50 rounded-md">
              <h3 className="text-sm font-medium text-blue-900 mb-2">
                💡 Datos de Prueba
              </h3>
              <div className="text-xs text-blue-800 space-y-1">
                <p><strong>Tarjeta de Prueba:</strong> 4051885600446623</p>
                <p><strong>CVV:</strong> 123</p>
                <p><strong>Fecha:</strong> 12/25</p>
                <p><strong>RUT:</strong> 11111111-1</p>
              </div>
            </div>

            {/* Escenarios de Prueba */}
            <div className="mt-4 p-4 bg-yellow-50 rounded-md">
              <h3 className="text-sm font-medium text-yellow-900 mb-2">
                🎲 Escenarios de Prueba
              </h3>
              <div className="text-xs text-yellow-800 space-y-1">
                <p>• <strong>60%</strong> - Pago exitoso</p>
                <p>• <strong>20%</strong> - Pago en revisión</p>
                <p>• <strong>20%</strong> - Pago rechazado</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransbankSimulator; 