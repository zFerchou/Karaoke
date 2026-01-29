import React, { useState } from 'react';
import { Upload, Music, Download, Loader2, Wand2, Cpu, XCircle, CheckCircle2 } from 'lucide-react';
import { cancelSpleeterProcess } from '../cancelService';

const SpleeterPanel = ({
  file, result, isProcessing, onSubmit, onCancel, error, selectedOption, setSelectedOption, spleeterOptions, fileInputRef, handleFileChange
}) => {
  const [isClosing, setIsClosing] = useState(false);

  const handleCancelAction = async () => {
    if (!file) return;
    setIsClosing(true); // Inicia animación de salida
    try {
      await cancelSpleeterProcess(file.name);
      setTimeout(() => {
        if (onCancel) onCancel();
        setIsClosing(false);
      }, 300); // Espera a que termine la animación CSS
    } catch (e) {
      setIsClosing(false);
      alert('No se pudo cancelar el proceso.');
    }
  };

  const handleDone = () => {
    setIsClosing(true);
    setTimeout(() => {
      if (onCancel) onCancel(); // Resetea el panel
      setIsClosing(false);
    }, 300);
  };

  return (
    <div className="vfs-controls">
      {/* MODAL CON ANIMACIÓN DE ENTRADA Y SALIDA */}
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
                <p>Separando pistas de audio...</p>
                <div className="vfs-progress-bar">
                  <div className="vfs-progress-fill"></div>
                </div>
                <button className="vfs-cancel-btn" onClick={handleCancelAction}>
                  <XCircle size={18} /> Cancelar proceso
                </button>
                <span className="vfs-disclaimer">Si cancelas, se liberará la memoria del servidor inmediatamente.</span>
              </>
            ) : (
              <div className="vfs-success-view">
                <CheckCircle2 size={60} color="#22c55e" className="scale-up-animation" />
                <h3 style={{color: '#cdd6f4'}}>¡Separación Exitosa!</h3>
                <p>Tu archivo ya está procesado.</p>
                <button className="vfs-done-btn" onClick={handleDone}>
                  Listo
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* AREA DE UPLOAD */}
      <div className={`vfs-upload-area ${file ? "active" : ""}`} onClick={() => fileInputRef.current.click()}>
        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="audio/*,video/*" style={{ display: "none" }} />
        <div className="vfs-upload-content">
          {file ? (
            <>
              <Music size={40} color="#a78bfa" />
              <span className="file-name-display">{file.name}</span>
            </>
          ) : (
            <>
              <Upload size={40} color="#64748b" />
              <span>Subir archivo para separador</span>
            </>
          )}
        </div>
      </div>

      {/* LISTA DE OPCIONES */}
      <div className="vfs-filter-list">
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

      <button onClick={onSubmit} disabled={!file || isProcessing} className="vfs-action-btn">
        {isProcessing ? <Loader2 className="animate-spin" /> : <Wand2 />}
        {isProcessing ? "Separando..." : "Separar audio"}
      </button>

      {error && <div className="vfs-error">{error}</div>}

      <div className="vfs-result-area">
        {!result ? (
          <div className="vfs-placeholder"><span>El resultado aparecerá aquí</span></div>
        ) : (
          <div className="vfs-success">
            <Music size={56} color="#4ade80" />
            <audio controls src={result.url} className="vfs-audio-player" key={result.url} />
            <a href={result.url} download className="vfs-download-btn"><Download size={20} /> Descargar Audio</a>
          </div>
        )}
      </div>
    </div>
  );
};

export default SpleeterPanel;