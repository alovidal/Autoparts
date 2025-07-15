import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { ProductoCarrito, AgregarAlCarritoRequest } from '../types';
import { carritoService, productoService } from '../services/api';
import toast from 'react-hot-toast';

interface CartContextType {
  cartId: number | null;
  cartItems: ProductoCarrito[];
  loading: boolean;
  addToCart: (data: AgregarAlCarritoRequest) => Promise<boolean>;
  removeFromCart: (productId: number) => Promise<boolean>;
  updateQuantity: (productId: number, cantidad: number) => Promise<boolean>;
  clearCart: () => Promise<boolean>;
  getCartTotal: () => number;
  getCartItemCount: () => number;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart debe ser usado dentro de un CartProvider');
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [cartId, setCartId] = useState<number | null>(null);
  const [cartItems, setCartItems] = useState<ProductoCarrito[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Verificar si hay un carrito guardado en localStorage
    const savedCartId = localStorage.getItem('cartId');
    if (savedCartId) {
      setCartId(parseInt(savedCartId));
    }
  }, []);

  useEffect(() => {
    // Cargar productos del carrito cuando cambie el cartId
    if (cartId) {
      const loadCart = async () => {
        try {
          setLoading(true);
          const { productos } = await carritoService.obtenerProductos(cartId);
          setCartItems(productos);
        } catch (error) {
          console.error('Error al cargar carrito:', error);
          // Si el carrito no existe, limpiar localStorage y crear uno nuevo
          localStorage.removeItem('cartId');
          setCartId(null);
          setCartItems([]);
          toast.error('Carrito no encontrado, se creará uno nuevo');
        } finally {
          setLoading(false);
        }
      };
      loadCart();
    } else {
      // Si no hay cartId, limpiar los items
      setCartItems([]);
    }
  }, [cartId]);

  const createCart = async (): Promise<number> => {
    try {
      const { id_carrito } = await carritoService.crearCarrito();
      setCartId(id_carrito);
      localStorage.setItem('cartId', id_carrito.toString());
      return id_carrito;
    } catch (error) {
      console.error('Error al crear carrito:', error);
      throw error;
    }
  };

  const refreshCart = useCallback(async (): Promise<void> => {
    if (!cartId) return;

    try {
      setLoading(true);
      const { productos } = await carritoService.obtenerProductos(cartId);
      setCartItems(productos);
    } catch (error) {
      console.error('Error al cargar carrito:', error);
      toast.error('Error al cargar el carrito');
    } finally {
      setLoading(false);
    }
  }, [cartId]);

  const addToCart = useCallback(async (data: AgregarAlCarritoRequest): Promise<boolean> => {
    try {
      setLoading(true);
      let currentCartId = cartId;
      if (!currentCartId) {
        currentCartId = await createCart();
      }
      console.log('🛒 Agregando producto al carrito:', data, 'Carrito ID:', currentCartId);

      await carritoService.agregarProducto(currentCartId, {
        ...data,
        id_carrito: currentCartId,
      });

      console.log('✅ Producto agregado exitosamente');
      await refreshCart();
      return true;
    } catch (error: any) {
      console.error('❌ Error en addToCart:', error);
      const errorMessage = error.response?.data?.error || 'Error al agregar al carrito';
      toast.error(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, [cartId, refreshCart]);

  const removeFromCart = useCallback(async (productId: number): Promise<boolean> => {
    if (!cartId) return false;

    try {
      setLoading(true);
      await carritoService.eliminarProducto(cartId, productId);
      await refreshCart();
      toast.success('Producto eliminado del carrito');
      return true;
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Error al eliminar del carrito';
      toast.error(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, [cartId, refreshCart]);

  const updateQuantity = useCallback(async (productId: number, cantidad: number): Promise<boolean> => {
    if (!cartId) return false;

    try {
      setLoading(true);
      await carritoService.actualizarCantidad(cartId, productId, cantidad);
      await refreshCart();
      toast.success('Cantidad actualizada');
      return true;
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Error al actualizar cantidad';
      toast.error(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, [cartId, refreshCart]);

  const clearCart = useCallback(async (): Promise<boolean> => {
    if (!cartId) return false;

    try {
      setLoading(true);
      await carritoService.vaciarCarrito(cartId);
      setCartItems([]);
      toast.success('Carrito vaciado');
      return true;
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Error al vaciar el carrito';
      toast.error(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, [cartId]);

  const getCartTotal = useCallback((): number => {
    return cartItems.reduce((total, item) => total + item.valor_total, 0);
  }, [cartItems]);

  const getCartItemCount = useCallback((): number => {
    return cartItems.reduce((count, item) => count + item.cantidad, 0);
  }, [cartItems]);

  const value: CartContextType = {
    cartId,
    cartItems,
    loading,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartItemCount,
    refreshCart,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};