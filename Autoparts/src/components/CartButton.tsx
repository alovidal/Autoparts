import React from 'react';
import { useCart } from '../context/CartContext';
import { ShoppingCartIcon } from '@heroicons/react/24/outline';

const CartButton: React.FC = () => {
    const { cart } = useCart();
    const itemCount = cart.items.reduce((total, item) => total + item.cantidad, 0);

    return (
        <div className="relative">
            <button
                className="flex items-center text-gray-700 hover:text-gray-900 focus:outline-none"
                aria-label="Carrito de compras"
            >
                <ShoppingCartIcon className="h-6 w-6" />
                {itemCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                        {itemCount}
                    </span>
                )}
            </button>
        </div>
    );
};

export default CartButton; 