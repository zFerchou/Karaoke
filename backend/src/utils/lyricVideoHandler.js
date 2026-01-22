const { spawn, execSync } = require("child_process");
const path = require("path");
const fs = require("fs");

/**
 * Busca el video plantilla
 */
const getTemplateVideoPath = () => {
  const templateDir = path.resolve(__dirname, "../../video_plantilla");
  if (!fs.existsSync(templateDir)) throw new Error("La carpeta 'video_plantilla' no existe.");
  
  const files = fs.readdirSync(templateDir);
  const videoFile = files.find(file => file.toLowerCase().endsWith(".mp4"));
  if (!videoFile) throw new Error("No hay video .mp4 en 'video_plantilla'");
  
  return path.join(templateDir, videoFile);
};

/**
 * Formateador de tiempo ASS de Alta Precisión
 */
const formatTimeASS = (seconds) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const cs = Math.floor((seconds % 1) * 100); 
  return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${cs.toString().padStart(2, '0')}`;
};

/**
 * Genera el archivo .ASS con SINCRONIZACIÓN PERFECTA (Sin superposición)
 */
const createAssFile = (jsonPath, outputAssPath) => {
  const rawData = fs.readFileSync(jsonPath, "utf8");
  const data = JSON.parse(rawData);
  const segments = data.segments || [];

  const header = `[Script Info]
ScriptType: v4.00+
PlayResX: 1920
PlayResY: 1080

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: KaraokeStyle,Arial,65,&H0000FFFF,&H00AAAAAA,&H00000000,&H80000000,-1,0,0,0,100,100,0,0,1,3,1,5,10,10,60,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
`;

  let events = "";

  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    const nextSeg = segments[i + 1]; // Miramos el futuro

    if (!seg.words || seg.words.length === 0) continue;

    // TIEMPO DE INICIO: Exacto a la primera palabra
    const lineStart = seg.words[0].start;

    // CÁLCULO INTELIGENTE DEL FINAL DE LÍNEA
    // Meta: Evitar que se empalmen visualmente.
    
    // 1. Final natural (última palabra + un pequeño margen visual)
    let naturalEnd = seg.words[seg.words.length - 1].end + 0.3; 

    // 2. ¿Cuándo empieza la SIGUIENTE frase?
    const nextStart = nextSeg ? nextSeg.words?.[0]?.start || nextSeg.start : 999999;

    // 3. REGLA DE ORO: El final actual NUNCA puede pasar el inicio del siguiente.
    // Usamos Math.min para cortar el subtítulo si el siguiente entra rápido.
    const lineEnd = Math.min(naturalEnd, nextStart);

    // Formatear a ASS
    const startAss = formatTimeASS(lineStart);
    const endAss = formatTimeASS(lineEnd);

    let karaokeLine = "";
    
    // --- LÓGICA DE RELLENO DE PALABRAS (LEGATO) ---
    seg.words.forEach((word, index) => {
      const cleanWord = word.word.trim();
      if (!cleanWord) return;

      const nextWord = seg.words[index + 1];
      const currentStart = word.start;
      
      // Calculamos el final de la palabra actual
      // Si hay siguiente palabra en la misma frase, llenamos el hueco hasta ella (Legato)
      // Si es la última palabra, usamos el final real de la palabra
      let currentEnd = nextWord ? nextWord.start : word.end;

      // Protección contra silencios largos dentro de la misma frase (> 1.5s)
      if (nextWord && (nextWord.start - word.end > 1.5)) {
        currentEnd = word.end;
      }

      // Duración en Centésimas para el efecto \K
      const durationSec = currentEnd - currentStart;
      let durationCs = Math.floor(durationSec * 100);
      
      const space = (index > 0) ? " " : "";
      karaokeLine += `${space}{\\K${durationCs}}${cleanWord}`;
    });

    events += `Dialogue: 0,${startAss},${endAss},KaraokeStyle,,0,0,0,,${karaokeLine}\n`;
  }

  fs.writeFileSync(outputAssPath, header + events, "utf8");
};

/**
 * Obtiene duración del audio (útil para logs o futuros usos)
 */
const getAudioDuration = (audioPath) => {
  try {
    const cmd = `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${audioPath}"`;
    return parseFloat(execSync(cmd).toString().trim());
  } catch (e) { return 0; }
};

exports.generateLyricVideo = (audioPath, jsonPath, outputDir, callback) => {
  try {
    const templatePath = getTemplateVideoPath();
    const outputVideoPath = path.join(outputDir, "video_lyrics.mp4");
    
    // 1. Generar Subtítulos
    const assPath = path.join(outputDir, "subtitles.ass");
    createAssFile(jsonPath, assPath);

    // 2. Rutas para Windows
    let assPathFormatted = assPath.split(path.sep).join("/");
    if (process.platform === "win32") {
      assPathFormatted = assPathFormatted.replace(":", "\\:");
    }

    // 3. Filtros: SOLO SUBTÍTULOS (Sin barra amarilla)
    const videoFilters = `subtitles='${assPathFormatted}'`;
    
    const args = [
      "-stream_loop", "-1",       // Loop infinito al video
      "-i", templatePath,         // Input Video
      "-i", audioPath,            // Input Audio
      "-vf", videoFilters,        // Filtro Subtítulos
      "-map", "0:v", "-map", "1:a",
      
      // --- SECCIÓN DE OPTIMIZACIÓN (Reduce peso drásticamente) ---
      "-c:v", "libx264",          // Codec de video eficiente
      "-preset", "medium",        // Compresión balanceada (antes era ultrafast=pesado)
      "-crf", "23",               // Calidad constante (valor estándar bueno)
      "-pix_fmt", "yuv420p",      // Formato de pixel compatible y ligero
      "-movflags", "+faststart",  // Optimización para web/streaming

      "-c:a", "aac", "-b:a", "192k", // Audio AAC
      "-shortest", "-y",          // Cortar al final del audio y sobreescribir
      outputVideoPath
    ];

    console.log(`--> Renderizando Video Optimizado (H.264 Medium CRF 23)...`);
    
    const ffmpeg = spawn("ffmpeg", args);
    let stderrLog = "";
    ffmpeg.stderr.on("data", d => stderrLog += d.toString());

    ffmpeg.on("close", (code) => {
      if (code === 0) callback(null, outputVideoPath);
      else {
        console.error(stderrLog);
        callback(new Error(`Error FFmpeg: ${code}`));
      }
    });

  } catch (error) {
    callback(error);
  }
};