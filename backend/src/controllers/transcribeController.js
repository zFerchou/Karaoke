const path = require("path");
const fs = require("fs");
const { spawnWhisper } = require("../utils/transcribeHandler");

exports.transcribeAudio = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No se recibió archivo de audio." });
  }

  const language = (req.body.language || "es").toLowerCase();
  const model = (req.body.model || "base").toLowerCase();

  const originalName = req.file.originalname;
  const folderName = path.parse(req.file.filename).name;
  const inputPath = path.resolve(__dirname, "../../uploads", req.file.filename);
  const outputDir = path.resolve(__dirname, "../../outputs", folderName);
  const outputFile = path.join(outputDir, "transcript.txt");

  const startTime = Date.now();
  spawnWhisper(inputPath, outputFile, language, model, (err, logs) => {
    if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);

    if (err) {
      return res.status(500).json({ error: "Fallo en transcripción Whisper", details: logs?.stderr || String(err) });
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    const publicUrl = `/outputs/${folderName}/transcript.txt`;

    if (!fs.existsSync(outputFile)) {
      return res.status(500).json({ error: "No se generó el archivo de texto." });
    }

    return res.json({
      status: "Success",
      info: { originalName, processingTime: `${duration}s`, language, model },
      file: publicUrl,
    });
  });
};
