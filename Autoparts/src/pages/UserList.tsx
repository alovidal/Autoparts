import React, { useState, useEffect } from 'react';
import { UserService } from '../services/users';
import type { User } from '../types/auth';
import { useAuth } from '../context/AuthContext';

const UserList: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { user: currentUser } = useAuth();
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [editForm, setEditForm] = useState({
        nombre_completo: '',
        rut: '',
        correo: ''
    });

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            const data = await UserService.getUsers();
            setUsers(data);
            setError(null);
        } catch (err) {
            setError('Error al cargar usuarios');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (user: User) => {
        setEditingUser(user);
        setEditForm({
            nombre_completo: user.nombre_completo,
            rut: user.rut,
            correo: user.correo
        });
    };

    const handleUpdate = async () => {
        if (!editingUser) return;

        try {
            await UserService.updateUser(editingUser.id, editForm);
            setEditingUser(null);
            await loadUsers();
            setError(null);
        } catch (err) {
            setError('Error al actualizar usuario');
            console.error(err);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
            return;
        }

        try {
            await UserService.deleteUser(id);
            await loadUsers();
            setError(null);
        } catch (err) {
            setError('Error al eliminar usuario');
            console.error(err);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-6">Gestión de Usuarios</h1>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
                    {error}
                </div>
            )}

            <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Nombre Completo
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                RUT
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Correo
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Rol
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Acciones
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {users.map((user) => (
                            <tr key={user.id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {editingUser?.id === user.id ? (
                                        <input
                                            type="text"
                                            value={editForm.nombre_completo}
                                            onChange={(e) => setEditForm({ ...editForm, nombre_completo: e.target.value })}
                                            className="border rounded px-2 py-1 w-full"
                                        />
                                    ) : (
                                        user.nombre_completo
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {editingUser?.id === user.id ? (
                                        <input
                                            type="text"
                                            value={editForm.rut}
                                            onChange={(e) => setEditForm({ ...editForm, rut: e.target.value })}
                                            className="border rounded px-2 py-1 w-full"
                                        />
                                    ) : (
                                        user.rut
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {editingUser?.id === user.id ? (
                                        <input
                                            type="email"
                                            value={editForm.correo}
                                            onChange={(e) => setEditForm({ ...editForm, correo: e.target.value })}
                                            className="border rounded px-2 py-1 w-full"
                                        />
                                    ) : (
                                        user.correo
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                        ${user.rol === 'ADMIN' ? 'bg-red-100 text-red-800' : 
                                          user.rol === 'BODEGUERO' ? 'bg-green-100 text-green-800' : 
                                          'bg-blue-100 text-blue-800'}`}>
                                        {user.rol}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    {editingUser?.id === user.id ? (
                                        <div className="space-x-2">
                                            <button
                                                onClick={handleUpdate}
                                                className="text-green-600 hover:text-green-900"
                                            >
                                                Guardar
                                            </button>
                                            <button
                                                onClick={() => setEditingUser(null)}
                                                className="text-gray-600 hover:text-gray-900"
                                            >
                                                Cancelar
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="space-x-2">
                                            <button
                                                onClick={() => handleEdit(user)}
                                                className="text-blue-600 hover:text-blue-900"
                                            >
                                                Editar
                                            </button>
                                            {currentUser?.rol === 'ADMIN' && user.id !== currentUser.id && (
                                                <button
                                                    onClick={() => handleDelete(user.id)}
                                                    className="text-red-600 hover:text-red-900"
                                                >
                                                    Eliminar
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default UserList; 