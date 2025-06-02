import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';

export interface Product {
  id_producto: number;
  nombre: string;
  marca: string;
  categoria: string;
  precio_unitario: number;
  stock_actual?: number;
  alerta?: string;
  imagen?: string;
}

const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="p-4">
        {product.imagen && (
          <img
            src={`img/productos/${product.imagen}`}
            alt={product.nombre}
            className="w-full h-48 object-contain mb-4"
            onError={(e) => {
              e.currentTarget.src = "/img/productos/default.jpg";
            }}
          />
        )}        
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{product.nombre}</h3>
        <div className="text-gray-600 text-sm mb-2">
          <p>Marca: {product.marca}</p>
          <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">
            {product.categoria}
          </span>
          <p className="text-gray-600 text-sm">Precio: ${product.precio_unitario}</p>
        </div>
        <button className="w-full mt-4 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors">
          Ver detalles
        </button>
      </div>
    </div>
  );
};

const CatalogoPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('todas');
  const [priceRange, setPriceRange] = useState('todas');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await apiService.getInternalData('/productos');
        setProducts(data);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar productos');
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Generar categorías automáticamente
  const categorias = ['todas', ...Array.from(new Set(products.map(p => p.categoria)))];

  const filteredProducts = products.filter(product => {
    const matchesSearch =
      product.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.marca.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = selectedCategory === 'todas' || product.categoria === selectedCategory;

    let matchesPrice = true;
    const precio = product.precio_unitario;
    if (priceRange === 'bajo') matchesPrice = precio <= 10000;
    else if (priceRange === 'medio') matchesPrice = precio > 10000 && precio <= 30000;
    else if (priceRange === 'alto') matchesPrice = precio > 30000;

    return matchesSearch && matchesCategory && matchesPrice;
  });

  if (loading) return <div className="text-center p-8">Cargando productos...</div>;
  if (error) return <div className="text-center p-8 text-red-600">Error: {error}</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Catálogo de Productos</h1>
          <p className="text-gray-600 text-lg">
            {filteredProducts.length} producto{filteredProducts.length !== 1 ? 's' : ''} encontrado{filteredProducts.length !== 1 ? 's' : ''}
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar - Filtros */}
          <div className="lg:w-1/4">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                <svg className="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                </svg>
                Filtros
              </h3>

              {/* Búsqueda */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Buscar productos</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="¿Qué necesitas?"
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-300"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>

              {/* Categorías */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Categorías</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-300"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  {categorias.map(categoria => (
                    <option key={categoria} value={categoria}>
                      {categoria === 'todas' ? 'Todas las Categorías' : categoria.charAt(0).toUpperCase() + categoria.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Rango de Precios */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Rango de Precios</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-300"
                  value={priceRange}
                  onChange={(e) => setPriceRange(e.target.value)}
                >
                  <option value="todas">Todos los precios</option>
                  <option value="bajo">Hasta $10.000</option>
                  <option value="medio">$10.000 - $30.000</option>
                  <option value="alto">Más de $30.000</option>
                </select>
              </div>

              {/* Stats */}
              <div className="bg-indigo-50 rounded-lg p-4">
                <p className="text-sm text-indigo-700">
                  <span className="font-semibold">{filteredProducts.length}</span> productos encontrados
                </p>
              </div>
            </div>
          </div>

          {/* Grid de productos */}
          <div className="flex-1">
            {filteredProducts.length === 0 ? (
              <div className="text-center py-16 text-gray-600">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold mb-2">No se encontraron productos</h3>
                <p>Prueba con otros términos o ajusta los filtros</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map(product => (
                  <ProductCard key={product.id_producto} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CatalogoPage;
