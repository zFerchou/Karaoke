require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const swaggerUi = require("swagger-ui-express");

// Configuración de Swagger
const swaggerSpec = require("./swagger"); 

// Importación de Rutas
const spleeterRoutes = require("./src/routes/spleeterRoutes");
const audioRoutes = require("./src/routes/audioRoutes");
const transcribeRoutes = require("./src/routes/transcribeRoutes");
const usuariosRouter = require("./src/routes/usuarios");

// Utilidades
const { startCleanupTask } = require("./src/utils/cleanUpTask");

const app = express();
const PORT = process.env.PORT || 3000;

// 1. Asegurar directorios base (incluyendo filtros de voz y subcarpetas)
const dirs = ["uploads", "outputs", "outputs/voice_filters"];
dirs.forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`📁 Carpeta asegurada: ${dir}`);
  }
});

// 2. Middlewares
app.use(cors());
app.use(express.json());
app.use("/outputs", express.static(path.join(__dirname, "outputs")));

// 3. Conexión de Rutas
app.use("/api/spleeter", spleeterRoutes);
app.use("/api/audio", audioRoutes);
app.use("/api/transcribe", transcribeRoutes);
app.use("/usuarios", usuariosRouter);

// 4. Documentación Swagger
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// 5. Ruta de salud (Health Check)
app.get("/", (req, res) => {
  res.json({
    status: "Online",
    message: "Backend Karaoke Pro - Motor Activo",
    services: {
      spleeter: "Ready",
      transcribe: "Ready",
      users: "Ready",
    },
    docs: "/api-docs",
  });
});

// 6. Iniciar tarea de limpieza de archivos temporales
startCleanupTask();

// 7. Lanzamiento del Servidor
app.listen(PORT, () => {
  console.log(`=========================================================`);
  console.log(`🚀 Servidor Organizado: http://localhost:${PORT}`);
  console.log(`📝 Documentación API:  http://localhost:${PORT}/api-docs`);
  console.log(`🐍 Motor Spleeter: Activo (Python 3.9)`);
  console.log(`💾 Base de Datos: Lista.`);
  console.log(`=========================================================`);
});