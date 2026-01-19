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
 * /api/audio/upload-filter:
 *   post:
 *     summary: "Aplicar filtros de voz"
 *     tags: ["Vocal Enhancement"]
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               audio:
 *                 type: string
 *                 format: binary
 *               filterType:
 *                 type: string
 *                 enum: ["clean", "vivid", "radio", "norm"]
 *     responses:
 *       200:
 *         description: "OK"
 */
router.post("/upload-filter", upload.single("audio"), audioController.uploadAndFilter);

module.exports = router;