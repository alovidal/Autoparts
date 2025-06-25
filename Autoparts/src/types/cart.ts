export interface CartItem {
    id_producto: number;
    nombre: string;
    precio_unitario: number;
    cantidad: number;
    imagen_url: string;
    stock_actual?: number;
}

export interface Cart {
    items: CartItem[];
    total: number;
    id_carrito: number | null;
} 