require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const swaggerUi = require("swagger-ui-express");

// IMPORTAMOS LA CONFIGURACIÓN CORREGIDA
const swaggerSpec = require("./swagger"); 

const spleeterRoutes = require("./src/routes/spleeterRoutes");
const usuariosRouter = require("./src/routes/usuarios");
const audioRoutes = require("./src/routes/audioRoutes");

const { startCleanupTask } = require("./src/utils/cleanUpTask");

const app = express();
const PORT = process.env.PORT || 3000;

// 1. Asegurar directorios base (Evita errores de "Carpeta no encontrada")
const dirs = ["uploads", "outputs", "outputs/voice_filters"];
dirs.forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`📁 Carpeta creada: ${dir}`);
  }
});

app.use(cors());
app.use(express.json());
app.use("/outputs", express.static(path.join(__dirname, "outputs")));

// Conexión de Rutas
app.use("/api/spleeter", spleeterRoutes);
app.use("/api/audio", audioRoutes);
app.use("/usuarios", usuariosRouter);

// Swagger
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// 6. Ruta de salud (Health Check)
app.get("/", (req, res) => {
  res.json({
    status: "Online",
    message: "Backend Karaoke Pro - Spleeter Engine Activo",
    services: {
      spleeter: "Ready",
      users: "Ready",
      database: "Conectada",
    },
    docs: "/api-docs",
  });
});

startCleanupTask();

// 7. Lanzamiento del Servidor
app.listen(PORT, () => {
  console.log(`=========================================================`);
  console.log(`🚀 Servidor Organizado: http://localhost:${PORT}`);
  console.log(`📝 Documentación API:  http://localhost:${PORT}/api-docs`);
  console.log(`🐍 Motor Spleeter: Activo (MP3/WAV)`);
  console.log(`💾 Base de Datos: Lista.`);
  console.log(`=========================================================`);
});
