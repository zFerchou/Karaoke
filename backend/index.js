const express = require("express");
const multer = require("multer");
const cors = require("cors");
const { exec } = require("child_process");
const path = require("path");

const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./swagger");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

app.get("/", (req, res) => {
  res.send("Backend Spleeter funcionando");
});

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/**
 * @swagger
 * /separate:
 *   post:
 *     summary: Separar voz y acompañamiento usando Spleeter
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               audio:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Separación exitosa
 */
app.post("/separate", upload.single("audio"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No se envió ningún archivo" });
  }

  const inputPath = req.file.path;
  const outputPath = "outputs";

  const command = `spleeter separate -p spleeter:2stems -o ${outputPath} ${inputPath}`;

  exec(command, (error) => {
    if (error) {
      return res.status(500).json({ error: "Error procesando el audio" });
    }

    const fileName = path.parse(req.file.filename).name;

    res.json({
      message: "Separación completada",
      vocals: `/outputs/${fileName}/vocals.wav`,
      accompaniment: `/outputs/${fileName}/accompaniment.wav`,
    });
  });
});

app.use("/outputs", express.static(path.join(__dirname, "outputs")));

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
  console.log(`Swagger en http://localhost:${PORT}/api-docs`);
});
