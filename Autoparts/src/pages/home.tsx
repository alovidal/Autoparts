import React from 'react';
import { Link } from 'react-router-dom';
import { 
  WrenchScrewdriverIcon, 
  TruckIcon, 
  ShieldCheckIcon, 
  StarIcon,
  ArrowRightIcon 
} from '@heroicons/react/24/outline';

const Home: React.FC = () => {
  const features = [
    {
      icon: WrenchScrewdriverIcon,
      title: 'Amplio Catálogo',
      description: 'Más de 10,000 productos de las mejores marcas del mercado automotriz.'
    },
    {
      icon: TruckIcon,
      title: 'Envío Rápido',
      description: 'Entrega en 24-48 horas en todo el país con seguimiento en tiempo real.'
    },
    {
      icon: ShieldCheckIcon,
      title: 'Garantía Total',
      description: 'Todos nuestros productos cuentan con garantía de fábrica y soporte técnico.'
    },
    {
      icon: StarIcon,
      title: 'Calidad Premium',
      description: 'Productos originales y de primera calidad para tu vehículo.'
    }
  ];

  const categories = [
    {
      name: 'Motor',
      description: 'Partes y repuestos para el motor',
      image: '/img/categorias/motor.jpg',
      color: 'bg-red-500'
    },
    {
      name: 'Frenos',
      description: 'Sistemas de frenado completos',
      image: '/img/categorias/frenos.jpg',
      color: 'bg-orange-500'
    },
    {
      name: 'Suspensión',
      description: 'Amortiguadores y componentes',
      image: '/img/categorias/suspension.jpg',
      color: 'bg-blue-500'
    },
    {
      name: 'Electricidad',
      description: 'Componentes eléctricos y electrónicos',
      image: '/img/categorias/electricidad.jpg',
      color: 'bg-green-500'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Las Mejores Partes para tu Auto
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              Encuentra repuestos originales y de calidad para mantener tu vehículo en perfecto estado
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/productos"
                className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center justify-center"
              >
                Ver Productos
                <ArrowRightIcon className="ml-2 h-5 w-5" />
              </Link>
              <Link
                to="/categorias"
                className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
              >
                Explorar Categorías
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              ¿Por qué elegir AutoParts?
            </h2>
            <p className="text-lg text-gray-600">
              Somos tu mejor opción para encontrar repuestos automotrices de calidad
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="bg-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Categorías Principales
            </h2>
            <p className="text-lg text-gray-600">
              Encuentra todo lo que necesitas organizado por categorías
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category, index) => (
              <Link
                key={index}
                to={`/categorias/${category.name.toLowerCase()}`}
                className="group block bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden"
              >
                <div className={`h-32 ${category.color} flex items-center justify-center`}>
                  <span className="text-white text-2xl font-bold">{category.name[0]}</span>
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {category.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            ¿Listo para encontrar tus repuestos?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Únete a miles de clientes satisfechos que confían en AutoParts
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/registro"
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Crear Cuenta
            </Link>
            <Link
              to="/productos"
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
            >
              Ver Catálogo
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-400 mb-2">10,000+</div>
              <div className="text-gray-300">Productos Disponibles</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-400 mb-2">50,000+</div>
              <div className="text-gray-300">Clientes Satisfechos</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-400 mb-2">24h</div>
              <div className="text-gray-300">Tiempo de Entrega</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-400 mb-2">100%</div>
              <div className="text-gray-300">Garantía de Calidad</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home; 