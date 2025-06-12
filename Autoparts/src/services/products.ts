import axios from 'axios';
import { API_CONFIG } from '../config/api';
import type { Product } from '../types/product';

const productsApi = axios.create({
    baseURL: API_CONFIG.INTERNAL_API_URL,
    timeout: API_CONFIG.TIMEOUT
});

export const ProductService = {
    async getProducts(): Promise<Product[]> {
        try {
            const response = await productsApi.get('/api/productos');
            return response.data.map((item: any) => ({
                id: item.id_producto,
                nombre: item.nombre,
                descripcion: item.descripcion || '',
                precio: item.precio_unitario || 0,
                stock: item.stock_actual || 0,
                imagen: item.imagen || 'https://via.placeholder.com/200',
                categoria: item.categoria || 'Sin categoría',
                marca: item.marca || '',
                modelo: '',
                alerta: item.alerta
            }));
        } catch (error) {
            console.error('Error al obtener productos:', error);
            return [];
        }
    },

    async getProductById(id: number): Promise<Product | null> {
        try {
            const response = await productsApi.get(`/api/productos/${id}`);
            const item = response.data;
            return {
                id: item.id_producto,
                nombre: item.nombre,
                descripcion: item.descripcion || '',
                precio: item.precio_unitario || 0,
                stock: item.stock_actual || 0,
                imagen: item.imagen || 'https://via.placeholder.com/200',
                categoria: item.categoria || 'Sin categoría',
                marca: item.marca || '',
                modelo: '',
                alerta: item.alerta
            };
        } catch (error) {
            console.error(`Error al obtener producto ${id}:`, error);
            return null;
        }
    }
}; 