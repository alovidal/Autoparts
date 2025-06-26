import React, { useEffect, useState } from 'react';
import { usuarioService } from '../services/api';
import { Usuario } from '../types';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

const roles = ['CLIENTE', 'DISTRIBUIDOR', 'BODEGUERO', 'ADMIN'];

const AdminUsuarios: React.FC = () => {
  const { user } = useAuth();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState<number | null>(null);
  const [editData, setEditData] = useState<Partial<Usuario>>({});

  useEffect(() => {
    if (!user || user.rol !== 'ADMIN') return;
    fetchUsuarios();
    // eslint-disable-next-line
  }, [user]);

  const fetchUsuarios = async () => {
    setLoading(true);
    try {
      const { usuarios } = await usuarioService.obtenerUsuarios();
      setUsuarios(usuarios);
    } catch {
      toast.error('Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (usuario: Usuario) => {
    setEditId(usuario.id_usuario);
    setEditData({ ...usuario });
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
    try {
      await usuarioService.actualizarUsuario(editId, editData);
      toast.success('Usuario actualizado');
      setEditId(null);
      setEditData({});
      fetchUsuarios();
    } catch {
      toast.error('Error al actualizar usuario');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Seguro que deseas eliminar este usuario?')) return;
    try {
      await usuarioService.eliminarUsuario(id);
      toast.success('Usuario eliminado');
      fetchUsuarios();
    } catch {
      toast.error('Error al eliminar usuario');
    }
  };

  if (!user || user.rol !== 'ADMIN') {
    return <div className="max-w-xl mx-auto py-16 text-center text-red-600 text-xl font-semibold">Acceso denegado. Solo administradores pueden ver esta página.</div>;
  }

  return (
    <div className="max-w-5xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Administrar Usuarios</h1>
      {loading ? (
        <div className="text-center">Cargando usuarios...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded shadow">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-4">ID</th>
                <th className="py-2 px-4">RUT</th>
                <th className="py-2 px-4">Nombre</th>
                <th className="py-2 px-4">Correo</th>
                <th className="py-2 px-4">Rol</th>
                <th className="py-2 px-4">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map(u => (
                <tr key={u.id_usuario} className="border-t">
                  <td className="py-2 px-4 text-center">{u.id_usuario}</td>
                  <td className="py-2 px-4 text-center">{u.rut}</td>
                  <td className="py-2 px-4 text-center">
                    {editId === u.id_usuario ? (
                      <input
                        name="nombre_completo"
                        value={editData.nombre_completo || ''}
                        onChange={handleChange}
                        className="border rounded px-2 py-1 w-40"
                      />
                    ) : (
                      u.nombre_completo
                    )}
                  </td>
                  <td className="py-2 px-4 text-center">
                    {editId === u.id_usuario ? (
                      <input
                        name="correo"
                        value={editData.correo || ''}
                        onChange={handleChange}
                        className="border rounded px-2 py-1 w-48"
                      />
                    ) : (
                      u.correo
                    )}
                  </td>
                  <td className="py-2 px-4 text-center">
                    {editId === u.id_usuario ? (
                      <select
                        name="rol"
                        value={editData.rol || 'CLIENTE'}
                        onChange={handleChange}
                        className="border rounded px-2 py-1"
                      >
                        {roles.map(r => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </select>
                    ) : (
                      <span className="inline-block px-2 py-1 rounded bg-blue-50 text-blue-700 text-xs font-semibold uppercase">{u.rol}</span>
                    )}
                  </td>
                  <td className="py-2 px-4 text-center">
                    {editId === u.id_usuario ? (
                      <>
                        <button onClick={handleSave} className="bg-green-600 text-white px-3 py-1 rounded mr-2 hover:bg-green-700 transition">Guardar</button>
                        <button onClick={handleCancel} className="bg-gray-300 px-3 py-1 rounded hover:bg-gray-400 transition">Cancelar</button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => handleEdit(u)} className="bg-blue-600 text-white px-3 py-1 rounded mr-2 hover:bg-blue-700 transition">Editar</button>
                        <button onClick={() => handleDelete(u.id_usuario)} className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition">Eliminar</button>
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

export default AdminUsuarios; 