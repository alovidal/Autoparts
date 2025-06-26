import React, { useEffect, useState } from 'react';
import { subcategoriaService, categoriaService } from '../services/api';
import { Subcategoria, Categoria } from '../types';
import toast from 'react-hot-toast';

const AdminSubcategorias: React.FC = () => {
  const [subcategorias, setSubcategorias] = useState<Subcategoria[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState<number | null>(null);
  const [editData, setEditData] = useState<Partial<Subcategoria>>({});

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [subRes, catRes] = await Promise.all([
        subcategoriaService.obtenerSubcategorias(),
        categoriaService.obtenerCategorias(),
      ]);
      setSubcategorias(subRes.subcategorias);
      setCategorias(catRes.categorias);
    } catch {
      toast.error('Error al cargar subcategorías');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handleEdit = (sub: Subcategoria) => {
    setEditId(sub.id_subcategoria);
    setEditData({ id_categoria: sub.id_categoria, nombre: sub.nombre });
  };

  const handleCancel = () => {
    setEditId(null);
    setEditData({});
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    if (!editId) return;
    if (!editData.nombre || !editData.id_categoria) {
      toast.error('Todos los campos son obligatorios');
      return;
    }
    try {
      await subcategoriaService.actualizarSubcategoria(editId, { id_categoria: Number(editData.id_categoria), nombre: editData.nombre });
      toast.success('Subcategoría actualizada');
      setEditId(null);
      setEditData({});
      fetchAll();
    } catch {
      toast.error('Error al actualizar subcategoría');
    }
  };

  const handleDelete = async (id: number, nombre: string) => {
    if (!window.confirm(`¿Seguro que deseas eliminar la subcategoría "${nombre}"?`)) return;
    try {
      await subcategoriaService.eliminarSubcategoria(id);
      toast.success('Subcategoría eliminada');
      fetchAll();
    } catch {
      toast.error('Error al eliminar subcategoría');
    }
  };

  const handleCreate = () => {
    setEditId(-1);
    setEditData({ id_categoria: categorias[0]?.id_categoria || 1, nombre: '' });
  };

  const handleSaveCreate = async () => {
    if (!editData.nombre || !editData.id_categoria) {
      toast.error('Todos los campos son obligatorios');
      return;
    }
    try {
      await subcategoriaService.crearSubcategoria({ id_categoria: Number(editData.id_categoria), nombre: editData.nombre });
      toast.success('Subcategoría creada');
      setEditId(null);
      setEditData({});
      fetchAll();
    } catch {
      toast.error('Error al crear subcategoría');
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Administrar Subcategorías</h1>
      <div className="flex justify-end mb-4">
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow"
          onClick={handleCreate}
        >
          + Nueva Subcategoría
        </button>
      </div>
      {loading ? (
        <div className="text-center">Cargando subcategorías...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded shadow">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-4">ID</th>
                <th className="py-2 px-4">Categoría</th>
                <th className="py-2 px-4">Nombre</th>
                <th className="py-2 px-4">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {editId === -1 && (
                <tr className="border-t bg-yellow-50">
                  <td className="py-2 px-4 text-center">-</td>
                  <td className="py-2 px-4 text-center">
                    <select name="id_categoria" value={editData.id_categoria || ''} onChange={handleChange} className="border rounded px-2 py-1">
                      {categorias.map(cat => (
                        <option key={cat.id_categoria} value={cat.id_categoria}>{cat.nombre}</option>
                      ))}
                    </select>
                  </td>
                  <td className="py-2 px-4 text-center">
                    <input name="nombre" value={editData.nombre || ''} onChange={handleChange} className="border rounded px-2 py-1 w-48" />
                  </td>
                  <td className="py-2 px-4 text-center">
                    <button onClick={handleSaveCreate} className="bg-green-600 text-white px-3 py-1 rounded mr-2 hover:bg-green-700 transition">Guardar</button>
                    <button onClick={handleCancel} className="bg-gray-300 px-3 py-1 rounded hover:bg-gray-400 transition">Cancelar</button>
                  </td>
                </tr>
              )}
              {subcategorias.map(sub => (
                <tr key={sub.id_subcategoria} className="border-t">
                  <td className="py-2 px-4 text-center">{sub.id_subcategoria}</td>
                  <td className="py-2 px-4 text-center">
                    {editId === sub.id_subcategoria ? (
                      <select name="id_categoria" value={editData.id_categoria || ''} onChange={handleChange} className="border rounded px-2 py-1">
                        {categorias.map(cat => (
                          <option key={cat.id_categoria} value={cat.id_categoria}>{cat.nombre}</option>
                        ))}
                      </select>
                    ) : (
                      categorias.find(c => c.id_categoria === sub.id_categoria)?.nombre || sub.id_categoria
                    )}
                  </td>
                  <td className="py-2 px-4 text-center">
                    {editId === sub.id_subcategoria ? (
                      <input name="nombre" value={editData.nombre || ''} onChange={handleChange} className="border rounded px-2 py-1 w-48" />
                    ) : (
                      sub.nombre
                    )}
                  </td>
                  <td className="py-2 px-4 text-center">
                    {editId === sub.id_subcategoria ? (
                      <>
                        <button onClick={handleSave} className="bg-green-600 text-white px-3 py-1 rounded mr-2 hover:bg-green-700 transition">Guardar</button>
                        <button onClick={handleCancel} className="bg-gray-300 px-3 py-1 rounded hover:bg-gray-400 transition">Cancelar</button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => handleEdit(sub)} className="bg-blue-600 text-white px-3 py-1 rounded mr-2 hover:bg-blue-700 transition">Editar</button>
                        <button onClick={() => handleDelete(sub.id_subcategoria, sub.nombre)} className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition">Eliminar</button>
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

export default AdminSubcategorias; 