import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

interface Pedido {
    id_pedido: number;
    fecha: string;
    estado: string;
    total: number;
    items: {
        nombre: string;
        cantidad: number;
        precio_unitario: number;
    }[];
}

const MisPedidos: React.FC = () => {
    const [pedidos, setPedidos] = useState<Pedido[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPedidos = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/pedidos');
                if (!response.ok) {
                    throw new Error('Error al cargar los pedidos');
                }
                const data = await response.json();
                setPedidos(data);
            } catch (error) {
                console.error('Error al cargar los pedidos:', error);
                toast.error('Error al cargar los pedidos');
            } finally {
                setLoading(false);
            }
        };

        fetchPedidos();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Mis Pedidos</h1>
            {pedidos.length === 0 ? (
                <div className="text-center py-8">
                    <p className="text-gray-500">No tienes pedidos realizados.</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {pedidos.map((pedido) => (
                        <div
                            key={pedido.id_pedido}
                            className="bg-white rounded-lg shadow-md overflow-hidden"
                        >
                            <div className="p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900">
                                            Pedido #{pedido.id_pedido}
                                        </h3>
                                        <p className="text-sm text-gray-500">
                                            {new Date(pedido.fecha).toLocaleDateString('es-CL')}
                                        </p>
                                    </div>
                                    <span
                                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                                            pedido.estado === 'ENTREGADO'
                                                ? 'bg-green-100 text-green-800'
                                                : pedido.estado === 'EN_CAMINO'
                                                ? 'bg-blue-100 text-blue-800'
                                                : 'bg-yellow-100 text-yellow-800'
                                        }`}
                                    >
                                        {pedido.estado}
                                    </span>
                                </div>
                                <div className="border-t border-gray-200 -mx-6 px-6 py-4">
                                    <ul className="divide-y divide-gray-200">
                                        {pedido.items.map((item, index) => (
                                            <li key={index} className="py-3 flex justify-between">
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">
                                                        {item.nombre}
                                                    </p>
                                                    <p className="text-sm text-gray-500">
                                                        Cantidad: {item.cantidad}
                                                    </p>
                                                </div>
                                                <p className="text-sm font-medium text-gray-900">
                                                    ${item.precio_unitario.toLocaleString('es-CL')}
                                                </p>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="border-t border-gray-200 mt-4 pt-4 flex justify-between items-center">
                                    <span className="text-sm font-medium text-gray-500">Total</span>
                                    <span className="text-lg font-bold text-gray-900">
                                        ${pedido.total.toLocaleString('es-CL')}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MisPedidos; 