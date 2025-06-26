import React, { useEffect, useState } from 'react';
import { productoService } from '../services/api';
import { Producto, ProductoConStock, Categoria } from '../types';
import toast from 'react-hot-toast';

const AdminProductos: React.FC = () => {
  const [productos, setProductos] = useState<ProductoConStock[]>([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState<number | null>(null);
  const [editData, setEditData] = useState<Partial<Producto>>({});
  const [categorias, setCategorias] = useState<Categoria[]>([]);

  const fetchProductos = async () => {
    setLoading(true);
    try {
      const { productos } = await productoService.obtenerProductos();
      setProductos(productos);
    } catch {
      toast.error('Error al cargar productos');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategorias = async () => {
    try {
      const res = await import('../services/api').then(m => m.categoriaService.obtenerCategorias());
      setCategorias(res.categorias);
    } catch {
      setCategorias([]);
    }
  };

  useEffect(() => {
    fetchProductos();
    fetchCategorias();
  }, []);

  const handleEdit = (producto: ProductoConStock) => {
    setEditId(producto.id_producto);
    setEditData({ ...producto });
  };

  const handleCancel = () => {
    setEditId(null);
    setEditData({});
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    if (!editId) return;
    // Validación básica
    const {
      codigo_fabricante,
      marca,
      codigo_interno,
      nombre,
      descripcion,
      precio_unitario,
      stock_min,
      id_categoria
    } = editData;
    if (!codigo_fabricante || !marca || !codigo_interno || !nombre || !descripcion || !precio_unitario || !stock_min || !id_categoria) {
      toast.error('Todos los campos son obligatorios');
      return;
    }
    try {
      await productoService.actualizarProducto(editId, editData as Omit<Producto, 'id_producto'>);
      toast.success('Producto actualizado');
      setEditId(null);
      setEditData({});
      fetchProductos();
    } catch {
      toast.error('Error al actualizar producto');
    }
  };

  const handleDelete = async (id: number, nombre: string) => {
    if (!window.confirm(`¿Seguro que deseas eliminar el producto "${nombre}"?`)) return;
    try {
      await productoService.eliminarProducto(id);
      toast.success('Producto eliminado');
      fetchProductos();
    } catch {
      toast.error('Error al eliminar producto');
    }
  };

  const handleCreate = async () => {
    setEditId(-1);
    setEditData({
      codigo_fabricante: '',
      marca: '',
      codigo_interno: '',
      nombre: '',
      descripcion: '',
      precio_unitario: 0,
      stock_min: 0,
      id_categoria: categorias[0]?.id_categoria || 1,
      imagen: '',
    });
  };

  const handleSaveCreate = async () => {
    // Validación básica
    const {
      codigo_fabricante,
      marca,
      codigo_interno,
      nombre,
      descripcion,
      precio_unitario,
      stock_min,
      id_categoria
    } = editData;
    if (!codigo_fabricante || !marca || !codigo_interno || !nombre || !descripcion || !precio_unitario || !stock_min || !id_categoria) {
      toast.error('Todos los campos son obligatorios');
      return;
    }
    try {
      await productoService.crearProducto(editData as Omit<Producto, 'id_producto'>);
      toast.success('Producto creado');
      setEditId(null);
      setEditData({});
      fetchProductos();
    } catch {
      toast.error('Error al crear producto');
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Administrar Productos</h1>
      <div className="flex justify-end mb-4">
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow"
          onClick={handleCreate}
        >
          + Nuevo Producto
        </button>
      </div>
      {loading ? (
        <div className="text-center">Cargando productos...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded shadow">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-4">ID</th>
                <th className="py-2 px-4">Nombre</th>
                <th className="py-2 px-4">Marca</th>
                <th className="py-2 px-4">Código</th>
                <th className="py-2 px-4">Precio</th>
                <th className="py-2 px-4">Categoría</th>
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
                    <input name="marca" value={editData.marca || ''} onChange={handleChange} className="border rounded px-2 py-1 w-24" />
                  </td>
                  <td className="py-2 px-4 text-center">
                    <input name="codigo_interno" value={editData.codigo_interno || ''} onChange={handleChange} className="border rounded px-2 py-1 w-20" />
                  </td>
                  <td className="py-2 px-4 text-center">
                    <input name="precio_unitario" type="number" value={editData.precio_unitario || 0} onChange={handleChange} className="border rounded px-2 py-1 w-20" min={1} />
                  </td>
                  <td className="py-2 px-4 text-center">
                    <select name="id_categoria" value={editData.id_categoria || ''} onChange={handleChange} className="border rounded px-2 py-1">
                      {categorias.map(cat => (
                        <option key={cat.id_categoria} value={cat.id_categoria}>{cat.nombre}</option>
                      ))}
                    </select>
                  </td>
                  <td className="py-2 px-4 text-center">
                    <button onClick={handleSaveCreate} className="bg-green-600 text-white px-3 py-1 rounded mr-2 hover:bg-green-700 transition">Guardar</button>
                    <button onClick={handleCancel} className="bg-gray-300 px-3 py-1 rounded hover:bg-gray-400 transition">Cancelar</button>
                  </td>
                </tr>
              )}
              {productos.map(prod => (
                <tr key={prod.id_producto} className="border-t">
                  <td className="py-2 px-4 text-center">{prod.id_producto}</td>
                  <td className="py-2 px-4 text-center">
                    {editId === prod.id_producto ? (
                      <input name="nombre" value={editData.nombre || ''} onChange={handleChange} className="border rounded px-2 py-1 w-32" />
                    ) : (
                      prod.nombre
                    )}
                  </td>
                  <td className="py-2 px-4 text-center">
                    {editId === prod.id_producto ? (
                      <input name="marca" value={editData.marca || ''} onChange={handleChange} className="border rounded px-2 py-1 w-24" />
                    ) : (
                      prod.marca
                    )}
                  </td>
                  <td className="py-2 px-4 text-center">
                    {editId === prod.id_producto ? (
                      <input name="codigo_interno" value={editData.codigo_interno || ''} onChange={handleChange} className="border rounded px-2 py-1 w-20" />
                    ) : (
                      prod.codigo_interno
                    )}
                  </td>
                  <td className="py-2 px-4 text-center">
                    {editId === prod.id_producto ? (
                      <input name="precio_unitario" type="number" value={editData.precio_unitario || 0} onChange={handleChange} className="border rounded px-2 py-1 w-20" min={1} />
                    ) : (
                      `$${prod.precio_unitario.toLocaleString()}`
                    )}
                  </td>
                  <td className="py-2 px-4 text-center">
                    {editId === prod.id_producto ? (
                      <select name="id_categoria" value={editData.id_categoria || ''} onChange={handleChange} className="border rounded px-2 py-1">
                        {categorias.map(cat => (
                          <option key={cat.id_categoria} value={cat.id_categoria}>{cat.nombre}</option>
                        ))}
                      </select>
                    ) : (
                      categorias.find(c => c.id_categoria === prod.id_categoria)?.nombre || prod.id_categoria
                    )}
                  </td>
                  <td className="py-2 px-4 text-center">
                    {editId === prod.id_producto ? (
                      <>
                        <button onClick={handleSave} className="bg-green-600 text-white px-3 py-1 rounded mr-2 hover:bg-green-700 transition">Guardar</button>
                        <button onClick={handleCancel} className="bg-gray-300 px-3 py-1 rounded hover:bg-gray-400 transition">Cancelar</button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => handleEdit(prod)} className="bg-blue-600 text-white px-3 py-1 rounded mr-2 hover:bg-blue-700 transition">Editar</button>
                        <button onClick={() => handleDelete(prod.id_producto, prod.nombre)} className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition">Eliminar</button>
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

export default AdminProductos; 