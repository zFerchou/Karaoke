require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const swaggerUi = require("swagger-ui-express");

// IMPORTAMOS LA CONFIGURACIÓN CORREGIDA
const swaggerSpec = require("./swagger"); 

const spleeterRoutes = require("./src/routes/spleeterRoutes");
const audioRoutes = require("./src/routes/audioRoutes");
const transcribeRoutes = require("./src/routes/transcribeRoutes");
const usuariosRouter = require("./src/routes/usuarios"); 

const app = express();
const PORT = process.env.PORT || 3000;

// Directorios necesarios
const dirs = ["uploads", "outputs"];
dirs.forEach(dir => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
});

app.use(cors());
app.use(express.json());
app.use("/outputs", express.static(path.join(__dirname, "outputs")));

// Conexión de Rutas
app.use("/api/spleeter", spleeterRoutes);
app.use("/api/audio", audioRoutes);
app.use("/api/transcribe", transcribeRoutes);
app.use("/usuarios", usuariosRouter);

// Swagger
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get("/", (req, res) => res.json({ status: "Online", docs: "/api-docs" }));

app.listen(PORT, () => {
    console.log(`🚀 Servidor listo en puerto ${PORT}`);
    console.log(`📝 Documentación: http://localhost:${PORT}/api-docs`);
});