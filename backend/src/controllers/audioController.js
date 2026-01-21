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

  const format = (req.body.format || "mp3").toLowerCase();
  const quality = req.body.quality || "192k";

  const filtrosValidos = ["clean", "vivid", "radio", "norm"];
  if (!filtrosValidos.includes(filterType)) {
    if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
    return res.status(400).json({
      error: "Filtro no válido",
      mensaje: `Los filtros permitidos son: ${filtrosValidos.join(", ")}`,
    });
  }

  const safeOriginalName = req.file.originalname
    .normalize("NFD") // Descompone caracteres (ó -> o + ´)
    .replace(/[\u0300-\u036f]/g, "") // Quita los acentos
    .replace(/[^a-zA-Z0-9.]/g, "_") // Todo lo que no sea letra/número a "_"
    .replace(/_{2,}/g, "_") // Evita el doble guion bajo "__"
    .toLowerCase();
  const baseName = path.parse(safeOriginalName).name;
  const outputName = `filtered_${filterType}_${Date.now()}_${baseName}.${format}`;
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

    const outputFolder = path.join(__dirname, "../../outputs/voice_filters");
    cleanFolderSync(outputFolder);

    audioHandler.applyAudioFilter(
      inputPath,
      outputPath,
      filterType,
      format,
      quality,
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
            outputFormat: format,
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

const cleanFolderSync = (folderPath) => {
  try {
    if (fs.existsSync(folderPath)) {
      const files = fs.readdirSync(folderPath);
      for (const file of files) {
        // Borramos todos los archivos existentes en la carpeta
        fs.unlinkSync(path.join(folderPath, file));
      }
      console.log("🧹 Carpeta purgada: Solo se mantendrá el nuevo audio.");
    }
  } catch (err) {
    console.error("❌ Error al limpiar carpeta previa:", err);
  }
};
