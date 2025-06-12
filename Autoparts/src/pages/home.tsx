import React from 'react';
import { Link } from 'react-router-dom';

const ShoppingBagIcon = React.memo(() => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l-1 12H6L5 9z" />
  </svg>
));

const SearchIcon = React.memo(() => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
));

const GridIcon = React.memo(() => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
  </svg>
));

ShoppingBagIcon.displayName = 'ShoppingBagIcon';
SearchIcon.displayName = 'SearchIcon';
GridIcon.displayName = 'GridIcon';

const FeatureCard: React.FC<{
  Icon: React.ComponentType;
  title: string;
  description: string;
  bgColor: string;
  textColor: string;
}> = React.memo(({ Icon, title, description, bgColor, textColor }) => (
  <div className="text-center p-6 bg-white rounded-lg shadow-md">
    <div className={`${bgColor} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${textColor}`}>
      <Icon />
    </div>
    <h3 className="text-xl font-semibold mb-2">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </div>
));

FeatureCard.displayName = 'FeatureCard';

const HomePage: React.FC = () => {
  const features = React.useMemo(() => [
    {
      Icon: ShoppingBagIcon,
      title: "Envío Gratis",
      description: "En compras mayores a $50000",
      bgColor: "bg-blue-100",
      textColor: "text-blue-600"
    },
    {
      Icon: SearchIcon,
      title: "Fácil Búsqueda",
      description: "Encuentra lo que necesitas rápidamente",
      bgColor: "bg-green-100",
      textColor: "text-green-600"
    },
    {
      Icon: GridIcon,
      title: "Gran Variedad",
      description: "Miles de productos disponibles",
      bgColor: "bg-purple-100",
      textColor: "text-purple-600"
    }
  ], []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Bienvenido a Autoparts
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              Encuentra los mejores productos al mejor precio
            </p>
            <Link
              to="/catalogo"
              className="bg-white text-blue-600 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors inline-block"
            >
              Explorar Catálogo
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomePage;