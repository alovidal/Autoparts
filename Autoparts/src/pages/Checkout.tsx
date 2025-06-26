import React from 'react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const Checkout: React.FC = () => {
  const { cart, clearCart } = useCart();
  const { user } = useAuth();

  const total = cart.reduce((sum, item) => sum + item.valor_total, 0);

  const handleConfirmar = () => {
    // Aquí deberías llamar al servicio de pedidos
    toast.success('Pedido confirmado (simulado)');
    clearCart();
  };

  if (!user) {
    return <div className="p-8 text-center text-red-600">Debes iniciar sesión para realizar el checkout.</div>;
  }

  if (cart.length === 0) {
    return <div className="p-8 text-center text-gray-500">Tu carrito está vacío.</div>;
  }

  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Checkout</h1>
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Resumen del pedido</h2>
        <ul className="mb-4">
          {cart.map(item => (
            <li key={item.id_producto} className="flex justify-between border-b py-2">
              <span>{item.nombre}</span>
              <span>${item.valor_total.toLocaleString()}</span>
            </li>
          ))}
        </ul>
        <div className="flex justify-between font-bold text-lg">
          <span>Total:</span>
          <span>${total.toLocaleString()}</span>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Datos del usuario</h2>
        <div className="mb-2"><strong>Nombre:</strong> {user.nombre_completo}</div>
        <div className="mb-2"><strong>Correo:</strong> {user.correo}</div>
      </div>
      <button onClick={handleConfirmar} className="w-full bg-blue-600 text-white py-3 rounded font-bold text-lg hover:bg-blue-700 transition">Confirmar pedido</button>
    </div>
  );
};

export default Checkout; 