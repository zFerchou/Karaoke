import React, { useState } from 'react';
import { 
  Upload, Music, Download, Wand2, Loader2, Sliders, 
  XCircle, CheckCircle2, Zap 
} from 'lucide-react';
import { cancelAudioFilterProcess } from "../audioService";

const FilterPanel = ({
  file,
  setFile,
  result,
  isProcessing,
  onSubmit,
  onCancel,
  error,
  setError, // Asegúrate de recibir setError como prop del padre
  selectedOption,
  setSelectedOption,
  selectedQuality,
  setSelectedQuality,
  filterOptions,
  qualityOptions,
  fileInputRef,
  handleFileChange,
}) => {
  const [isClosing, setIsClosing] = useState(false);

  // LÓGICA DE CANCELACIÓN REAL (Fusionada)
  const handleCancelAction = async () => {
    try {
      setIsClosing(true);
      const response = await cancelAudioFilterProcess();

      // Notificamos al padre para detener el loading
      if (onCancel) onCancel();

      setTimeout(() => {
        setIsClosing(false);
        if (response && response.message) {
          setError(response.message);
        }
      }, 300);
    } catch (err) {
      setError("No se pudo cancelar el proceso.");
      setIsClosing(false);
    }
  };

  const handleDone = () => {
    setIsClosing(true);
    setTimeout(() => setIsClosing(false), 300);
  };

  return (
    <div className="spleeter-container">
      {/* HEADER INFORMATIVO */}
      <div className="spleeter-header-info">
        <div className="spleeter-title-group">
          <h2>Masterización de Audio</h2>
          <p>Aplica filtros DSP y normalización para mejorar la calidad de tu pista.</p>
        </div>
        <div className="spleeter-badge-ai" style={{ borderColor: '#3b82f6', color: '#3b82f6', background: 'rgba(59, 130, 246, 0.1)' }}>
          <Zap size={14} /> DSP Engine
        </div>
      </div>

      {/* MODAL DE PROCESAMIENTO Y ÉXITO (Diseño Moderno) */}
      {(isProcessing || isClosing) && (
        <div className={`vfs-modal-overlay ${isClosing ? 'exit' : 'entry'}`}>
          <div className="vfs-modal-content">
            {!result ? (
              <>
                <div className="vfs-loader-container">
                  <Loader2 className="animate-spin loader-main" size={48} color="#3b82f6" />
                  <Sliders className="loader-icon-center" size={20} />
                </div>
                <h3>Aplicando Filtros</h3>
                <p>Procesando ecualización y ganancia...</p>
                <div className="vfs-progress-bar">
                  <div className="vfs-progress-fill" style={{ background: 'linear-gradient(90deg, #3b82f6, #60a5fa)' }}></div>
                </div>
                <button className="vfs-cancel-btn" onClick={handleCancelAction}>
                  <XCircle size={18} /> Cancelar Proceso
                </button>
              </>
            ) : (
              <div className="vfs-success-view">
                <CheckCircle2 size={60} color="#3b82f6" className="scale-up-animation" />
                <h3 style={{ color: '#cdd6f4' }}>¡Masterización Completa!</h3>
                <p>Tu audio ha sido mejorado correctamente.</p>
                <button className="vfs-done-btn" onClick={handleDone} style={{ backgroundColor: '#3b82f6' }}>
                  Ver Resultado
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CONTROLES PRINCIPALES */}
      <div className="vfs-content-grid">
        {/* Panel Izquierdo: Upload y Estilos */}
        <div className="vfs-left-panel">
          <div 
            className={`vfs-upload-area ${file ? "active" : ""}`} 
            onClick={() => fileInputRef.current.click()}
          >
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="audio/*,video/*" style={{ display: "none" }} />
            <div className="vfs-upload-content">
              {file ? (
                <>
                  <Music size={40} color="#60a5fa" />
                  <span className="file-name-display">{file.name}</span>
                  <span className="file-change-hint">Click para cambiar</span>
                </>
              ) : (
                <>
                  <Upload size={40} color="#64748b" />
                  <span>Subir archivo original</span>
                </>
              )}
            </div>
          </div>

          <div style={{ marginTop: '20px' }}>
            <label className="section-label">Estilo de Filtro</label>
            <div className="vfs-filter-grid-compact">
              {filterOptions.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setSelectedOption(opt.id)}
                  className={`vfs-filter-card ${selectedOption === opt.id ? "selected" : ""}`}
                >
                  <div className="filter-dot" style={{ backgroundColor: opt.color }}></div>
                  <span>{opt.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Panel Derecho: Calidad y Botón de Acción */}
        <div className="vfs-right-panel">
          <div className="vfs-quality-selector">
            <label className="section-label">Calidad de Salida</label>
            <div className="vfs-quality-stack">
              {qualityOptions.map((q, index) => (
                <button
                  key={index}
                  className={`vfs-quality-row ${selectedQuality.label === q.label ? "active" : ""}`}
                  onClick={() => setSelectedQuality(q)}
                >
                  <div className="radio-circle">
                    {selectedQuality.label === q.label && <div className="radio-inner" />}
                  </div>
                  {q.label}
                </button>
              ))}
            </div>
          </div>

          <div className="action-wrapper" style={{ marginTop: 'auto' }}>
            <button 
              onClick={onSubmit} 
              disabled={!file || isProcessing} 
              className="vfs-action-btn"
              style={{ background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)' }}
            >
              {isProcessing ? <Loader2 className="animate-spin" /> : <Wand2 />}
              {isProcessing ? "Procesando..." : "Aplicar Filtros"}
            </button>
            {error && <div className="vfs-error" style={{ marginTop: '10px' }}>{error}</div>}
          </div>
        </div>
      </div>

      {/* ÁREA DE RESULTADO FINAL */}
      {result && (
        <div className="vfs-result-area">
          <div className="vfs-success result-card-animated">
            <div className="result-header">
              <CheckCircle2 size={24} color="#60a5fa" />
              <span style={{ color: '#60a5fa', fontSize: '1.1rem', fontWeight: '600' }}>Audio Masterizado</span>
            </div>
            <div className="audio-visualizer-mock">
              <div className="bar"></div><div className="bar"></div><div className="bar"></div><div className="bar"></div>
              <div className="bar"></div><div className="bar"></div><div className="bar"></div><div className="bar"></div>
            </div>
            <audio controls src={result.url} className="vfs-audio-player" key={result.url} />
            <a href={result.url} download className="vfs-download-btn full-width" style={{ background: '#1e40af', marginTop: '15px' }}>
              <Download size={20} /> Descargar Audio Filtrado
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterPanel;