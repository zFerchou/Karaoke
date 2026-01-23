const path = require("path");
const fs = require("fs");
const { spawnWhisper } = require("../utils/transcribeHandler");
const { generateLyricVideo } = require("../utils/lyricVideoHandler");

exports.createLyricVideo = (req, res) => {
  if (!req.file) return res.status(400).json({ error: "Falta archivo de audio." });

  const language = (req.body.language || "es").toLowerCase();
  const model = (req.body.model || "base").toLowerCase();
  const folderName = path.parse(req.file.filename).name; 

  const inputAudioPath = path.resolve(__dirname, "../../uploads", req.file.filename);
  const outputDir = path.resolve(__dirname, "../../outputs", folderName);

  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

  console.log(`--> [LyricVideo] 1. Iniciando Transcripción...`);

  spawnWhisper(inputAudioPath, outputDir, language, model, (err, logs) => {
    if (err) return res.status(500).json({ error: "Fallo Whisper", details: logs?.stderr });

    // AHORA: Verificamos el JSON, que es más preciso para generar el .ASS
    const jsonPath = path.join(outputDir, "transcript.json");
    
    if (!fs.existsSync(jsonPath)) {
      return res.status(500).json({ error: "No se generó el archivo transcript.json" });
    }

    console.log(`--> [LyricVideo] 2. Generando Subtítulos Karaoke (.ass) y Video...`);

    // Le pasamos el JSON path al handler
    generateLyricVideo(inputAudioPath, jsonPath, outputDir, (videoErr, videoPath) => {
      if (videoErr) return res.status(500).json({ error: "Error Video", details: videoErr.message });

      res.json({
        status: "Success",
        files: {
            video: `/outputs/${folderName}/video_lyrics.mp4`,
            // Ahora devolvemos también el .ass por si quieren descargarlo
            subtitles_ass: `/outputs/${folderName}/subtitles.ass`,
            subtitles_srt: `/outputs/${folderName}/transcript.srt`
        }
      });
    });
  });
};