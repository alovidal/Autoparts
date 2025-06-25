import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { apiService } from '../services/api';
import type { Producto } from '../types/api';

interface CatalogoPageProps {
    searchTerm?: string;
}

const CatalogoPage: React.FC<CatalogoPageProps> = ({ searchTerm: initialSearchTerm = '' }) => {
    const [products, setProducts] = useState<Producto[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
    const [selectedCategory, setSelectedCategory] = useState('todas');
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);
    const [maxPossiblePrice, setMaxPossiblePrice] = useState(100000);
    const navigate = useNavigate();
    const { addToCart } = useCart();

    useEffect(() => {
        setSearchTerm(initialSearchTerm);
    }, [initialSearchTerm]);

    const fetchProducts = useCallback(async () => {
        try {
            console.log('Fetching products...');
            const data = await apiService.getProductos();
            console.log('Raw API response:', data);

            if (data.status === 'success' && Array.isArray(data.productos)) {
                console.log('Setting products:', data.productos);
                setProducts(data.productos);
                
                if (data.productos.length > 0) {
                    const maxPrice = Math.max(...data.productos.map(p => p.precio_unitario));
                    console.log('Setting max price:', maxPrice);
                    setMaxPossiblePrice(maxPrice);
                    setPriceRange([0, maxPrice]);
                }
            } else {
                console.error('Invalid products data:', data);
                throw new Error(data.message || 'Error al cargar productos: formato de datos inválido');
            }
        } catch (err) {
            console.error('Error fetching products:', err);
            setError(err instanceof Error ? err.message : 'Error al cargar productos');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const handlePriceRangeChange = useCallback((event: Event, newValue: number | number[]) => {
        setPriceRange(newValue as [number, number]);
    }, []);

    const handleAddToCart = (product: Producto) => {
        addToCart({
            id_producto: product.id_producto,
            nombre: product.nombre,
            precio_unitario: product.precio_unitario,
            cantidad: 1,
            imagen_url: product.imagen_url,
            stock_actual: product.stock_actual
        });
    };

    const filteredProducts = products.filter(product => {
        const matchesSearch = product.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            product.descripcion.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'todas' || product.categoria_nombre === selectedCategory;
        const matchesPrice = product.precio_unitario >= priceRange[0] && product.precio_unitario <= priceRange[1];
        return matchesSearch && matchesCategory && matchesPrice;
    });

    const categories = ['todas', ...new Set(products.map(p => p.categoria_nombre))];

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                    <strong className="font-bold">Error:</strong>
                    <span className="block sm:inline"> {error}</span>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Filtros */}
            <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <input
                        type="text"
                        placeholder="Buscar productos..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <div>
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        {categories.map(category => (
                            <option key={category} value={category}>
                                {category.charAt(0).toUpperCase() + category.slice(1)}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-600">
                        ${priceRange[0].toLocaleString('es-CL')}
                    </span>
                    <input
                        type="range"
                        min={0}
                        max={maxPossiblePrice}
                        value={priceRange[0]}
                        onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                        className="flex-1"
                    />
                    <input
                        type="range"
                        min={0}
                        max={maxPossiblePrice}
                        value={priceRange[1]}
                        onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                        className="flex-1"
                    />
                    <span className="text-sm text-gray-600">
                        ${priceRange[1].toLocaleString('es-CL')}
                    </span>
                </div>
            </div>

            {/* Lista de productos */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map(product => (
                    <div key={product.id_producto} className="bg-white rounded-lg shadow-md overflow-hidden">
                        <img
                            src={product.imagen_url || 'https://via.placeholder.com/300'}
                            alt={product.nombre}
                            className="w-full h-48 object-cover"
                            onClick={() => navigate(`/producto/${product.id_producto}`)}
                            style={{ cursor: 'pointer' }}
                        />
                        <div className="p-4">
                            <h3 className="text-lg font-semibold mb-2">{product.nombre}</h3>
                            <p className="text-gray-600 text-sm mb-2">{product.descripcion}</p>
                            <div className="flex justify-between items-center">
                                <span className="text-lg font-bold text-blue-600">
                                    ${product.precio_unitario.toLocaleString('es-CL')}
                                </span>
                                <button
                                    onClick={() => handleAddToCart(product)}
                                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                                >
                                    Agregar al carrito
                                </button>
                            </div>
                            {product.stock_actual !== undefined && product.stock_actual < (product.stock_min || 5) && (
                                <p className="text-red-500 text-sm mt-2">¡Últimas unidades!</p>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {filteredProducts.length === 0 && (
                <div className="text-center py-8">
                    <p className="text-gray-500">No se encontraron productos que coincidan con los filtros seleccionados.</p>
                </div>
            )}
        </div>
    );
};

export default CatalogoPage; 