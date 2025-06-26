import React, { useEffect, useState } from 'react';
import { bitacoraService, usuarioService } from '../services/api';
import { Usuario } from '../types';
import toast from 'react-hot-toast';

interface BitacoraLog {
  id_log: number;
  id_usuario: number;
  accion: string;
  fecha_accion: string;
}

const AdminBitacora: React.FC = () => {
  const [logs, setLogs] = useState<BitacoraLog[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [logRes, usuRes] = await Promise.all([
        bitacoraService.obtenerBitacora(),
        usuarioService.obtenerUsuarios(),
      ]);
      setLogs(logRes.bitacora);
      setUsuarios(usuRes.usuarios);
    } catch {
      toast.error('Error al cargar la bitácora');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  return (
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Bitácora de Acciones</h1>
      {loading ? (
        <div className="text-center">Cargando bitácora...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded shadow">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-4">ID</th>
                <th className="py-2 px-4">Usuario</th>
                <th className="py-2 px-4">Acción</th>
                <th className="py-2 px-4">Fecha/Hora</th>
              </tr>
            </thead>
            <tbody>
              {logs.map(log => {
                const usuario = usuarios.find(u => u.id_usuario === log.id_usuario);
                return (
                  <tr key={log.id_log} className="border-t">
                    <td className="py-2 px-4 text-center">{log.id_log}</td>
                    <td className="py-2 px-4 text-center">{usuario ? usuario.nombre_completo : log.id_usuario}</td>
                    <td className="py-2 px-4 text-center">{log.accion}</td>
                    <td className="py-2 px-4 text-center">{new Date(log.fecha_accion).toLocaleString()}</td>
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

export default AdminBitacora; 