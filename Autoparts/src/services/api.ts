import axios from 'axios';
import { API_CONFIG } from '../config/api';
import type {
    ProductoResponse,
    ProductoExterno,
    CarritoResponse,
    AgregarCarritoRequest,
    AgregarCarritoResponse,
    DetallePedidoRequest,
    DetallePedidoResponse,
    Producto,
    UserProfile,
    UpdateProfileRequest,
    ConfiguracionUsuario
} from '../types/api';

const api = axios.create({
    baseURL: `${API_CONFIG.INTERNAL_API_URL}/api`,
    timeout: API_CONFIG.TIMEOUT
});

interface ApiResponse<T> {
    status: 'success' | 'error';
    message?: string;
    productos?: T[];
    producto?: T;
}

class ApiService {
    private async fetchWithError(url: string, options: RequestInit = {}) {
        try {
            console.log('Fetching:', url);
            const response = await fetch(url, {
                ...options,
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers,
                },
            });

            const data = await response.json();
            console.log('Response data:', data);

            // Manejar errores de la API
            if (!response.ok || (data && data.detail)) {
                const errorMessage = data.detail || data.message || `Error HTTP: ${response.status}`;
                console.error('Error from API:', errorMessage);
                throw new Error(errorMessage);
            }

            return data;
        } catch (error) {
            console.error('Error en la petición:', error);
            return {
                status: 'error',
                message: error instanceof Error ? error.message : 'Error en la petición'
            };
        }
    }

    // API Interna - Productos
    async getProductos(): Promise<ApiResponse<Producto>> {
        try {
            const response = await fetch(`${API_CONFIG.INTERNAL_API_URL}/api/productos`);
            if (!response.ok) {
                throw new Error('Error al obtener productos');
            }
            const data = await response.json();
            return {
                status: 'success',
                productos: data
            };
        } catch (error) {
            console.error('Error en getProductos:', error);
            return {
                status: 'error',
                message: error instanceof Error ? error.message : 'Error desconocido'
            };
        }
    }

    async getProducto(id: number): Promise<ApiResponse<Producto>> {
        try {
            const response = await fetch(`${API_CONFIG.INTERNAL_API_URL}/api/productos/${id}`);
            if (!response.ok) {
                throw new Error('Error al obtener el producto');
            }
            const data = await response.json();
            return {
                status: 'success',
                producto: data
            };
        } catch (error) {
            console.error('Error en getProducto:', error);
            return {
                status: 'error',
                message: error instanceof Error ? error.message : 'Error desconocido'
            };
        }
    }

    // Métodos para carrito (usando API externa cuando esté disponible)
    async getCarrito(id: number): Promise<CarritoResponse> {
        try {
            // Por ahora devolver datos simulados
            return {
                status: 'success',
                carrito_id: id,
                productos: [],
                total_final: 0,
                message: 'Carrito vacío'
            };
        } catch (error) {
            return {
                status: 'error',
                carrito_id: id,
                productos: [],
                total_final: 0,
                message: error instanceof Error ? error.message : 'Error al cargar el carrito'
            };
        }
    }

    async agregarAlCarrito(data: AgregarCarritoRequest): Promise<AgregarCarritoResponse> {
        try {
            // Por ahora simular éxito
            console.log('Simulando agregar al carrito:', data);
            return {
                status: 'success',
                mensaje: 'Producto agregado al carrito exitosamente',
                id_carrito: Math.floor(Math.random() * 1000)
            };
        } catch (error) {
            console.error('Error al agregar al carrito:', error);
            return {
                status: 'error',
                mensaje: 'Error al agregar al carrito'
            };
        }
    }

    // Métodos para pedidos (placeholder)
    async crearDetallePedido(data: DetallePedidoRequest): Promise<DetallePedidoResponse> {
        return {
            status: 'success',
            id_detalle: data.id_detalle,
            estado: 'PENDIENTE',
            fecha: new Date().toISOString(),
            total: 0,
            productos: []
        };
    }

    async getDetallePedido(id: number): Promise<DetallePedidoResponse> {
        return {
            status: 'success',
            id_detalle: id,
            estado: 'PENDIENTE',
            fecha: new Date().toISOString(),
            total: 0,
            productos: []
        };
    }

    async confirmarEntrega(idDetalle: number): Promise<{ status: string; mensaje: string }> {
        return {
            status: 'success',
            mensaje: 'Entrega confirmada'
        };
    }

    // Métodos para usuarios
    async getUserProfile(userId: number): Promise<{ status: string; profile?: UserProfile; message?: string }> {
        try {
            const response = await api.get(`/usuarios/${userId}/perfil`);
            return {
                status: 'success',
                profile: response.data
            };
        } catch (error) {
            if (axios.isAxiosError(error) && error.response?.status === 404) {
                return {
                    status: 'error',
                    message: 'Usuario no encontrado'
                };
            }
            console.error('Error al obtener perfil de usuario:', error);
            return {
                status: 'error',
                message: 'Error al obtener el perfil del usuario'
            };
        }
    }

    async updateProfile(userId: number, data: UpdateProfileRequest): Promise<{ status: string; message?: string }> {
        try {
            await api.put(`/usuarios/${userId}/perfil`, data);
            return {
                status: 'success',
                message: 'Perfil actualizado exitosamente'
            };
        } catch (error) {
            if (axios.isAxiosError(error) && error.response?.status === 404) {
                return {
                    status: 'error',
                    message: 'Usuario no encontrado'
                };
            }
            console.error('Error al actualizar perfil:', error);
            return {
                status: 'error',
                message: 'Error al actualizar el perfil'
            };
        }
    }

    async getUserConfig(userId: number): Promise<{ status: string; config?: ConfiguracionUsuario; message?: string }> {
        try {
            const response = await api.get(`/usuarios/${userId}/configuracion`);
            return {
                status: 'success',
                config: response.data
            };
        } catch (error) {
            if (axios.isAxiosError(error) && error.response?.status === 404) {
                return {
                    status: 'error',
                    message: 'Usuario no encontrado'
                };
            }
            console.error('Error al obtener configuración:', error);
            return {
                status: 'error',
                message: 'Error al obtener la configuración'
            };
        }
    }

    async updateUserConfig(userId: number, config: ConfiguracionUsuario): Promise<{ status: string; message?: string }> {
        try {
            await api.put(`/usuarios/${userId}/configuracion`, config);
            return {
                status: 'success',
                message: 'Configuración actualizada exitosamente'
            };
        } catch (error) {
            if (axios.isAxiosError(error) && error.response?.status === 404) {
                return {
                    status: 'error',
                    message: 'Usuario no encontrado'
                };
            }
            console.error('Error al actualizar configuración:', error);
            return {
                status: 'error',
                message: 'Error al actualizar la configuración'
            };
        }
    }
}

export const apiService = new ApiService();