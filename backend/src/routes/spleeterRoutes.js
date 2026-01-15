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
 * description: "Envía un archivo de audio (MP3/WAV) para que la IA separe las voces del acompañamiento musical. El resultado son dos archivos MP3."
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
 * description: "Archivo de audio a procesar"
 * responses:
 * 200:
 * description: "Separación completada exitosamente"
 * content:
 * application/json:
 * example:
 * status: "Success"
 * message: "Audio separado correctamente"
 * info: { originalName: "cancion.mp3", processingTime: "25s", format: "MP3" }
 * files: { vocals: "/outputs/Spleeter_123/vocals.mp3", accompaniment: "/outputs/Spleeter_123/accompaniment.mp3" }
 * 400:
 * description: "No se proporcionó un archivo válido"
 * 500:
 * description: "Error interno en el motor Spleeter o Timeout"
 */
router.post("/separate", upload.single("audio"), spleeterController.separateAudio);

module.exports = router;