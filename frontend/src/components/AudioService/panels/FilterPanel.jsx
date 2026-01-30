import React, { useState } from 'react';
import { Upload, Music, Download, Wand2, Loader2, Sliders, XCircle, CheckCircle2, Zap } from 'lucide-react';

const FilterPanel = ({
  file, setFile, result, isProcessing, onSubmit, error, selectedOption, setSelectedOption, selectedQuality, setSelectedQuality, filterOptions, qualityOptions, fileInputRef, handleFileChange
}) => {
  const [isClosing, setIsClosing] = useState(false);

  // Simulación de cancelación (o conecta tu servicio real aquí)
  const handleCancelAction = () => {
    setIsClosing(true);
    setTimeout(() => {
      // Aquí iría la llamada al backend para cancelar si existe
      setIsClosing(false);
      window.location.reload(); // O resetear estados según tu flujo
    }, 300);
  };

  const handleDone = () => {
    setIsClosing(true);
    setTimeout(() => setIsClosing(false), 300);
  };

  return (
    <div className="spleeter-container">
      {/* HEADER */}
      <div className="spleeter-header-info">
        <div className="spleeter-title-group">
          <h2>Masterización de Audio</h2>
          <p>Aplica filtros DSP y normalización para mejorar la calidad de tu pista.</p>
        </div>
        <div className="spleeter-badge-ai" style={{ borderColor: '#3b82f6', color: '#3b82f6', background: 'rgba(59, 130, 246, 0.1)' }}>
          <Zap size={14} /> DSP Engine
        </div>
      </div>

      {/* MODAL DE PROCESAMIENTO */}
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
                  <XCircle size={18} /> Cancelar
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
        {/* Lado Izquierdo: Upload y Opciones */}
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

        {/* Lado Derecho: Calidad y Acción */}
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

            <div className="action-wrapper" style={{marginTop: 'auto'}}>
                <button 
                    onClick={onSubmit} 
                    disabled={!file || isProcessing} 
                    className="vfs-action-btn"
                    style={{ background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)' }}
                >
                    {isProcessing ? <Loader2 className="animate-spin" /> : <Wand2 />}
                    {isProcessing ? "Procesando..." : "Aplicar Filtros"}
                </button>
                {error && <div className="vfs-error">{error}</div>}
            </div>
        </div>
      </div>

      {/* RESULTADO (VICTORY SCREEN) */}
      {result && (
        <div className="vfs-result-area">
          <div className="vfs-success result-card-animated">
            <div className="result-header">
                <CheckCircle2 size={24} color="#60a5fa" />
                <span style={{color: '#60a5fa', fontSize: '1.1rem'}}>Audio Masterizado</span>
            </div>
            <div className="audio-visualizer-mock">
                {/* Visual decorativo */}
                <div className="bar"></div><div className="bar"></div><div className="bar"></div><div className="bar"></div>
            </div>
            <audio controls src={result.url} className="vfs-audio-player" key={result.url} />
            <a href={result.url} download className="vfs-download-btn full-width" style={{background: '#1e40af'}}>
              <Download size={20} /> Descargar Audio Filtrado
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterPanel;