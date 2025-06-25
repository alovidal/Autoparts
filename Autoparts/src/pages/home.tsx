import React from 'react';
import { Link } from 'react-router-dom';

interface FeatureProps {
    title: string;
    description: string;
    icon: React.ReactNode;
}

const FeatureCard: React.FC<FeatureProps> = ({ title, description, icon }) => (
    <div className="p-6 bg-white rounded-lg shadow-lg">
        <div className="text-blue-600 mb-4">{icon}</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600">{description}</p>
    </div>
);

const HomePage: React.FC = () => {
    const features = [
        {
            title: "Amplio Catálogo",
            description: "Encuentra todas las piezas que necesitas para tu vehículo",
            icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
            )
        },
        {
            title: "Envíos Rápidos",
            description: "Entrega a domicilio en todo Chile",
            icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
            )
        },
        {
            title: "Soporte Experto",
            description: "Asesoría técnica especializada para tu compra",
            icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
            )
        }
    ];

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