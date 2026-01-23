const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const lyricVideoController = require("../controllers/lyricVideoController");

// Configuración de Multer
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, `LyricSource_${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ storage });

/**
 * @swagger
 * /api/video/lyric-maker:
 *   post:
 *     summary: "Crear Video con Letra (Lyric Video)"
 *     description: "Sube un audio, lo transcribe a .srt y lo fusiona con un video plantilla en bucle."
 *     tags:
 *       - "Video Generation"
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               audio:
 *                 type: string
 *                 format: binary
 *                 description: "Archivo de música (mp3, wav)"
 *               language:
 *                 type: string
 *                 example: "es"
 *                 description: "Idioma de la canción"
 *               model:
 *                 type: string
 *                 example: "small"
 *                 description: "Modelo Whisper (tiny, base, small, medium, large)"
 *             required:
 *               - audio
 *     responses:
 *       200:
 *         description: "Video creado exitosamente"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "Success"
 *                 files:
 *                   type: object
 *                   properties:
 *                     video:
 *                       type: string
 *                       example: "/outputs/Video_12345/video_lyrics.mp4"
 *                     subtitles:
 *                       type: string
 *                       example: "/outputs/Video_12345/transcript.srt"
 *       500:
 *         description: "Error en el procesamiento"
 */
router.post("/lyric-maker", upload.single("audio"), (req, res, next) => {
    console.log("--> ¡Petición recibida en /lyric-maker!");
    next();
}, lyricVideoController.createLyricVideo);

module.exports = router;