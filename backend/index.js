require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const swaggerUi = require("swagger-ui-express");

// 1. IMPORTACIÓN DE CONFIGURACIONES Y RUTAS
const swaggerSpec = require("./swagger"); 
const spleeterRoutes = require("./src/routes/spleeterRoutes");
const usuariosRouter = require("./src/routes/usuarios");
const audioRoutes = require("./src/routes/audioRoutes");
const transcribeRoutes = require("./src/routes/transcribeRoutes");
const { startCleanupTask } = require("./src/utils/cleanUpTask");

const app = express();
const PORT = process.env.PORT || 3000;

// 2. CONFIGURACIÓN DE DIRECTORIOS (UNIFICADA)
// Incluimos voice_filters para que el frontend no falle al procesar audio
const directorios = ["uploads", "outputs", "outputs/voice_filters"];
directorios.forEach((dir) => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`📁 Carpeta garantizada: ${dir}`);
    }
});

// 3. MIDDLEWARES
app.use(cors());
app.use(express.json());
// Servir archivos estáticos para que el frontend pueda escuchar los resultados
app.use("/outputs", express.static(path.join(__dirname, "outputs")));

// 4. CONEXIÓN DE RUTAS API
app.use("/api/spleeter", spleeterRoutes);
app.use("/api/audio", audioRoutes);
app.use("/api/transcribe", transcribeRoutes);
app.use("/usuarios", usuariosRouter);

// 5. DOCUMENTACIÓN SWAGGER
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// 6. RUTA DE SALUD (HEALTH CHECK)
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

// 7. INICIO DE TAREAS PROGRAMADAS
// Esto ejecutará node-cron para limpiar archivos temporales
startCleanupTask();

// 8. LANZAMIENTO DEL SERVIDOR (UNA SOLA VEZ)
app.listen(PORT, () => {
    console.log(`=========================================================`);
    console.log(`🚀 Servidor Corriendo en: http://localhost:${PORT}`);
    console.log(`📝 Documentación API:    http://localhost:${PORT}/api-docs`);
    console.log(`🐍 Motor Spleeter:       Activo (Python 3.9)`);
    console.log(`💾 Base de Datos:        Lista.`);
    console.log(`=========================================================`);
});