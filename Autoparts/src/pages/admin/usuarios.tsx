import React, { useState, useEffect } from 'react';
import { authService } from '../../services/auth';
import { User, UserRole, UserUpdateRequest } from '../../types/auth';

const AdminUsuariosPage: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [formData, setFormData] = useState<UserUpdateRequest | null>(null);

    const fetchUsers = async () => {
        try {
            const response = await authService.getUsers();
            if (response.status === 'success' && response.users) {
                setUsers(response.users);
            } else {
                throw new Error(response.message || 'Error al cargar usuarios');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al cargar usuarios');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleEdit = (user: User) => {
        setEditingUser(user);
        setFormData({
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
            nombre: user.nombre,
            apellido: user.apellido,
            telefono: user.telefono,
            direccion: user.direccion,
            rut: user.rut,
            razon_social: user.razon_social,
            descuento: user.descuento
        });
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        if (!formData) return;
        
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev!,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData) return;

        try {
            const response = await authService.updateUser(formData);
            if (response.status === 'success') {
                await fetchUsers();
                setEditingUser(null);
                setFormData(null);
            } else {
                throw new Error(response.message || 'Error al actualizar usuario');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al actualizar usuario');
        }
    };

    const handleDelete = async (userId: number) => {
        if (!window.confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
            return;
        }

        try {
            const response = await authService.deleteUser(userId);
            if (response.status === 'success') {
                await fetchUsers();
            } else {
                throw new Error(response.message || 'Error al eliminar usuario');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al eliminar usuario');
        }
    };

    const handleConvertToEmpresa = async (userId: number) => {
        try {
            const response = await authService.convertToEmpresa(userId);
            if (response.status === 'success') {
                await fetchUsers();
            } else {
                throw new Error(response.message || 'Error al convertir a empresa');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al convertir a empresa');
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Administración de Usuarios</h1>

            {error && (
                <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
                    {error}
                </div>
            )}

            {editingUser ? (
                <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
                    <h2 className="text-xl font-bold mb-4">Editar Usuario</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-gray-700 text-sm font-bold mb-2">
                                    Nombre de usuario
                                </label>
                                <input
                                    type="text"
                                    name="username"
                                    value={formData?.username || ''}
                                    onChange={handleChange}
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-700 text-sm font-bold mb-2">
                                    Correo electrónico
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData?.email || ''}
                                    onChange={handleChange}
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-700 text-sm font-bold mb-2">
                                    Rol
                                </label>
                                <select
                                    name="role"
                                    value={formData?.role || ''}
                                    onChange={handleChange}
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                >
                                    {Object.values(UserRole).map(role => (
                                        <option key={role} value={role}>
                                            {role}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-gray-700 text-sm font-bold mb-2">
                                    Descuento (%)
                                </label>
                                <input
                                    type="number"
                                    name="descuento"
                                    value={formData?.descuento || ''}
                                    onChange={handleChange}
                                    disabled={formData?.role !== UserRole.EMPRESA}
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end space-x-4">
                            <button
                                type="button"
                                onClick={() => {
                                    setEditingUser(null);
                                    setFormData(null);
                                }}
                                className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                            >
                                Guardar cambios
                            </button>
                        </div>
                    </form>
                </div>
            ) : (
                <div className="bg-white shadow-md rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Usuario
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Correo
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Rol
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Descuento
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Acciones
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {users.map(user => (
                                <tr key={user.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">
                                            {user.username}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {user.nombre} {user.apellido}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {user.email}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                            user.role === UserRole.ADMIN ? 'bg-red-100 text-red-800' :
                                            user.role === UserRole.EMPRESA ? 'bg-green-100 text-green-800' :
                                            'bg-blue-100 text-blue-800'
                                        }`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {user.descuento ? `${user.descuento}%` : '-'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                        <button
                                            onClick={() => handleEdit(user)}
                                            className="text-indigo-600 hover:text-indigo-900"
                                        >
                                            Editar
                                        </button>
                                        {user.role !== UserRole.EMPRESA && (
                                            <button
                                                onClick={() => handleConvertToEmpresa(user.id)}
                                                className="text-green-600 hover:text-green-900"
                                            >
                                                Convertir a empresa
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleDelete(user.id)}
                                            className="text-red-600 hover:text-red-900"
                                        >
                                            Eliminar
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default AdminUsuariosPage; 