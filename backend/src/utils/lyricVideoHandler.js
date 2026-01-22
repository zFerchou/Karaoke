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
 * Formateador de tiempo ASS de Alta Precisión (Math-based)
 * Evita errores de milisegundos de Date()
 * Salida: H:MM:SS.cc (Centésimas)
 */
const formatTimeASS = (seconds) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const cs = Math.floor((seconds % 1) * 100); // Centésimas
  return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${cs.toString().padStart(2, '0')}`;
};

/**
 * Genera el archivo .ASS con lógica "LEGATO" (Fluidez Continua)
 */
const createAssFile = (jsonPath, outputAssPath) => {
  const rawData = fs.readFileSync(jsonPath, "utf8");
  const data = JSON.parse(rawData);
  const segments = data.segments || [];

  // Configuración de Estilo Karaoke Profesional
  // PrimaryColour: &H0000FFFF (Amarillo)
  // SecondaryColour: &H00AAAAAA (Gris)
  // MarginV=60: Altura desde el fondo
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

  const events = segments.map(seg => {
    if (!seg.words || seg.words.length === 0) return ""; // Saltar si no hay datos precisos

    // LINGER TIME: Tiempo extra que se queda el subtítulo al final (0.3s)
    // Esto evita que la letra desaparezca de golpe mientras el cantante termina la nota.
    const EXTRA_END_TIME = 0.3; 
    
    const lineStart = seg.words[0].start;
    // El final de la línea visual es el final real + el tiempo extra
    const lineEnd = seg.words[seg.words.length - 1].end + EXTRA_END_TIME;

    const startAss = formatTimeASS(lineStart);
    const endAss = formatTimeASS(lineEnd);

    let karaokeLine = "";
    
    // --- LÓGICA DE SINCRONIZACIÓN "LEGATO" ---
    // En lugar de usar word.end, extendemos la duración de la palabra actual
    // hasta el inicio de la siguiente. Esto cubre los huecos y silencios
    // haciendo que el color se llene suavemente durante la nota sostenida.
    
    seg.words.forEach((word, index) => {
      const cleanWord = word.word.trim();
      if (!cleanWord) return;

      const nextWord = seg.words[index + 1];
      
      // Inicio real de esta palabra
      const currentStart = word.start;
      
      // Final calculado:
      // Si hay siguiente palabra, nuestro final es SU inicio (rellenamos el hueco).
      // Si es la última palabra, usamos su final real.
      let currentEnd = nextWord ? nextWord.start : word.end;

      // Si el hueco con la siguiente palabra es GIGANTE (> 1s), respetamos el silencio.
      // Si es pequeño (respiración), lo puenteamos para fluidez.
      if (nextWord && (nextWord.start - word.end > 1.0)) {
        currentEnd = word.end; // Cortar, es un silencio largo instrumental
      }

      // Duración en Centésimas (ASS usa centésimas para \K)
      const durationSec = currentEnd - currentStart;
      const durationCs = Math.floor(durationSec * 100);

      // Agregamos espacio previo si es necesario (Whisper suele pegar las palabras)
      // Solo agregamos espacio visual, no de tiempo \K, para no desfasar.
      const space = (index > 0) ? " " : "";

      // Construcción del tag: { \K80 } Palabrabra
      karaokeLine += `${space}{\\K${durationCs}}${cleanWord}`;
    });

    return `Dialogue: 0,${startAss},${endAss},KaraokeStyle,,0,0,0,,${karaokeLine}`;
  }).join("\n");

  fs.writeFileSync(outputAssPath, header + events, "utf8");
};

/**
 * Obtiene duración del audio para la barra de progreso
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
    const duration = getAudioDuration(audioPath);

    // 1. Generar el ASS con la nueva lógica Legato
    const assPath = path.join(outputDir, "subtitles.ass");
    createAssFile(jsonPath, assPath);

    // 2. Rutas para Windows
    let assPathFormatted = assPath.split(path.sep).join("/");
    if (process.platform === "win32") {
      assPathFormatted = assPathFormatted.replace(":", "\\:");
    }

    // 3. Filtros (Subtítulos + Barra de progreso)
    let videoFilters = `subtitles='${assPathFormatted}'`;
    if (duration > 0) {
      videoFilters += `,drawbox=x=0:y=ih-20:w=iw*(t/${duration}):h=20:color=#FFFF00:t=fill`;
    }

    const args = [
      "-stream_loop", "-1",
      "-i", templatePath,
      "-i", audioPath,
      "-vf", videoFilters,
      "-map", "0:v", "-map", "1:a",
      "-c:v", "libx264", "-preset", "ultrafast",
      "-c:a", "aac", "-b:a", "192k",
      "-shortest", "-y",
      outputVideoPath
    ];

    console.log(`--> Renderizando Video Karaoke Legato (Duración: ${duration}s)...`);
    
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