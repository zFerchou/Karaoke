require("dotenv").config(); 
const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./swagger"); 

// Importar rutas modulares
const spleeterRoutes = require("./src/routes/spleeterRoutes");
const usuariosRouter = require("./routes/usuarios"); // La ruta que trajo Kevin

const app = express();
const PORT = process.env.PORT || 3000;

// 1. Asegurar directorios base
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

// 3. Servir archivos estáticos
app.use("/outputs", express.static(path.join(__dirname, "outputs")));

// 4. Conexión de Rutas
// Tus rutas modulares (Spleeter)
app.use("/api/spleeter", spleeterRoutes);
// Las rutas de Kevin (Usuarios/DB)
app.use("/usuarios", usuariosRouter);

// 5. Documentación Swagger
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// 6. Ruta de salud (Health Check) mejorada
app.get("/", (req, res) => {
    res.json({
        status: "Online",
        message: "Backend Karaoke Pro - Spleeter Engine Activo",
        database: "Conectada", // Manteniendo el espíritu del mensaje de Kevin
        docs: "/api-docs"
    });
});

// 7. Lanzamiento del Servidor
app.listen(PORT, () => {
    console.log(`=========================================================`);
    console.log(`🚀 Servidor Organizado: http://localhost:${PORT}`);
    console.log(`📝 Documentación API:  http://localhost:${PORT}/api-docs`);
    console.log(`🐍 Motor Spleeter: Configurado en MP3`);
    console.log(`💾 Base de Datos: Lista.`);
    console.log(`=========================================================`);
});