import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { apiService } from '../services/api';
import { Slider } from '@mui/material';
import type { Producto } from '../types/api';
import { useNavigate } from 'react-router-dom';

interface CatalogoPageProps {
    searchTerm?: string;
}

const ProductCard: React.FC<{ product: Producto }> = React.memo(({ product }) => {
  const navigate = useNavigate();
  const [agregandoAlCarrito, setAgregandoAlCarrito] = useState(false);
  const [errorCarrito, setErrorCarrito] = useState<string | null>(null);
  
  const handleImageError = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = "/img/productos/default.jpg";
  }, []);

  const handleAgregarAlCarrito = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setAgregandoAlCarrito(true);
    setErrorCarrito(null);

    try {
      console.log('Intentando agregar al carrito:', product.id_producto);
      const response = await apiService.agregarAlCarrito({
        producto_id: product.id_producto,
        cantidad: 1
      });
      
      console.log('Respuesta al agregar al carrito:', response);
      if (response.status === 'success') {
        // Mostrar notificación de éxito usando un toast o alert más elegante
        alert('¡Producto agregado al carrito exitosamente!');
      } else {
        throw new Error(response.mensaje || 'Error al agregar al carrito');
      }
    } catch (err) {
      console.error('Error al agregar al carrito:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error al agregar al carrito';
      setErrorCarrito(errorMessage);
      // Mostrar el error en un toast o alert más elegante
      alert(`Error: ${errorMessage}`);
    } finally {
      setAgregandoAlCarrito(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="p-4">
        {product.imagen_url && (
          <img
            src={product.imagen_url}
            alt={product.nombre}
            className="w-full h-48 object-contain mb-4"
            onError={handleImageError}
          />
        )}        
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{product.nombre}</h3>
        <div className="text-gray-600 text-sm mb-2">
          <p>Marca: {product.marca}</p>
          <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">
            {product.categoria_nombre}
          </span>
          <p className="text-gray-600 text-sm">Precio: ${product.precio_unitario.toLocaleString()}</p>
        </div>
        <div className="flex flex-col space-y-2">
          <button 
            onClick={() => navigate(`/producto/${product.id_producto}`, { state: { producto: product } })}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
          >
            Ver detalles
          </button>
          <button
            onClick={handleAgregarAlCarrito}
            disabled={agregandoAlCarrito}
            className={`w-full ${
              agregandoAlCarrito 
                ? 'bg-gray-400 cursor-not-allowed' 
                : errorCarrito 
                  ? 'bg-red-600 hover:bg-red-700' 
                  : 'bg-green-600 hover:bg-green-700'
            } text-white py-2 px-4 rounded-md transition-colors`}
          >
            {agregandoAlCarrito 
              ? 'Agregando...' 
              : errorCarrito 
                ? 'Reintentar' 
                : 'Agregar al carrito'
            }
          </button>
          {errorCarrito && (
            <p className="text-red-600 text-xs mt-1 text-center">
              Error al agregar al carrito. Por favor, intente de nuevo.
            </p>
          )}
        </div>
      </div>
    </div>
  );
});

ProductCard.displayName = 'ProductCard';

const CatalogoPage: React.FC<CatalogoPageProps> = ({ searchTerm: initialSearchTerm = '' }) => {
  const [products, setProducts] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [selectedCategory, setSelectedCategory] = useState('todas');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);
  const [maxPossiblePrice, setMaxPossiblePrice] = useState(100000);

  // Actualizar searchTerm cuando cambia initialSearchTerm
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

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  }, []);

  const handleCategoryChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategory(e.target.value);
  }, []);

  // Memoizar las categorías
  const categorias = useMemo(() => 
    ['todas', ...Array.from(new Set(products.map(p => p.categoria_nombre)))],
    [products]
  );

  // Memoizar los productos filtrados
  const filteredProducts = useMemo(() => {
    console.log('Filtering products:', { products, searchTerm, selectedCategory, priceRange });
    const filtered = products.filter(product => {
      const matchesSearch =
        product.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.marca.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory = selectedCategory === 'todas' || product.categoria_nombre === selectedCategory;

      const [minPrice, maxPrice] = priceRange;
      const matchesPrice = 
        product.precio_unitario >= minPrice && 
        product.precio_unitario <= maxPrice;

      return matchesSearch && matchesCategory && matchesPrice;
    });
    console.log('Filtered products:', filtered);
    return filtered;
  }, [products, searchTerm, selectedCategory, priceRange]);

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center p-8 bg-red-50 rounded-lg">
        <div className="text-red-600 text-xl mb-4">⚠️</div>
        <h3 className="text-xl font-semibold mb-2 text-red-700">Error</h3>
        <p className="text-red-600">{error}</p>
        <button 
          onClick={fetchProducts}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
        >
          Reintentar
        </button>
      </div>
    </div>
  );

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
                    onChange={handleSearchChange}
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
                  onChange={handleCategoryChange}
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
                <div className="px-2 pt-1">
                  <Slider
                    value={priceRange}
                    onChange={handlePriceRangeChange}
                    valueLabelDisplay="auto"
                    min={0}
                    max={maxPossiblePrice}
                    sx={{
                      color: '#4F46E5',
                      '& .MuiSlider-thumb': {
                        backgroundColor: '#4F46E5',
                      },
                      '& .MuiSlider-track': {
                        backgroundColor: '#4F46E5',
                      },
                      '& .MuiSlider-rail': {
                        backgroundColor: '#E5E7EB',
                      },
                    }}
                  />
                  <div className="flex justify-between text-sm text-gray-600 mt-2">
                    <span>${priceRange[0].toLocaleString()}</span>
                    <span>${priceRange[1].toLocaleString()}</span>
                  </div>
                </div>
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
