import React, { useEffect, useState } from 'react';
import { usuarioService, productoService, pedidoService, pagoService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [usuarios, setUsuarios] = useState(0);
  const [productos, setProductos] = useState(0);
  const [pedidos, setPedidos] = useState(0);
  const [ventas, setVentas] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.rol !== 'ADMIN') return;
    cargarDatos();
    // eslint-disable-next-line
  }, [user]);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const [{ usuarios }, { productos }, { pedidos }, { pagos }] = await Promise.all([
        usuarioService.obtenerUsuarios(),
        productoService.obtenerProductos(),
        pedidoService.obtenerPedidos(),
        pagoService.obtenerPagos()
      ]);
      setUsuarios(usuarios.length);
      setProductos(productos.length);
      setPedidos(pedidos.length);
      setVentas(pagos.reduce((sum, p) => sum + (p.monto_total || 0), 0));
    } catch {
      // No mostrar error, solo dejar en 0
    } finally {
      setLoading(false);
    }
  };

  if (!user || user.rol !== 'ADMIN') {
    return <div className="max-w-xl mx-auto py-16 text-center text-red-600 text-xl font-semibold">Acceso denegado. Solo administradores pueden ver esta página.</div>;
  }

  return (
    <div className="max-w-7xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Panel de Administración</h1>
      {loading ? (
        <div className="text-center text-gray-500">Cargando resumen...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <Link to="/admin/usuarios" className="bg-white rounded-xl shadow p-6 flex flex-col items-center hover:shadow-md transition">
            <span className="text-3xl font-bold text-blue-700 mb-2">{usuarios}</span>
            <span className="text-gray-700 font-medium">Usuarios</span>
          </Link>
          <Link to="/admin/productos" className="bg-white rounded-xl shadow p-6 flex flex-col items-center hover:shadow-md transition">
            <span className="text-3xl font-bold text-blue-700 mb-2">{productos}</span>
            <span className="text-gray-700 font-medium">Productos</span>
          </Link>
          <Link to="/admin/pedidos" className="bg-white rounded-xl shadow p-6 flex flex-col items-center hover:shadow-md transition">
            <span className="text-3xl font-bold text-blue-700 mb-2">{pedidos}</span>
            <span className="text-gray-700 font-medium">Pedidos</span>
          </Link>
          <Link to="/admin/pagos" className="bg-white rounded-xl shadow p-6 flex flex-col items-center hover:shadow-md transition">
            <span className="text-3xl font-bold text-blue-700 mb-2">${ventas.toLocaleString('es-CL')}</span>
            <span className="text-gray-700 font-medium">Ventas totales</span>
          </Link>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link to="/admin/usuarios" className="bg-blue-50 rounded-lg p-4 text-blue-700 font-semibold text-center hover:bg-blue-100 transition">Gestionar Usuarios</Link>
        <Link to="/admin/productos" className="bg-blue-50 rounded-lg p-4 text-blue-700 font-semibold text-center hover:bg-blue-100 transition">Gestionar Productos</Link>
        <Link to="/admin/categorias" className="bg-blue-50 rounded-lg p-4 text-blue-700 font-semibold text-center hover:bg-blue-100 transition">Gestionar Categorías</Link>
        <Link to="/admin/sucursales" className="bg-blue-50 rounded-lg p-4 text-blue-700 font-semibold text-center hover:bg-blue-100 transition">Gestionar Sucursales</Link>
        <Link to="/admin/inventario" className="bg-blue-50 rounded-lg p-4 text-blue-700 font-semibold text-center hover:bg-blue-100 transition">Gestionar Inventario</Link>
        <Link to="/admin/pedidos" className="bg-blue-50 rounded-lg p-4 text-blue-700 font-semibold text-center hover:bg-blue-100 transition">Gestionar Pedidos</Link>
        <Link to="/admin/pagos" className="bg-blue-50 rounded-lg p-4 text-blue-700 font-semibold text-center hover:bg-blue-100 transition">Gestionar Pagos</Link>
        <Link to="/admin/bitacora" className="bg-blue-50 rounded-lg p-4 text-blue-700 font-semibold text-center hover:bg-blue-100 transition">Ver Bitácora</Link>
      </div>
    </div>
  );
};

export default AdminDashboard; 