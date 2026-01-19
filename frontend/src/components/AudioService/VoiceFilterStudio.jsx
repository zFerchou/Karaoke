import React, { useState, useRef } from 'react';
import { Upload, Mic, Play, Download, Music, Wand2, Loader2, Layers, AudioWaveform } from 'lucide-react';
import { processAudio, separateAudio } from './audioService';

import './VoiceFilterStudio.css'; 

// --- CONSTANTES ---
// Asegúrate de que esta URL sea la correcta (sin barra al final)
const BASE_SERVER_URL = "http://localhost:3000"; 

const FILTER_OPTIONS = [
  { id: 'clean', label: 'Limpieza (Clean)', desc: 'Elimina ruido de fondo', color: '#3b82f6' },
  { id: 'vivid', label: 'Vívido', desc: 'Realza frecuencias altas', color: '#a855f7' },
  { id: 'radio', label: 'Radio AM', desc: 'Efecto vintage/telefónico', color: '#f59e0b' },
  { id: 'norm', label: 'Normalizar', desc: 'Equilibra el volumen', color: '#22c55e' },
];

const SPLEETER_OPTIONS = [
  { id: 'vocals', label: 'Extraer Voz', desc: 'Separa solo la voz (Acapella)', color: '#ef4444' },
  { id: 'accompaniment', label: 'Karaoke (Pista)', desc: 'Elimina la voz, deja la música', color: '#06b6d4' },
];

const VoiceFilterStudio = () => {
  const [mode, setMode] = useState('filter'); 
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedOption, setSelectedOption] = useState('clean'); 
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultAudio, setResultAudio] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleTabChange = (newMode) => {
    setMode(newMode);
    setSelectedOption(newMode === 'filter' ? 'clean' : 'vocals');
    setResultAudio(null);
    setError(null);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setResultAudio(null);
      setError(null);
    }
  };

  // --- LÓGICA PRINCIPAL CORREGIDA ---
  const handleSubmit = async () => {
    if (!selectedFile) return;
    
    setIsProcessing(true);
    setError(null);
    setResultAudio(null);

    try {
      let data;
      let finalUrl = null;

      if (mode === 'filter') {
        // 1. MODO FILTROS
        data = await processAudio(selectedFile, selectedOption);
        
        // CORRECCIÓN AQUÍ: El backend envía 'downloadUrl', no 'filename'
        if (data && data.downloadUrl) {
          // El backend ya manda "/api/audio/download/archivo.mp3", solo agregamos el host
          finalUrl = `${BASE_SERVER_URL}${data.downloadUrl}`;
        } else if (data && data.filename) {
          // Fallback por si acaso cambias el backend después
          finalUrl = `${BASE_SERVER_URL}/api/audio/download/${data.filename}`;
        } else {
          console.error("Respuesta del servidor:", data);
          throw new Error("El servidor no devolvió la URL de descarga.");
        }

      } else {
        // 2. MODO SPLEETER
        data = await separateAudio(selectedFile, selectedOption);
        
        if (data && data.files) {
          let relativePath = null;

          if (selectedOption === 'vocals') {
             relativePath = data.files.vocals;
          } else if (selectedOption === 'accompaniment') {
             relativePath = data.files.accompaniment;
          }

          if (relativePath) {
            finalUrl = `${BASE_SERVER_URL}${relativePath}`;
          } else {
             const anyKey = Object.keys(data.files)[0];
             if (anyKey) finalUrl = `${BASE_SERVER_URL}${data.files[anyKey]}`;
          }
        }
        
        if (!finalUrl) {
           throw new Error("Spleeter terminó, pero no encontramos los archivos.");
        }
      }

      setResultAudio(finalUrl);

    } catch (err) {
      console.error("Error en Frontend:", err);
      // Intentar obtener el mensaje exacto del backend si existe
      const backendMsg = err.response?.data?.error || err.response?.data?.message || err.message || "Error desconocido";
      setError(`Ocurrió un error: ${backendMsg}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const currentOptions = mode === 'filter' ? FILTER_OPTIONS : SPLEETER_OPTIONS;

  return (
    <div className="vfs-container">
      <div className="vfs-card">
        
        {/* Header con Tabs */}
        <div className="vfs-header" style={{ paddingBottom: 0 }}>
          <div style={{ padding: '24px 24px 10px 24px' }}>
            <h1 className="vfs-title">
              {mode === 'filter' ? <Mic size={32} /> : <Layers size={32} />}
              Estudio de Audio IA
            </h1>
            <p className="vfs-subtitle">
              {mode === 'filter' 
                ? 'Aplica filtros profesionales a tu voz.' 
                : 'Separa la voz de la música usando Inteligencia Artificial.'}
            </p>
          </div>

          <div className="vfs-tabs">
            <button 
              className={`vfs-tab-btn ${mode === 'filter' ? 'active' : ''}`}
              onClick={() => handleTabChange('filter')}
            >
              <AudioWaveform size={18} /> Filtros de Voz
            </button>
            <button 
              className={`vfs-tab-btn ${mode === 'spleeter' ? 'active' : ''}`}
              onClick={() => handleTabChange('spleeter')}
            >
              <Layers size={18} /> Separador IA
            </button>
          </div>
        </div>

        <div className="vfs-content">
          
          <div className="vfs-controls">
            <div 
              className={`vfs-upload-area ${selectedFile ? 'active' : ''}`}
              onClick={() => fileInputRef.current.click()}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept="audio/*" 
                style={{ display: 'none' }} 
              />
              <div className="vfs-upload-content">
                {selectedFile ? (
                  <>
                    <Music size={48} color="#a78bfa" />
                    <span style={{ fontWeight: '500', color: '#ddd' }}>{selectedFile.name}</span>
                    <span style={{ fontSize: '0.8rem', color: '#888' }}>Click para cambiar</span>
                  </>
                ) : (
                  <>
                    <Upload size={48} color="#64748b" />
                    <span style={{ color: '#94a3b8' }}>Arrastra o selecciona un audio</span>
                  </>
                )}
              </div>
            </div>

            <div>
              <label className="vfs-filter-label">
                {mode === 'filter' ? 'Elige un Filtro' : 'Modo de Separación'}
              </label>
              <div className="vfs-filter-list">
                {currentOptions.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setSelectedOption(opt.id)}
                    className={`vfs-filter-btn ${selectedOption === opt.id ? 'selected' : ''}`}
                  >
                    <div 
                      className="filter-dot" 
                      style={{ backgroundColor: opt.color }}
                    ></div>
                    <div>
                      <div style={{ fontWeight: 'bold' }}>{opt.label}</div>
                      <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>{opt.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={!selectedFile || isProcessing}
              className="vfs-action-btn"
              style={{ backgroundColor: mode === 'spleeter' ? '#ef4444' : 'var(--primary)' }}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="animate-spin" /> Procesando...
                </>
              ) : (
                <>
                  <Wand2 /> 
                  {mode === 'filter' ? 'Aplicar Filtro' : 'Separar Pistas'}
                </>
              )}
            </button>

            {error && (
              <div className="vfs-error">
                {error}
              </div>
            )}
          </div>

          <div className="vfs-result-area">
            {!resultAudio ? (
              <div className="vfs-placeholder">
                <div style={{ marginBottom: '16px' }}>
                  <Play size={48} />
                </div>
                <p>El resultado aparecerá aquí</p>
              </div>
            ) : (
              <div className="vfs-success">
                <div style={{ marginBottom: '16px' }}>
                  <Music size={56} color="#4ade80" />
                </div>
                
                <h3 style={{ fontSize: '1.5rem', marginBottom: '4px' }}>¡Proceso Terminado!</h3>
                <p style={{ color: '#94a3b8', textTransform: 'uppercase', fontSize: '0.9rem' }}>
                   {mode === 'filter' ? 'Filtro:' : 'Separación:'} {selectedOption}
                </p>

                <audio controls className="vfs-audio-player" src={resultAudio}>
                  Tu navegador no soporta el elemento de audio.
                </audio>

                <a 
                  href={resultAudio} 
                  download={`audio_procesado_${Date.now()}.mp3`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="vfs-download-btn"
                >
                  <Download size={20} />
                  Descargar Resultado
                </a>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default VoiceFilterStudio;