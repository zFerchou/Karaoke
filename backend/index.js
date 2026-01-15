const express = require("express");
const multer = require("multer");
const cors = require("cors");
const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");

const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./swagger");

const app = express();
const PORT = 3000;

// 1. Crear carpetas necesarias al iniciar el servidor
const dirs = ["uploads", "outputs"];
dirs.forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
});

app.use(cors());
app.use(express.json());

// 2. Configuración de Multer (CORREGIDA: Limpieza de caracteres especiales)
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    // Esta expresión regular quita TODO lo que no sea letras, números o puntos.
    // Evita que símbolos como &, (, ), ' rompan el comando de Windows.
    const safeName = file.originalname.replace(/[^a-z0-9.]/gi, "_");
    cb(null, Date.now() + "-" + safeName);
  },
});

const upload = multer({ storage });

// 3. Documentación Swagger
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get("/", (req, res) => {
  res.send("Backend Spleeter funcionando con Python 3.9");
});

// 4. Ruta principal para separar audio
app.post("/separate", upload.single("audio"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No se envió ningún archivo" });
  }

  const inputPath = path.resolve(req.file.path);
  const outputDir = path.resolve(__dirname, "outputs");
  
  // Ruta al venv (Ya que lo tienes dentro de backend)
  const spleeterExe = path.join(__dirname, "venv", "Scripts", "spleeter.exe");

  // Comando de Spleeter: Usamos comillas dobles por seguridad
  const command = `"${spleeterExe}" separate -p spleeter:2stems -o "${outputDir}" "${inputPath}"`;

  console.log(`--- Iniciando procesamiento ---`);
  console.log(`Archivo original: ${req.file.originalname}`);
  console.log(`Ejecutando: ${command}`);

  // Aumentamos el maxBuffer por si Spleeter arroja muchos logs
  exec(command, { maxBuffer: 1024 * 1024 * 10 }, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error de ejecución: ${error.message}`);
      return res.status(500).json({ 
        error: "Error procesando el audio", 
        details: stderr || error.message 
      });
    }

    const fileNameWithoutExt = path.parse(req.file.filename).name;
    
    console.log(`Procesamiento completado para: ${fileNameWithoutExt}`);

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
  console.log(`=========================================================`);
});