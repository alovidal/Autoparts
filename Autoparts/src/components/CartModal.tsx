import React, { useState, useEffect, useCallback } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { apiService } from '../services/api';
import type { CarritoResponse, CarritoItem } from '../types/api';

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
  carritoId?: number;
}

const CartItem: React.FC<{ item: CarritoItem }> = React.memo(({ item }) => (
  <div className="flex items-center space-x-4 border-b pb-4">
    <div className="flex-1">
      <h4 className="text-sm font-medium text-gray-900">{item.nombre}</h4>
      <div className="flex items-center justify-between mt-1">
        <div className="text-sm text-gray-500">
          Cantidad: {item.cantidad}
        </div>
        <div className="text-sm font-medium text-gray-900">
          ${item.valor_total.toLocaleString()}
        </div>
      </div>
    </div>
  </div>
));

CartItem.displayName = 'CartItem';

const LoadingDialog: React.FC<{ isOpen: boolean; onClose: () => void }> = React.memo(({ isOpen, onClose }) => (
  <Dialog as="div" className="relative z-50" open={isOpen} onClose={onClose}>
    <div className="fixed inset-0 bg-black bg-opacity-25" />
    <div className="fixed inset-0 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg">
        <p className="text-gray-600">Cargando carrito...</p>
      </div>
    </div>
  </Dialog>
));

LoadingDialog.displayName = 'LoadingDialog';

const CartModal: React.FC<CartModalProps> = ({ isOpen, onClose, carritoId }) => {
  const [carrito, setCarrito] = useState<CarritoResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCarrito = useCallback(async () => {
    if (!carritoId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await apiService.getCarrito(carritoId);
      if (data.status === 'success') {
        setCarrito(data);
      } else {
        throw new Error(data.message || 'Error al cargar el carrito');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar el carrito');
      console.error('Error al cargar el carrito:', err);
    } finally {
      setIsLoading(false);
    }
  }, [carritoId]);

  useEffect(() => {
    if (isOpen && carritoId) {
      fetchCarrito();
    }
  }, [isOpen, carritoId, fetchCarrito]);

  const handleProcederPago = useCallback(async () => {
    if (!carritoId || !carrito) return;

    try {
      const detallePedido = await apiService.crearDetallePedido({
        id_detalle: Date.now(),
        id_carrito: carritoId,
        id_usuario: 1,
        direccion: 'Dirección de ejemplo'
      });

      if (detallePedido.status === 'success') {
        console.log('Pedido creado:', detallePedido);
        onClose();
      } else {
        throw new Error(detallePedido.message || 'Error al procesar el pedido');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al procesar el pedido');
      console.error('Error al procesar el pedido:', err);
    }
  }, [carritoId, carrito, onClose]);

  if (isLoading) {
    return <LoadingDialog isOpen={isOpen} onClose={onClose} />;
  }

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900 flex justify-between items-center"
                >
                  <span>Carrito de Compras</span>
                  {carrito && (
                    <span className="text-sm text-gray-500">
                      {carrito.productos.length} {carrito.productos.length === 1 ? 'item' : 'items'}
                    </span>
                  )}
                </Dialog.Title>

                {error && (
                  <div className="mt-4 p-2 bg-red-100 border border-red-400 text-red-700 rounded">
                    {error}
                  </div>
                )}

                <div className="mt-4">
                  {!carrito || carrito.productos.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="text-gray-400 text-6xl mb-4">🛒</div>
                      <p className="text-gray-500">Tu carrito está vacío</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {carrito.productos.map((item, index) => (
                        <CartItem key={`${item.id_producto}-${index}`} item={item} />
                      ))}

                      <div className="border-t pt-4 space-y-2">
                        <div className="flex justify-between text-base font-medium">
                          <span className="text-gray-900">Total</span>
                          <span className="text-blue-600">
                            ${carrito.total_final.toLocaleString()}
                          </span>
                        </div>
                      </div>

                      <div className="mt-6">
                        <button
                          type="button"
                          onClick={handleProcederPago}
                          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                        >
                          Proceder al Pago
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-4 text-center">
                  <button
                    type="button"
                    onClick={onClose}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    Cerrar
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default React.memo(CartModal); 