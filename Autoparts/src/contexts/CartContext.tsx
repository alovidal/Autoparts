import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ProductoCarrito, AgregarAlCarritoRequest } from '../types';
import { carritoService, productoService } from '../services/api';
import toast from 'react-hot-toast';

interface CartContextType {
  cartId: number | null;
  cartItems: ProductoCarrito[];
  loading: boolean;
  addToCart: (data: AgregarAlCarritoRequest) => Promise<boolean>;
  removeFromCart: (productId: number) => Promise<boolean>;
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
      refreshCart();
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

  const refreshCart = async (): Promise<void> => {
    if (!cartId) return;

    try {
      setLoading(true);
      const { productos } = await carritoService.obtenerProductos(cartId);
      
      // Enriquecer los productos con información adicional
      const enrichedProducts = await Promise.all(
        productos.map(async (item) => {
          try {
            const productoInfo = await productoService.obtenerProducto(item.id_producto);
            return {
              ...item,
              nombre: productoInfo.nombre,
              marca: productoInfo.marca,
              imagen: productoInfo.imagen,
            };
          } catch (error) {
            console.error(`Error al obtener información del producto ${item.id_producto}:`, error);
            return item;
          }
        })
      );
      
      setCartItems(enrichedProducts);
    } catch (error) {
      console.error('Error al cargar carrito:', error);
      toast.error('Error al cargar el carrito');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (data: AgregarAlCarritoRequest): Promise<boolean> => {
    try {
      setLoading(true);
      
      let currentCartId = cartId;
      if (!currentCartId) {
        currentCartId = await createCart();
      }

      await carritoService.agregarProducto(currentCartId, {
        ...data,
        id_carrito: currentCartId,
      });

      await refreshCart();
      toast.success('Producto agregado al carrito');
      return true;
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Error al agregar al carrito';
      toast.error(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (productId: number): Promise<boolean> => {
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
  };

  const clearCart = async (): Promise<boolean> => {
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
  };

  const getCartTotal = (): number => {
    return cartItems.reduce((total, item) => total + item.valor_total, 0);
  };

  const getCartItemCount = (): number => {
    return cartItems.reduce((count, item) => count + item.cantidad, 0);
  };

  const value: CartContextType = {
    cartId,
    cartItems,
    loading,
    addToCart,
    removeFromCart,
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