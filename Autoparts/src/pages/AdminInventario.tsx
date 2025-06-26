import React, { useEffect, useState } from 'react';
import { inventarioService, productoService, sucursalService } from '../services/api';
import { Inventario, Producto, Sucursal } from '../types';
import toast from 'react-hot-toast';

interface InventarioRow {
  id_producto: number;
  id_sucursal: number;
  stock: number;
  producto: Producto | undefined;
  sucursal: Sucursal | undefined;
}

const AdminInventario: React.FC = () => {
  const [inventario, setInventario] = useState<InventarioRow[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  const [loading, setLoading] = useState(true);
  const [editRow, setEditRow] = useState<{ id_producto: number; id_sucursal: number } | null>(null);
  const [editStock, setEditStock] = useState<number>(0);
  const [newRow, setNewRow] = useState<{ id_producto: number; id_sucursal: number; stock: number }>({ id_producto: 0, id_sucursal: 0, stock: 0 });
  const [creating, setCreating] = useState(false);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [prodRes, sucRes] = await Promise.all([
        productoService.obtenerProductos(),
        sucursalService.obtenerSucursales(),
      ]);
      setProductos(prodRes.productos);
      setSucursales(sucRes.sucursales);
      // Obtener inventario para cada sucursal
      let allRows: InventarioRow[] = [];
      for (const suc of sucRes.sucursales) {
        const res = await inventarioService.obtenerStock(suc.id_sucursal);
        (res.inventario || []).forEach((inv) => {
          allRows.push({
            id_producto: inv.id_producto,
            id_sucursal: suc.id_sucursal,
            stock: inv.stock,
            producto: prodRes.productos.find(p => p.id_producto === inv.id_producto),
            sucursal: suc,
          });
        });
      }
      setInventario(allRows);
    } catch {
      toast.error('Error al cargar inventario');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handleEdit = (row: InventarioRow) => {
    setEditRow({ id_producto: row.id_producto, id_sucursal: row.id_sucursal });
    setEditStock(row.stock);
  };

  const handleCancel = () => {
    setEditRow(null);
    setEditStock(0);
  };

  const handleSave = async () => {
    if (!editRow) return;
    const row = inventario.find(r => r.id_producto === editRow.id_producto && r.id_sucursal === editRow.id_sucursal);
    if (!row) return;
    const diff = editStock - row.stock;
    if (diff === 0) {
      setEditRow(null);
      return;
    }
    try {
      if (diff > 0) {
        await inventarioService.ingresarStock({ id_sucursal: row.id_sucursal, id_producto: row.id_producto, cantidad: diff });
      } else {
        await inventarioService.rebajarStock({ id_sucursal: row.id_sucursal, id_producto: row.id_producto, cantidad: -diff });
      }
      toast.success('Stock actualizado');
      setEditRow(null);
      fetchAll();
    } catch {
      toast.error('Error al actualizar stock');
    }
  };

  const handleDelete = async (row: InventarioRow) => {
    if (!window.confirm(`¿Seguro que deseas eliminar el inventario de "${row.producto?.nombre}" en "${row.sucursal?.nombre}"?`)) return;
    try {
      await inventarioService.eliminarInventario(row.id_sucursal, row.id_producto);
      toast.success('Registro de inventario eliminado');
      fetchAll();
    } catch {
      toast.error('Error al eliminar inventario');
    }
  };

  const handleCreate = () => {
    setCreating(true);
    setNewRow({ id_producto: productos[0]?.id_producto || 0, id_sucursal: sucursales[0]?.id_sucursal || 0, stock: 0 });
  };

  const handleSaveCreate = async () => {
    if (!newRow.id_producto || !newRow.id_sucursal) {
      toast.error('Selecciona producto y sucursal');
      return;
    }
    if (newRow.stock < 0) {
      toast.error('El stock debe ser 0 o mayor');
      return;
    }
    try {
      await inventarioService.ingresarStock({ id_sucursal: newRow.id_sucursal, id_producto: newRow.id_producto, cantidad: newRow.stock });
      toast.success('Registro de inventario creado');
      setCreating(false);
      fetchAll();
    } catch {
      toast.error('Error al crear inventario');
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Administrar Inventario</h1>
      <div className="flex justify-end mb-4">
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow"
          onClick={handleCreate}
        >
          + Nuevo Registro
        </button>
      </div>
      {loading ? (
        <div className="text-center">Cargando inventario...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded shadow">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-4">Producto</th>
                <th className="py-2 px-4">Sucursal</th>
                <th className="py-2 px-4">Stock</th>
                <th className="py-2 px-4">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {creating && (
                <tr className="border-t bg-yellow-50">
                  <td className="py-2 px-4 text-center">
                    <select
                      value={newRow.id_producto}
                      onChange={e => setNewRow({ ...newRow, id_producto: Number(e.target.value) })}
                      className="border rounded px-2 py-1 w-40"
                    >
                      {productos.map(p => (
                        <option key={p.id_producto} value={p.id_producto}>{p.nombre}</option>
                      ))}
                    </select>
                  </td>
                  <td className="py-2 px-4 text-center">
                    <select
                      value={newRow.id_sucursal}
                      onChange={e => setNewRow({ ...newRow, id_sucursal: Number(e.target.value) })}
                      className="border rounded px-2 py-1 w-40"
                    >
                      {sucursales.map(s => (
                        <option key={s.id_sucursal} value={s.id_sucursal}>{s.nombre}</option>
                      ))}
                    </select>
                  </td>
                  <td className="py-2 px-4 text-center">
                    <input
                      type="number"
                      value={newRow.stock}
                      onChange={e => setNewRow({ ...newRow, stock: Number(e.target.value) })}
                      className="border rounded px-2 py-1 w-20"
                      min={0}
                    />
                  </td>
                  <td className="py-2 px-4 text-center">
                    <button onClick={handleSaveCreate} className="bg-green-600 text-white px-3 py-1 rounded mr-2 hover:bg-green-700 transition">Guardar</button>
                    <button onClick={() => setCreating(false)} className="bg-gray-300 px-3 py-1 rounded hover:bg-gray-400 transition">Cancelar</button>
                  </td>
                </tr>
              )}
              {inventario.map(row => (
                <tr key={row.id_producto + '-' + row.id_sucursal} className="border-t">
                  <td className="py-2 px-4 text-center">{row.producto?.nombre || row.id_producto}</td>
                  <td className="py-2 px-4 text-center">{row.sucursal?.nombre || row.id_sucursal}</td>
                  <td className="py-2 px-4 text-center">
                    {editRow && editRow.id_producto === row.id_producto && editRow.id_sucursal === row.id_sucursal ? (
                      <input
                        type="number"
                        value={editStock}
                        onChange={e => setEditStock(Number(e.target.value))}
                        className="border rounded px-2 py-1 w-20"
                        min={0}
                      />
                    ) : (
                      row.stock
                    )}
                  </td>
                  <td className="py-2 px-4 text-center">
                    {editRow && editRow.id_producto === row.id_producto && editRow.id_sucursal === row.id_sucursal ? (
                      <>
                        <button onClick={handleSave} className="bg-green-600 text-white px-3 py-1 rounded mr-2 hover:bg-green-700 transition">Guardar</button>
                        <button onClick={handleCancel} className="bg-gray-300 px-3 py-1 rounded hover:bg-gray-400 transition">Cancelar</button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => handleEdit(row)} className="bg-blue-600 text-white px-3 py-1 rounded mr-2 hover:bg-blue-700 transition">Editar</button>
                        <button onClick={() => handleDelete(row)} className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition">Eliminar</button>
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

export default AdminInventario; 