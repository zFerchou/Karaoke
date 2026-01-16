require("dotenv").config(); // IMPORTANTÍSIMO: Esto debe ir primero
const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const swaggerJSDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

// --- IMPORTACIONES DE RUTAS ---
const spleeterRoutes = require("./src/routes/spleeterRoutes");
const audioRoutes = require("./src/routes/audioRoutes");
const usuariosRouter = require("./src/routes/usuarios"); 

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
app.use("/api/spleeter", spleeterRoutes);
app.use("/api/audio", audioRoutes);
app.use("/usuarios", usuariosRouter);

// 5. Configuración de Swagger (Unificada)
const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API Karaoke Pro",
      version: "1.0.0",
      description: "Backend modular con Spleeter Engine (MP3/WAV), Filtros de Voz, Autenticación JWT y Google Login.",
    },
    servers: [{ url: `http://localhost:${PORT}`, description: "Servidor Local" }],
    components: {
      securitySchemes: {
        bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
      },
    },
    paths: {
      "/api/spleeter/separate": {
        post: {
          summary: "Separar audio en Voces y Acompañamiento",
          tags: ["Audio AI"],
          description: "Utiliza IA para separar las voces del instrumental. Permite elegir la calidad (MP3 320k o WAV).",
          requestBody: {
            required: true,
            content: {
              "multipart/form-data": {
                schema: {
                  type: "object",
                  properties: {
                    audio: { type: "string", format: "binary" },
                    format: { type: "string", enum: ["mp3", "wav"], default: "mp3" },
                  },
                  required: ["audio"],
                },
              },
            },
          },
          responses: { 200: { description: "Éxito" }, 500: { description: "Error de RAM/Spleeter" } }
        }
      },
      "/api/audio/upload-filter": {
        post: {
          summary: "Aplicar filtros de limpieza/mejora",
          tags: ["Filtro de voz"],
          requestBody: {
            content: {
              "multipart/form-data": {
                schema: {
                  type: "object",
                  properties: {
                    audio: { type: "string", format: "binary" },
                    filterType: { type: "string", enum: ["clean", "vivid", "radio"] }
                  }
                }
              }
            }
          },
          responses: { 200: { description: "Procesado" } }
        }
      },
      "/usuarios/login": {
        post: {
          summary: "Login (JWT)",
          tags: ["Usuarios"],
          requestBody: {
            content: { "application/json": { schema: { type: "object", properties: { correo: {type: "string"}, contrasena: {type: "string"} } } } }
          },
          responses: { 200: { description: "OK" } }
        }
      }
    }
  },
  apis: [], 
};

const swaggerSpec = swaggerJSDoc(options);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// 6. Ruta de salud
app.get("/", (req, res) => {
    res.json({
        status: "Online",
        message: "Backend Karaoke Pro - Spleeter Engine Activo",
        services: { spleeter: "Ready", users: "Ready", database: "Conectada" },
        docs: "/api-docs"
    });
});

// 7. Lanzamiento
app.listen(PORT, () => {
    console.log(`=========================================================`);
    console.log(`🚀 Servidor Organizado: http://localhost:${PORT}`);
    console.log(`📝 Documentación API:  http://localhost:${PORT}/api-docs`);
    console.log(`🐍 Motor Spleeter: Activo (Python 3.9)`);
    console.log(`💾 Base de Datos: Lista.`);
    console.log(`=========================================================`);
});