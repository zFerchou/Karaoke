import axios from 'axios';

// Definimos la URL base general (duplicada aquí para evitar problemas de import/export)
const BASE_URL = 'http://localhost:3000/api';

// Cancela un proceso Spleeter en el backend por filename
export const cancelSpleeterProcess = async (filename) => {
  try {
    const response = await axios.post(`${BASE_URL}/spleeter/cancel`, { fileName: filename });
    return response.data;
  } catch (error) {
    console.error('Error cancelando proceso Spleeter:', error);
    throw error;
  }
};
