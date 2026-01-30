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
 *   post:
 *     summary: "Motor Spleeter IA"
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
 *               format:
 *                 type: string
 *                 enum: ["mp3", "wav"]
 *               separation:
 *                 type: string
 *                 enum: ["vocals", "accompaniment", "both"]
 *     responses:
 *       200:
 *         description: "OK"
 */
router.post("/separate", upload.single("audio"), spleeterController.separateAudio);

// Endpoint para cancelar proceso Spleeter por nombre de archivo
router.post("/cancel", spleeterController.cancelSpleeter);

module.exports = router;