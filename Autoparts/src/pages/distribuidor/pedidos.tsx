import React, { useState, useEffect } from 'react';

interface OrderProduct {
    id: number;
    nombre: string;
    cantidad: number;
    precio: number;
}

interface Order {
    id: number;
    usuario: {
        id: number;
        nombre: string;
        apellido: string;
        email: string;
        telefono: string;
    };
    productos: OrderProduct[];
    estado: 'PENDIENTE' | 'EN_PROCESO' | 'LISTO_PARA_ENTREGA' | 'EN_ENTREGA' | 'ENTREGADO' | 'CANCELADO';
    total: number;
    fecha: string;
    direccion_entrega: string;
}

const DistribuidorPedidosPage: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

    const fetchOrders = async () => {
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/orders/delivery`);
            if (!response.ok) throw new Error('Error al cargar pedidos');
            const data = await response.json();
            setOrders(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al cargar pedidos');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const handleUpdateStatus = async (orderId: number, newStatus: Order['estado']) => {
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/orders/${orderId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ estado: newStatus })
            });

            if (!response.ok) throw new Error('Error al actualizar estado');
            
            await fetchOrders();
            setSelectedOrder(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al actualizar estado');
        }
    };

    const getStatusColor = (status: Order['estado']) => {
        switch (status) {
            case 'LISTO_PARA_ENTREGA':
                return 'bg-yellow-100 text-yellow-800';
            case 'EN_ENTREGA':
                return 'bg-blue-100 text-blue-800';
            case 'ENTREGADO':
                return 'bg-green-100 text-green-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Pedidos para Entrega</h1>

            {error && (
                <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Lista de pedidos */}
                <div className="bg-white shadow-md rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Pedido
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Estado
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Dirección
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Acciones
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {orders.map(order => (
                                <tr key={order.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">
                                            Pedido #{order.id}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {formatDate(order.fecha)}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.estado)}`}>
                                            {order.estado.replace(/_/g, ' ')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        <div className="truncate max-w-xs">
                                            {order.direccion_entrega}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={() => setSelectedOrder(order)}
                                            className="text-indigo-600 hover:text-indigo-900"
                                        >
                                            Ver detalles
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Detalles del pedido */}
                {selectedOrder && (
                    <div className="bg-white shadow-md rounded-lg p-6">
                        <div className="flex justify-between items-start mb-6">
                            <h2 className="text-xl font-bold">Pedido #{selectedOrder.id}</h2>
                            <button
                                onClick={() => setSelectedOrder(null)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="mb-6">
                            <h3 className="font-bold text-gray-700 mb-2">Cliente</h3>
                            <p className="text-gray-600">
                                {selectedOrder.usuario.nombre} {selectedOrder.usuario.apellido}
                            </p>
                            <p className="text-gray-600">{selectedOrder.usuario.email}</p>
                            <p className="text-gray-600">{selectedOrder.usuario.telefono}</p>
                        </div>

                        <div className="mb-6">
                            <h3 className="font-bold text-gray-700 mb-2">Dirección de entrega</h3>
                            <p className="text-gray-600">{selectedOrder.direccion_entrega}</p>
                        </div>

                        <div className="mb-6">
                            <h3 className="font-bold text-gray-700 mb-2">Productos</h3>
                            <div className="space-y-4">
                                {selectedOrder.productos.map(product => (
                                    <div key={product.id} className="flex justify-between items-center">
                                        <div>
                                            <p className="font-medium">{product.nombre}</p>
                                            <p className="text-sm text-gray-500">
                                                Cantidad: {product.cantidad}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="font-bold text-gray-700">Actualizar estado</h3>
                            <div className="grid grid-cols-2 gap-4">
                                {selectedOrder.estado === 'LISTO_PARA_ENTREGA' && (
                                    <button
                                        onClick={() => handleUpdateStatus(selectedOrder.id, 'EN_ENTREGA')}
                                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                                    >
                                        Iniciar entrega
                                    </button>
                                )}
                                {selectedOrder.estado === 'EN_ENTREGA' && (
                                    <button
                                        onClick={() => handleUpdateStatus(selectedOrder.id, 'ENTREGADO')}
                                        className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                                    >
                                        Marcar como entregado
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DistribuidorPedidosPage; 