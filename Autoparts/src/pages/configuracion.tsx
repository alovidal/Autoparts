import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import type { ConfiguracionUsuario } from '../types/api';
import { apiService } from '../services/api';
import { useNavigate } from 'react-router-dom';

const ConfiguracionPage: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [config, setConfig] = useState<ConfiguracionUsuario>({
        notificaciones_email: true,
        tema_oscuro: false,
        idioma: 'es'
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    useEffect(() => {
        const fetchConfig = async () => {
            if (!user?.id) {
                setError('Debes iniciar sesión para ver tu configuración');
                return;
            }

            try {
                const response = await apiService.getUserConfig(user.id);
                if (response.status === 'success' && response.config) {
                    setConfig(response.config);
                } else {
                    if (response.message === 'Usuario no encontrado') {
                        setError('Tu perfil no se encuentra en el sistema. Por favor, contacta a soporte.');
                        setTimeout(() => {
                            navigate('/');
                        }, 3000);
                    } else {
                        throw new Error(response.message || 'Error al cargar la configuración');
                    }
                }
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Error al cargar la configuración';
                setError(errorMessage);
                if (errorMessage === 'Usuario no encontrado') {
                    setTimeout(() => {
                        navigate('/');
                    }, 3000);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchConfig();
    }, [user?.id, navigate]);

    const handleConfigChange = async (key: keyof ConfiguracionUsuario, value: any) => {
        if (!user?.id) {
            setError('Debes iniciar sesión para actualizar tu configuración');
            return;
        }

        try {
            setError(null);
            setSuccessMessage(null);
            
            const newConfig = { ...config, [key]: value };
            const response = await apiService.updateUserConfig(user.id, newConfig);
            
            if (response.status === 'success') {
                setConfig(newConfig);
                setSuccessMessage('Configuración actualizada exitosamente');
            } else {
                if (response.message === 'Usuario no encontrado') {
                    setError('Tu perfil no se encuentra en el sistema. Por favor, contacta a soporte.');
                    setTimeout(() => {
                        navigate('/');
                    }, 3000);
                } else {
                    throw new Error(response.message || 'Error al actualizar la configuración');
                }
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error al actualizar la configuración';
            setError(errorMessage);
            if (errorMessage === 'Usuario no encontrado') {
                setTimeout(() => {
                    navigate('/');
                }, 3000);
            }
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center p-8 bg-red-50 rounded-lg">
                    <div className="text-red-600 text-xl mb-4">⚠️</div>
                    <h3 className="text-xl font-semibold mb-2 text-red-700">Error</h3>
                    <p className="text-red-600">{error}</p>
                    {error === 'Usuario no encontrado' && (
                        <p className="mt-4 text-sm text-gray-600">
                            Serás redirigido a la página principal en unos segundos...
                        </p>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white shadow rounded-lg">
                    {/* Encabezado */}
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-2xl font-bold text-gray-900">Configuración</h2>
                    </div>

                    {/* Contenido */}
                    <div className="px-6 py-4">
                        {error && (
                            <div className="mb-4 p-4 bg-red-50 rounded-md">
                                <p className="text-red-700">{error}</p>
                            </div>
                        )}

                        {successMessage && (
                            <div className="mb-4 p-4 bg-green-50 rounded-md">
                                <p className="text-green-700">{successMessage}</p>
                            </div>
                        )}

                        <div className="space-y-6">
                            {/* Notificaciones por Email */}
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900">Notificaciones por Email</h3>
                                    <p className="text-sm text-gray-500">Recibe actualizaciones sobre tus pedidos y ofertas especiales</p>
                                </div>
                                <button
                                    className={`${
                                        config.notificaciones_email
                                            ? 'bg-blue-600'
                                            : 'bg-gray-200'
                                    } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
                                    onClick={() => handleConfigChange('notificaciones_email', !config.notificaciones_email)}
                                >
                                    <span
                                        className={`${
                                            config.notificaciones_email ? 'translate-x-5' : 'translate-x-0'
                                        } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                                    />
                                </button>
                            </div>

                            {/* Tema Oscuro */}
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900">Tema Oscuro</h3>
                                    <p className="text-sm text-gray-500">Cambia la apariencia de la aplicación</p>
                                </div>
                                <button
                                    className={`${
                                        config.tema_oscuro
                                            ? 'bg-blue-600'
                                            : 'bg-gray-200'
                                    } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
                                    onClick={() => handleConfigChange('tema_oscuro', !config.tema_oscuro)}
                                >
                                    <span
                                        className={`${
                                            config.tema_oscuro ? 'translate-x-5' : 'translate-x-0'
                                        } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                                    />
                                </button>
                            </div>

                            {/* Idioma */}
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">Idioma</h3>
                                <select
                                    value={config.idioma}
                                    onChange={(e) => handleConfigChange('idioma', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                >
                                    <option value="es">Español</option>
                                    <option value="en">English</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConfiguracionPage; 