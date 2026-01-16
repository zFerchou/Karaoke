const audioHandler = require("../utils/audioHandler");
const path = require("path");
const fs = require("fs");

exports.uploadAndFilter = (req, res) => {
  if (!req.file)
    return res.status(400).json({ error: "No se subió ningún archivo" });

  const filterType = req.body.filterType || "clean";
  const inputPath = req.file.path;

  const baseName = path.parse(req.file.filename).name;
  const outputName = `filtered_${filterType}_${baseName}.mp3`;
  const outputPath = path.join(__dirname, "../../outputs", outputName);

  audioHandler.validarAudio(inputPath, (isValid, errorMsg) => {
    if (!isValid) {
      if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
      return res.status(400).json({ error: errorMsg });
    }

    audioHandler.applyAudioFilter(
      inputPath,
      outputPath,
      filterType,
      (success) => {
        if (!success) {
          if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
          return res
            .status(500)
            .json({ error: "Error al procesar el filtro de audio" });
        }

        res.json({
          status: "Success",
          message: "Audio procesado correctamente",
          previewUrl: `/outputs/${outputName}`,
          formatInfo: {
            inputOriginal: req.file.originalname,
            outputFormat: "mp3",
          },
        });
      }
    );
  });
};
