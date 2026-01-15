require("dotenv").config(); // IMPORTANTÍSIMO: Esto debe ir primero para que db.js lea las variables
const express = require("express");
const multer = require("multer");
const cors = require("cors");
const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");

// Importar Swagger
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./swagger");

// Importar rutas
const usuariosRouter = require("./routes/usuarios");

const app = express();
const PORT = process.env.PORT || 3000;

// Crear carpetas necesarias
const dirs = ["uploads", "outputs"];
dirs.forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
});

app.use(cors());
app.use(express.json());

// Configuración de Multer
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    const safeName = file.originalname.replace(/[^a-z0-9.]/gi, "_");
    cb(null, Date.now() + "-" + safeName);
  },
});
const upload = multer({ storage });

// Documentación Swagger
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// USAR RUTAS DE USUARIOS
app.use("/usuarios", usuariosRouter);

// Ruta de prueba
app.get("/", (req, res) => {
  res.send("Backend Karaoke funcionando correctamente");
});

// Ruta de Spleeter
app.post("/separate", upload.single("audio"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No se envió ningún archivo" });
  }

  const inputPath = path.resolve(req.file.path);
  const outputDir = path.resolve(__dirname, "outputs");
  const spleeterExe = path.join(__dirname, "venv", "Scripts", "spleeter.exe");

  const command = `"${spleeterExe}" separate -p spleeter:2stems -o "${outputDir}" "${inputPath}"`;

  console.log(`--- Iniciando procesamiento Spleeter ---`);
  
  exec(command, { maxBuffer: 1024 * 1024 * 10 }, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error de ejecución: ${error.message}`);
      return res.status(500).json({ error: "Error procesando el audio", details: stderr || error.message });
    }
    const fileNameWithoutExt = path.parse(req.file.filename).name;
    console.log(`Procesamiento completado: ${fileNameWithoutExt}`);
    res.json({
      message: "Separación completada",
      vocals: `/outputs/${fileNameWithoutExt}/vocals.wav`,
      accompaniment: `/outputs/${fileNameWithoutExt}/accompaniment.wav`,
    });
  });
});

app.use("/outputs", express.static(path.join(__dirname, "outputs")));

app.listen(PORT, () => {
  console.log(`=========================================================`);
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📝 Swagger disponible en http://localhost:${PORT}/api-docs`);
  console.log(`🐍 Usando Python 3.9 desde venv`);
  console.log(`🍆 Base de Datos configurados mami.`);
  console.log(`=========================================================`);
});