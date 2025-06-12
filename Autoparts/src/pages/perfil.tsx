import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import type { UserProfile, UpdateProfileRequest } from '../types/api';
import { apiService } from '../services/api';
import { useNavigate } from 'react-router-dom';

const PerfilPage: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<UpdateProfileRequest>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    useEffect(() => {
        const fetchProfile = async () => {
            if (!user?.id) {
                setError('Debes iniciar sesión para ver tu perfil');
                return;
            }

            try {
                const response = await apiService.getUserProfile(user.id);
                if (response.status === 'success' && response.profile) {
                    setProfile(response.profile);
                    setFormData({
                        nombre: response.profile.nombre,
                        email: response.profile.email,
                        direccion: response.profile.direccion,
                        telefono: response.profile.telefono
                    });
                } else {
                    if (response.message === 'Usuario no encontrado') {
                        setError('Tu perfil no se encuentra en el sistema. Por favor, contacta a soporte.');
                    } else {
                        throw new Error(response.message || 'Error al cargar el perfil');
                    }
                }
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Error al cargar el perfil';
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

        fetchProfile();
    }, [user?.id, navigate]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user?.id) {
            setError('Debes iniciar sesión para actualizar tu perfil');
            return;
        }

        setError(null);
        setSuccessMessage(null);

        try {
            const response = await apiService.updateProfile(user.id, formData);
            if (response.status === 'success') {
                setSuccessMessage('Perfil actualizado exitosamente');
                setIsEditing(false);
                // Recargar el perfil para mostrar los cambios actualizados
                const profileResponse = await apiService.getUserProfile(user.id);
                if (profileResponse.status === 'success' && profileResponse.profile) {
                    setProfile(profileResponse.profile);
                }
            } else {
                if (response.message === 'Usuario no encontrado') {
                    setError('Tu perfil no se encuentra en el sistema. Por favor, contacta a soporte.');
                    setTimeout(() => {
                        navigate('/');
                    }, 3000);
                } else {
                    throw new Error(response.message || 'Error al actualizar el perfil');
                }
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al actualizar el perfil');
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
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-gray-900">Mi Perfil</h2>
                            <button
                                onClick={() => setIsEditing(!isEditing)}
                                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                {isEditing ? 'Cancelar' : 'Editar Perfil'}
                            </button>
                        </div>
                    </div>

                    {/* Contenido */}
                    <div className="px-6 py-4">
                        {successMessage && (
                            <div className="mb-4 p-4 bg-green-50 rounded-md">
                                <p className="text-green-700">{successMessage}</p>
                            </div>
                        )}

                        {isEditing ? (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Nombre</label>
                                    <input
                                        type="text"
                                        name="nombre"
                                        value={formData.nombre || ''}
                                        onChange={handleInputChange}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email || ''}
                                        onChange={handleInputChange}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Dirección</label>
                                    <input
                                        type="text"
                                        name="direccion"
                                        value={formData.direccion || ''}
                                        onChange={handleInputChange}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Teléfono</label>
                                    <input
                                        type="tel"
                                        name="telefono"
                                        value={formData.telefono || ''}
                                        onChange={handleInputChange}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    />
                                </div>
                                <div className="flex justify-end space-x-3">
                                    <button
                                        type="button"
                                        onClick={() => setIsEditing(false)}
                                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                                    >
                                        Guardar Cambios
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900">Información Personal</h3>
                                    <dl className="mt-2 divide-y divide-gray-200">
                                        <div className="py-3 flex justify-between">
                                            <dt className="text-sm font-medium text-gray-500">Nombre</dt>
                                            <dd className="text-sm text-gray-900">{profile?.nombre}</dd>
                                        </div>
                                        <div className="py-3 flex justify-between">
                                            <dt className="text-sm font-medium text-gray-500">Email</dt>
                                            <dd className="text-sm text-gray-900">{profile?.email}</dd>
                                        </div>
                                        <div className="py-3 flex justify-between">
                                            <dt className="text-sm font-medium text-gray-500">Dirección</dt>
                                            <dd className="text-sm text-gray-900">{profile?.direccion || '-'}</dd>
                                        </div>
                                        <div className="py-3 flex justify-between">
                                            <dt className="text-sm font-medium text-gray-500">Teléfono</dt>
                                            <dd className="text-sm text-gray-900">{profile?.telefono || '-'}</dd>
                                        </div>
                                        <div className="py-3 flex justify-between">
                                            <dt className="text-sm font-medium text-gray-500">Tipo de Usuario</dt>
                                            <dd className="text-sm text-gray-900">{profile?.role}</dd>
                                        </div>
                                        <div className="py-3 flex justify-between">
                                            <dt className="text-sm font-medium text-gray-500">Fecha de Registro</dt>
                                            <dd className="text-sm text-gray-900">
                                                {new Date(profile?.fecha_registro || '').toLocaleDateString()}
                                            </dd>
                                        </div>
                                        {profile?.ultima_compra && (
                                            <div className="py-3 flex justify-between">
                                                <dt className="text-sm font-medium text-gray-500">Última Compra</dt>
                                                <dd className="text-sm text-gray-900">
                                                    {new Date(profile.ultima_compra).toLocaleDateString()}
                                                </dd>
                                            </div>
                                        )}
                                    </dl>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PerfilPage; 