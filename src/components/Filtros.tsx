import React from 'react';

interface FiltrosProps {
  marcaSeleccionada: string;
  setMarcaSeleccionada: (marca: string) => void;
  marcasDisponibles: string[];
}

const Filtros: React.FC<FiltrosProps> = ({
  marcaSeleccionada,
  setMarcaSeleccionada,
  marcasDisponibles
}) => {
  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Filtros</h2>
      
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">Marca</h3>
        <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="radio"
              name="marca"
              value=""
              checked={marcaSeleccionada === ""}
              onChange={(e) => setMarcaSeleccionada(e.target.value)}
              className="form-radio h-4 w-4 text-blue-600"
            />
            <span className="ml-2">Todas las marcas</span>
          </label>
          
          {marcasDisponibles.sort().map((marca) => (
            <label key={marca} className="flex items-center">
              <input
                type="radio"
                name="marca"
                value={marca}
                checked={marcaSeleccionada === marca}
                onChange={(e) => setMarcaSeleccionada(e.target.value)}
                className="form-radio h-4 w-4 text-blue-600"
              />
              <span className="ml-2">{marca}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Filtros; 