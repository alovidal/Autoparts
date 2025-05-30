import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Navbar from './components/navbar';
import HomePage from './pages/home';
import CatalogoPage from './pages/catalogo';
import { ProductList } from './components/ProductList';

// Componente interno que usa los hooks de routing
const AppContent: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const navigate = useNavigate();
  const location = useLocation();

  // Efecto para navegar al catálogo cuando hay búsqueda
  useEffect(() => {
    if (searchTerm.trim() !== '' && location.pathname === '/') {
      navigate('/catalogo');
    }
  }, [searchTerm, location.pathname, navigate]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />
      
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/catalogo" element={<CatalogoPage searchTerm={searchTerm} />} />
          <Route path="/productos" element={<ProductList />} />
        </Routes>
      </main>
    </div>
  );
};

// Componente principal que envuelve con Router
const App: React.FC = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App;