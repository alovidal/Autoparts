import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface OrderItem {
    id: number;
    product_name: string;
    quantity: number;
    price: number;
}

interface Order {
    id: number;
    date: string;
    status: 'pending' | 'processing' | 'completed' | 'cancelled';
    customer_name: string;
    total: number;
    items: OrderItem[];
}

const BodegaPedidosPage: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const response = await axios.get('/api/orders');
            setOrders(response.data);
            setLoading(false);
        } catch (err) {
            setError('Error al cargar los pedidos');
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (orderId: number, newStatus: Order['status']) => {
        try {
            await axios.patch(`/api/orders/${orderId}`, { status: newStatus });
            setOrders(orders.map(order => 
                order.id === orderId ? { ...order, status: newStatus } : order
            ));
        } catch (err) {
            setError('Error al actualizar el estado del pedido');
        }
    };

    const getStatusColor = (status: Order['status']) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'processing':
                return 'bg-blue-100 text-blue-800';
            case 'completed':
                return 'bg-green-100 text-green-800';
            case 'cancelled':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusText = (status: Order['status']) => {
        switch (status) {
            case 'pending':
                return 'Pendiente';
            case 'processing':
                return 'En proceso';
            case 'completed':
                return 'Completado';
            case 'cancelled':
                return 'Cancelado';
            default:
                return status;
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 bg-red-100 text-red-700 rounded-md">
                {error}
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-6">Gestión de Pedidos</h1>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Lista de pedidos */}
                <div className="lg:col-span-2">
                    <div className="bg-white shadow-md rounded-lg overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Pedido
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Cliente
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Estado
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Total
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Acciones
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {orders.map((order) => (
                                    <tr key={order.id} 
                                        className={selectedOrder?.id === order.id ? 'bg-blue-50' : ''}
                                        onClick={() => setSelectedOrder(order)}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">
                                                #{order.id}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {new Date(order.date).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{order.customer_name}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)}`}>
                                                {getStatusText(order.status)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            ${order.total.toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <select
                                                value={order.status}
                                                onChange={(e) => handleStatusUpdate(order.id, e.target.value as Order['status'])}
                                                className="text-sm border rounded-md p-1"
                                            >
                                                <option value="pending">Pendiente</option>
                                                <option value="processing">En proceso</option>
                                                <option value="completed">Completado</option>
                                                <option value="cancelled">Cancelado</option>
                                            </select>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Detalles del pedido */}
                {selectedOrder && (
                    <div className="bg-white shadow-md rounded-lg p-6">
                        <h2 className="text-lg font-semibold mb-4">Detalles del Pedido #{selectedOrder.id}</h2>
                        <div className="space-y-4">
                            <div>
                                <p className="text-sm text-gray-500">Cliente</p>
                                <p className="font-medium">{selectedOrder.customer_name}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Fecha</p>
                                <p className="font-medium">{new Date(selectedOrder.date).toLocaleDateString()}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Estado</p>
                                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(selectedOrder.status)}`}>
                                    {getStatusText(selectedOrder.status)}
                                </span>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 mb-2">Productos</p>
                                <ul className="space-y-2">
                                    {selectedOrder.items.map((item) => (
                                        <li key={item.id} className="flex justify-between text-sm">
                                            <span>{item.quantity}x {item.product_name}</span>
                                            <span className="text-gray-600">${(item.price * item.quantity).toFixed(2)}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="border-t pt-4">
                                <div className="flex justify-between font-semibold">
                                    <span>Total</span>
                                    <span>${selectedOrder.total.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BodegaPedidosPage; 