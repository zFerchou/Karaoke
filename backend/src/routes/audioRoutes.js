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
 *     summary: Aplicar filtros de voz y elegir formato/calidad
 *     tags:
 *       - Filtros para la voz
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
 *
 *               filterType:
 *                 type: string
 *                 enum: [clean, vivid, radio, norm]
 *                 default: clean
 *
 *               format:
 *                 type: string
 *                 enum: [mp3, wav, flac]
 *                 default: mp3
 *
 *               quality:
 *                 type: string
 *                 enum: [128k, 192k, 320k]
 *                 description: Solo aplica para formato mp3
 *                 default: 192k
 *
 *     responses:
 *       200:
 *         description: Audio procesado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: Success
 *                 message:
 *                   type: string
 *                   example: Audio procesado correctamente
 *                 previewUrl:
 *                   type: string
 *                   example: /outputs/voice_filters/filtered_clean_123.mp3
 *                 downloadUrl:
 *                   type: string
 *                   example: /api/audio/download/filtered_clean_123.mp3
 *                 formatInfo:
 *                   type: object
 *                   properties:
 *                     inputOriginal:
 *                       type: string
 *                     outputFormat:
 *                       type: string
 *                     duration:
 *                       type: string
 *                     filterType:
 *                       type: string
 *
 *       400:
 *         description: Error de validación (archivo, filtro o duración)
 *
 *       500:
 *         description: Error interno al procesar el audio
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
 *       - Filtros para la voz
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

/**
 * @swagger
 * /api/audio/cancel:
 *   post:
 *     summary: Cancelar proceso de filtrado
 *     description: >
 *       Detiene la ejecución de FFmpeg. Si no se envía `fileName`,
 *       intentará detener el último proceso iniciado.
 *     tags:
 *       - Filtros para la voz
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fileName:
 *                 type: string
 *                 description: Nombre del archivo a cancelar (opcional)
 *                 example: entrevista_cliente.mp3
 *
 *     responses:
 *       200:
 *         description: Proceso detenido
 *
 *       404:
 *         description: No hay procesos activos
 */
router.post("/cancel", audioController.cancelProcessing);

module.exports = router;
