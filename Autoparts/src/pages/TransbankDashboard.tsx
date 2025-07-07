import React, { useState, useEffect } from 'react';
import { 
  CreditCardIcon, 
  ShoppingBagIcon, 
  ChartBarIcon,
  CurrencyDollarIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface TransbankStats {
  pagos: {
    total: number;
    exitosos: number;
    pendientes: number;
    fallidos: number;
    monto_total: number;
  };
  pedidos: {
    total: number;
    confirmados: number;
    pendientes: number;
  };
  productos_mas_vendidos: Array<{
    nombre: string;
    marca: string;
    cantidad_vendida: number;
    valor_total: number;
  }>;
}

const TransbankDashboard: React.FC = () => {
  const [stats, setStats] = useState<TransbankStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await transbankService.obtenerEstadisticas();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast.error('Error al cargar estadísticas');
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

  const formatPercentage = (value: number, total: number) => {
    if (total === 0) return '0%';
    return `${((value / total) * 100).toFixed(1)}%`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando estadísticas...</p>
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
            <ChartBarIcon className="h-8 w-8 text-blue-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">
              Dashboard Transbank
            </h1>
          </div>
          <p className="text-lg text-gray-600">
            Estadísticas y métricas del ambiente de pruebas de Transbank
          </p>
        </div>

        {stats && (
          <>
            {/* Métricas Principales */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Total de Pagos */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <CreditCardIcon className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Total de Pagos</p>
                    <p className="text-2xl font-semibold text-gray-900">{stats.pagos.total}</p>
                  </div>
                </div>
              </div>

              {/* Pagos Exitosos */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <CheckCircleIcon className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Pagos Exitosos</p>
                    <p className="text-2xl font-semibold text-gray-900">{stats.pagos.exitosos}</p>
                    <p className="text-sm text-green-600">
                      {formatPercentage(stats.pagos.exitosos, stats.pagos.total)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Pagos Pendientes */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <ClockIcon className="h-8 w-8 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Pagos Pendientes</p>
                    <p className="text-2xl font-semibold text-gray-900">{stats.pagos.pendientes}</p>
                    <p className="text-sm text-yellow-600">
                      {formatPercentage(stats.pagos.pendientes, stats.pagos.total)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Pagos Fallidos */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <XCircleIcon className="h-8 w-8 text-red-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Pagos Fallidos</p>
                    <p className="text-2xl font-semibold text-gray-900">{stats.pagos.fallidos}</p>
                    <p className="text-sm text-red-600">
                      {formatPercentage(stats.pagos.fallidos, stats.pagos.total)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Métricas Secundarias */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* Monto Total */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <CurrencyDollarIcon className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Monto Total</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {formatPrice(stats.pagos.monto_total)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Total de Pedidos */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <ShoppingBagIcon className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Total de Pedidos</p>
                    <p className="text-2xl font-semibold text-gray-900">{stats.pedidos.total}</p>
                  </div>
                </div>
              </div>

              {/* Pedidos Confirmados */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <CheckCircleIcon className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Pedidos Confirmados</p>
                    <p className="text-2xl font-semibold text-gray-900">{stats.pedidos.confirmados}</p>
                    <p className="text-sm text-green-600">
                      {formatPercentage(stats.pedidos.confirmados, stats.pedidos.total)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Productos Más Vendidos */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Productos Más Vendidos
              </h2>
              
              {stats.productos_mas_vendidos.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Producto
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Marca
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Cantidad Vendida
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Valor Total
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {stats.productos_mas_vendidos.map((producto, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {producto.nombre}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {producto.marca}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {producto.cantidad_vendida}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatPrice(producto.valor_total)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <ShoppingBagIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No hay productos vendidos</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Comienza a hacer pruebas para ver estadísticas de ventas.
                  </p>
                </div>
              )}
            </div>

            {/* Información de Pruebas */}
            <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-blue-50 rounded-lg p-6">
                <h3 className="text-lg font-medium text-blue-900 mb-4">
                  🎯 Información de Pruebas
                </h3>
                <div className="space-y-3 text-sm text-blue-800">
                  <p>• <strong>Ambiente:</strong> Simulación de Transbank</p>
                  <p>• <strong>Escenarios:</strong> Éxito (60%), Pendiente (20%), Fallo (20%)</p>
                  <p>• <strong>Inventario:</strong> Se actualiza automáticamente al confirmar pagos</p>
                  <p>• <strong>Bitácora:</strong> Todas las transacciones se registran</p>
                </div>
              </div>

              <div className="bg-green-50 rounded-lg p-6">
                <h3 className="text-lg font-medium text-green-900 mb-4">
                  ✅ Funcionalidades Implementadas
                </h3>
                <div className="space-y-3 text-sm text-green-800">
                  <p>• Simulación completa de Transbank</p>
                  <p>• Actualización automática de inventario</p>
                  <p>• Registro de transacciones en bitácora</p>
                  <p>• Estadísticas en tiempo real</p>
                  <p>• Manejo de diferentes escenarios de pago</p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TransbankDashboard; 