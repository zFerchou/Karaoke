const audioHandler = require("../utils/audioHandler");
const path = require("node:path");
const fs = require("node:fs");

exports.uploadAndFilter = (req, res) => {
  if (!req.file)
    return res.status(400).json({ error: "No se subió ningún archivo" });

  const inputPath = req.file.path;
  let filterType = req.body.filterType;

  if (typeof filterType !== "string") {
    filterType = "clean";
  }

  filterType = filterType.toLowerCase().replaceAll(/[^a-z]/g, "");

  const filtrosValidos = ["clean", "vivid", "radio"];
  if (!filtrosValidos.includes(filterType)) {
    if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
    return res.status(400).json({
      error: "Filtro no válido",
      mensaje: `Los filtros permitidos son: ${filtrosValidos.join(", ")}`,
    });
  }

  const safeOriginalName = req.file.originalname
    .normalize("NFD")
    .replaceAll(/[\u0300-\u036f]/g, "")
    .replaceAll(/[^a-z0-9.]/gi, "_")
    .toLowerCase();
  const baseName = path.parse(safeOriginalName).name;
  const outputName = `filtered_${filterType}_${Date.now()}_${baseName}.mp3`;
  const outputPath = path.join(
    __dirname,
    "../../outputs/voice_filters",
    outputName,
  );

  audioHandler.validarAudio(inputPath, (isValid, errorMsg, duration) => {
    if (!isValid) {
      if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
      return res.status(400).json({ error: errorMsg });
    }

    const MAX_DURATION = 600; //10 minutis en segundos
    if (duration > MAX_DURATION) {
      if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
      return res.status(400).json({
        error: "El audio es muy grande",
        mensaje: "La duración del audio no debe superar los 10 minutos",
      });
    }

    audioHandler.applyAudioFilter(
      inputPath,
      outputPath,
      filterType,
      (success) => {
        if (fs.existsSync(inputPath)) {
          fs.unlinkSync(inputPath);
        }

        if (!success) {
          return res
            .status(500)
            .json({ error: "Error al procesar el filtro de audio" });
        }

        res.json({
          status: "Success",
          message: "Audio procesado correctamente",
          previewUrl: `/outputs/voice_filters/${outputName}`,
          downloadUrl: `/api/audio/download/${outputName}`,
          formatInfo: {
            inputOriginal: req.file.originalname,
            outputFormat: "mp3",
            duration: `${duration.toFixed(2)}s`,
            filterType: filterType,
          },
        });
      },
    );
  });
};

exports.downloadFile = (req, res) => {
  const { filename } = req.params;

  const safeFilename = path.basename(filename);
  const filePath = path.join(
    __dirname,
    "../../outputs/voice_filters",
    safeFilename,
  );

  if (fs.existsSync(filePath)) {
    return res.download(filePath, (err) => {
      if (err) {
        console.error("Error al descargar el archivo: ", err);
        if (!res.headersSent) {
          res.status(500).json({ error: "No se pudo completar la descarga" });
        }
      }
    });
  }

  return res
    .status(404)
    .json({ error: "El archivo solicitado ya no existe en el servidor." });
};
