import React, { useState, useRef } from 'react';
import { Upload, Mic, Play, Download, Music, Wand2, Loader2, Layers, AudioWaveform, FileText, AlignLeft } from 'lucide-react';
import { processAudio, separateAudio, transcribeAudio } from './audioService';
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

// --- NUEVAS OPCIONES PARA WHISPER ---
const TRANSCRIBE_OPTIONS = [
  { id: 'transcribe', label: 'Generar Letra', desc: 'Convierte audio a texto (Whisper)', color: '#10b981' },
];

const VoiceFilterStudio = () => {
  const [mode, setMode] = useState('filter'); 
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedOption, setSelectedOption] = useState('clean'); 
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultAudio, setResultAudio] = useState(null);
  const [resultText, setResultText] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleTabChange = (newMode) => {
    setMode(newMode);
    setSelectedOption(newMode === 'filter' ? 'clean' : 'vocals');
    setResultAudio(null);
    setResultText(null); // Limpiar texto previo
    setError(null);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setResultAudio(null);
      setResultText(null);
      setError(null);
    }
  };

  // --- LÓGICA PRINCIPAL CORREGIDA ---
  const handleSubmit = async () => {
    if (!selectedFile) return;
    
    setIsProcessing(true);
    setError(null);
    setResultAudio(null);
    setResultText(null);

    try {
      let data;
      let finalUrl = null;

      if (mode === 'filter') {
        // --- 1. MODO FILTROS ---
        data = await processAudio(selectedFile, selectedOption);
        if (data && data.downloadUrl) {
          finalUrl = `${BASE_SERVER_URL}${data.downloadUrl}`;
        } else if (data && data.filename) {
          finalUrl = `${BASE_SERVER_URL}/api/audio/download/${data.filename}`;
        } else {
            throw new Error("No se recibió URL de descarga.");
        }
        setResultAudio(finalUrl);

      } else if (mode === 'spleeter') {
        // --- 2. MODO SPLEETER ---
        data = await separateAudio(selectedFile, selectedOption);
        if (data && data.files) {
          let relativePath = selectedOption === 'vocals' ? data.files.vocals : data.files.accompaniment;
          if (relativePath) finalUrl = `${BASE_SERVER_URL}${relativePath}`;
        }
        if (!finalUrl) throw new Error("No se generaron los archivos de separación.");
        setResultAudio(finalUrl);

      } else if (mode === 'transcribe') {
        // --- 3. MODO WHISPER (LETRA) ---
        data = await transcribeAudio(selectedFile);
        // Asumimos que el backend devuelve { text: "..." }
        if (data && data.text) {
            setResultText(data.text);
        } else {
            throw new Error("No se pudo obtener la letra del audio.");
        }
      }

    } catch (err) {
      console.error("Error en Frontend:", err);
      const backendMsg = err.response?.data?.error || err.message || "Error desconocido";
      setError(`Error: ${backendMsg}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Determinar qué opciones mostrar
  let currentOptions = FILTER_OPTIONS;
  if (mode === 'spleeter') currentOptions = SPLEETER_OPTIONS;
  if (mode === 'transcribe') currentOptions = TRANSCRIBE_OPTIONS;

  return (
    <div className="vfs-container">
      <div className="vfs-card">
        
        {/* Header con Tabs */}
        <div className="vfs-header" style={{ paddingBottom: 0 }}>
          <div style={{ padding: '24px 24px 10px 24px' }}>
            <h1 className="vfs-title">
              {/* Icono dinámico según modo */}
              {mode === 'filter' && <Mic size={32} />}
              {mode === 'spleeter' && <Layers size={32} />}
              {mode === 'transcribe' && <FileText size={32} />}
              Estudio de Audio IA
            </h1>
            <p className="vfs-subtitle">
              {mode === 'filter' && 'Aplica filtros profesionales a tu voz.'}
              {mode === 'spleeter' && 'Separa la voz de la música.'}
              {mode === 'transcribe' && 'Obtén la letra de tus canciones automáticamente.'}
            </p>
          </div>

          <div className="vfs-tabs">
            <button 
              className={`vfs-tab-btn ${mode === 'filter' ? 'active' : ''}`}
              onClick={() => handleTabChange('filter')}
            >
              <AudioWaveform size={18} /> Filtros
            </button>
            <button 
              className={`vfs-tab-btn ${mode === 'spleeter' ? 'active' : ''}`}
              onClick={() => handleTabChange('spleeter')}
            >
              <Layers size={18} /> Separador
            </button>
            {/* NUEVO BOTÓN LETRA */}
            <button 
              className={`vfs-tab-btn ${mode === 'transcribe' ? 'active' : ''}`}
              onClick={() => handleTabChange('transcribe')}
            >
              <AlignLeft size={18} /> Letra
            </button>
          </div>
        </div>

        <div className="vfs-content">
          
          {/* COLUMNA IZQUIERDA: CONTROLES */}
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
                    <span style={{ color: '#94a3b8' }}>Sube tu canción aquí</span>
                  </>
                )}
              </div>
            </div>

            <div>
              <label className="vfs-filter-label">
                {mode === 'transcribe' ? 'Motor de IA' : 'Opciones'}
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
              // Color verde para transcripción, rojo spleeter, violeta filtros
              style={{ backgroundColor: mode === 'spleeter' ? '#ef4444' : mode === 'transcribe' ? '#10b981' : 'var(--primary)' }}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="animate-spin" /> Procesando...
                </>
              ) : (
                <>
                  <Wand2 /> 
                  {mode === 'filter' && 'Aplicar Filtro'}
                  {mode === 'spleeter' && 'Separar Pistas'}
                  {mode === 'transcribe' && 'Obtener Letra'}
                </>
              )}
            </button>

            {error && (
              <div className="vfs-error">
                {error}
              </div>
            )}
          </div>

          {/* COLUMNA DERECHA: RESULTADOS */}
          <div className="vfs-result-area">
            {/* 1. ESTADO INICIAL */}
            {!resultAudio && !resultText && (
              <div className="vfs-placeholder">
                <div style={{ marginBottom: '16px' }}>
                  <Play size={48} />
                </div>
                <p>El resultado aparecerá aquí</p>
              </div>
            )}

            {/* 2. RESULTADO DE AUDIO (FILTROS Y SPLEETER) */}
            {resultAudio && (
              <div className="vfs-success">
                <div style={{ marginBottom: '16px' }}>
                  <Music size={56} color="#4ade80" />
                </div>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '4px' }}>¡Audio Listo!</h3>
                <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '20px' }}>
                   {mode === 'filter' ? 'Filtro aplicado' : 'Pistas separadas'}
                </p>

                <audio controls className="vfs-audio-player" src={resultAudio}>
                  Tu navegador no soporta audio.
                </audio>

                <a 
                  href={resultAudio} 
                  download={`resultado_${Date.now()}.mp3`}
                  className="vfs-download-btn"
                  target="_blank" rel="noreferrer"
                >
                  <Download size={20} /> Descargar
                </a>
              </div>
            )}

            {/* 3. RESULTADO DE TEXTO (WHISPER) */}
            {resultText && (
              <div className="vfs-success" style={{ width: '100%', height: '100%', display:'flex', flexDirection:'column' }}>
                 <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'10px', marginBottom:'15px' }}>
                    <FileText size={32} color="#10b981" />
                    <h3 style={{ margin:0 }}>Letra Detectada</h3>
                 </div>
                 
                 {/* Área de texto con scroll */}
                 <div style={{ 
                    background: 'rgba(0,0,0,0.3)', 
                    padding: '20px', 
                    borderRadius: '8px', 
                    flex: 1, 
                    overflowY: 'auto',
                    textAlign: 'left',
                    whiteSpace: 'pre-wrap', // Respeta saltos de línea
                    fontFamily: 'monospace',
                    lineHeight: '1.6',
                    color: '#e2e8f0',
                    maxHeight: '400px' // Limite de altura
                 }}>
                    {resultText}
                 </div>

                 <button 
                    onClick={() => navigator.clipboard.writeText(resultText)}
                    className="vfs-download-btn"
                    style={{ marginTop: '20px', justifyContent: 'center', cursor: 'pointer', border:'none' }}
                 >
                    Copiar Texto
                 </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default VoiceFilterStudio;