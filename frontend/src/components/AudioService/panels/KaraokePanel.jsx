import React, { useState } from 'react';
import { Upload, Music, Loader2, Wand2, Video, FileText, XCircle, CheckCircle2, Clapperboard } from 'lucide-react';

const KaraokePanel = ({
  file, setFile, result, isProcessing, onSubmit, error, videoOptions, fileInputRef, handleFileChange
}) => {
  const [isClosing, setIsClosing] = useState(false);

  const handleCancelAction = () => {
    setIsClosing(true);
    setTimeout(() => { setIsClosing(false); window.location.reload(); }, 300);
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
          <h2>Generador de Karaoke</h2>
          <p>Crea videos con letras sincronizadas automáticamente.</p>
        </div>
        <div className="spleeter-badge-ai" style={{ borderColor: '#f43f5e', color: '#f43f5e', background: 'rgba(244, 63, 94, 0.1)' }}>
          <Video size={14} /> Render Engine
        </div>
      </div>

      {/* MODAL */}
      {(isProcessing || isClosing) && (
        <div className={`vfs-modal-overlay ${isClosing ? 'exit' : 'entry'}`}>
          <div className="vfs-modal-content">
            {!result ? (
              <>
                <div className="vfs-loader-container">
                  <Loader2 className="animate-spin loader-main" size={48} color="#f43f5e" />
                  <Clapperboard className="loader-icon-center" size={20} />
                </div>
                <h3>Renderizando Video</h3>
                <p>Sincronizando subtítulos y generando frames...</p>
                <div className="vfs-progress-bar">
                  <div className="vfs-progress-fill" style={{ background: 'linear-gradient(90deg, #f43f5e, #fda4af)' }}></div>
                </div>
                <button className="vfs-cancel-btn" onClick={handleCancelAction}>
                  <XCircle size={18} /> Cancelar Renderizado
                </button>
              </>
            ) : (
              <div className="vfs-success-view">
                <CheckCircle2 size={60} color="#f43f5e" className="scale-up-animation" />
                <h3 style={{ color: '#cdd6f4' }}>¡Video Listo!</h3>
                <p>Tu archivo MP4 y subtítulos han sido generados.</p>
                <button className="vfs-done-btn" onClick={handleDone} style={{ backgroundColor: '#e11d48' }}>
                  Ver Video
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* UPLOAD Y ACCIÓN */}
      <div className={`vfs-upload-area ${file ? "active" : ""}`} onClick={() => fileInputRef.current.click()} style={{marginBottom: '20px'}}>
        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="audio/*,video/*" style={{ display: "none" }} />
        <div className="vfs-upload-content">
          {file ? (
            <>
              <Music size={40} color="#f43f5e" />
              <span className="file-name-display">{file.name}</span>
            </>
          ) : (
            <>
              <Upload size={40} color="#64748b" />
              <span>Sube tu canción para Karaoke</span>
            </>
          )}
        </div>
      </div>

      <button 
        onClick={onSubmit} 
        disabled={!file || isProcessing} 
        className="vfs-action-btn"
        style={{ background: 'linear-gradient(135deg, #e11d48 0%, #f43f5e 100%)' }}
      >
        {isProcessing ? <Loader2 className="animate-spin" /> : <Wand2 />}
        {isProcessing ? "Procesando..." : "Generar Video con Letra"}
      </button>
      {error && <div className="vfs-error">{error}</div>}

      {/* VICTORY SCREEN - VIDEO PLAYER */}
      {result && (
        <div className="vfs-result-area" style={{display: 'block', marginTop: '30px'}}>
           <div className="vfs-success result-card-animated" style={{ borderColor: 'rgba(244, 63, 94, 0.3)' }}>
              <div className="result-header">
                  <CheckCircle2 size={24} color="#f43f5e" />
                  <span style={{color: '#f43f5e', fontSize: '1.1rem'}}>Renderizado Finalizado</span>
              </div>
              
              <div className="video-wrapper-styled">
                  <video controls src={result.url} className="vfs-video-player" key={result.url} />
              </div>

              <div className="download-grid">
                  <a href={result.url} download className="vfs-download-btn full-width" style={{ background: '#be123c' }}>
                      <Video size={18} /> Descargar Video MP4
                  </a>
                  <a href={result.assUrl} download className="vfs-download-btn full-width" style={{ background: '#334155' }}>
                      <FileText size={18} /> Subtítulos .ASS
                  </a>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default KaraokePanel;