const express = require("express");
const multer = require("multer");
const cors = require("cors");
const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./swagger");

const app = express();
const PORT = 3000;

// 1. Crear directorios base
["uploads", "outputs"].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir);
});

app.use(cors());
app.use(express.json());

// 2. Configuración de Multer para nombres limpios
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}${path.extname(file.originalname)}`);
  },
});
const upload = multer({ storage });

// 3. Documentación Swagger
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get("/", (req, res) => {
  res.send("Backend Spleeter Activo. Documentación en /api-docs");
});

// 4. Ruta principal de procesamiento
app.post("/separate", upload.single("audio"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No se envió audio" });

  const fileName = req.file.filename;
  const folderName = path.parse(fileName).name;
  
  const venvPath = path.resolve(__dirname, "venv", "Scripts");
  const pythonExe = path.join(venvPath, "python.exe");
  const inputPath = path.resolve(__dirname, "uploads", fileName);
  const outputDir = path.resolve(__dirname, "outputs");

  console.log(`\n--- [NUEVA PETICIÓN: ${fileName}] ---`);

  // CONFIGURACIÓN DE ENTORNO REFORZADA
  // TF_CPP_MIN_LOG_LEVEL: 2 silencia advertencias de optimización de CPU que causan crashes
  const env = { 
    ...process.env, 
    PATH: `${venvPath};${process.env.PATH}`,
    TF_CPP_MIN_LOG_LEVEL: "2",
    PYTHONIOENCODING: "utf-8"
  };

  const args = ["-m", "spleeter", "separate", "-p", "spleeter:2stems", "-o", outputDir, inputPath];

  // Usamos spawn para manejar el flujo de datos sin bloqueos
  const spleeterProcess = spawn(pythonExe, args, { env });

  let logOutput = "";

  spleeterProcess.stdout.on("data", (data) => {
    console.log(`[Python Stdout]: ${data}`);
  });

  spleeterProcess.stderr.on("data", (data) => {
    const msg = data.toString();
    logOutput += msg;
    // Imprimimos en consola para ver el progreso real (Downloading models, etc)
    process.stdout.write(`[Spleeter]: ${msg}`);
  });

  spleeterProcess.on("close", (code) => {
    if (code !== 0) {
      console.error(`\n❌ Spleeter falló con código ${code}`);
      if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
      
      return res.status(500).json({ 
        error: "Error en el motor de separación", 
        code: code,
        details: logOutput 
      });
    }

    console.log("\n⏳ Generando archivos finales...");
    
    // Polling de verificación (3 minutos de espera máx)
    const finalFolder = path.join(outputDir, folderName);
    let attempts = 0;
    const interval = setInterval(() => {
      attempts++;
      const vocalPath = path.join(finalFolder, "vocals.wav");
      
      if (fs.existsSync(vocalPath)) {
        clearInterval(interval);
        if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
        console.log(`✅ PROCESO EXITOSO: ${folderName}`);
        return res.json({
          message: "Separación exitosa",
          folder: folderName,
          vocals: `/outputs/${folderName}/vocals.wav`,
          accompaniment: `/outputs/${folderName}/accompaniment.wav`
        });
      }

      if (attempts >= 180) {
        clearInterval(interval);
        if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
        res.status(500).json({ error: "Spleeter terminó pero los archivos no se guardaron." });
      }
    }, 1000);
  });
});

// 5. Servidor de estáticos
app.use("/outputs", express.static(path.join(__dirname, "outputs")));

app.listen(PORT, () => {
  console.log(`=========================================================`);
  console.log(`🚀 Servidor en http://localhost:${PORT}`);
  console.log(`📝 Swagger en http://localhost:${PORT}/api-docs`);
  console.log(`=========================================================`);
});