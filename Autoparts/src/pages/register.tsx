import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RegisterPage: React.FC = () => {
    const navigate = useNavigate();
    const { register } = useAuth();
    const [correo, setCorreo] = useState('');
    const [contrasena, setContrasena] = useState('');
    const [confirmContrasena, setConfirmContrasena] = useState('');
    const [nombreCompleto, setNombreCompleto] = useState('');
    const [rut, setRut] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        if (contrasena !== confirmContrasena) {
            setError('Las contraseñas no coinciden');
            setLoading(false);
            return;
        }

        try {
            const response = await register({
                correo,
                contrasena,
                nombre_completo: nombreCompleto,
                rut
            });

            if (response.status === 'success') {
                navigate('/');
            } else {
                setError(response.message || 'Error al registrar usuario');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al registrar usuario');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    Crear una cuenta
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    ¿Ya tienes una cuenta?{' '}
                    <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
                        Inicia sesión aquí
                    </Link>
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="nombreCompleto" className="block text-sm font-medium text-gray-700">
                                Nombre completo
                            </label>
                            <div className="mt-1">
                                <input
                                    id="nombreCompleto"
                                    name="nombreCompleto"
                                    type="text"
                                    required
                                    value={nombreCompleto}
                                    onChange={(e) => setNombreCompleto(e.target.value)}
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="rut" className="block text-sm font-medium text-gray-700">
                                RUT
                            </label>
                            <div className="mt-1">
                                <input
                                    id="rut"
                                    name="rut"
                                    type="text"
                                    required
                                    value={rut}
                                    onChange={(e) => setRut(e.target.value)}
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    placeholder="12345678-9"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="correo" className="block text-sm font-medium text-gray-700">
                                Correo electrónico
                            </label>
                            <div className="mt-1">
                                <input
                                    id="correo"
                                    name="correo"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={correo}
                                    onChange={(e) => setCorreo(e.target.value)}
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="contrasena" className="block text-sm font-medium text-gray-700">
                                Contraseña
                            </label>
                            <div className="mt-1">
                                <input
                                    id="contrasena"
                                    name="contrasena"
                                    type="password"
                                    required
                                    value={contrasena}
                                    onChange={(e) => setContrasena(e.target.value)}
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="confirmContrasena" className="block text-sm font-medium text-gray-700">
                                Confirmar contraseña
                            </label>
                            <div className="mt-1">
                                <input
                                    id="confirmContrasena"
                                    name="confirmContrasena"
                                    type="password"
                                    required
                                    value={confirmContrasena}
                                    onChange={(e) => setConfirmContrasena(e.target.value)}
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="rounded-md bg-red-50 p-4">
                                <div className="flex">
                                    <div className="ml-3">
                                        <h3 className="text-sm font-medium text-red-800">
                                            {error}
                                        </h3>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                                    loading ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                            >
                                {loading ? 'Registrando...' : 'Registrarse'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage; 