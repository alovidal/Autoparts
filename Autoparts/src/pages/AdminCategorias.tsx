import React, { useEffect, useState } from 'react';
import { categoriaService } from '../services/api';
import { Categoria } from '../types';
import toast from 'react-hot-toast';

const AdminCategorias: React.FC = () => {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState<number | null>(null);
  const [editData, setEditData] = useState<Partial<Categoria>>({});

  const fetchCategorias = async () => {
    setLoading(true);
    try {
      const { categorias } = await categoriaService.obtenerCategorias();
      setCategorias(categorias);
    } catch {
      toast.error('Error al cargar categorías');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategorias();
  }, []);

  const handleEdit = (categoria: Categoria) => {
    setEditId(categoria.id_categoria);
    setEditData({ nombre: categoria.nombre });
  };

  const handleCancel = () => {
    setEditId(null);
    setEditData({});
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    if (!editId) return;
    if (!editData.nombre) {
      toast.error('El nombre es obligatorio');
      return;
    }
    try {
      await categoriaService.actualizarCategoria(editId, { nombre: editData.nombre });
      toast.success('Categoría actualizada');
      setEditId(null);
      setEditData({});
      fetchCategorias();
    } catch {
      toast.error('Error al actualizar categoría');
    }
  };

  const handleDelete = async (id: number, nombre: string) => {
    if (!window.confirm(`¿Seguro que deseas eliminar la categoría "${nombre}"?`)) return;
    try {
      await categoriaService.eliminarCategoria(id);
      toast.success('Categoría eliminada');
      fetchCategorias();
    } catch {
      toast.error('Error al eliminar categoría');
    }
  };

  const handleCreate = () => {
    setEditId(-1);
    setEditData({ nombre: '' });
  };

  const handleSaveCreate = async () => {
    if (!editData.nombre) {
      toast.error('El nombre es obligatorio');
      return;
    }
    try {
      await categoriaService.crearCategoria({ nombre: editData.nombre });
      toast.success('Categoría creada');
      setEditId(null);
      setEditData({});
      fetchCategorias();
    } catch {
      toast.error('Error al crear categoría');
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Administrar Categorías</h1>
      <div className="flex justify-end mb-4">
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow"
          onClick={handleCreate}
        >
          + Nueva Categoría
        </button>
      </div>
      {loading ? (
        <div className="text-center">Cargando categorías...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded shadow">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-4">ID</th>
                <th className="py-2 px-4">Nombre</th>
                <th className="py-2 px-4">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {editId === -1 && (
                <tr className="border-t bg-yellow-50">
                  <td className="py-2 px-4 text-center">-</td>
                  <td className="py-2 px-4 text-center">
                    <input name="nombre" value={editData.nombre || ''} onChange={handleChange} className="border rounded px-2 py-1 w-48" />
                  </td>
                  <td className="py-2 px-4 text-center">
                    <button onClick={handleSaveCreate} className="bg-green-600 text-white px-3 py-1 rounded mr-2 hover:bg-green-700 transition">Guardar</button>
                    <button onClick={handleCancel} className="bg-gray-300 px-3 py-1 rounded hover:bg-gray-400 transition">Cancelar</button>
                  </td>
                </tr>
              )}
              {categorias.map(cat => (
                <tr key={cat.id_categoria} className="border-t">
                  <td className="py-2 px-4 text-center">{cat.id_categoria}</td>
                  <td className="py-2 px-4 text-center">
                    {editId === cat.id_categoria ? (
                      <input name="nombre" value={editData.nombre || ''} onChange={handleChange} className="border rounded px-2 py-1 w-48" />
                    ) : (
                      cat.nombre
                    )}
                  </td>
                  <td className="py-2 px-4 text-center">
                    {editId === cat.id_categoria ? (
                      <>
                        <button onClick={handleSave} className="bg-green-600 text-white px-3 py-1 rounded mr-2 hover:bg-green-700 transition">Guardar</button>
                        <button onClick={handleCancel} className="bg-gray-300 px-3 py-1 rounded hover:bg-gray-400 transition">Cancelar</button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => handleEdit(cat)} className="bg-blue-600 text-white px-3 py-1 rounded mr-2 hover:bg-blue-700 transition">Editar</button>
                        <button onClick={() => handleDelete(cat.id_categoria, cat.nombre)} className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition">Eliminar</button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminCategorias; 