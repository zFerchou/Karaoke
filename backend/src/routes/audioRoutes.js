const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("node:path");
const audioController = require("../controllers/audioController");

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, `Filter_${Date.now()}${path.extname(file.originalname)}`);
  },
});

const upload = multer({ storage });

/**
 * @swagger
 * tags:
 *   - name: Filtros para la voz
 *     description: Operaciones de filtrado y descarga de audio
 */

/**
 * @swagger
 * /api/audio/upload-filter:
 *   post:
 *     summary: Aplicar filtros de voz a un archivo de audio
 *     tags:
 *       - Vocal Enhancement
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - audio
 *             properties:
 *               audio:
 *                 type: string
 *                 format: binary
 *                 description: Archivo de audio a procesar
 *               filterType:
 *                 type: string
 *                 description: Tipo de filtro de voz a aplicar
 *                 enum:
 *                   - clean
 *                   - vivid
 *                   - radio
 *                   - norm
 *                 default: clean
 *     responses:
 *       200:
 *         description: Audio procesado con éxito
 *       400:
 *         description: Error en la validación del archivo
 *       500:
 *         description: Error interno en el motor de procesamiento
 */
router.post(
  "/upload-filter",
  upload.single("audio"),
  audioController.uploadAndFilter,
);

/**
 * @swagger
 * /api/audio/download/{filename}:
 *   get:
 *     summary: Descargar un audio procesado
 *     tags:
 *       - Vocal Enhancement
 *     parameters:
 *       - in: path
 *         name: filename
 *         required: true
 *         schema:
 *           type: string
 *         description: Nombre del archivo generado (ej. Filter_1736890000000.mp3)
 *     responses:
 *       200:
 *         description: Archivo de audio procesado
 *         content:
 *           audio/mpeg:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: El archivo no existe o ha expirado
 */
router.get("/download/:filename", audioController.downloadFile);

module.exports = router;
