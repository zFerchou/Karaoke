import React, { useState } from 'react';
import { Upload, Music, Download, Loader2, Wand2, Cpu, XCircle, CheckCircle2, Info } from 'lucide-react';
import { cancelSpleeterProcess } from '../cancelService';
import './SpleeterPanel.css'; // Importamos los nuevos estilos

const SpleeterPanel = ({
  file, result, isProcessing, onSubmit, onCancel, error, selectedOption, setSelectedOption, spleeterOptions, fileInputRef, handleFileChange
}) => {
  const [isClosing, setIsClosing] = useState(false);

  const handleCancelAction = async () => {
    if (!file) return;
    setIsClosing(true);
    try {
      await cancelSpleeterProcess(file.name);
      setTimeout(() => {
        if (onCancel) onCancel();
        setIsClosing(false);
      }, 300);
    } catch (e) {
      setIsClosing(false);
      alert('No se pudo cancelar el proceso.');
    }
  };

  const handleDone = () => {
    setIsClosing(true);
    setTimeout(() => {
      if (onCancel) onCancel();
      setIsClosing(false);
    }, 300);
  };

  return (
    <div className="spleeter-container">
      {/* HEADER DE LA FUNCIONALIDAD */}
      <div className="spleeter-header-info">
        <div className="spleeter-title-group">
          <h2>Separación de Pistas con IA</h2>
          <p>Utilizamos el motor <strong>Spleeter</strong> para desglosar tu audio en componentes individuales mediante redes neuronales.</p>
        </div>
        <div className="spleeter-badge-ai">
          <Cpu size={14} /> AI Powered
        </div>
      </div>

      {/* MODAL DE PROCESAMIENTO */}
      {(isProcessing || isClosing) && (
        <div className={`vfs-modal-overlay ${isClosing ? 'exit' : 'entry'}`}>
          <div className="vfs-modal-content">
            {!result ? (
              <>
                <div className="vfs-loader-container">
                  <Loader2 className="animate-spin loader-main" size={48} />
                  <Cpu className="loader-icon-center" size={20} />
                </div>
                <h3>Procesando con IA</h3>
                <p>Nuestros servidores están aislando las frecuencias para separar la pista...</p>
                <div className="vfs-progress-bar">
                  <div className="vfs-progress-fill"></div>
                </div>
                <button className="vfs-cancel-btn" onClick={handleCancelAction}>
                  <XCircle size={18} /> Cancelar proceso
                </button>
                <span className="vfs-disclaimer">Esta operación consume altos recursos de CPU. Al cancelar, liberarás memoria del servidor.</span>
              </>
            ) : (
              <div className="vfs-success-view">
                <CheckCircle2 size={60} color="#22c55e" className="scale-up-animation" />
                <h3 style={{color: '#cdd6f4'}}>¡Separación Exitosa!</h3>
                <p>El motor IA ha terminado de procesar tu archivo.</p>
                <button className="vfs-done-btn" onClick={handleDone}>
                  Listo
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ZONA DE CARGA */}
      <div className={`vfs-upload-area ${file ? "active" : ""}`} onClick={() => fileInputRef.current.click()}>
        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="audio/*,video/*" style={{ display: "none" }} />
        <div className="vfs-upload-content">
          {file ? (
            <>
              <div className="file-icon-wrapper">
                 <Music size={40} color="#a78bfa" />
              </div>
              <span className="file-name-display">{file.name}</span>
              <span className="file-change-hint">Haz clic para cambiar de archivo</span>
            </>
          ) : (
            <>
              <Upload size={40} color="#64748b" />
              <span>Selecciona un archivo de audio o video</span>
              <p className="upload-subtext">Formatos soportados: MP3, WAV, FLAC, MP4</p>
            </>
          )}
        </div>
      </div>

      {/* SELECCIÓN DE MODO IA */}
      <div className="spleeter-options-grid">
        <label className="section-label">Selecciona el modo de extracción:</label>
        <div className="vfs-filter-list horizontal">
          {spleeterOptions.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setSelectedOption(opt.id)}
              className={`vfs-filter-btn ${selectedOption === opt.id ? "selected" : ""}`}
            >
              <div className="filter-dot" style={{ backgroundColor: opt.color }}></div>
              <div className="filter-text-wrapper">
                <div className="filter-title">{opt.label}</div>
                <div className="filter-desc">{opt.desc}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <button onClick={onSubmit} disabled={!file || isProcessing} className="vfs-action-btn primary-gradient">
        {isProcessing ? <Loader2 className="animate-spin" /> : <Wand2 />}
        {isProcessing ? "Procesando..." : "Comenzar Separación"}
      </button>

      {error && <div className="vfs-error">{error}</div>}

      {/* RESULTADO */}
      <div className="vfs-result-area">
        {!result ? (
          <div className="vfs-placeholder">
            <Info size={18} />
            <span>El reproductor aparecerá aquí tras el proceso</span>
          </div>
        ) : (
          <div className="vfs-success result-card-animated">
            <div className="result-header">
                <CheckCircle2 size={20} color="#4ade80" />
                <span>Audio Procesado</span>
            </div>
            <audio controls src={result.url} className="vfs-audio-player" key={result.url} />
            <a href={result.url} download className="vfs-download-btn full-width">
              <Download size={20} /> Descargar Archivo Final
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default SpleeterPanel;