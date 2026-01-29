import axios from 'axios';

// Definimos la URL base general
const BASE_URL = 'http://localhost:3000/api';

// --- FUNCIONES DE FILTROS DE VOZ ---
export const processAudio = async (file, filterType, format = 'mp3', quality = '192k') => {
  const formData = new FormData();
  formData.append('audio', file);
  formData.append('filterType', filterType);
  formData.append('format', format);
  formData.append('quality', quality)

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

// --- NUEVA FUNCIÓN: GENERADOR DE VIDEO KARAOKE ---
export const createLyricVideo = async (file, language = 'es', model = 'small') => {
  const formData = new FormData();
  formData.append('audio', file);
  formData.append('language', language);
  formData.append('model', model);

  try {
    const response = await axios.post(`${BASE_URL}/video/lyric-maker`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data; // Retorna { status: "Success", files: { video: "...", subtitles... } }
  } catch (error) {
    console.error("Error en Lyric Maker:", error);
    throw error;
  }
};

// audioService.js
export const transcribeAudio = async (file) => {
  const formData = new FormData();
  formData.append('audio', file);
  formData.append('model', 'base'); 

  try {
    // CAMBIO AQUÍ: Agregamos /whisper al final
    const response = await axios.post(`${BASE_URL}/transcribe/whisper`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data; 
  } catch (error) {
    console.error("Error en Whisper:", error);
    throw error;
  }
};

// --- CANCELACIÓN DE SPLEETER ---
export const cancelSpleeterProcess = async (filename) => {
  try {
    const response = await axios.post(`${BASE_URL}/spleeter/cancel`, { fileName: filename });
    return response.data;
  } catch (error) {
    console.error('Error cancelando proceso Spleeter:', error);
    throw error;
  }
}

// Función genérica para obtener URL de descarga
// NOTA: Ajusta esto según si tu backend devuelve rutas diferentes para spleeter
export const getDownloadUrl = (filename) => {
  // Asumimos que la ruta de descarga es compartida o el backend devuelve la ruta correcta
  return `${BASE_URL}/audio/download/${filename}`;
};