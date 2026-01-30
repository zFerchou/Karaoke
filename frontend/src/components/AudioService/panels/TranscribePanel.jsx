import React, { useState } from 'react';
import { Upload, Music, Loader2, Wand2, FileText, Copy, Check, XCircle, CheckCircle2, Languages } from 'lucide-react';

const TranscribePanel = ({
  file, setFile, result, isProcessing, onSubmit, error, transcribeOptions, fileInputRef, handleFileChange
}) => {
  const [copied, setCopied] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const handleCancelAction = () => {
    setIsClosing(true);
    setTimeout(() => { setIsClosing(false); window.location.reload(); }, 300);
  };

  const handleDone = () => {
    setIsClosing(true);
    setTimeout(() => setIsClosing(false), 300);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="spleeter-container">
      {/* HEADER */}
      <div className="spleeter-header-info">
        <div className="spleeter-title-group">
          <h2>Transcripción IA</h2>
          <p>Convierte audio a texto utilizando modelos de reconocimiento de voz.</p>
        </div>
        <div className="spleeter-badge-ai" style={{ borderColor: '#10b981', color: '#10b981', background: 'rgba(16, 185, 129, 0.1)' }}>
          <Languages size={14} /> Whisper AI
        </div>
      </div>

       {/* MODAL */}
       {(isProcessing || isClosing) && (
        <div className={`vfs-modal-overlay ${isClosing ? 'exit' : 'entry'}`}>
          <div className="vfs-modal-content">
            {!result ? (
              <>
                <div className="vfs-loader-container">
                  <Loader2 className="animate-spin loader-main" size={48} color="#10b981" />
                  <FileText className="loader-icon-center" size={20} />
                </div>
                <h3>Transcribiendo</h3>
                <p>Analizando formas de onda y detectando palabras...</p>
                <div className="vfs-progress-bar">
                  <div className="vfs-progress-fill" style={{ background: 'linear-gradient(90deg, #10b981, #34d399)' }}></div>
                </div>
                <button className="vfs-cancel-btn" onClick={handleCancelAction}>
                  <XCircle size={18} /> Cancelar
                </button>
              </>
            ) : (
              <div className="vfs-success-view">
                <CheckCircle2 size={60} color="#10b981" className="scale-up-animation" />
                <h3 style={{ color: '#cdd6f4' }}>¡Texto Extraído!</h3>
                <p>La transcripción se ha completado.</p>
                <button className="vfs-done-btn" onClick={handleDone} style={{ backgroundColor: '#059669' }}>
                  Ver Texto
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* UPLOAD AREA */}
      <div className={`vfs-upload-area ${file ? "active" : ""}`} onClick={() => fileInputRef.current.click()} style={{ marginBottom: '20px' }}>
        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="audio/*,video/*" style={{ display: "none" }} />
        <div className="vfs-upload-content">
          {file ? (
            <>
              <Music size={40} color="#10b981" />
              <span className="file-name-display">{file.name}</span>
            </>
          ) : (
            <>
              <Upload size={40} color="#64748b" />
              <span>Subir audio para transcribir</span>
            </>
          )}
        </div>
      </div>

      <button 
        onClick={onSubmit} 
        disabled={!file || isProcessing} 
        className="vfs-action-btn"
        style={{ background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)' }}
      >
        {isProcessing ? <Loader2 className="animate-spin" /> : <Wand2 />}
        {isProcessing ? "Procesando..." : "Iniciar Transcripción"}
      </button>
      {error && <div className="vfs-error">{error}</div>}

      {/* VICTORY SCREEN - TEXT EDITOR STYLE */}
      {result && (
        <div className="vfs-result-area" style={{ display: 'block', marginTop: '30px' }}>
           <div className="vfs-success result-card-animated" style={{ borderColor: 'rgba(16, 185, 129, 0.3)' }}>
              <div className="result-header" style={{ justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <CheckCircle2 size={24} color="#10b981" />
                    <span style={{color: '#10b981', fontSize: '1.1rem'}}>Contenido Generado</span>
                  </div>
                  <button 
                    onClick={handleCopy}
                    className={`copy-btn-mini ${copied ? 'copied' : ''}`}
                  >
                    {copied ? <Check size={16} /> : <Copy size={16} />} 
                    {copied ? "Copiado" : "Copiar"}
                  </button>
              </div>

              <div className="text-editor-container">
                  <div className="line-numbers">
                      {/* Simulación visual de números de línea */}
                      <span>1</span><span>2</span><span>3</span>
                  </div>
                  <div className="text-content-scroll">
                    {result.content}
                  </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default TranscribePanel;