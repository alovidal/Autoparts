import { useState, useEffect } from 'react';
import { apiService } from '../services/api';

interface Product {
    id_producto: number;
    nombre: string;
    marca: string;
    stock_actual: number;
    alerta?: string;
}

export const ProductList = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                console.log('Iniciando petición a la API...');
                const data = await apiService.getInternalData('/productos');
                console.log('Datos recibidos:', data);
                setProducts(data);
                setLoading(false);
            } catch (err) {
                console.error('Error al cargar productos:', err);
                setError(err instanceof Error ? err.message : 'Error al cargar productos');
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    if (loading) return <div className="text-center p-4">Cargando productos...</div>;
    if (error) return <div className="text-center p-4 text-red-600">Error: {error}</div>;
    if (products.length === 0) return <div className="text-center p-4">No hay productos disponibles</div>;

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Lista de Productos</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map((product) => (
                    <div key={product.id_producto} className="border rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow">
                        <h2 className="text-xl font-bold">{product.nombre}</h2>
                        <p className="text-gray-600">Marca: {product.marca}</p>
                        <div className={`mt-2 ${product.alerta ? 'text-red-600' : 'text-green-600'}`}>
                            <p className="text-lg font-semibold">
                                Stock: {product.stock_actual}
                            </p>
                            {product.alerta && (
                                <p className="text-sm mt-1">{product.alerta}</p>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}; 