import React, { useState, useRef } from 'react';
import { Mic, Layers, FileText, Film, AudioWaveform, AlignLeft, Video } from 'lucide-react';
import { processAudio, separateAudio, transcribeAudio, createLyricVideo } from './audioService';
import { cancelSpleeterProcess } from './cancelService';
import './VoiceFilterStudio.css';
import FilterPanel from './panels/FilterPanel';
import SpleeterPanel from './panels/SpleeterPanel';
import TranscribePanel from './panels/TranscribePanel';
import KaraokePanel from './panels/KaraokePanel';

const BASE_SERVER_URL = "http://localhost:3000"; 

const FILTER_OPTIONS = [
  { id: 'clean', label: 'Limpieza (Clean)', desc: 'Elimina ruido de fondo', color: '#3b82f6' },
  { id: 'vivid', label: 'Vívido', desc: 'Realza frecuencias altas', color: '#a855f7' },
  { id: 'radio', label: 'Radio', desc: 'Efecto vintage/telefónico', color: '#f59e0b' },
  { id: 'norm', label: 'Normalizar', desc: 'Equilibra el volumen', color: '#22c55e' },
];

const QUALITY_OPTIONS = [
  {label: 'Estándar (MP3 - 192K)', format: 'mp3', bitrate: '192k'},
  {label: 'Alta Calidad (MP3 - 320k)', format: 'mp3', bitrate: '320k'},
  {label: 'Sin Pérdida (FLAC)', format: 'flac', bitrate: 'lossless'},
  {label: 'Sin Pérdida (WAV)', format: 'wav', bitrate: 'none'}
];

const SPLEETER_OPTIONS = [
  { id: 'vocals', label: 'Extraer Voz', desc: 'Separa solo la voz (Acapella)', color: '#ef4444' },
  { id: 'accompaniment', label: 'Karaoke (Pista)', desc: 'Elimina la voz, deja la música', color: '#06b6d4' },
];

const TRANSCRIBE_OPTIONS = [
  { id: 'transcribe', label: 'Generar Letra', desc: 'Convierte audio a texto (Whisper)', color: '#10b981' },
];

const VIDEO_OPTIONS = [
  { id: 'karaoke_video', label: 'Video Lyric (Karaoke)', desc: 'Crea video MP4 con subtítulos animados', color: '#f43f5e' },
];

const VoiceFilterStudio = () => {
  const [mode, setMode] = useState('filter'); 
  const [selectedOption, setSelectedOption] = useState('clean');
  const [selectedQuality, setSelectedQuality] = useState(QUALITY_OPTIONS[0]);
  
  // Estado de archivos independiente por modo
  const [files, setFiles] = useState({
    filter: null,
    spleeter: null,
    transcribe: null,
    video: null // Nuevo estado para video
  });

  // Resultados independientes
  const [results, setResults] = useState({
    filter: null,
    spleeter: null,
    transcribe: null,
    video: null // Nuevo estado para video
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleTabChange = (newMode) => {
    setMode(newMode);
    setError(null);
    if (newMode === 'filter') setSelectedOption('clean');
    if (newMode === 'spleeter') setSelectedOption('vocals');
    if (newMode === 'transcribe') setSelectedOption('transcribe');
    else if (newMode === 'video') setSelectedOption('karaoke_video');
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const isValidType = file.type.startsWith("audio/") || file.type === "video/mp4";
      
      if (!isValidType) {
        setError("Formato no soportado. Sube un audio o video MP4");
        return;
      }

      setFiles(prev => ({ ...prev, [mode]: file }));
      setResults(prev => ({ ...prev, [mode]: null }));
      setError(null);
    }
  };

  const handleSubmit = async () => {
    const currentFile = files[mode];
    if (!currentFile) return;
    
    setIsProcessing(true);
    setError(null);

    try {
      let data;
      let finalUrl = null;

      if (mode === 'filter') {
        data = await processAudio(
          currentFile,
          selectedOption,
          selectedQuality.format,
          selectedQuality.bitrate,
        );
        if (data?.downloadUrl) finalUrl = `${BASE_SERVER_URL}${data.downloadUrl}`;
        else if (data?.filename) finalUrl = `${BASE_SERVER_URL}/api/audio/download/${data.filename}`;
        
        setResults(prev => ({ ...prev, filter: { type: 'audio', url: finalUrl } }));

      } else if (mode === 'spleeter') {
        data = await separateAudio(currentFile, selectedOption);
        if (data?.files) {
          let relativePath = selectedOption === 'vocals' ? data.files.vocals : data.files.accompaniment;
          if (relativePath) finalUrl = `${BASE_SERVER_URL}${relativePath}`;
        }
        setResults(prev => ({ ...prev, spleeter: { type: 'audio', url: finalUrl } }));

      } else if (mode === 'transcribe') {
        data = await transcribeAudio(currentFile);
        if (data?.text) {
          setResults(prev => ({ ...prev, transcribe: { type: 'text', content: data.text } }));
        }

      } else if (mode === 'video') {
        // --- LÓGICA DE VIDEO KARAOKE ---
        data = await createLyricVideo(currentFile, 'es', 'small'); // Idioma y modelo hardcoded o hacer selectores
        
        if (data?.files?.video) {
           setResults(prev => ({ 
             ...prev, 
             video: { 
               type: 'video', 
               url: `${BASE_SERVER_URL}${data.files.video}`,
               assUrl: `${BASE_SERVER_URL}${data.files.subtitles_ass}`,
               srtUrl: `${BASE_SERVER_URL}${data.files.subtitles_srt}`
             } 
           }));
        } else {
            throw new Error("El servidor no devolvió la ruta del video.");
        }
      }

    } catch (err) {
      console.error(err);
      setError(`Error: ${err.response?.data?.error || err.message || "Fallo desconocido"}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Maneja la cancelación del proceso Spleeter
  const handleCancelSpleeter = () => {
    setIsProcessing(false);
    setError(null);
    setResults(prev => ({ ...prev, spleeter: null }));
    setFiles(prev => ({ ...prev, spleeter: null }));
  };

  // Paneles
  const panelProps = {
    file: files[mode],
    setFile: f => setFiles(prev => ({ ...prev, [mode]: f })),
    result: results[mode],
    setResult: r => setResults(prev => ({ ...prev, [mode]: r })),
    isProcessing,
    onSubmit: handleSubmit,
    onCancel: mode === 'spleeter' ? handleCancelSpleeter : undefined,
    error,
    selectedOption,
    setSelectedOption,
    selectedQuality,
    setSelectedQuality,
    filterOptions: FILTER_OPTIONS,
    qualityOptions: QUALITY_OPTIONS,
    spleeterOptions: SPLEETER_OPTIONS,
    transcribeOptions: TRANSCRIBE_OPTIONS,
    videoOptions: VIDEO_OPTIONS,
    fileInputRef,
    handleFileChange
  };

  return (
    <div className="vfs-container">
      <div className="vfs-card">
        <div className="vfs-header">
          <h1 className="vfs-title">
            {mode === "filter" && <Mic size={32} />}
            {mode === "spleeter" && <Layers size={32} />}
            {mode === "transcribe" && <FileText size={32} />}
            {mode === "video" && <Film size={32} />}
            Estudio de Audio IA
          </h1>
          <p className="vfs-subtitle">
            {mode === "filter" && "Aplica filtros profesionales a tu voz."}
            {mode === "spleeter" && "Separa la voz de la música."}
            {mode === "transcribe" && "Obtén la letra de tus canciones automáticamente."}
            {mode === "video" && "Crea videos con letra estilo Karaoke."}
          </p>

          <div className="vfs-tabs">
            <button className={`vfs-tab-btn ${mode === "filter" ? "active" : ""}`} onClick={() => handleTabChange("filter")}>
              <AudioWaveform size={18} /> Filtros
            </button>
            <button className={`vfs-tab-btn ${mode === "spleeter" ? "active" : ""}`} onClick={() => handleTabChange("spleeter")}>
              <Layers size={18} /> Separador
            </button>
            <button className={`vfs-tab-btn ${mode === "transcribe" ? "active" : ""}`} onClick={() => handleTabChange("transcribe")}>
              <AlignLeft size={18} /> Letra
            </button>
            <button className={`vfs-tab-btn ${mode === "video" ? "active" : ""}`} onClick={() => handleTabChange("video")}>
              <Video size={18} /> Karaoke
            </button>
          </div>
        </div>

        <div className="vfs-content">
          {mode === 'filter' && <FilterPanel {...panelProps} />}
          {mode === 'spleeter' && <SpleeterPanel {...panelProps} />}
          {mode === 'transcribe' && <TranscribePanel {...panelProps} />}
          {mode === 'video' && <KaraokePanel {...panelProps} />}
        </div>
      </div>
    </div>
  );
};

export default VoiceFilterStudio;