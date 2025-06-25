import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import AppRoutes from './routes';
import { Toaster } from 'react-hot-toast';

const App: React.FC = () => {
    return (
        <Router>
            <AuthProvider>
                <CartProvider>
                    <div className="min-h-screen bg-gray-100">
                        <Navbar />
                        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                            <AppRoutes />
                        </main>
                        <Toaster position="bottom-right" />
                    </div>
                </CartProvider>
            </AuthProvider>
        </Router>
    );
};

export default App; 