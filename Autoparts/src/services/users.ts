import axios from 'axios';
import { API_CONFIG } from '../config/api';
import type { User, UserUpdateRequest } from '../types/auth';

const usersApi = axios.create({
    baseURL: API_CONFIG.INTERNAL_API_URL,
    timeout: API_CONFIG.TIMEOUT
});

export const UserService = {
    async getUsers(): Promise<User[]> {
        try {
            const response = await usersApi.get('/api/usuarios');
            return response.data;
        } catch (error) {
            console.error('Error al obtener usuarios:', error);
            throw error;
        }
    },

    async getUser(id: number): Promise<User> {
        try {
            const response = await usersApi.get(`/api/usuarios/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error al obtener usuario:', error);
            throw error;
        }
    },

    async updateUser(id: number, data: UserUpdateRequest): Promise<User> {
        try {
            const response = await usersApi.put(`/api/usuarios/${id}`, data);
            return response.data;
        } catch (error) {
            console.error('Error al actualizar usuario:', error);
            throw error;
        }
    },

    async deleteUser(id: number): Promise<void> {
        try {
            await usersApi.delete(`/api/usuarios/${id}`);
        } catch (error) {
            console.error('Error al eliminar usuario:', error);
            throw error;
        }
    }
}; 