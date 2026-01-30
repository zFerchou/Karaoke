import React from 'react';
import { Upload, Music, Loader2, Wand2, FileText } from 'lucide-react';

const TranscribePanel = ({
  file, setFile, result, isProcessing, onSubmit, error, transcribeOptions, fileInputRef, handleFileChange
}) => {
  return (
    <div className="vfs-controls">
      {/* AREA DE UPLOAD */}
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
              <Music size={40} color="#a78bfa" />
              <span style={{ fontWeight: "500", color: "#ddd", fontSize: "0.9rem" }}>
                {file.name}
              </span>
            </>
          ) : (
            <>
              <Upload size={40} color="#64748b" />
              <span style={{ color: "#94a3b8" }}>
                Subir archivo para transcribir
              </span>
            </>
          )}
        </div>
      </div>

      {/* BOTÓN DE PROCESAR */}
      <button
        onClick={onSubmit}
        disabled={!file || isProcessing}
        className="vfs-action-btn"
      >
        {isProcessing ? <Loader2 className="animate-spin" /> : <Wand2 />}
        {isProcessing ? "Procesando..." : "Transcribir audio"}
      </button>
      {error && <div className="vfs-error">{error}</div>}

      {/* ÁREA DE RESULTADOS */}
      <div className="vfs-result-area">
        {!result ? (
          <div className="vfs-placeholder">
            <span>El resultado aparecerá aquí</span>
          </div>
        ) : (
          <div className="vfs-success" style={{ width: "100%" }}>
            <FileText size={32} color="#10b981" />
            <div className="text-scroll-area" style={{
                whiteSpace: "pre-wrap", textAlign: "left", background: "#0f172a",
                padding: "20px", borderRadius: "8px", marginTop: "15px",
                maxHeight: "300px", overflowY: "auto", border: "1px solid #334155", width: '100%'
            }}>
              {result.content}
            </div>
            <button
              onClick={() => navigator.clipboard.writeText(result.content)}
              className="vfs-download-btn"
              style={{ marginTop: "10px", width: "100%", cursor: "pointer" }}
            >
              Copiar Letra
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TranscribePanel;
