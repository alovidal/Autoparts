export interface Product {
    id: number;
    nombre: string;
    descripcion: string;
    precio: number;
    stock: number;
    imagen: string;
    categoria: string;
    marca: string;
    modelo: string;
    created_at?: string;
    updated_at?: string;
}

export interface CartItem {
    id: number;
    producto: Product;
    cantidad: number;
    precio_unitario: number;
    subtotal: number;
}

export interface Cart {
    id: number;
    usuario_id: number;
    items: CartItem[];
    total: number;
    created_at: string;
    updated_at: string;
}

export interface Order {
    id: number;
    usuario_id: number;
    items: CartItem[];
    total: number;
    estado: 'PENDIENTE' | 'EN_PROCESO' | 'LISTO_PARA_ENTREGA' | 'EN_ENTREGA' | 'ENTREGADO' | 'CANCELADO';
    direccion_entrega: string;
    created_at: string;
    updated_at: string;
} 