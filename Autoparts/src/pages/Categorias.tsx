import React, { useEffect, useState } from 'react';
import { categoriaService } from '../services/api';
import { Categoria } from '../types';
import { useNavigate } from 'react-router-dom';

const Categorias: React.FC = () => {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    categoriaService.obtenerCategorias()
      .then(data => setCategorias(data.categorias))
      .catch(() => setError('Error al cargar las categorías'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 text-center">Cargando categorías...</div>;
  if (error) return <div className="p-8 text-center text-red-600">{error}</div>;

  return (
    <div className="max-w-3xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Categorías</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {categorias.map(cat => (
          <button
            key={cat.id_categoria}
            className="bg-white rounded-lg shadow p-6 flex flex-col items-center hover:bg-blue-50 transition cursor-pointer border border-transparent hover:border-blue-400"
            onClick={() => navigate(`/productos?categoria=${cat.id_categoria}`)}
          >
            <span className="text-xl font-semibold mb-2">{cat.nombre}</span>
            <span className="text-gray-500">ID: {cat.id_categoria}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default Categorias; 