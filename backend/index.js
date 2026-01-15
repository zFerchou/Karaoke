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

// 2. Configuración de Multer
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
  res.send("Backend Spleeter MP3 Activo. Documentación en /api-docs");
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

  console.log(`\n--- [NUEVA PETICIÓN MP3: ${fileName}] ---`);

  const env = { 
    ...process.env, 
    PATH: `${venvPath};${process.env.PATH}`,
    TF_CPP_MIN_LOG_LEVEL: "2",
    PYTHONIOENCODING: "utf-8"
  };

  /**
   * CAMBIO CLAVE: 
   * -c mp3: Especifica el códec de salida.
   * -b 192k: Define el bitrate (calidad).
   */
  const args = [
    "-m", "spleeter", 
    "separate", 
    "-p", "spleeter:2stems", 
    "-o", outputDir, 
    "-c", "mp3", 
    "-b", "192k", 
    inputPath
  ];

  const spleeterProcess = spawn(pythonExe, args, { env });

  let logOutput = "";

  spleeterProcess.stderr.on("data", (data) => {
    const msg = data.toString();
    logOutput += msg;
    process.stdout.write(`[Spleeter]: ${msg}`);
  });

  spleeterProcess.on("close", (code) => {
    if (code !== 0) {
      console.error(`\n❌ Spleeter falló con código ${code}`);
      if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
      return res.status(500).json({ error: "Spleeter falló", details: logOutput });
    }

    console.log("\n⏳ Verificando archivos MP3...");
    
    const finalFolder = path.join(outputDir, folderName);
    let attempts = 0;
    
    // Polling buscando archivos .mp3
    const interval = setInterval(() => {
      attempts++;
      const vocalPath = path.join(finalFolder, "vocals.mp3");
      
      if (fs.existsSync(vocalPath)) {
        clearInterval(interval);
        if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
        console.log(`✅ ÉXITO MP3: ${folderName}`);
        return res.json({
          message: "Separación exitosa (MP3)",
          folder: folderName,
          vocals: `/outputs/${folderName}/vocals.mp3`,
          accompaniment: `/outputs/${folderName}/accompaniment.mp3`
        });
      }

      if (attempts >= 180) {
        clearInterval(interval);
        if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
        res.status(500).json({ error: "Los archivos MP3 no se generaron a tiempo." });
      }
    }, 1000);
  });
});

app.use("/outputs", express.static(path.join(__dirname, "outputs")));

app.listen(PORT, () => {
  console.log(`=========================================================`);
  console.log(`🚀 Servidor MP3 en http://localhost:${PORT}`);
  console.log(`=========================================================`);
});