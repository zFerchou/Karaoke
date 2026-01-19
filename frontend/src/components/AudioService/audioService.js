import axios from 'axios';

// Definimos la URL base general
const BASE_URL = 'http://localhost:3000/api';

// --- FUNCIONES DE FILTROS DE VOZ ---
export const processAudio = async (file, filterType) => {
  const formData = new FormData();
  formData.append('audio', file);
  formData.append('filterType', filterType);

  try {
    const response = await axios.post(`${BASE_URL}/audio/upload-filter`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data; 
  } catch (error) {
    console.error("Error en filtros:", error);
    throw error;
  }
};

// --- NUEVA FUNCIÓN: SPLEETER ---
export const separateAudio = async (file, separationType) => {
  const formData = new FormData();
  formData.append('audio', file);
  formData.append('separation', separationType); // vocals, accompaniment, both
  // format por defecto mp3 si quieres
  formData.append('format', 'mp3'); 

  try {
    // Conectamos con /api/spleeter/separate
    const response = await axios.post(`${BASE_URL}/spleeter/separate`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data; 
  } catch (error) {
    console.error("Error en Spleeter:", error);
    throw error;
  }
};

// Función genérica para obtener URL de descarga
// NOTA: Ajusta esto según si tu backend devuelve rutas diferentes para spleeter
export const getDownloadUrl = (filename) => {
  // Asumimos que la ruta de descarga es compartida o el backend devuelve la ruta correcta
  return `${BASE_URL}/audio/download/${filename}`;
};