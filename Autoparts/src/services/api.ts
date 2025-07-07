import axios from 'axios';
import {
  Usuario,
  Sucursal,
  Categoria,
  Subcategoria,
  Producto,
  ProductoConStock,
  Inventario,
  Carrito,
  ProductoCarrito,
  Pedido,
  DetallePedido,
  Pago,
  LoginRequest,
  RegistroRequest,
  AgregarAlCarritoRequest,
  CrearPedidoRequest
} from '../types';

// Configuración base de axios
const API_BASE_URL = 'http://localhost:5000'; // Puerto por defecto de Flask

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para manejar errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Servicios de Usuarios
export const usuarioService = {
  login: async (credentials: LoginRequest): Promise<Usuario> => {
    const response = await api.post('/usuarios/login', credentials);
    return response.data;
  },

  registro: async (userData: RegistroRequest): Promise<{ mensaje: string }> => {
    const response = await api.post('/usuarios/registrar', userData);
    return response.data;
  },

  obtenerUsuarios: async (): Promise<{ usuarios: Usuario[] }> => {
    const response = await api.get('/usuarios');
    return response.data;
  },

  obtenerUsuario: async (id: number): Promise<Usuario> => {
    const response = await api.get(`/usuarios/${id}`);
    return response.data;
  },

  actualizarUsuario: async (id: number, userData: Partial<Usuario>): Promise<{ mensaje: string }> => {
    const response = await api.put(`/usuarios/${id}`, userData);
    return response.data;
  },

  eliminarUsuario: async (id: number): Promise<{ mensaje: string }> => {
    const response = await api.delete(`/usuarios/${id}`);
    return response.data;
  },
};

// Servicios de Sucursales
export const sucursalService = {
  obtenerSucursales: async (): Promise<{ sucursales: Sucursal[] }> => {
    const response = await api.get('/sucursales');
    return response.data;
  },

  obtenerSucursal: async (id: number): Promise<Sucursal> => {
    const response = await api.get(`/sucursales/${id}`);
    return response.data;
  },

  crearSucursal: async (sucursalData: Omit<Sucursal, 'id_sucursal'>): Promise<{ mensaje: string }> => {
    const response = await api.post('/sucursales', sucursalData);
    return response.data;
  },

  actualizarSucursal: async (id: number, sucursalData: Partial<Sucursal>): Promise<{ mensaje: string }> => {
    const response = await api.put(`/sucursales/${id}`, sucursalData);
    return response.data;
  },

  eliminarSucursal: async (id: number): Promise<{ mensaje: string }> => {
    const response = await api.delete(`/sucursales/${id}`);
    return response.data;
  },
};

// Servicios de Categorías
export const categoriaService = {
  obtenerCategorias: async (): Promise<{ categorias: Categoria[] }> => {
    const response = await api.get('/categorias');
    return response.data;
  },

  crearCategoria: async (categoriaData: Omit<Categoria, 'id_categoria'>): Promise<{ mensaje: string }> => {
    const response = await api.post('/categorias', categoriaData);
    return response.data;
  },
};

// Servicios de Subcategorías
export const subcategoriaService = {
  obtenerSubcategorias: async (): Promise<{ subcategorias: Subcategoria[] }> => {
    const response = await api.get('/subcategorias');
    return response.data;
  },

  obtenerSubcategoriasPorCategoria: async (idCategoria: number): Promise<{ subcategorias: Subcategoria[] }> => {
    const response = await api.get(`/categorias/${idCategoria}/subcategorias`);
    return response.data;
  },

  crearSubcategoria: async (subcategoriaData: Omit<Subcategoria, 'id_subcategoria'>): Promise<{ mensaje: string }> => {
    const response = await api.post('/subcategorias', subcategoriaData);
    return response.data;
  },

  actualizarSubcategoria: async (id: number, subcategoriaData: Partial<Subcategoria>): Promise<{ mensaje: string }> => {
    const response = await api.put(`/subcategorias/${id}`, subcategoriaData);
    return response.data;
  },

  eliminarSubcategoria: async (id: number): Promise<{ mensaje: string }> => {
    const response = await api.delete(`/subcategorias/${id}`);
    return response.data;
  },
};

// Servicios de Inventario
export const inventarioService = {
  obtenerStock: async (sucursal?: number, producto?: number): Promise<{ stock?: number; inventario?: Inventario[] }> => {
    const params = new URLSearchParams();
    if (sucursal) params.append('sucursal', sucursal.toString());
    if (producto) params.append('producto', producto.toString());
    
    const response = await api.get(`/inventario?${params.toString()}`);
    return response.data;
  },

  ingresarStock: async (data: { id_sucursal: number; id_producto: number; cantidad: number }): Promise<{ mensaje: string }> => {
    const response = await api.post('/ingresar_stock', data);
    return response.data;
  },

  rebajarStock: async (data: { id_sucursal: number; id_producto: number; cantidad: number }): Promise<{ mensaje: string }> => {
    const response = await api.post('/rebajar_stock', data);
    return response.data;
  },

  eliminarInventario: async (id_sucursal: number, id_producto: number): Promise<{ mensaje: string }> => {
    const response = await api.delete(`/inventario?sucursal=${id_sucursal}&producto=${id_producto}`);
    return response.data;
  },
};

// Servicios de Carrito
export const carritoService = {
  crearCarrito: async (): Promise<{ id_carrito: number; mensaje: string }> => {
    const response = await api.post('/carritos');
    return response.data;
  },

  agregarProducto: async (idCarrito: number, data: AgregarAlCarritoRequest): Promise<{ mensaje: string }> => {
    const response = await api.post(`/carritos/${idCarrito}/productos`, data);
    return response.data;
  },

  obtenerProductos: async (idCarrito: number): Promise<{ productos: ProductoCarrito[] }> => {
    const response = await api.get(`/carritos/${idCarrito}/productos`);
    return response.data;
  },

  eliminarProducto: async (idCarrito: number, idProducto: number): Promise<{ mensaje: string }> => {
    const response = await api.delete(`/carritos/${idCarrito}/productos/${idProducto}`);
    return response.data;
  },

  vaciarCarrito: async (idCarrito: number): Promise<{ mensaje: string }> => {
    const response = await api.delete(`/carritos/${idCarrito}/vaciar`);
    return response.data;
  },
};

// Servicios de Pedidos
export const pedidoService = {
  crearPedido: async (data: CrearPedidoRequest): Promise<{ id_pedido: number; mensaje: string }> => {
    const response = await api.post('/pedidos', data);
    return response.data;
  },

  obtenerPedidos: async (): Promise<{ pedidos: Pedido[] }> => {
    const response = await api.get('/pedidos');
    return response.data;
  },

  obtenerPedido: async (id: number): Promise<Pedido> => {
    const response = await api.get(`/pedidos/${id}`);
    return response.data;
  },

  obtenerPedidosUsuario: async (idUsuario: number): Promise<{ pedidos: Pedido[] }> => {
    const response = await api.get(`/usuarios/${idUsuario}/pedidos`);
    return response.data;
  },

  actualizarEstadoPedido: async (id: number, estado: string): Promise<{ mensaje: string }> => {
    const response = await api.put(`/pedidos/${id}/estado`, { estado });
    return response.data;
  },
};

// Servicios de Pagos
export const pagoService = {
  registrarPago: async (data: Omit<Pago, 'id_pago' | 'fecha_pago'>): Promise<{ mensaje: string }> => {
    const response = await api.post('/pagos', data);
    return response.data;
  },

  obtenerPagos: async (): Promise<{ pagos: Pago[] }> => {
    const response = await api.get('/pagos');
    return response.data;
  },

  obtenerPago: async (id: number): Promise<Pago> => {
    const response = await api.get(`/pagos/${id}`);
    return response.data;
  },

  actualizarPago: async (id: number, data: Partial<Pago>): Promise<{ mensaje: string }> => {
    const response = await api.put(`/pagos/${id}`, data);
    return response.data;
  },
};

// Servicios de Productos
export const productoService = {
  obtenerProductos: async (): Promise<{ productos: ProductoConStock[] }> => {
    const response = await api.get('/productos');
    return response.data;
  },

  obtenerProducto: async (id: number): Promise<ProductoConStock> => {
    const response = await api.get(`/productos/${id}`);
    return response.data;
  },

  crearProducto: async (producto: Omit<Producto, 'id_producto'>): Promise<{ mensaje: string }> => {
    const response = await api.post('/productos', producto);
    return response.data;
  },

  actualizarProducto: async (id: number, producto: Omit<Producto, 'id_producto'>): Promise<{ mensaje: string }> => {
    const response = await api.put(`/productos/${id}`, producto);
    return response.data;
  },

  eliminarProducto: async (id: number): Promise<{ mensaje: string }> => {
    const response = await api.delete(`/productos/${id}`);
    return response.data;
  },
};

export const bitacoraService = {
  obtenerBitacora: async (): Promise<{ bitacora: Array<{ id_log: number; id_usuario: number; accion: string; fecha_accion: string }> }> => {
    const response = await api.get('/bitacora');
    return response.data;
  },
};

// Servicios de Transbank
export const transbankService = {
  crearTransaccion: async (data: {
    id_pedido: number;
    monto: number;
    return_url: string;
    session_id: string;
    buy_order: string;
  }): Promise<{
    success: boolean;
    transaccion: {
      id_pedido: number;
      monto: number;
      return_url: string;
      session_id: string;
      buy_order: string;
      token: string;
      url_pago: string;
      estado: string;
    };
    mensaje: string;
  }> => {
    const response = await api.post('/transbank/crear-transaccion', data);
    return response.data;
  },

  confirmarPago: async (data: {
    token: string;
    id_pedido: number;
  }): Promise<{
    success: boolean;
    mensaje: string;
    id_pedido: number;
  }> => {
    const response = await api.post('/transbank/confirmar-pago', data);
    return response.data;
  },
};

export default api; 