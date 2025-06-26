import React, { useEffect, useState } from 'react';
import { sucursalService } from '../services/api';
import { Sucursal } from '../types';
import toast from 'react-hot-toast';

const AdminSucursales: React.FC = () => {
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState<number | null>(null);
  const [editData, setEditData] = useState<Partial<Sucursal>>({});

  const fetchSucursales = async () => {
    setLoading(true);
    try {
      const { sucursales } = await sucursalService.obtenerSucursales();
      setSucursales(sucursales);
    } catch {
      toast.error('Error al cargar sucursales');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSucursales();
  }, []);

  const handleEdit = (sucursal: Sucursal) => {
    setEditId(sucursal.id_sucursal);
    setEditData({ ...sucursal });
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
    const { nombre, direccion, comuna, region } = editData;
    if (!nombre || !direccion || !comuna || !region) {
      toast.error('Todos los campos son obligatorios');
      return;
    }
    try {
      await sucursalService.actualizarSucursal(editId, { nombre, direccion, comuna, region });
      toast.success('Sucursal actualizada');
      setEditId(null);
      setEditData({});
      fetchSucursales();
    } catch {
      toast.error('Error al actualizar sucursal');
    }
  };

  const handleDelete = async (id: number, nombre: string) => {
    if (!window.confirm(`¿Seguro que deseas eliminar la sucursal "${nombre}"?`)) return;
    try {
      await sucursalService.eliminarSucursal(id);
      toast.success('Sucursal eliminada');
      fetchSucursales();
    } catch {
      toast.error('Error al eliminar sucursal');
    }
  };

  const handleCreate = () => {
    setEditId(-1);
    setEditData({ nombre: '', direccion: '', comuna: '', region: '' });
  };

  const handleSaveCreate = async () => {
    const { nombre, direccion, comuna, region } = editData;
    if (!nombre || !direccion || !comuna || !region) {
      toast.error('Todos los campos son obligatorios');
      return;
    }
    try {
      await sucursalService.crearSucursal({ nombre, direccion, comuna, region });
      toast.success('Sucursal creada');
      setEditId(null);
      setEditData({});
      fetchSucursales();
    } catch {
      toast.error('Error al crear sucursal');
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Administrar Sucursales</h1>
      <div className="flex justify-end mb-4">
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow"
          onClick={handleCreate}
        >
          + Nueva Sucursal
        </button>
      </div>
      {loading ? (
        <div className="text-center">Cargando sucursales...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded shadow">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-4">ID</th>
                <th className="py-2 px-4">Nombre</th>
                <th className="py-2 px-4">Dirección</th>
                <th className="py-2 px-4">Comuna</th>
                <th className="py-2 px-4">Región</th>
                <th className="py-2 px-4">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {editId === -1 && (
                <tr className="border-t bg-yellow-50">
                  <td className="py-2 px-4 text-center">-</td>
                  <td className="py-2 px-4 text-center">
                    <input name="nombre" value={editData.nombre || ''} onChange={handleChange} className="border rounded px-2 py-1 w-32" />
                  </td>
                  <td className="py-2 px-4 text-center">
                    <input name="direccion" value={editData.direccion || ''} onChange={handleChange} className="border rounded px-2 py-1 w-40" />
                  </td>
                  <td className="py-2 px-4 text-center">
                    <input name="comuna" value={editData.comuna || ''} onChange={handleChange} className="border rounded px-2 py-1 w-24" />
                  </td>
                  <td className="py-2 px-4 text-center">
                    <input name="region" value={editData.region || ''} onChange={handleChange} className="border rounded px-2 py-1 w-24" />
                  </td>
                  <td className="py-2 px-4 text-center">
                    <button onClick={handleSaveCreate} className="bg-green-600 text-white px-3 py-1 rounded mr-2 hover:bg-green-700 transition">Guardar</button>
                    <button onClick={handleCancel} className="bg-gray-300 px-3 py-1 rounded hover:bg-gray-400 transition">Cancelar</button>
                  </td>
                </tr>
              )}
              {sucursales.map(suc => (
                <tr key={suc.id_sucursal} className="border-t">
                  <td className="py-2 px-4 text-center">{suc.id_sucursal}</td>
                  <td className="py-2 px-4 text-center">
                    {editId === suc.id_sucursal ? (
                      <input name="nombre" value={editData.nombre || ''} onChange={handleChange} className="border rounded px-2 py-1 w-32" />
                    ) : (
                      suc.nombre
                    )}
                  </td>
                  <td className="py-2 px-4 text-center">
                    {editId === suc.id_sucursal ? (
                      <input name="direccion" value={editData.direccion || ''} onChange={handleChange} className="border rounded px-2 py-1 w-40" />
                    ) : (
                      suc.direccion
                    )}
                  </td>
                  <td className="py-2 px-4 text-center">
                    {editId === suc.id_sucursal ? (
                      <input name="comuna" value={editData.comuna || ''} onChange={handleChange} className="border rounded px-2 py-1 w-24" />
                    ) : (
                      suc.comuna
                    )}
                  </td>
                  <td className="py-2 px-4 text-center">
                    {editId === suc.id_sucursal ? (
                      <input name="region" value={editData.region || ''} onChange={handleChange} className="border rounded px-2 py-1 w-24" />
                    ) : (
                      suc.region
                    )}
                  </td>
                  <td className="py-2 px-4 text-center">
                    {editId === suc.id_sucursal ? (
                      <>
                        <button onClick={handleSave} className="bg-green-600 text-white px-3 py-1 rounded mr-2 hover:bg-green-700 transition">Guardar</button>
                        <button onClick={handleCancel} className="bg-gray-300 px-3 py-1 rounded hover:bg-gray-400 transition">Cancelar</button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => handleEdit(suc)} className="bg-blue-600 text-white px-3 py-1 rounded mr-2 hover:bg-blue-700 transition">Editar</button>
                        <button onClick={() => handleDelete(suc.id_sucursal, suc.nombre)} className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition">Eliminar</button>
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

export default AdminSucursales; 