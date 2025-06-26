import React, { useEffect, useState } from 'react';
import { pedidoService, usuarioService } from '../services/api';
import { Pedido, Usuario } from '../types';
import toast from 'react-hot-toast';

const estados = ['PENDIENTE', 'CONFIRMADO', 'ENVIADO', 'ENTREGADO', 'CANCELADO'];

const AdminPedidos: React.FC = () => {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState<number | null>(null);
  const [editEstado, setEditEstado] = useState<string>('');

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [pedRes, usuRes] = await Promise.all([
        pedidoService.obtenerPedidos(),
        usuarioService.obtenerUsuarios(),
      ]);
      setPedidos(pedRes.pedidos);
      setUsuarios(usuRes.usuarios);
    } catch {
      toast.error('Error al cargar pedidos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handleEdit = (pedido: Pedido) => {
    setEditId(pedido.id_pedido);
    // Para obtener el estado actual, habría que obtener el detalle del pedido
    pedidoService.obtenerPedido(pedido.id_pedido).then((p: any) => {
      setEditEstado(p.estado || 'PENDIENTE');
    });
  };

  const handleCancel = () => {
    setEditId(null);
    setEditEstado('');
  };

  const handleSave = async () => {
    if (!editId) return;
    try {
      await pedidoService.actualizarEstadoPedido(editId, editEstado);
      toast.success('Estado actualizado');
      setEditId(null);
      setEditEstado('');
      fetchAll();
    } catch {
      toast.error('Error al actualizar estado');
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Administrar Pedidos</h1>
      {loading ? (
        <div className="text-center">Cargando pedidos...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded shadow">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-4">ID</th>
                <th className="py-2 px-4">Usuario</th>
                <th className="py-2 px-4">Fecha</th>
                <th className="py-2 px-4">Estado</th>
                <th className="py-2 px-4">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {pedidos.map(ped => {
                const usuario = usuarios.find(u => u.id_usuario === ped.id_usuario);
                return (
                  <tr key={ped.id_pedido} className="border-t">
                    <td className="py-2 px-4 text-center">{ped.id_pedido}</td>
                    <td className="py-2 px-4 text-center">{usuario ? usuario.nombre_completo : ped.id_usuario}</td>
                    <td className="py-2 px-4 text-center">{new Date(ped.fecha_pedido).toLocaleString()}</td>
                    <td className="py-2 px-4 text-center">
                      {editId === ped.id_pedido ? (
                        <select
                          value={editEstado}
                          onChange={e => setEditEstado(e.target.value)}
                          className="border rounded px-2 py-1"
                        >
                          {estados.map(e => (
                            <option key={e} value={e}>{e}</option>
                          ))}
                        </select>
                      ) : (
                        <span className="inline-block px-2 py-1 rounded bg-blue-50 text-blue-700 text-xs font-semibold uppercase">{ped.estado || 'PENDIENTE'}</span>
                      )}
                    </td>
                    <td className="py-2 px-4 text-center">
                      {editId === ped.id_pedido ? (
                        <>
                          <button onClick={handleSave} className="bg-green-600 text-white px-3 py-1 rounded mr-2 hover:bg-green-700 transition">Guardar</button>
                          <button onClick={handleCancel} className="bg-gray-300 px-3 py-1 rounded hover:bg-gray-400 transition">Cancelar</button>
                        </>
                      ) : (
                        <button onClick={() => handleEdit(ped)} className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition">Editar estado</button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminPedidos; 