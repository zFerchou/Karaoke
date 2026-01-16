const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const spleeterController = require("../controllers/spleeterController");

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, `Spleeter_${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ storage });

/**
 * @swagger
 * /api/spleeter/separate:
 * post:
 * summary: "Motor de Separación de Audio (Vocales vs Instrumentos)"
 * description: "IA para separar voces. Puedes elegir entre calidad estándar (MP3 320k) o profesional (WAV)."
 * tags: [Spleeter AI]
 * requestBody:
 * required: true
 * content:
 * multipart/form-data:
 * schema:
 * type: object
 * properties:
 * audio:
 * type: string
 * format: binary
 * description: "Archivo de audio (MP3/WAV)"
 * format:
 * type: string
 * enum: [mp3, wav]
 * default: mp3
 * description: "Formato de salida de las pistas separadas"
 * responses:
 * 200:
 * description: "Archivos generados con éxito"
 * 500:
 * description: "Error en el motor IA"
 */
router.post("/separate", upload.single("audio"), spleeterController.separateAudio);

module.exports = router;