export interface Usuario {
  id_usuario: number;
  rut: string;
  nombre_completo: string;
  correo: string;
  rol: 'CLIENTE' | 'EMPRESA' | 'DISTRIBUIDOR' | 'BODEGUERO' | 'ADMIN';
  fecha_registro: string;
}

export interface Sucursal {
  id_sucursal: number;
  nombre: string;
  direccion: string;
  comuna: string;
  region: string;
}

export interface Categoria {
  id_categoria: number;
  nombre: string;
}

export interface Subcategoria {
  id_subcategoria: number;
  id_categoria: number;
  nombre: string;
}

export interface Producto {
  id_producto: number;
  codigo_fabricante: string;
  marca: string;
  codigo_interno: string;
  nombre: string;
  descripcion: string;
  precio_unitario: number;
  stock_min: number;
  id_categoria: number;
  imagen: string;
}

export interface ProductoConStock extends Producto {
  stock: number;
  sucursal: string;
}

export interface Inventario {
  id_producto: number;
  stock: number;
}

export interface Carrito {
  id_carrito: number;
  fecha_creacion: string;
}

export interface ProductoCarrito {
  id_producto: number;
  id_sucursal: number;
  cantidad: number;
  valor_unitario: number;
  valor_total: number;
  nombre: string;
  marca: string;
  imagen: string;
  sucursal_nombre: string;
}

export interface Pedido {
  id_pedido: number;
  id_usuario: number;
  fecha_pedido: string;
  id_detalle: number;
}

export interface DetallePedido {
  id_detalle: number;
  id_carrito: number;
  direccion: string;
  estado: 'PENDIENTE' | 'CONFIRMADO' | 'ENVIADO' | 'ENTREGADO' | 'CANCELADO';
  id_usuario: number;
}

export interface Pago {
  id_pago: number;
  id_pedido: number;
  monto_total: number;
  metodo_pago: 'WEBPAY' | 'MERCADOPAGO' | 'TRANSFERENCIA';
  estado_pago: 'PENDIENTE' | 'PAGADO' | 'FALLIDO';
  fecha_pago: string;
}

export interface LoginRequest {
  correo: string;
  contrasena: string;
}

export interface RegistroRequest {
  rut: string;
  nombre_completo: string;
  correo: string;
  contrasena: string;
  rol: string;
}

// Función para calcular descuentos por rol
export const calcularDescuento = (rol: string, precioOriginal: number): { precioConDescuento: number; descuentoAplicado: number; porcentajeDescuento: number } => {
  let porcentajeDescuento = 0;
  
  switch (rol) {
    case 'EMPRESA':
      porcentajeDescuento = 15; // 15% de descuento para empresas
      break;
    case 'DISTRIBUIDOR':
      porcentajeDescuento = 10; // 10% de descuento para distribuidores
      break;
    case 'BODEGUERO':
      porcentajeDescuento = 5; // 5% de descuento para bodegueros
      break;
    default:
      porcentajeDescuento = 0; // Sin descuento para clientes normales y admin
  }
  
  const descuentoAplicado = (precioOriginal * porcentajeDescuento) / 100;
  const precioConDescuento = precioOriginal - descuentoAplicado;
  
  return {
    precioConDescuento: Math.round(precioConDescuento),
    descuentoAplicado: Math.round(descuentoAplicado),
    porcentajeDescuento
  };
};

export interface AgregarAlCarritoRequest {
  id_carrito?: number;
  id_producto: number;
  id_sucursal: number;
  cantidad: number;
  valor_unitario: number;
  valor_total: number;
}

export interface CrearPedidoRequest {
  id_usuario: number;
  id_carrito: number;
  direccion: string;
} 