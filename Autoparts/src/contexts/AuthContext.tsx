import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Usuario, LoginRequest, RegistroRequest } from '../types';
import { usuarioService } from '../services/api';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: Usuario | null;
  loading: boolean;
  login: (credentials: LoginRequest) => Promise<boolean>;
  register: (userData: RegistroRequest) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar si hay un usuario guardado en localStorage
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Error al parsear usuario guardado:', error);
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (credentials: LoginRequest): Promise<boolean> => {
    try {
      setLoading(true);
      const userData = await usuarioService.login(credentials);
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      toast.success('¡Inicio de sesión exitoso!');
      return true;
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Error al iniciar sesión';
      toast.error(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: RegistroRequest): Promise<boolean> => {
    try {
      setLoading(true);
      await usuarioService.registro(userData);
      toast.success('¡Registro exitoso! Por favor inicia sesión.');
      return true;
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Error al registrar usuario';
      toast.error(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    toast.success('Sesión cerrada exitosamente');
  };

  const handleGuardar = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateUser({ nombre_completo: nombre, correo, contrasena });
      // Obtener datos actualizados del usuario
      const updatedUser = await usuarioService.obtenerUsuario(user.id_usuario);
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      toast.success('Perfil actualizado');
      setEditando(false);
    } catch {
      toast.error('Error al actualizar el perfil');
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 