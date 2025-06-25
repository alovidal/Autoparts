import axios from 'axios';
import { API_CONFIG } from '../config/api';
import type { CartItem } from '../types/cart';

const cartApi = axios.create({
    baseURL: API_CONFIG.INTERNAL_API_URL,
    timeout: API_CONFIG.TIMEOUT
});

export const CartService = {
    async createCart(items: CartItem[]) {
        try {
            const response = await cartApi.post('/api/carrito', {
                items: items.map(item => ({
                    id_producto: item.id_producto,
                    cantidad: item.cantidad,
                    precio_unitario: item.precio_unitario
                }))
            });
            return response.data;
        } catch (error) {
            console.error('Error al crear el carrito:', error);
            throw error;
        }
    },

    async getCart(cartId: number) {
        try {
            const response = await cartApi.get(`/api/carrito/${cartId}`);
            return response.data;
        } catch (error) {
            console.error('Error al obtener el carrito:', error);
            throw error;
        }
    },

    async updateCartItem(cartId: number, productId: number, quantity: number) {
        try {
            const response = await cartApi.put(`/api/carrito/${cartId}/item/${productId}`, null, {
                params: { cantidad: quantity }
            });
            return response.data;
        } catch (error) {
            console.error('Error al actualizar item del carrito:', error);
            throw error;
        }
    },

    async removeCartItem(cartId: number, productId: number) {
        try {
            const response = await cartApi.delete(`/api/carrito/${cartId}/item/${productId}`);
            return response.data;
        } catch (error) {
            console.error('Error al eliminar item del carrito:', error);
            throw error;
        }
    }
}; 