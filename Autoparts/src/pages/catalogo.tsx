import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';

// Iconos SVG
const FilterIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z" />
  </svg>
);

const XIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const SearchIcon = () => (
  <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

// Tipos de datos
export interface Product {
  id_producto: number;
  nombre: string;
  marca: string;
  categoria: string;
  stock_actual?: number;
  alerta?: string;
}

// Componente ProductCard
const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{product.nombre}</h3>
        <div className="text-gray-600 text-sm mb-2">
          <p>Marca: {product.marca}</p>
          <p>Categoría: {product.categoria}</p>
        </div>
        <div className="flex justify-between items-center">
          {product.stock_actual ? (
            <span className="text-green-600 text-lg font-semibold">
              En stock
            </span>
          ) : (
            <span className="text-red-600 text-lg font-semibold">
              {product.alerta || "Sin stock"}
            </span>
          )}
          <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">
            {product.categoria}
          </span>
        </div>
        <button className="w-full mt-4 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors">
          Ver detalles
        </button>
      </div>
    </div>
  );
};

interface CatalogoPageProps {
  searchTerm: string;
}

const CatalogoPage: React.FC<CatalogoPageProps> = ({ searchTerm }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMarca, setSelectedMarca] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

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

  // Obtener marcas únicas
  const marcas = Array.from(new Set(products.map(p => p.marca)));

  // Filtrar productos
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.marca.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesMarca = selectedMarca === 'all' || product.marca === selectedMarca;

    return matchesSearch && matchesMarca;
  });

  if (loading) return <div className="text-center p-8">Cargando productos...</div>;
  if (error) return <div className="text-center p-8 text-red-600">Error: {error}</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Catálogo de Productos</h1>
            <p className="text-gray-600 mt-2">
              {filteredProducts.length} producto{filteredProducts.length !== 1 ? 's' : ''} encontrado{filteredProducts.length !== 1 ? 's' : ''}
              {searchTerm && ` para "${searchTerm}"`}
            </p>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="md:hidden bg-blue-600 text-white px-4 py-2 rounded-md flex items-center gap-2"
          >
            <FilterIcon />
            Filtros
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar de filtros */}
          <div className={`lg:w-64 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex justify-between items-center mb-4 lg:hidden">
                <h2 className="text-lg font-semibold">Filtros</h2>
                <button
                  onClick={() => setShowFilters(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <XIcon />
                </button>
              </div>
              
              <h2 className="text-lg font-semibold mb-4 hidden lg:block">Filtros</h2>
              
              {/* Filtro por marca */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Marca</h3>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="marca"
                      value="all"
                      checked={selectedMarca === 'all'}
                      onChange={(e) => setSelectedMarca(e.target.value)}
                      className="h-4 w-4 text-blue-600"
                    />
                    <span className="ml-2 text-sm text-gray-700">Todas las marcas</span>
                  </label>
                  {marcas.map((marca) => (
                    <label key={marca} className="flex items-center">
                      <input
                        type="radio"
                        name="marca"
                        value={marca}
                        checked={selectedMarca === marca}
                        onChange={(e) => setSelectedMarca(e.target.value)}
                        className="h-4 w-4 text-blue-600"
                      />
                      <span className="ml-2 text-sm text-gray-700">{marca}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Grid de productos */}
          <div className="flex-1">
            {filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 text-gray-400 mx-auto mb-4">
                  <SearchIcon />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No se encontraron productos
                </h3>
                <p className="text-gray-600">
                  Intenta ajustar tus filtros o términos de búsqueda
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
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