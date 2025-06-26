import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-800 text-white pt-10 pb-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {/* Columna de la empresa */}
          <div className="lg:col-span-1">
            <h3 className="text-xl font-bold mb-3 tracking-wide">AutoParts</h3>
            <p className="text-gray-400 text-sm">
              Empresa de ejemplo dedicada a la venta de repuestos y accesorios para vehículos de todas las marcas.
            </p>
          </div>

          {/* Columna de Enlaces Rápidos */}
          <div>
            <h4 className="font-semibold mb-3">Enlaces Rápidos</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-gray-400 hover:text-white transition">Inicio</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition">Productos</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition">Contacto de Ejemplo</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition">Blog de Ejemplo</a></li>
            </ul>
          </div>

          {/* Columna de Información */}
          <div>
            <h4 className="font-semibold mb-3">Información</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-gray-400 hover:text-white transition">Política de Privacidad</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition">Términos y Condiciones</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition">Preguntas Frecuentes</a></li>
            </ul>
          </div>

          {/* Columna de Contacto */}
          <div>
            <h4 className="font-semibold mb-3">Contacto de Ejemplo</h4>
            <address className="text-gray-400 text-sm not-italic">
              <p>Av. Ejemplo 123, Ciudad Ficticia</p>
              <p>Email: <a href="mailto:contacto@ejemplo.com" className="hover:text-white transition">contacto@ejemplo.com</a></p>
              <p>Teléfono: +56 9 1234 5678</p>
            </address>
          </div>
        </div>

        <div className="mt-8 pt-4 border-t border-gray-700 text-center text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} AutoParts Ejemplo. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 