import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, LoginRequest, RegisterRequest } from '../types/auth';
import axios from 'axios';
import { API_CONFIG } from '../config/api';

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    login: (data: LoginRequest) => Promise<void>;
    register: (data: RegisterRequest) => Promise<{ status: string; message?: string }>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(() => {
        const savedUser = localStorage.getItem('user');
        return savedUser ? JSON.parse(savedUser) : null;
    });

    const isAuthenticated = !!user;

    useEffect(() => {
        if (user) {
            localStorage.setItem('user', JSON.stringify(user));
        } else {
            localStorage.removeItem('user');
        }
    }, [user]);

    const login = async (data: LoginRequest) => {
        try {
            console.log('Intentando login con:', data);
            
            // Usar FormData para el login como espera FastAPI OAuth2PasswordRequestForm
            const formData = new FormData();
            formData.append('username', data.correo);
            formData.append('password', data.contrasena);

            console.log('Datos del formulario:', formData);

            console.log('Enviando a:', `${API_CONFIG.INTERNAL_API_URL}/api/auth/login`);
            
            const response = await axios.post(
                `${API_CONFIG.INTERNAL_API_URL}/api/auth/login`, 
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );

            console.log('Respuesta del login:', response.data);

            if (response.data.access_token && response.data.user) {
                localStorage.setItem('token', response.data.access_token);
                setUser(response.data.user);
                console.log('Login exitoso, usuario guardado:', response.data.user);
            } else {
                throw new Error('Respuesta de login inválida');
            }
        } catch (error) {
            console.error('Error durante el login:', error);
            if (axios.isAxiosError(error)) {
                console.error('Error response:', error.response?.data);
                throw new Error(error.response?.data?.detail || 'Error al iniciar sesión');
            }
            throw error;
        }
    };

    const register = async (data: RegisterRequest): Promise<{ status: string; message?: string }> => {
        try {
            console.log('Intentando registro con:', data);
            
            const response = await axios.post(
                `${API_CONFIG.INTERNAL_API_URL}/api/auth/register`, 
                data,
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );

            console.log('Respuesta del registro:', response.data);

            if (response.status === 200 || response.status === 201) {
                return {
                    status: 'success',
                    message: 'Usuario registrado exitosamente'
                };
            }

            return {
                status: 'error',
                message: 'Error al registrar usuario'
            };
        } catch (error) {
            console.error('Error durante el registro:', error);
            if (axios.isAxiosError(error)) {
                console.error('Error response:', error.response?.data);
                return {
                    status: 'error',
                    message: error.response?.data?.detail || 'Error al registrar usuario'
                };
            }
            return {
                status: 'error',
                message: 'Error al registrar usuario'
            };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        console.log('Usuario desconectado');
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;