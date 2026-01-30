import React, { useState, useRef, useEffect } from "react";
import {
  processAudio,
  separateAudio,
  transcribeAudio,
  createLyricVideo,
} from "./audioService";
import Navbar from "../Navbar";

// Importación de Paneles
import FilterPanel from "./panels/FilterPanel";
import SpleeterPanel from "./panels/SpleeterPanel";
import TranscribePanel from "./panels/TranscribePanel";
import KaraokePanel from "./panels/KaraokePanel";

import "./VoiceFilterStudio.css";

const FILTER_OPTIONS = [
  {
    id: "clean",
    label: "Limpieza (Clean)",
    desc: "Elimina ruido de fondo",
    color: "#3b82f6",
  },
  {
    id: "vivid",
    label: "Vívido",
    desc: "Realza frecuencias altas",
    color: "#a855f7",
  },
  {
    id: "radio",
    label: "Radio",
    desc: "Efecto vintage/telefónico",
    color: "#f59e0b",
  },
  {
    id: "norm",
    label: "Normalizar",
    desc: "Equilibra el volumen",
    color: "#22c55e",
  },
];

const QUALITY_OPTIONS = [
  { label: "Estándar (MP3 - 192K)", format: "mp3", bitrate: "192k" },
  { label: "Alta Calidad (MP3 - 320k)", format: "mp3", bitrate: "320k" },
];

const SPLEETER_OPTIONS = [
  {
    id: "vocals",
    label: "Extraer Voz",
    desc: "Separa solo la voz (Acapella)",
    color: "#ef4444",
  },
  {
    id: "accompaniment",
    label: "Karaoke (Pista)",
    desc: "Elimina la voz, deja la música",
    color: "#06b6d4",
  },
];

const VoiceFilterStudio = ({ mode }) => {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [selectedOption, setSelectedOption] = useState("");
  const [selectedQuality, setSelectedQuality] = useState(QUALITY_OPTIONS[0]);
  const fileInputRef = useRef(null);

  useEffect(() => {
    setFile(null);
    setResult(null);
    setError(null);

    const defaults = {
      filter: "clean",
      spleeter: "vocals",
      transcribe: "transcribe",
      video: "karaoke_video",
    };
    setSelectedOption(defaults[mode] || "");
  }, [mode]);

  const handleSubmit = async () => {
    if (!file) return;
    setIsProcessing(true);
    setError(null);
    setResult(null);

    try {
      let data;
      const BASE = "http://localhost:3000";

      if (mode === "filter") {
        data = await processAudio(
          file,
          selectedOption,
          selectedQuality.format,
          selectedQuality.bitrate,
        );
        setResult({
          url: `${BASE}${data.downloadUrl || `/api/audio/download/${data.filename}`}`,
        });
      } else if (mode === "spleeter") {
        data = await separateAudio(file, selectedOption);
        const path =
          selectedOption === "vocals"
            ? data.files.vocals
            : data.files.accompaniment;
        setResult({ url: `${BASE}${path}` });
      } else if (mode === "transcribe") {
        data = await transcribeAudio(file);
        setResult({ content: data.text });
      } else if (mode === "video") {
        data = await createLyricVideo(file, "es", "small");
        setResult({
          url: `${BASE}${data.files.video}`,
          assUrl: `${BASE}${data.files.subtitles_ass}`,
        });
      }
    } catch (err) {
      console.error("Error capturado en el procesamiento:", err);

      setIsProcessing((prevIsProcessing) => {
        // Si prevIsProcessing es false, es porque handleCancel ya lo apagó.
        // Solo ponemos el error si realmente fue un fallo del servidor (prevIsProcessing === true)
        if (prevIsProcessing) {
          setError("Error en el servidor. Revisa la conexión.");
        }
        return false; // Apagamos el procesamiento
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const commonProps = {
    file,
    setFile,
    result,
    isProcessing,
    onSubmit: handleSubmit,
    onCancel: () => setIsProcessing(false),
    error,
    selectedOption,
    setSelectedOption,
    fileInputRef,
    handleFileChange: (e) => {
      setFile(e.target.files[0]);
      setResult(null);
    },
  };

  return (
    <div className="vfs-main-layout">
      {/* 1. USAMOS EL COMPONENTE ÚNICO */}
      <Navbar />

      <div className="vfs-container">
        <div className="vfs-card">
          {mode === "filter" && (
            <FilterPanel
              {...commonProps}
              setError={setError}
              filterOptions={FILTER_OPTIONS}
              qualityOptions={QUALITY_OPTIONS}
              selectedQuality={selectedQuality}
              setSelectedQuality={setSelectedQuality}
            />
          )}
          {mode === "spleeter" && (
            <SpleeterPanel
              {...commonProps}
              spleeterOptions={SPLEETER_OPTIONS}
              onCancel={() => setIsProcessing(false)}
            />
          )}
          {mode === "transcribe" && <TranscribePanel {...commonProps} />}
          {mode === "video" && <KaraokePanel {...commonProps} />}
        </div>
      </div>
    </div>
  );
};

export default VoiceFilterStudio;
