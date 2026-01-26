const path = require("path");
const fs = require("fs");
const { spawnWhisper } = require("../utils/transcribeHandler");

exports.transcribeAudio = (req, res) => {
  // 1. Validar que llegó el archivo
  if (!req.file) {
    return res.status(400).json({ error: "No se recibió archivo de audio." });
  }

  const language = (req.body.language || "es").toLowerCase();
  const model = (req.body.model || "base").toLowerCase();

  const originalName = req.file.originalname;
  // Usamos el nombre del archivo (sin extensión) para crear una subcarpeta única
  const folderName = path.parse(req.file.filename).name; 

  // Definir rutas absolutas
  const inputPath = path.resolve(__dirname, "../../uploads", req.file.filename);
  const outputDir = path.resolve(__dirname, "../../outputs", folderName);

  // --- CORRECCIÓN CRÍTICA: CREAR LA CARPETA DE SALIDA ---
  // Si no existe la carpeta outputs/nombre_archivo, la creamos.
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const startTime = Date.now();

  console.log(`--> Iniciando Whisper: ${model} / ${language}`);
  console.log(`    Input: ${inputPath}`);
  console.log(`    Output Dir: ${outputDir}`);

  // Ahora Whisper CLI genera múltiples formatos dentro de outputDir
  spawnWhisper(inputPath, outputDir, language, model, (err, logs) => {
    // Limpieza del audio temporal (opcional, según tu preferencia)
    if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);

    if (err) {
      console.error("Error en Whisper Script:", err);
      return res.status(500).json({ 
        error: "Fallo en transcripción Whisper", 
        details: logs?.stderr || String(err) 
      });
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    const txtFile = path.join(outputDir, "transcript.txt");
    const jsonFile = path.join(outputDir, "transcript.json");
    const srtFile = path.join(outputDir, "transcript.srt");

    // --- LEER LOS ARCHIVOS PARA ENVIAR TEXTO + SEGMENTOS ---
    if (fs.existsSync(txtFile)) {
      try {
        const transcriptionText = fs.readFileSync(txtFile, "utf8");
        let segments = [];
        if (fs.existsSync(jsonFile)) {
          try {
            const data = JSON.parse(fs.readFileSync(jsonFile, "utf8"));
            if (Array.isArray(data.segments)) {
              segments = data.segments.map(seg => ({
                start: seg.start,
                end: seg.end,
                text: (seg.text || "").trim(),
              }));
            }
          } catch (_) {}
        }

        // Enviamos la respuesta exitosa
        return res.json({
          status: "Success",
          info: { originalName, processingTime: `${duration}s`, language, model },
          text: transcriptionText,
          segments,
          files: {
            txt: `/outputs/${folderName}/transcript.txt`,
            srt: fs.existsSync(srtFile) ? `/outputs/${folderName}/transcript.srt` : null,
            json: fs.existsSync(jsonFile) ? `/outputs/${folderName}/transcript.json` : null,
          },
        });
      } catch (readError) {
        return res.status(500).json({ error: "Error leyendo el archivo de transcripción." });
      }
    } else {
      return res.status(500).json({ error: "No se generó el archivo de texto (Whisper terminó pero no guardó)." });
    }
  });
};