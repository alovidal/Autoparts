export enum UserRole {
    ADMIN = 'ADMIN',
    BODEGUERO = 'BODEGUERO',
    DISTRIBUIDOR = 'DISTRIBUIDOR',
    CLIENTE = 'CLIENTE'
}

export interface User {
    id: number;
    nombre_completo: string;
    rut: string;
    correo: string;
    rol: UserRole; // Cambiado a UserRole para consistencia
    fecha_registro?: string;
}

export interface AuthResponse {
    status: 'success' | 'error';
    user?: User;
    token?: string;
    message?: string;
}

export interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    token: string | null;
}

export interface LoginRequest {
    correo: string;
    contrasena: string;
}

export interface LoginResponse {
    access_token: string;
    token_type: string;
    user: User;
}

export interface RegisterRequest extends LoginRequest {
    nombre_completo: string;
    rut: string;
}

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

export interface UserUpdateRequest {
    id?: number;
    username?: string;
    email?: string;
    role?: UserRole;
    nombre?: string;
    apellido?: string;
    telefono?: string;
    direccion?: string;
    rut?: string;
    razon_social?: string;
    descuento?: number;
    nombre_completo?: string;
    correo?: string;
}

export interface UserResponse {
    status: 'success' | 'error';
    users?: User[];
    user?: User;
    message?: string;
}

export interface PedidoResumen {
    id_pedido: number;
    fecha: string;
    estado: string;
    total: number;
}

export interface ConfiguracionUsuario {
    notificaciones_email: boolean;
    tema_oscuro: boolean;
    idioma: string;
}