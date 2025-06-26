import React, { useEffect, useState } from 'react';
import { pedidoService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Pedido } from '../types';

const MisPedidos: React.FC = () => {
  const { user } = useAuth();
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setError('Debes iniciar sesión para ver tus pedidos');
      setLoading(false);
      return;
    }
    pedidoService.obtenerPedidosUsuario(user.id_usuario)
      .then(data => setPedidos(data.pedidos))
      .catch(() => setError('Error al cargar tus pedidos'))
      .finally(() => setLoading(false));
  }, [user]);

  if (loading) return <div className="p-8 text-center">Cargando pedidos...</div>;
  if (error) return <div className="p-8 text-center text-red-600">{error}</div>;

  return (
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Mis Pedidos</h1>
      {pedidos.length === 0 ? (
        <div className="text-center text-gray-500">No tienes pedidos registrados.</div>
      ) : (
        <table className="w-full bg-white rounded shadow">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-4">ID</th>
              <th className="py-2 px-4">Fecha</th>
              <th className="py-2 px-4">Estado</th>
              <th className="py-2 px-4">Total</th>
            </tr>
          </thead>
          <tbody>
            {pedidos.map(p => (
              <tr key={p.id_pedido} className="border-t">
                <td className="py-2 px-4 text-center">{p.id_pedido}</td>
                <td className="py-2 px-4 text-center">{p.fecha_pedido}</td>
                <td className="py-2 px-4 text-center">{p.estado}</td>
                <td className="py-2 px-4 text-center">${p.total?.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default MisPedidos; 