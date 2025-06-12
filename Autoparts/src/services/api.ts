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
    baseURL: API_CONFIG.INTERNAL_API_URL,
    timeout: API_CONFIG.TIMEOUT
});

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

    // Métodos para la API Interna
    async getInternalData(endpoint: string) {
        return this.fetchWithError(`${API_CONFIG.INTERNAL_API_URL}${endpoint}`);
    }

    async postInternalData(endpoint: string, data: any) {
        return this.fetchWithError(`${API_CONFIG.INTERNAL_API_URL}${endpoint}`, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    // Métodos para la API Externa
    async getExternalData(endpoint: string) {
        return this.fetchWithError(`${API_CONFIG.EXTERNAL_API_URL}${endpoint}`);
    }

    async postExternalData(endpoint: string, data: any) {
        return this.fetchWithError(`${API_CONFIG.EXTERNAL_API_URL}${endpoint}`, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    // API Interna - Productos
    async getProductos(): Promise<ProductoResponse> {
        try {
            console.log('Calling API endpoint:', `${API_CONFIG.INTERNAL_API_URL}/productos`);
            const response = await api.get('/productos');
            console.log('Raw backend response:', response.data);
            
            // Transformar la respuesta para que coincida con la interfaz esperada
            const productos = response.data.map((item: any) => ({
                id_producto: item.id_producto,
                codigo_fabricante: '', // Campo no presente en el backend
                marca: item.marca,
                codigo_interno: '', // Campo no presente en el backend
                nombre: item.nombre,
                descripcion: '', // Campo no presente en el backend
                precio_unitario: item.precio_unitario || 0,
                stock_min: 0, // Campo no presente en el backend
                id_categoria: 0, // Campo no presente en el backend
                imagen_url: item.imagen || 'https://via.placeholder.com/200',
                categoria_nombre: item.categoria || 'Sin categoría'
            }));

            console.log('Transformed products:', productos);
            
            return {
                status: 'success',
                productos
            };
        } catch (error) {
            console.error('Error al obtener productos:', error);
            return {
                status: 'error',
                message: 'Error al obtener los productos',
                productos: []
            };
        }
    }

    async getProducto(id: number): Promise<ProductoResponse> {
        try {
            console.log('Obteniendo producto con ID:', id);
            const response = await fetch(`${API_CONFIG.INTERNAL_API_URL}/productos/${id}`);
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || `Error HTTP: ${response.status}`);
            }

            const data = await response.json();
            console.log('Respuesta del servidor para producto:', data);

            // Si la respuesta es un objeto de producto directo
            if (data && typeof data === 'object' && 'id_producto' in data) {
                console.log('Respuesta es un objeto producto, formateando...');
                const formattedData: ProductoResponse = {
                    status: 'success',
                    producto: {
                        id_producto: data.id_producto || data.id || 0,
                        codigo_fabricante: data.codigo_fabricante || '',
                        marca: data.marca || '',
                        codigo_interno: data.codigo_interno || '',
                        nombre: data.nombre || '',
                        descripcion: data.descripcion || '',
                        precio_unitario: parseFloat(data.precio_unitario) || 0,
                        stock_min: parseInt(data.stock_min) || 0,
                        id_categoria: parseInt(data.id_categoria) || 0,
                        imagen_url: data.imagen_url || data.imagen || '',
                        categoria_nombre: data.categoria_nombre || data.categoria || 'Sin categoría'
                    }
                };
                console.log('Datos del producto formateados:', formattedData);
                return formattedData;
            }

            // Si la respuesta ya tiene el formato ProductoResponse
            if (data && typeof data === 'object' && 'status' in data) {
                console.log('Respuesta ya tiene formato ProductoResponse');
                if (data.producto) {
                    data.producto = {
                        ...data.producto,
                        id_producto: data.producto.id_producto || data.producto.id || 0,
                        codigo_fabricante: data.producto.codigo_fabricante || '',
                        marca: data.producto.marca || '',
                        codigo_interno: data.producto.codigo_interno || '',
                        nombre: data.producto.nombre || '',
                        descripcion: data.producto.descripcion || '',
                        precio_unitario: parseFloat(data.producto.precio_unitario) || 0,
                        stock_min: parseInt(data.producto.stock_min) || 0,
                        id_categoria: parseInt(data.producto.id_categoria) || 0,
                        imagen_url: data.producto.imagen_url || data.producto.imagen || '',
                        categoria_nombre: data.producto.categoria_nombre || data.producto.categoria || 'Sin categoría'
                    };
                }
                return data;
            }

            // Si la respuesta tiene un error de la API
            if (data && data.detail) {
                throw new Error(data.detail);
            }

            // Si llegamos aquí, el formato no es reconocido
            console.error('Formato de respuesta no reconocido:', data);
            throw new Error('Formato de respuesta no reconocido');

        } catch (error) {
            console.error('Error al obtener producto:', error);
            return {
                status: 'error',
                message: error instanceof Error ? error.message : 'Error al obtener el producto',
            };
        }
    }

    // API Externa - Productos y Stock
    async getProductoExterno(id: number): Promise<ProductoExterno> {
        return this.fetchWithError(`${API_CONFIG.EXTERNAL_API_URL}/producto/${id}`);
    }

    // API Externa - Carrito
    async getCarrito(id: number): Promise<CarritoResponse> {
        try {
            const data = await this.fetchWithError(`${API_CONFIG.EXTERNAL_API_URL}/carrito/${id}`);
            if (!data.status) {
                return {
                    status: 'success',
                    carrito_id: data.carrito_id,
                    productos: data.productos || [],
                    total_final: data.total_final || 0,
                    message: ''
                };
            }
            return data;
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
            const response = await api.post('/carrito/agregar', data);
            return {
                status: 'success',
                mensaje: 'Producto agregado al carrito exitosamente',
                id_carrito: response.data.id_carrito
            };
        } catch (error) {
            console.error('Error al agregar al carrito:', error);
            return {
                status: 'error',
                mensaje: 'Error al agregar al carrito'
            };
        }
    }

    // API Externa - Pedidos
    async crearDetallePedido(data: DetallePedidoRequest): Promise<DetallePedidoResponse> {
        return this.fetchWithError(`${API_CONFIG.EXTERNAL_API_URL}/detalle_pedido`, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async getDetallePedido(id: number): Promise<DetallePedidoResponse> {
        return this.fetchWithError(`${API_CONFIG.EXTERNAL_API_URL}/detalle_pedido/${id}`);
    }

    async confirmarEntrega(idDetalle: number): Promise<{ status: string; mensaje: string }> {
        return this.fetchWithError(`${API_CONFIG.EXTERNAL_API_URL}/confirmar_entrega`, {
            method: 'POST',
            body: JSON.stringify({ id_detalle: idDetalle }),
        });
    }

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