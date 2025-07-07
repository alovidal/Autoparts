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
  resetCart: () => void; // Nueva función para resetear el carrito
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
      const parsedCartId = parseInt(savedCartId);
      console.log('🔍 Carrito guardado encontrado:', parsedCartId);
      // Verificar si el carrito existe antes de usarlo
      verifyCartExists(parsedCartId);
    }
  }, []);

  // Nueva función para verificar si el carrito existe
  const verifyCartExists = async (id: number) => {
    try {
      console.log('🔍 Verificando si el carrito existe:', id);
      const response = await fetch(`http://localhost:5000/diagnostico/carritos`);
      const diagnostico = await response.json();
      
      const carritoExiste = diagnostico.carritos_existentes.some((c: any) => c.id === id);
      
      if (carritoExiste) {
        console.log('✅ Carrito existe, configurando ID:', id);
        setCartId(id);
      } else {
        console.log('❌ Carrito no existe, limpiando localStorage');
        localStorage.removeItem('cartId');
        setCartId(null);
        setCartItems([]);
      }
    } catch (error) {
      console.error('❌ Error verificando carrito:', error);
      // En caso de error, limpiar el estado
      localStorage.removeItem('cartId');
      setCartId(null);
      setCartItems([]);
    }
  };

  useEffect(() => {
    // Cargar productos del carrito cuando cambie el cartId
    if (cartId) {
      loadCartItems();
    } else {
      setCartItems([]);
    }
  }, [cartId]);

  const loadCartItems = async () => {
    if (!cartId) return;

    try {
      setLoading(true);
      console.log('📦 Cargando productos del carrito:', cartId);
      const { productos } = await carritoService.obtenerProductos(cartId);
      setCartItems(productos);
      console.log('✅ Productos cargados:', productos.length);
    } catch (error: any) {
      console.error('❌ Error al cargar carrito:', error);
      
      // Si el carrito no existe (404), resetear el estado
      if (error.response?.status === 404) {
        console.log('🔄 Carrito no encontrado, reseteando estado');
        resetCart();
        toast.error('El carrito ha expirado, se ha creado uno nuevo');
      } else {
        toast.error('Error al cargar el carrito');
      }
    } finally {
      setLoading(false);
    }
  };

  const createCart = async (): Promise<number> => {
    try {
      console.log('🛒 Creando nuevo carrito...');
      const { id_carrito } = await carritoService.crearCarrito();
      console.log('✅ Carrito creado exitosamente:', id_carrito);
      
      setCartId(id_carrito);
      localStorage.setItem('cartId', id_carrito.toString());
      return id_carrito;
    } catch (error) {
      console.error('❌ Error al crear carrito:', error);
      throw error;
    }
  };

  const refreshCart = useCallback(async (): Promise<void> => {
    if (!cartId) return;
    await loadCartItems();
  }, [cartId]);

  const resetCart = () => {
    console.log('🔄 Reseteando carrito');
    setCartId(null);
    setCartItems([]);
    localStorage.removeItem('cartId');
  };

  const addToCart = useCallback(async (data: AgregarAlCarritoRequest): Promise<boolean> => {
    try {
      setLoading(true);
      let currentCartId = cartId;
      
      // Si no hay carrito, crear uno nuevo
      if (!currentCartId) {
        console.log('🛒 No hay carrito, creando uno nuevo...');
        currentCartId = await createCart();
      }
      
      console.log('🛒 Agregando producto al carrito:', data, 'Carrito ID:', currentCartId);

      // Intentar agregar el producto
      await carritoService.agregarProducto(currentCartId, {
        ...data,
        id_carrito: currentCartId,
      });

      console.log('✅ Producto agregado exitosamente');
      await refreshCart();
      toast.success('Producto agregado al carrito');
      return true;
      
    } catch (error: any) {
      console.error('❌ Error en addToCart:', error);
      
      // Manejar diferentes tipos de errores
      if (error.response?.status === 404 && error.response?.data?.error?.includes('Carrito')) {
        console.log('🔄 Carrito no encontrado, creando uno nuevo...');
        resetCart();
        // Intentar de nuevo con un carrito nuevo
        try {
          const newCartId = await createCart();
          await carritoService.agregarProducto(newCartId, {
            ...data,
            id_carrito: newCartId,
          });
          await refreshCart();
          toast.success('Producto agregado al carrito');
          return true;
        } catch (retryError) {
          console.error('❌ Error en reintento:', retryError);
          toast.error('Error al agregar al carrito');
          return false;
        }
      } else {
        const errorMessage = error.response?.data?.error || 'Error al agregar al carrito';
        toast.error(errorMessage);
        return false;
      }
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
    resetCart,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};