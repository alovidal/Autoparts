import React, { useState, useEffect } from 'react';
import { Tab } from '@headlessui/react';
import axios from 'axios';

interface Product {
  id: number;
  name: string;
  stock: number;
  price: number;
}

interface Order {
  id: number;
  date: string;
  status: string;
  items: Array<{
    product_id: number;
    quantity: number;
    product_name: string;
  }>;
}

export const WarehousePanel: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    // Cargar productos
    const fetchProducts = async () => {
      try {
        const response = await axios.get('/api/products');
        setProducts(response.data);
      } catch (error) {
        console.error('Error al cargar productos:', error);
      }
    };

    // Cargar pedidos
    const fetchOrders = async () => {
      try {
        const response = await axios.get('/api/orders');
        setOrders(response.data);
      } catch (error) {
        console.error('Error al cargar pedidos:', error);
      }
    };

    fetchProducts();
    fetchOrders();
  }, []);

  return (
    <div className="w-96 p-4 bg-white rounded-lg shadow-lg">
      <Tab.Group>
        <Tab.List className="flex space-x-1 rounded-xl bg-blue-900/20 p-1">
          <Tab className={({ selected }) =>
            `w-full rounded-lg py-2.5 text-sm font-medium leading-5
             ${selected 
               ? 'bg-white text-blue-700 shadow'
               : 'text-blue-100 hover:bg-white/[0.12] hover:text-white'
             }`
          }>
            Productos
          </Tab>
          <Tab className={({ selected }) =>
            `w-full rounded-lg py-2.5 text-sm font-medium leading-5
             ${selected 
               ? 'bg-white text-blue-700 shadow'
               : 'text-blue-100 hover:bg-white/[0.12] hover:text-white'
             }`
          }>
            Pedidos
          </Tab>
        </Tab.List>
        <Tab.Panels className="mt-2">
          <Tab.Panel className="rounded-xl bg-white p-3">
            <div className="max-h-96 overflow-y-auto">
              <table className="min-w-full">
                <thead>
                  <tr>
                    <th className="px-4 py-2">Nombre</th>
                    <th className="px-4 py-2">Stock</th>
                    <th className="px-4 py-2">Precio</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id} className="border-t">
                      <td className="px-4 py-2">{product.name}</td>
                      <td className="px-4 py-2">{product.stock}</td>
                      <td className="px-4 py-2">${product.price}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Tab.Panel>
          <Tab.Panel className="rounded-xl bg-white p-3">
            <div className="max-h-96 overflow-y-auto">
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold">Pedido #{order.id}</span>
                      <span className={`px-2 py-1 rounded-full text-sm ${
                        order.status === 'completed' ? 'bg-green-100 text-green-800' :
                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      Fecha: {new Date(order.date).toLocaleDateString()}
                    </div>
                    <ul className="mt-2">
                      {order.items.map((item, index) => (
                        <li key={index} className="text-sm">
                          {item.quantity}x {item.product_name}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
}; 