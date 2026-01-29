import React from 'react';
import { Upload, Music, Loader2, Wand2, Video, FileText } from 'lucide-react';

const KaraokePanel = ({
  file, setFile, result, isProcessing, onSubmit, error, videoOptions, fileInputRef, handleFileChange
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
                Subir archivo para Karaoke
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
        {isProcessing ? "Procesando..." : "Generar Video"}
      </button>
      {error && <div className="vfs-error">{error}</div>}

      {/* ÁREA DE RESULTADOS */}
      <div className="vfs-result-area">
        {!result ? (
          <div className="vfs-placeholder">
            <span>El resultado aparecerá aquí</span>
          </div>
        ) : (
          <div className="vfs-success" style={{width: '100%'}}>
            <div style={{ position: 'relative', width: '100%', borderRadius: '8px', overflow: 'hidden', border: '1px solid #334155' }}>
                <video 
                    controls 
                    src={result.url} 
                    style={{ width: '100%', display: 'block' }} 
                    key={result.url}
                />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '15px', width: '100%' }}>
                <a href={result.url} download className="vfs-download-btn">
                    <Video size={18} /> Video MP4
                </a>
                <a href={result.assUrl} download className="vfs-download-btn" style={{ background: '#334155' }}>
                    <FileText size={18} /> Subtítulos .ASS
                </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default KaraokePanel;
