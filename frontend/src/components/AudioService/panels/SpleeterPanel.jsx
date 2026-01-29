import React from 'react';
import { Upload, Music, Download, Loader2, Wand2 } from 'lucide-react';

const SpleeterPanel = ({
  file, setFile, result, isProcessing, onSubmit, error, selectedOption, setSelectedOption, spleeterOptions, fileInputRef, handleFileChange
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
                Subir archivo para separador
              </span>
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
            <div style={{ textAlign: "left" }}>
              <div style={{ fontWeight: "bold", fontSize: "0.9rem" }}>{opt.label}</div>
              <div style={{ fontSize: "0.75rem", opacity: 0.7 }}>{opt.desc}</div>
            </div>
          </button>
        ))}
      </div>

      {/* BOTÓN DE PROCESAR */}
      <button
        onClick={onSubmit}
        disabled={!file || isProcessing}
        className="vfs-action-btn"
      >
        {isProcessing ? <Loader2 className="animate-spin" /> : <Wand2 />}
        {isProcessing ? "Procesando..." : "Separar audio"}
      </button>
      {error && <div className="vfs-error">{error}</div>}

      {/* ÁREA DE RESULTADOS */}
      <div className="vfs-result-area">
        {!result ? (
          <div className="vfs-placeholder">
            <span>El resultado aparecerá aquí</span>
          </div>
        ) : (
          <div className="vfs-success">
            <Music size={56} color="#4ade80" />
            <audio controls src={result.url} className="vfs-audio-player" key={result.url} />
            <a href={result.url} download className="vfs-download-btn">
              <Download size={20} /> Descargar Audio
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default SpleeterPanel;
