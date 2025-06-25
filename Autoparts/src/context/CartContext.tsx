import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Cart, CartItem } from '../types/cart';
import { CartService } from '../services/cart';

interface CartContextType {
    cart: Cart;
    addToCart: (product: CartItem) => void;
    removeFromCart: (productId: number) => void;
    updateQuantity: (productId: number, quantity: number) => void;
    clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart debe ser usado dentro de un CartProvider');
    }
    return context;
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [cart, setCart] = useState<Cart>(() => {
        const savedCart = localStorage.getItem('cart');
        return savedCart ? JSON.parse(savedCart) : { items: [], total: 0, id_carrito: null };
    });

    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cart));
    }, [cart]);

    const calculateTotal = (items: CartItem[]): number => {
        return items.reduce((total, item) => total + (item.precio_unitario * item.cantidad), 0);
    };

    const syncWithDatabase = async (items: CartItem[]) => {
        try {
            if (items.length === 0) return;

            if (!cart.id_carrito) {
                // Crear nuevo carrito en la base de datos
                const response = await CartService.createCart(items);
                setCart(currentCart => ({
                    ...currentCart,
                    id_carrito: response.id_carrito
                }));
            } else {
                // Actualizar carrito existente
                for (const item of items) {
                    await CartService.updateCartItem(cart.id_carrito, item.id_producto, item.cantidad);
                }
            }
        } catch (error) {
            console.error('Error al sincronizar con la base de datos:', error);
        }
    };

    const addToCart = async (product: CartItem) => {
        setCart(currentCart => {
            const existingItem = currentCart.items.find(item => item.id_producto === product.id_producto);
            
            if (existingItem) {
                const newItems = currentCart.items.map(item =>
                    item.id_producto === product.id_producto
                        ? { ...item, cantidad: item.cantidad + product.cantidad }
                        : item
                );
                const newCart = {
                    ...currentCart,
                    items: newItems,
                    total: calculateTotal(newItems)
                };
                syncWithDatabase(newItems);
                return newCart;
            }

            const newItems = [...currentCart.items, product];
            const newCart = {
                ...currentCart,
                items: newItems,
                total: calculateTotal(newItems)
            };
            syncWithDatabase(newItems);
            return newCart;
        });
    };

    const removeFromCart = async (productId: number) => {
        setCart(currentCart => {
            const newItems = currentCart.items.filter(item => item.id_producto !== productId);
            const newCart = {
                ...currentCart,
                items: newItems,
                total: calculateTotal(newItems)
            };

            if (currentCart.id_carrito) {
                CartService.removeCartItem(currentCart.id_carrito, productId)
                    .catch(error => console.error('Error al eliminar item:', error));
            }

            return newCart;
        });
    };

    const updateQuantity = async (productId: number, quantity: number) => {
        if (quantity < 1) return;

        setCart(currentCart => {
            const newItems = currentCart.items.map(item =>
                item.id_producto === productId
                    ? { ...item, cantidad: quantity }
                    : item
            );
            const newCart = {
                ...currentCart,
                items: newItems,
                total: calculateTotal(newItems)
            };

            if (currentCart.id_carrito) {
                CartService.updateCartItem(currentCart.id_carrito, productId, quantity)
                    .catch(error => console.error('Error al actualizar cantidad:', error));
            }

            return newCart;
        });
    };

    const clearCart = () => {
        setCart({ items: [], total: 0, id_carrito: null });
    };

    return (
        <CartContext.Provider value={{
            cart,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart
        }}>
            {children}
        </CartContext.Provider>
    );
};

export default CartContext; 