require("dotenv").config(); // IMPORTANTÍSIMO: Esto debe ir primero
const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

// --- IMPORTACIONES ---
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./swagger"); 
// Importamos la lógica modular de Spleeter (De la rama Fernando)
const spleeterRoutes = require("./src/routes/spleeterRoutes");
// Importamos la lógica de Usuarios (Rescatado de tu rama HEAD)
const usuariosRouter = require("./routes/usuarios");

const app = express();
const PORT = process.env.PORT || 3000;

// 1. Asegurar directorios base (Evita errores de "Carpeta no encontrada")
const dirs = ["uploads", "outputs"];
dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
        console.log(`📁 Carpeta creada: ${dir}`);
    }
});

// 2. Middlewares Globales
app.use(cors());
app.use(express.json());

// 3. Servir archivos estáticos (Para descargar/reproducir los MP3 resultantes)
app.use("/outputs", express.static(path.join(__dirname, "outputs")));

// 4. Conexión de Rutas
// A. Rutas de Spleeter (Modularizadas) -> Endpoint: /api/spleeter/separate
app.use("/api/spleeter", spleeterRoutes);

// B. Rutas de Usuarios (Tu código original) -> Endpoint: /usuarios
app.use("/usuarios", usuariosRouter);

// 5. Documentación Swagger
// Accesible en http://localhost:3000/api-docs
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// 6. Ruta de salud (Health Check)
app.get("/", (req, res) => {
    res.json({
        status: "Online",
        message: "Backend Karaoke Pro - API Activa",
        services: {
            spleeter: "Ready",
            users: "Ready"
        },
        docs: "/api-docs"
    });
});

// 7. Lanzamiento del Servidor
app.listen(PORT, () => {
    console.log(`=========================================================`);
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    console.log(`📝 Swagger disponible en http://localhost:${PORT}/api-docs`);
    console.log(`🐍 Spleeter Engine: Activo`);
    console.log(`🍆 Base de Datos: Configurada`);
    console.log(`=========================================================`);
});