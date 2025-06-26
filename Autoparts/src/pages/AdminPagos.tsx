import React, { useEffect, useState } from 'react';
import { pagoService, pedidoService, usuarioService } from '../services/api';
import { Pago, Pedido, Usuario } from '../types';
import toast from 'react-hot-toast';

const metodos = ['WEBPAY', 'MERCADOPAGO', 'TRANSFERENCIA'];
const estados = ['PENDIENTE', 'PAGADO', 'FALLIDO'];

const AdminPagos: React.FC = () => {
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState<number | null>(null);
  const [editData, setEditData] = useState<Partial<Pago>>({});

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [pagRes, pedRes, usuRes] = await Promise.all([
        pagoService.obtenerPagos(),
        pedidoService.obtenerPedidos(),
        usuarioService.obtenerUsuarios(),
      ]);
      setPagos(pagRes.pagos);
      setPedidos(pedRes.pedidos);
      setUsuarios(usuRes.usuarios);
    } catch {
      toast.error('Error al cargar pagos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handleEdit = (pago: Pago) => {
    setEditId(pago.id_pago);
    setEditData({
      estado_pago: pago.estado_pago,
      metodo_pago: pago.metodo_pago,
      monto_total: pago.monto_total,
    });
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
      await pagoService.actualizarPago(editId, editData);
      toast.success('Pago actualizado');
      setEditId(null);
      setEditData({});
      fetchAll();
    } catch {
      toast.error('Error al actualizar pago');
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Administrar Pagos</h1>
      {loading ? (
        <div className="text-center">Cargando pagos...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded shadow">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-4">ID</th>
                <th className="py-2 px-4">Pedido</th>
                <th className="py-2 px-4">Usuario</th>
                <th className="py-2 px-4">Monto</th>
                <th className="py-2 px-4">Método</th>
                <th className="py-2 px-4">Estado</th>
                <th className="py-2 px-4">Fecha</th>
                <th className="py-2 px-4">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {pagos.map(pago => {
                const pedido = pedidos.find(p => p.id_pedido === pago.id_pedido);
                const usuario = pedido ? usuarios.find(u => u.id_usuario === pedido.id_usuario) : undefined;
                return (
                  <tr key={pago.id_pago} className="border-t">
                    <td className="py-2 px-4 text-center">{pago.id_pago}</td>
                    <td className="py-2 px-4 text-center">{pago.id_pedido}</td>
                    <td className="py-2 px-4 text-center">{usuario ? usuario.nombre_completo : '-'}</td>
                    <td className="py-2 px-4 text-center">
                      {editId === pago.id_pago ? (
                        <input
                          name="monto_total"
                          type="number"
                          value={editData.monto_total ?? pago.monto_total}
                          onChange={handleChange}
                          className="border rounded px-2 py-1 w-24"
                          min={0}
                        />
                      ) : (
                        `$${pago.monto_total.toLocaleString()}`
                      )}
                    </td>
                    <td className="py-2 px-4 text-center">
                      {editId === pago.id_pago ? (
                        <select
                          name="metodo_pago"
                          value={editData.metodo_pago || pago.metodo_pago}
                          onChange={handleChange}
                          className="border rounded px-2 py-1"
                        >
                          {metodos.map(m => (
                            <option key={m} value={m}>{m}</option>
                          ))}
                        </select>
                      ) : (
                        <span className="inline-block px-2 py-1 rounded bg-blue-50 text-blue-700 text-xs font-semibold uppercase">{pago.metodo_pago}</span>
                      )}
                    </td>
                    <td className="py-2 px-4 text-center">
                      {editId === pago.id_pago ? (
                        <select
                          name="estado_pago"
                          value={editData.estado_pago || pago.estado_pago}
                          onChange={handleChange}
                          className="border rounded px-2 py-1"
                        >
                          {estados.map(e => (
                            <option key={e} value={e}>{e}</option>
                          ))}
                        </select>
                      ) : (
                        <span className="inline-block px-2 py-1 rounded bg-blue-50 text-blue-700 text-xs font-semibold uppercase">{pago.estado_pago}</span>
                      )}
                    </td>
                    <td className="py-2 px-4 text-center">{new Date(pago.fecha_pago).toLocaleString()}</td>
                    <td className="py-2 px-4 text-center">
                      {editId === pago.id_pago ? (
                        <>
                          <button onClick={handleSave} className="bg-green-600 text-white px-3 py-1 rounded mr-2 hover:bg-green-700 transition">Guardar</button>
                          <button onClick={handleCancel} className="bg-gray-300 px-3 py-1 rounded hover:bg-gray-400 transition">Cancelar</button>
                        </>
                      ) : (
                        <button onClick={() => handleEdit(pago)} className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition">Editar</button>
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

export default AdminPagos; 