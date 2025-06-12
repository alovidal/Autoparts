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
            const formData = new FormData();
            formData.append('username', data.correo);
            formData.append('password', data.contrasena);

            const response = await axios.post(`${API_CONFIG.INTERNAL_API_URL}/api/auth/login`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            const { access_token, user: userData } = response.data;
            localStorage.setItem('token', access_token);
            setUser(userData);
        } catch (error) {
            console.error('Error during login:', error);
            throw error;
        }
    };

    const register = async (data: RegisterRequest): Promise<{ status: string; message?: string }> => {
        try {
            const response = await axios.post(`${API_CONFIG.INTERNAL_API_URL}/api/auth/register`, data, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.data && response.status === 201) {
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
            console.error('Error during registration:', error);
            if (axios.isAxiosError(error)) {
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
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;