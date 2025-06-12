import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { apiService } from '../services/api';
import type { Producto } from '../types/api';

const DetalleProducto: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const productoFromState = location.state?.producto as Producto | undefined;
  
  const [producto, setProducto] = useState<Producto | null>(productoFromState || null);
  const [loading, setLoading] = useState(!productoFromState);
  const [error, setError] = useState<string | null>(null);
  const [agregandoAlCarrito, setAgregandoAlCarrito] = useState(false);
  const [errorCarrito, setErrorCarrito] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducto = async () => {
      // Si ya tenemos el producto del estado de navegación, no necesitamos cargarlo
      if (productoFromState) {
        console.log('Usando producto del estado de navegación:', productoFromState);
        return;
      }

      try {
        console.log('Intentando cargar producto con ID:', id);
        if (!id) {
          throw new Error('ID de producto no proporcionado');
        }

        const response = await apiService.getProducto(parseInt(id));
        console.log('Respuesta del servidor:', response);

        if (response.status === 'error') {
          throw new Error(response.message || 'Error al cargar el producto');
        }

        if (!response.producto) {
          throw new Error('Producto no encontrado');
        }

        console.log('Producto cargado exitosamente:', response.producto);
        setProducto(response.producto);
      } catch (err) {
        console.error('Error al cargar el producto:', err);
        setError(err instanceof Error ? err.message : 'Error al cargar el producto');
      } finally {
        setLoading(false);
      }
    };

    fetchProducto();
  }, [id, productoFromState]);

  const handleAgregarAlCarrito = async () => {
    if (!producto) return;
    
    setAgregandoAlCarrito(true);
    setErrorCarrito(null);

    try {
      console.log('Intentando agregar al carrito:', producto.id_producto);
      const response = await apiService.agregarAlCarrito({
        producto_id: producto.id_producto,
        cantidad: 1
      });
      
      console.log('Respuesta al agregar al carrito:', response);
      if (response.status === 'success') {
        alert('¡Producto agregado al carrito exitosamente!');
      } else {
        throw new Error(response.mensaje || 'Error al agregar al carrito');
      }
    } catch (err) {
      console.error('Error al agregar al carrito:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error al agregar al carrito';
      setErrorCarrito(errorMessage);
      alert(`Error: ${errorMessage}`);
    } finally {
      setAgregandoAlCarrito(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando producto...</p>
        </div>
      </div>
    );
  }

  if (error || !producto) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md w-full">
          <div className="text-red-600 text-5xl mb-4">⚠️</div>
          <h3 className="text-xl font-semibold mb-2 text-gray-800">Error</h3>
          <p className="text-gray-600 mb-6">{error || 'Producto no encontrado'}</p>
          <button 
            onClick={() => navigate('/catalogo')}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 transition-colors duration-200"
          >
            Volver al catálogo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="md:flex">
          <div className="md:flex-shrink-0 md:w-1/2">
            <img
              className="h-96 w-full object-contain md:object-cover"
              src={producto.imagen_url || "/img/productos/default.jpg"}
              alt={producto.nombre}
              onError={(e) => {
                console.log('Error al cargar imagen, usando imagen por defecto');
                (e.target as HTMLImageElement).src = "/img/productos/default.jpg";
              }}
            />
          </div>
          <div className="p-8 md:w-1/2">
            <div className="uppercase tracking-wide text-sm text-indigo-500 font-semibold">
              {producto.categoria_nombre}
            </div>
            <h1 className="mt-2 text-3xl font-bold text-gray-900">
              {producto.nombre}
            </h1>
            <p className="mt-4 text-xl text-gray-900">
              ${producto.precio_unitario.toLocaleString()}
            </p>
            <div className="mt-4">
              <span className="text-gray-600 font-medium">Marca: </span>
              <span className="text-gray-800">{producto.marca}</span>
            </div>
            <div className="mt-2">
              <span className="text-gray-600 font-medium">Código: </span>
              <span className="text-gray-800">{producto.codigo_interno || producto.codigo_fabricante}</span>
            </div>
            {producto.descripcion && (
              <p className="mt-4 text-gray-600">
                {producto.descripcion}
              </p>
            )}
            <div className="mt-8 space-y-4">
              <button
                onClick={handleAgregarAlCarrito}
                disabled={agregandoAlCarrito}
                className={`w-full ${
                  agregandoAlCarrito 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : errorCarrito 
                      ? 'bg-red-600 hover:bg-red-700' 
                      : 'bg-blue-600 hover:bg-blue-700'
                } text-white py-3 px-4 rounded-md transition-colors`}
              >
                {agregandoAlCarrito 
                  ? 'Agregando al carrito...' 
                  : errorCarrito 
                    ? 'Reintentar agregar al carrito' 
                    : 'Agregar al carrito'
                }
              </button>
              {errorCarrito && (
                <p className="text-red-600 text-sm text-center">
                  {errorCarrito}
                </p>
              )}
              <button
                onClick={() => navigate('/catalogo')}
                className="w-full bg-gray-200 text-gray-800 py-3 px-4 rounded-md hover:bg-gray-300 transition-colors"
              >
                Volver al catálogo
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetalleProducto; 