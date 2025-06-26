import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { UserIcon } from '@heroicons/react/24/solid';

const Perfil: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [nombre, setNombre] = useState(user?.nombre_completo || '');
  const [correo, setCorreo] = useState(user?.correo || '');
  const [contrasena, setContrasena] = useState('');
  const [editando, setEditando] = useState(false);

  if (!user) {
    return <div className="p-8 text-center text-red-600">Debes iniciar sesión para ver tu perfil.</div>;
  }

  const handleGuardar = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateUser({ nombre_completo: nombre, correo, contrasena });
      toast.success('Perfil actualizado');
      setEditando(false);
    } catch {
      toast.error('Error al actualizar el perfil');
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center">
        {/* Avatar y resumen */}
        <div className="flex flex-col items-center mb-6 w-full">
          <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center mb-3 border-4 border-blue-200">
            <UserIcon className="w-16 h-16 text-blue-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">{user.nombre_completo}</h2>
          <div className="text-gray-500 mb-1">{user.correo}</div>
          <span className="inline-block bg-blue-50 text-blue-700 text-xs px-3 py-1 rounded-full font-semibold mb-2 uppercase tracking-wide">{user.rol}</span>
        </div>

        {/* Formulario de edición */}
        <form onSubmit={handleGuardar} className="w-full flex flex-col gap-4 mt-2">
          <div>
            <label className="block text-gray-700 font-medium mb-1">Nombre completo</label>
            <input type="text" className="mt-1 w-full border rounded px-3 py-2" value={editando ? nombre : user.nombre_completo} onChange={e => setNombre(e.target.value)} disabled={!editando} />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-1">Correo</label>
            <input type="email" className="mt-1 w-full border rounded px-3 py-2" value={editando ? correo : user.correo} onChange={e => setCorreo(e.target.value)} disabled={!editando} />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-1">Contraseña</label>
            <input type="password" className="mt-1 w-full border rounded px-3 py-2" value={contrasena} onChange={e => setContrasena(e.target.value)} disabled={!editando} placeholder="••••••••" />
            <span className="text-xs text-gray-400">Deja en blanco para no cambiarla</span>
          </div>
          <div className="flex gap-2 justify-end mt-2">
            {!editando ? (
              <button type="button" className="bg-blue-600 text-white px-6 py-2 rounded shadow hover:bg-blue-700 transition" onClick={() => setEditando(true)}>Editar perfil</button>
            ) : (
              <>
                <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded shadow hover:bg-green-700 transition">Guardar cambios</button>
                <button type="button" className="bg-gray-300 px-6 py-2 rounded shadow hover:bg-gray-400 transition" onClick={() => setEditando(false)}>Cancelar</button>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default Perfil; 