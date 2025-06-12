// Tipos para la API Interna
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
    imagen_url: string;
    categoria_nombre: string;
}

export interface ProductoResponse {
    status: 'success' | 'error';
    productos?: Producto[];
    message?: string;
}

// Tipos para la API Externa
export interface SucursalStock {
    nombre: string;
    stock: number;
}

export interface ProductoExterno {
    id_producto: number;
    nombre: string;
    marca: string;
    valor: number;
    sucursales: SucursalStock[];
}

export interface CarritoItem {
    id_producto: number;
    nombre: string;
    cantidad: number;
    valor_unitario: number;
    valor_total: number;
}

export interface CarritoResponse {
    status: 'success' | 'error';
    carrito_id: number;
    productos: CarritoItem[];
    total_final: number;
    message?: string;
}

export interface AgregarCarritoRequest {
    producto_id: number;
    cantidad: number;
}

export interface AgregarCarritoResponse {
    status: 'success' | 'error';
    mensaje: string;
    id_carrito?: number;
}

export interface DetallePedidoRequest {
    id_detalle: number;
    id_carrito: number;
    id_usuario: number;
    direccion: string;
}

export interface DetallePedidoResponse {
    status: 'success' | 'error';
    id_detalle: number;
    estado: string;
    fecha: string;
    total: number;
    productos: CarritoItem[];
    message?: string;
}

// Tipos para usuarios
export interface UserProfile {
    id: number;
    nombre: string;
    email: string;
    role: string;
    direccion?: string;
    telefono?: string;
    fecha_registro: string;
    ultima_compra?: string;
}

export interface UpdateProfileRequest {
    nombre?: string;
    email?: string;
    direccion?: string;
    telefono?: string;
}

export interface ConfiguracionUsuario {
    notificaciones_email: boolean;
    tema_oscuro: boolean;
    idioma: string;
} 