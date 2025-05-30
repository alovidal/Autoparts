import React, { useState, useEffect } from 'react';
import Filtros from '../components/Filtros';
import ProductList from '../components/ProductList';
import { getProducts } from '../services/api';

interface Product {
  id_producto: number;
  nombre: string;
  marca: string;
  categoria: string;
  stock_actual: number | null;
  alerta: string | null;
  imagen_url: string | null;
}

const Catalogo: React.FC = () => {
  const [productos, setProductos] = useState<Product[]>([]);
  const [marcaSeleccionada, setMarcaSeleccionada] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Obtener lista única de marcas de los productos
  const marcasDisponibles = Array.from(new Set(productos.map(p => p.marca)));

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const data = await getProducts(marcaSeleccionada);
        setProductos(data);
        setError(null);
      } catch (err) {
        setError('Error al cargar los productos');
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [marcaSeleccionada]);

  // Filtrar productos según la marca seleccionada
  const productosFiltrados = marcaSeleccionada
    ? productos.filter(p => p.marca === marcaSeleccionada)
    : productos;

  if (loading) return <div className="text-center p-4">Cargando...</div>;
  if (error) return <div className="text-center text-red-600 p-4">{error}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex gap-8">
        {/* Sidebar con filtros */}
        <div className="w-64 flex-shrink-0">
          <Filtros
            marcaSeleccionada={marcaSeleccionada}
            setMarcaSeleccionada={setMarcaSeleccionada}
            marcasDisponibles={marcasDisponibles}
          />
        </div>

        {/* Lista de productos */}
        <div className="flex-grow">
          <ProductList products={productosFiltrados} />
        </div>
      </div>
    </div>
  );
};

export default Catalogo; 