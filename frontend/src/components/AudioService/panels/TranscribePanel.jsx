import React from 'react';
import { Upload, Music, Loader2, Wand2, FileText, CheckCircle2, Copy, Mic, Cpu } from 'lucide-react';

const TranscribePanel = ({
  file, setFile, result, isProcessing, onSubmit, error, transcribeOptions, fileInputRef, handleFileChange
}) => {
  return (
    <div className="vfs-controls fade-in">
      
      {/* HEADER */}
      <div className="spleeter-header-info">
        <div className="spleeter-title-group">
          <h2>Transcripción IA</h2>
          <p>Convierte voz y canto a texto plano utilizando Whisper.</p>
        </div>
        <div className="spleeter-badge-ai" style={{ borderColor: '#10b981', color: '#10b981', background: 'rgba(16, 185, 129, 0.1)' }}>
          <Mic size={14} /> Speech-to-Text
        </div>
      </div>

      {/* MODAL PROCESAMIENTO */}
      {isProcessing && (
        <div className="vfs-modal-overlay entry">
          <div className="vfs-modal-content">
            <div className="vfs-loader-container">
              <Loader2 className="animate-spin loader-main" size={48} />
              <FileText className="loader-icon-center" size={20} />
            </div>
            <h3>Transcribiendo</h3>
            <p>La IA está escuchando y escribiendo tu audio...</p>
            <div className="vfs-progress-bar">
              <div className="vfs-progress-fill"></div>
            </div>
          </div>
        </div>
      )}

      {/* UPLOAD */}
      <div
        className={`vfs-upload-area ${file ? "active" : ""}`}
        onClick={() => fileInputRef.current.click()}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="audio/*,video/*"
          style={{ display: "none" }}
        />
        <div className="vfs-upload-content">
          {file ? (
            <>
              <div className="file-icon-wrapper">
                 <Music size={40} color="#10b981" />
              </div>
              <span className="file-name-display">{file.name}</span>
              <span className="file-change-hint">Click para cambiar</span>
            </>
          ) : (
            <>
              <Upload size={40} color="#64748b" />
              <span>Subir audio para transcribir</span>
              <p className="upload-subtext">Ideal para entrevistas o letras de canciones</p>
            </>
          )}
        </div>
      </div>

      {/* BOTON */}
      <button
        onClick={onSubmit}
        disabled={!file || isProcessing}
        className="vfs-action-btn primary-gradient"
        style={{ marginTop: '20px' }}
      >
        <Wand2 /> Iniciar Transcripción
      </button>

      {error && <div className="vfs-error">{error}</div>}

      {/* RESULTADO */}
      <div className="vfs-result-area">
        {!result ? (
          <div className="vfs-placeholder">
            <FileText size={20} style={{marginBottom: 10}}/>
            <span>El texto aparecerá aquí</span>
          </div>
        ) : (
          <div className="vfs-success result-card-animated" style={{ width: "100%" }}>
            
            <div className="result-header">
                <CheckCircle2 size={24} color="#10b981" />
                <span>Transcripción Completada</span>
            </div>

            <div className="text-scroll-area" style={{
                whiteSpace: "pre-wrap", 
                textAlign: "left", 
                background: "#0f172a",
                padding: "20px", 
                borderRadius: "12px", 
                marginTop: "10px",
                maxHeight: "300px", 
                overflowY: "auto", 
                border: "1px solid #334155", 
                width: '100%',
                fontFamily: 'monospace',
                fontSize: '0.9rem',
                lineHeight: '1.6',
                color: '#cbd5e1'
            }}>
              {result.content}
            </div>

            <button
              onClick={() => navigator.clipboard.writeText(result.content)}
              className="vfs-download-btn full-width"
              style={{ marginTop: "15px", justifyContent: 'center' }}
            >
              <Copy size={18} /> Copiar al Portapapeles
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TranscribePanel;