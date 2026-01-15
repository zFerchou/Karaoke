const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./swagger"); 
const spleeterRoutes = require("./src/routes/spleeterRoutes");

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

// 3. Servir archivos estáticos (Para descargar los MP3 resultantes)
app.use("/outputs", express.static(path.join(__dirname, "outputs")));

// 4. Conexión de Rutas Modulares
// El prefijo /api/spleeter hará que tus endpoints sean: http://localhost:3000/api/spleeter/separate
app.use("/api/spleeter", spleeterRoutes);

// 5. Documentación Swagger
// Accesible en http://localhost:3000/api-docs
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// 6. Ruta de salud (Health Check)
app.get("/", (req, res) => {
    res.json({
        status: "Online",
        message: "Backend Karaoke Pro - Spleeter Engine Activo",
        docs: "/api-docs"
    });
});

// 7. Lanzamiento del Servidor
app.listen(PORT, () => {
    console.log(`=========================================================`);
    console.log(`🚀 Servidor Organizado: http://localhost:${PORT}`);
    console.log(`📝 Documentación API:  http://localhost:${PORT}/api-docs`);
    console.log(`=========================================================`);
});