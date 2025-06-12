import axios from 'axios';
import { API_CONFIG } from '../config/api';
import type {
    LoginRequest,
    RegisterRequest,
    AuthResponse,
    UserUpdateRequest,
    UserResponse,
    User
} from '../types/auth';

class AuthService {
    private token: string | null = null;
    private user: User | null = null;

    constructor() {
        this.token = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            try {
                this.user = JSON.parse(savedUser);
            } catch (e) {
                console.error('Error parsing saved user:', e);
                localStorage.removeItem('user');
                localStorage.removeItem('token');
            }
        }
    }

    private async fetchWithAuth(url: string, options: RequestInit = {}): Promise<any> {
        try {
            const headers = {
                'Content-Type': 'application/json',
                ...(this.token ? { 'Authorization': `Bearer ${this.token}` } : {}),
                ...options.headers
            };

            const response = await fetch(url, {
                ...options,
                headers
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Error en la petición');
            }

            return data;
        } catch (error) {
            console.error('Error en fetchWithAuth:', error);
            throw error;
        }
    }

    getUser(): User | null {
        return this.user;
    }

    getToken(): string | null {
        return this.token;
    }

    isAuthenticated(): boolean {
        return !!this.token && !!this.user;
    }

    async login(credentials: LoginRequest): Promise<AuthResponse> {
        try {
            const response = await axios.post(
                `${API_CONFIG.INTERNAL_API_URL}/auth/login`,
                credentials,
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.data.token && response.data.user) {
                this.token = response.data.token;
                this.user = response.data.user;
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user', JSON.stringify(this.user));
                return {
                    status: 'success',
                    user: this.user,
                    token: response.data.token
                };
            }

            return {
                status: 'error',
                message: 'Credenciales inválidas'
            };
        } catch (error) {
            console.error('Error en login:', error);
            if (axios.isAxiosError(error)) {
                return {
                    status: 'error',
                    message: error.response?.data?.detail || 'Error en el inicio de sesión'
                };
            }
            return {
                status: 'error',
                message: 'Error en el inicio de sesión'
            };
        }
    }

    async register(userData: RegisterRequest): Promise<AuthResponse> {
        try {
            const response = await axios.post(
                `${API_CONFIG.INTERNAL_API_URL}/auth/register`,
                userData,
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.data.token && response.data.user) {
                this.token = response.data.token;
                this.user = response.data.user;
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user', JSON.stringify(this.user));
                return {
                    status: 'success',
                    user: this.user,
                    token: response.data.token
                };
            }

            return {
                status: 'error',
                message: 'Error en el registro'
            };
        } catch (error) {
            console.error('Error en register:', error);
            if (axios.isAxiosError(error)) {
                return {
                    status: 'error',
                    message: error.response?.data?.detail || 'Error en el registro'
                };
            }
            return {
                status: 'error',
                message: 'Error en el registro'
            };
        }
    }

    logout(): void {
        this.token = null;
        this.user = null;
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    }

    // Métodos para administración de usuarios (ADMIN)
    async getUsers(): Promise<UserResponse> {
        try {
            return await this.fetchWithAuth(`${API_CONFIG.INTERNAL_API_URL}/users`);
        } catch (error) {
            return {
                status: 'error',
                message: error instanceof Error ? error.message : 'Error al obtener usuarios'
            };
        }
    }

    async updateUser(userData: UserUpdateRequest): Promise<UserResponse> {
        try {
            return await this.fetchWithAuth(
                `${API_CONFIG.INTERNAL_API_URL}/users/${userData.id}`,
                {
                    method: 'PUT',
                    body: JSON.stringify(userData)
                }
            );
        } catch (error) {
            return {
                status: 'error',
                message: error instanceof Error ? error.message : 'Error al actualizar usuario'
            };
        }
    }

    async deleteUser(userId: number): Promise<UserResponse> {
        try {
            return await this.fetchWithAuth(
                `${API_CONFIG.INTERNAL_API_URL}/users/${userId}`,
                {
                    method: 'DELETE'
                }
            );
        } catch (error) {
            return {
                status: 'error',
                message: error instanceof Error ? error.message : 'Error al eliminar usuario'
            };
        }
    }

    // Método para convertir a empresa (ADMIN)
    async convertToEmpresa(userId: number): Promise<UserResponse> {
        try {
            return await this.fetchWithAuth(
                `${API_CONFIG.INTERNAL_API_URL}/users/${userId}/convert-to-empresa`,
                {
                    method: 'PUT',
                    body: JSON.stringify({ role: 'EMPRESA', descuento: 15 })
                }
            );
        } catch (error) {
            return {
                status: 'error',
                message: error instanceof Error ? error.message : 'Error al convertir a empresa'
            };
        }
    }
}

export const authService = new AuthService(); 