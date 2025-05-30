const API_URL = 'http://localhost:8000';

export const getProducts = async (marca?: string) => {
  try {
    let url = `${API_URL}/productos`;
    if (marca) {
      url += `?marca=${encodeURIComponent(marca)}`;
    }
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Error en la respuesta del servidor');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error al obtener productos:', error);
    throw error;
  }
}; 