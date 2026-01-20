const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const transcribeController = require("../controllers/transcribeController");

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, `Transcribe_${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ storage });

/**
 * @swagger
 * /api/transcribe/whisper:
 *   post:
 *     summary: "Transcribir audio a texto con Whisper"
 *     tags: ["Audio AI"]
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               audio:
 *                 type: string
 *                 format: binary
 *               language:
 *                 type: string
 *                 example: "es"
 *               model:
 *                 type: string
 *                 example: "base"
  *             required: [audio]
 *     responses:
 *       200:
 *         description: "Transcripción generada correctamente"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "Success"
 *                 info:
 *                   type: object
 *                   properties:
 *                     originalName:
 *                       type: string
 *                     processingTime:
 *                       type: string
 *                     language:
 *                       type: string
 *                     model:
 *                       type: string
 *                 file:
 *                   type: string
 *                   example: "/outputs/Transcribe_1737312345678/transcript.txt"
 *       400:
 *         description: "Solicitud inválida (falta archivo de audio)"
 *       500:
 *         description: "Error interno del motor de transcripción"
 */
router.post("/whisper", upload.single("audio"), transcribeController.transcribeAudio);

module.exports = router;
