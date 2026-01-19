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
 * post:
 * summary: "Cargar archivo y aplicar filtro de limpieza (HU1, HU2)"
 * tags: [Vocal Enhancement]
 * requestBody:
 * content:
 * multipart/form-data:
 * schema:
 * type: object
 * properties:
 * audio:
 * type: string
 * format: binary
 * filterType:
 * type: string
 * enum: [clean, vivid, radio, norm]
 * default: clean
 */
router.post(
  "/upload-filter",
  upload.single("audio"),
  audioController.uploadAndFilter,
);

router.get("/download/:filename", audioController.downloadFile);

module.exports = router;
