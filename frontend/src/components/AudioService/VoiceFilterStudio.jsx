import React, { useState, useRef } from 'react';
import { Upload, Mic, Play, Download, Music, Wand2, Loader2, Layers, AudioWaveform, FileText, AlignLeft } from 'lucide-react';
import { processAudio, separateAudio, transcribeAudio } from './audioService';
import './VoiceFilterStudio.css'; 

const BASE_SERVER_URL = "http://localhost:3000"; 

const FILTER_OPTIONS = [
  { id: 'clean', label: 'Limpieza (Clean)', desc: 'Elimina ruido de fondo', color: '#3b82f6' },
  { id: 'vivid', label: 'Vívido', desc: 'Realza frecuencias altas', color: '#a855f7' },
  { id: 'radio', label: 'Radio', desc: 'Efecto vintage/telefónico', color: '#f59e0b' },
  { id: 'norm', label: 'Normalizar', desc: 'Equilibra el volumen', color: '#22c55e' },
];

const SPLEETER_OPTIONS = [
  { id: 'vocals', label: 'Extraer Voz', desc: 'Separa solo la voz (Acapella)', color: '#ef4444' },
  { id: 'accompaniment', label: 'Karaoke (Pista)', desc: 'Elimina la voz, deja la música', color: '#06b6d4' },
];

const TRANSCRIBE_OPTIONS = [
  { id: 'transcribe', label: 'Generar Letra', desc: 'Convierte audio a texto (Whisper)', color: '#10b981' },
];

const VoiceFilterStudio = () => {
  const [mode, setMode] = useState('filter'); 
  const [selectedOption, setSelectedOption] = useState('clean');
  
  // Estado de archivos independiente por modo
  const [files, setFiles] = useState({
    filter: null,
    spleeter: null,
    transcribe: null
  });

  // Resultados independientes
  const [results, setResults] = useState({
    filter: null,
    spleeter: null,
    transcribe: null
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleTabChange = (newMode) => {
    setMode(newMode);
    setError(null);
    if (newMode === 'filter') setSelectedOption('clean');
    if (newMode === 'spleeter') setSelectedOption('vocals');
    if (newMode === 'transcribe') setSelectedOption('transcribe');
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const isValidType = file.type.startsWith("audio/") || file.type === "video/mp4";
      
      if (!isValidType) {
        setError("Formato no soportado. Sube un audio o video MP4");
        return;
      }

      setFiles(prev => ({ ...prev, [mode]: file }));
      setResults(prev => ({ ...prev, [mode]: null }));
      setError(null);
    }
  };

  const handleSubmit = async () => {
    const currentFile = files[mode];
    if (!currentFile) return;
    
    setIsProcessing(true);
    setError(null);

    try {
      let data;
      let finalUrl = null;

      if (mode === 'filter') {
        data = await processAudio(currentFile, selectedOption);
        if (data?.downloadUrl) finalUrl = `${BASE_SERVER_URL}${data.downloadUrl}`;
        else if (data?.filename) finalUrl = `${BASE_SERVER_URL}/api/audio/download/${data.filename}`;
        
        if (!finalUrl) throw new Error("No se pudo obtener la ruta del audio procesado.");
        setResults(prev => ({ ...prev, filter: { type: 'audio', url: finalUrl } }));

      } else if (mode === 'spleeter') {
        data = await separateAudio(currentFile, selectedOption);
        if (data?.files) {
          let relativePath = selectedOption === 'vocals' ? data.files.vocals : data.files.accompaniment;
          if (relativePath) finalUrl = `${BASE_SERVER_URL}${relativePath}`;
        }
        setResults(prev => ({ ...prev, spleeter: { type: 'audio', url: finalUrl } }));

      } else if (mode === 'transcribe') {
        data = await transcribeAudio(currentFile);
        if (data?.text) {
          setResults(prev => ({ ...prev, transcribe: { type: 'text', content: data.text } }));
        }
      }

    } catch (err) {
      setError(`Error: ${err.response?.data?.error || err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const currentFile = files[mode];
  const currentResult = results[mode];
  const currentOptions = mode === 'filter' ? FILTER_OPTIONS : mode === 'spleeter' ? SPLEETER_OPTIONS : TRANSCRIBE_OPTIONS;

  return (
    <div className="vfs-container">
      <div className="vfs-card">
        
        <div className="vfs-header">
          <h1 className="vfs-title">
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
          
          <div className="vfs-tabs">
            <button className={`vfs-tab-btn ${mode === 'filter' ? 'active' : ''}`} onClick={() => handleTabChange('filter')}>
              <AudioWaveform size={18} /> Filtros
            </button>
            <button className={`vfs-tab-btn ${mode === 'spleeter' ? 'active' : ''}`} onClick={() => handleTabChange('spleeter')}>
              <Layers size={18} /> Separador
            </button>
            <button className={`vfs-tab-btn ${mode === 'transcribe' ? 'active' : ''}`} onClick={() => handleTabChange('transcribe')}>
              <AlignLeft size={18} /> Letra
            </button>
          </div>
        </div>

        <div className="vfs-content">
          <div className="vfs-controls">
            <div className={`vfs-upload-area ${currentFile ? 'active' : ''}`} onClick={() => fileInputRef.current.click()}>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept="audio/*,video/mp4" 
                style={{ display: 'none' }} 
              />
              <div className="vfs-upload-content">
                {currentFile ? (
                  <>
                    <Music size={40} color="#a78bfa" />
                    <span style={{ fontWeight: '500', color: '#ddd', fontSize: '0.9rem' }}>{currentFile.name}</span>
                  </>
                ) : (
                  <>
                    <Upload size={40} color="#64748b" />
                    <span style={{ color: '#94a3b8' }}>Subir audio para {mode}</span>
                  </>
                )}
              </div>
            </div>

            <div className="vfs-filter-list">
                {currentOptions.map(opt => (
                    <button key={opt.id} onClick={() => setSelectedOption(opt.id)} className={`vfs-filter-btn ${selectedOption === opt.id ? 'selected' : ''}`}>
                        <div className="filter-dot" style={{ backgroundColor: opt.color }}></div>
                        <div style={{ textAlign: 'left' }}>
                          <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{opt.label}</div>
                          <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>{opt.desc}</div>
                        </div>
                    </button>
                ))}
            </div>

            <button onClick={handleSubmit} disabled={!currentFile || isProcessing} className="vfs-action-btn">
              {isProcessing ? <Loader2 className="animate-spin" /> : <Wand2 />} 
              {isProcessing ? 'Procesando...' : `Procesar ${mode}`}
            </button>
            {error && <div className="vfs-error">{error}</div>}
          </div>

          <div className="vfs-result-area">
            {!currentResult ? (
              <div className="vfs-placeholder">
                <Play size={48} />
                <p>El resultado aparecerá aquí</p>
              </div>
            ) : (
              currentResult.type === 'audio' ? (
                <div className="vfs-success">
                  <Music size={56} color="#4ade80" />
                  <audio controls src={currentResult.url} className="vfs-audio-player" key={currentResult.url} />
                  <a href={currentResult.url} download className="vfs-download-btn">
                    <Download size={20}/> Descargar
                  </a>
                </div>
              ) : (
                <div className="vfs-success" style={{ width: '100%' }}>
                  <FileText size={32} color="#10b981" />
                  <div className="text-scroll-area" style={{ 
                    whiteSpace: 'pre-wrap', 
                    textAlign: 'left', 
                    background: '#0f172a', 
                    padding: '20px', 
                    borderRadius: '8px', 
                    marginTop: '15px',
                    maxHeight: '300px',
                    overflowY: 'auto',
                    border: '1px solid #334155'
                  }}>
                    {currentResult.content}
                  </div>
                  <button 
                    onClick={() => navigator.clipboard.writeText(currentResult.content)}
                    className="vfs-download-btn" 
                    style={{ marginTop: '10px', width: '100%', cursor: 'pointer' }}
                  >
                    Copiar Letra
                  </button>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceFilterStudio;