import { useState, useEffect } from 'react';
import { ProductService } from '../services/products';
import type { Product } from '../types/product';

export const ProductList = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                console.log('Iniciando petición a la API...');
                const data = await ProductService.getProducts();
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
            {products.map((product) => (
                <div key={product.id} className="bg-white rounded-lg shadow-md p-4">
                    <img
                        src={product.imagen}
                        alt={product.nombre}
                        className="w-full h-48 object-cover rounded-t-lg"
                    />
                    <div className="p-4">
                        <h3 className="text-lg font-semibold">{product.nombre}</h3>
                        <p className="text-gray-600">{product.marca}</p>
                        <p className="text-gray-500">{product.categoria}</p>
                        <div className="mt-2">
                            <span className="text-lg font-bold">${product.precio.toFixed(2)}</span>
                            {product.stock > 0 ? (
                                <span className="ml-2 text-green-600">En stock: {product.stock}</span>
                            ) : (
                                <span className="ml-2 text-red-600">Sin stock</span>
                            )}
                        </div>
                        {product.alerta && (
                            <div className="mt-2 text-yellow-600">
                                ⚠️ {product.alerta}
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}; 