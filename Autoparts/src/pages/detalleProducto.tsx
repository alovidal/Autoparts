import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';

interface Producto {
    id_producto: number;
    nombre: string;
    precio: number;
    descripcion: string;
    imagen_url: string;
    stock_actual: number;
    categoria_nombre: string;
    marca: string;
}

const DetalleProducto: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [producto, setProducto] = useState<Producto | null>(null);
    const [loading, setLoading] = useState(true);
    const [cantidad, setCantidad] = useState(1);
    const { addToCart } = useCart();

    useEffect(() => {
        const fetchProducto = async () => {
            try {
                const response = await fetch(`http://localhost:5000/api/productos/${id}`);
                if (!response.ok) {
                    throw new Error('Producto no encontrado');
                }
                const data = await response.json();
                setProducto(data);
            } catch (error) {
                console.error('Error al cargar el producto:', error);
                toast.error('Error al cargar el producto');
                navigate('/catalogo');
            } finally {
                setLoading(false);
            }
        };

        fetchProducto();
    }, [id, navigate]);

    const handleAddToCart = () => {
        if (producto) {
            addToCart({
                id_producto: producto.id_producto,
                nombre: producto.nombre,
                precio_unitario: producto.precio,
                cantidad,
                imagen_url: producto.imagen_url,
                stock_actual: producto.stock_actual
            });
            toast.success('Producto agregado al carrito');
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!producto) {
        return null;
    }

    return (
        <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="md:flex">
                        <div className="md:flex-shrink-0">
                            <img
                                src={producto.imagen_url || 'https://via.placeholder.com/400'}
                                alt={producto.nombre}
                                className="h-96 w-full object-cover md:w-96"
                            />
                        </div>
                        <div className="p-8">
                            <div className="uppercase tracking-wide text-sm text-blue-600 font-semibold">
                                {producto.categoria_nombre}
                            </div>
                            <h1 className="mt-2 text-3xl font-bold text-gray-900">
                                {producto.nombre}
                            </h1>
                            <p className="mt-2 text-gray-600">
                                {producto.descripcion}
                            </p>
                            <div className="mt-4">
                                <span className="text-gray-600">Marca:</span>
                                <span className="ml-2 font-medium">{producto.marca}</span>
                            </div>
                            <div className="mt-4">
                                <span className="text-2xl font-bold text-gray-900">
                                    ${producto.precio.toLocaleString('es-CL')}
                                </span>
                            </div>
                            <div className="mt-6">
                                <div className="flex items-center space-x-4">
                                    <button
                                        onClick={() => setCantidad(prev => Math.max(1, prev - 1))}
                                        className="px-3 py-1 border rounded-md"
                                        disabled={cantidad <= 1}
                                    >
                                        -
                                    </button>
                                    <span className="text-lg font-medium">{cantidad}</span>
                                    <button
                                        onClick={() => setCantidad(prev => Math.min(producto.stock_actual, prev + 1))}
                                        className="px-3 py-1 border rounded-md"
                                        disabled={cantidad >= producto.stock_actual}
                                    >
                                        +
                                    </button>
                                </div>
                                <button
                                    onClick={handleAddToCart}
                                    disabled={producto.stock_actual === 0}
                                    className={`mt-6 w-full py-3 px-6 rounded-md ${
                                        producto.stock_actual === 0
                                            ? 'bg-gray-300 cursor-not-allowed'
                                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                                    }`}
                                >
                                    {producto.stock_actual === 0
                                        ? 'Sin stock'
                                        : 'Agregar al carrito'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DetalleProducto; 