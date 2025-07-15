import React, { useState, useEffect } from 'react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { productoService, sucursalService, categoriaService } from '../services/api';
import { ProductoConStock, Sucursal, Categoria, calcularDescuento } from '../types';
import { MagnifyingGlassIcon, FunnelIcon, ShoppingCartIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { useLocation, useNavigate } from 'react-router-dom';

const Products: React.FC = () => {
  const [products, setProducts] = useState<ProductoConStock[]>([]);
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedSucursal, setSelectedSucursal] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<'nombre' | 'precio' | 'marca'>('nombre');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const { addToCart } = useCart();
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Leer query param de categoría
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const cat = params.get('categoria');
    setSelectedCategory(cat ? Number(cat) : null);
  }, [location.search]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Cargando datos...');
      
      // Cargar sucursales, categorías y productos disponibles
      const [sucursalesData, categoriasData, productosData] = await Promise.all([
        sucursalService.obtenerSucursales(),
        categoriaService.obtenerCategorias(),
        fetch('http://localhost:5000/productos/disponibles').then(res => res.json())
      ]);

      console.log('📊 Datos recibidos:', {
        sucursales: sucursalesData.sucursales?.length || 0,
        categorias: categoriasData.categorias?.length || 0,
        productos: productosData.productos?.length || 0
      });

      setSucursales(sucursalesData.sucursales);
      setCategorias(categoriasData.categorias);
      
      // Transformar los datos de productos para que coincidan con la interfaz
      const transformed = productosData.productos.map((item: any) => ({
        id_producto: item.id_producto,
        nombre: item.nombre,
        marca: item.marca || 'Sin marca',
        descripcion: item.descripcion || 'Sin descripción',
        precio_unitario: item.precio_unitario || 0,
        codigo_interno: item.codigo_interno || '',
        codigo_fabricante: item.codigo_fabricante || '',
        id_categoria: item.id_categoria,
        imagen: item.imagen ? '/img/productos/' + item.imagen : '/img/productos/default.jpg',
        stock: item.stock_total,
        sucursal: item.sucursal_principal,
        num_sucursales: item.num_sucursales
      }));
      
      console.log('✅ Productos disponibles:', transformed.length);
      setProducts(transformed);
    } catch (error: any) {
      console.error('❌ Error cargando datos:', error);
      const errorMessage = error.response?.data?.error || 'Error al cargar los productos';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (product: ProductoConStock) => {
    try {
      console.log('🛒 Intentando agregar al carrito:', product);
      
      // Buscar la primera sucursal disponible para este producto
      const sucursalDisponible = sucursales.find(s => s.nombre === product.sucursal) || sucursales[0];
      console.log('📍 Sucursal seleccionada:', sucursalDisponible);
      
      // Calcular precio con descuento si aplica
      const descuento = user?.rol ? calcularDescuento(user.rol, product.precio_unitario) : null;
      const precioFinal = descuento?.precioConDescuento || product.precio_unitario;
      
      const cartData = {
        id_producto: product.id_producto,
        id_sucursal: sucursalDisponible?.id_sucursal || 1,
        cantidad: 1,
        valor_unitario: precioFinal,
        valor_total: precioFinal * 1
      };
      
      console.log('📦 Datos del carrito:', cartData);
      
      const success = await addToCart(cartData);

      if (success) {
        toast.success(`${product.nombre} agregado al carrito`);
      }
    } catch (error: any) {
      console.error('❌ Error agregando al carrito:', error);
      const errorMessage = error.response?.data?.error || 'Error al agregar al carrito';
      toast.error(errorMessage);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.marca.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.codigo_interno.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || product.id_categoria === selectedCategory;
    const matchesSucursal = !selectedSucursal || product.sucursal.includes(sucursales.find(s => s.id_sucursal === selectedSucursal)?.nombre || '');
    
    return matchesSearch && matchesCategory && matchesSucursal;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    let aValue: string | number;
    let bValue: string | number;

    switch (sortBy) {
      case 'nombre':
        aValue = a.nombre;
        bValue = b.nombre;
        break;
      case 'precio':
        aValue = a.precio_unitario;
        bValue = b.precio_unitario;
        break;
      case 'marca':
        aValue = a.marca;
        bValue = b.marca;
        break;
      default:
        aValue = a.nombre;
        bValue = b.nombre;
    }

    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const formatPrice = (price: number, showDiscount = true) => {
    const formattedPrice = new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(price);
    
    if (showDiscount && user?.rol) {
      const descuento = calcularDescuento(user.rol, price);
      if (descuento.porcentajeDescuento > 0) {
        return {
          original: formattedPrice,
          conDescuento: new Intl.NumberFormat('es-CL', {
            style: 'currency',
            currency: 'CLP'
          }).format(descuento.precioConDescuento),
          porcentaje: descuento.porcentajeDescuento
        };
      }
    }
    
    return { original: formattedPrice };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando productos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error al cargar productos</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadData}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Intentar de nuevo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Productos</h1>
          <p className="text-gray-600">Encuentra las mejores partes para tu vehículo</p>
        </div>

        {/* Filtros y búsqueda */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Búsqueda */}
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar productos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Filtro por categoría */}
            <select
              value={selectedCategory || ''}
              onChange={(e) => setSelectedCategory(e.target.value ? Number(e.target.value) : null)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Todas las categorías</option>
              {categorias.map(categoria => (
                <option key={categoria.id_categoria} value={categoria.id_categoria}>
                  {categoria.nombre}
                </option>
              ))}
            </select>

            {/* Filtro por sucursal */}
            <select
              value={selectedSucursal || ''}
              onChange={(e) => setSelectedSucursal(e.target.value ? Number(e.target.value) : null)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Todas las sucursales</option>
              {sucursales.map(sucursal => (
                <option key={sucursal.id_sucursal} value={sucursal.id_sucursal}>
                  {sucursal.nombre}
                </option>
              ))}
            </select>

            {/* Ordenamiento */}
            <div className="flex gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'nombre' | 'precio' | 'marca')}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="nombre">Nombre</option>
                <option value="precio">Precio</option>
                <option value="marca">Marca</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </button>
            </div>
          </div>
        </div>

        {/* Resultados */}
        <div className="mb-4">
          <p className="text-gray-600">
            {sortedProducts.length} producto{sortedProducts.length !== 1 ? 's' : ''} encontrado{sortedProducts.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Grid de productos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sortedProducts.map(product => (
            <div key={product.id_producto} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              {/* Imagen del producto */}
              <div className="aspect-w-1 aspect-h-1 w-full">
                <img
                  src={product.imagen}
                  alt={product.nombre}
                  className="w-full h-48 object-cover"
                  onError={e => { e.currentTarget.src = '/img/productos/default.jpg'; }}
                />
              </div>

              {/* Información del producto */}
              <div className="p-4">
                <div className="mb-2">
                  <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                    {product.marca}
                  </span>
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                  {product.nombre}
                </h3>
                
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {product.descripcion}
                </p>

                <div className="flex items-center justify-between mb-3">
                  <div className="flex flex-col">
                    {(() => {
                      const precio = formatPrice(product.precio_unitario);
                      return (
                        <>
                          {precio.conDescuento ? (
                            <>
                              <span className="text-lg font-bold text-gray-900">
                                {precio.conDescuento}
                              </span>
                              <span className="text-sm text-gray-500 line-through">
                                {precio.original}
                              </span>
                              <span className="text-xs text-green-600 font-semibold">
                                -{precio.porcentaje}% descuento
                              </span>
                            </>
                          ) : (
                            <span className="text-2xl font-bold text-gray-900">
                              {precio.original}
                            </span>
                          )}
                        </>
                      );
                    })()}
                  </div>
                  <span className={`text-sm px-2 py-1 rounded-full ${
                    product.stock > 10 ? 'bg-green-100 text-green-800' :
                    product.stock > 0 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {product.stock > 0 ? `${product.stock} en stock` : 'Sin stock'}
                  </span>
                </div>

                <div className="text-xs text-gray-500 mb-3">
                  <p>Disponible en {(product as any).num_sucursales || 1} sucursal{((product as any).num_sucursales || 1) > 1 ? 'es' : ''}</p>
                  <p>Código: {product.codigo_interno}</p>
                </div>

                <button
                  onClick={() => handleAddToCart(product)}
                  disabled={product.stock === 0}
                  className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ShoppingCartIcon className="h-4 w-4 mr-2" />
                  {product.stock === 0 ? 'Sin stock' : 'Agregar al carrito'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Mensaje cuando no hay productos */}
        {sortedProducts.length === 0 && (
          <div className="text-center py-12">
            <FunnelIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No se encontraron productos</h3>
            <p className="mt-1 text-sm text-gray-500">
              {products.length === 0 
                ? 'No hay productos disponibles en el catálogo.' 
                : 'Intenta ajustar los filtros de búsqueda.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Products; 