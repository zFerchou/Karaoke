import {
  Upload,
  Music,
  Download,
  Wand2,
  Loader2,
  XCircle,
  Info,
} from "lucide-react";
import { cancelAudioFilterProcess } from "../audioService";

const FilterPanel = ({
  file,
  setFile,
  result,
  isProcessing,
  onSubmit,
  onCancel,
  error,
  selectedOption,
  setSelectedOption,
  selectedQuality,
  setSelectedQuality,
  filterOptions,
  qualityOptions,
  fileInputRef,
  handleFileChange,
}) => {
  const handleCancel = async () => {
    try {
      const response = await cancelAudioFilterProcess();

      // 1. Apagamos el flag en el padre.
      // Esto hace que el catch del handleSubmit ignore el error de conexión.
      if (onCancel) onCancel();

      // 2. Esperamos un pelín para asegurar que el catch del padre ya pasó
      setTimeout(() => {
        if (response && response.message) {
          setError(response.message); // Aquí ya debería salir "Proceso detenido..."
        }
      }, 50);
    } catch (err) {
      setError("No se pudo cancelar el proceso.");
    }
  };
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
              <span
                style={{ fontWeight: "500", color: "#ddd", fontSize: "0.9rem" }}
              >
                {file.name}
              </span>
            </>
          ) : (
            <>
              <Upload size={40} color="#64748b" />
              <span style={{ color: "#94a3b8" }}>
                Subir archivo para filtro
              </span>
            </>
          )}
        </div>
      </div>

      {/* LISTA DE OPCIONES */}
      <div className="vfs-filter-list">
        {filterOptions.map((opt) => (
          <button
            key={opt.id}
            onClick={() => setSelectedOption(opt.id)}
            className={`vfs-filter-btn ${selectedOption === opt.id ? "selected" : ""}`}
          >
            <div
              className="filter-dot"
              style={{ backgroundColor: opt.color }}
            ></div>
            <div style={{ textAlign: "left" }}>
              <div style={{ fontWeight: "bold", fontSize: "0.9rem" }}>
                {opt.label}
              </div>
              <div style={{ fontSize: "0.75rem", opacity: 0.7 }}>
                {opt.desc}
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* SELECTOR DE CALIDAD */}
      <div className="vfs-quality-selector" style={{ marginTop: "20px" }}>
        <label className="vfs-filter-label">Calidad de Exportación</label>
        <div className="vfs-quality-grid">
          {qualityOptions.map((q, index) => (
            <button
              key={index}
              className={`vfs-quality-chip ${selectedQuality.label === q.label ? "active" : ""}`}
              onClick={() => setSelectedQuality(q)}
            >
              {q.label}
            </button>
          ))}
        </div>
      </div>

      {/* BOTÓN DE PROCESAR Y CANCELAR */}
      <button
        onClick={onSubmit}
        disabled={!file || isProcessing}
        className="vfs-action-btn"
      >
        {isProcessing ? <Loader2 className="animate-spin" /> : <Wand2 />}
        {isProcessing ? "Procesando..." : "Procesar filtro"}
      </button>
      {/* MODAL DE PROCESAMIENTO (Igual al de tus compañeros) */}
      {isProcessing && (
        <div className="vfs-modal-overlay entry">
          <div className="vfs-modal-content">
            <div className="vfs-loader-container">
              <div className="vfs-loader-spinner"></div>
              <Loader2 className="loader-icon-center animate-spin" size={32} />
            </div>

            <h3>Aplicando Filtro de Voz</h3>
            <p>Esto puede tardar unos segundos dependiendo de la duración...</p>

            <button onClick={handleCancel} className="vfs-cancel-btn">
              <XCircle size={18} />
              Cancelar Proceso
            </button>
          </div>
        </div>
      )}
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
            <audio
              controls
              src={result.url}
              className="vfs-audio-player"
              key={result.url}
            />
            <a href={result.url} download className="vfs-download-btn">
              <Download size={20} /> Descargar Audio
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default FilterPanel;
